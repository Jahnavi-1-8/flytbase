"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AccountKey,
  CRMExecutiveState,
  AllBookSummary,
  RateLimiterState,
  LiveSignal,
  CRMNote,
  NextMove,
  SourceCitation,
} from "@/types/crm";
import { HeaderStatus } from "@/components/HeaderStatus";
import { AllBookOverview } from "@/components/AllBookOverview";
import { Question1BookWorth } from "@/components/Question1BookWorth";
import { Question2PowerMap } from "@/components/Question2PowerMap";
import { Question3NextMoves } from "@/components/Question3NextMoves";
import { Question4RisksRadar } from "@/components/Question4RisksRadar";
import { Question5KnowledgeGaps } from "@/components/Question5KnowledgeGaps";
import { LiveSignalsPanel } from "@/components/LiveSignalsPanel";
import { WriteNoteModal } from "@/components/WriteNoteModal";
import { RawCacheModal } from "@/components/RawCacheModal";
import { SourceCitationDrawer } from "@/components/SourceCitationDrawer";
import {
  Building2,
  User,
  HeartPulse,
  PlusCircle,
  FileSpreadsheet,
  Activity,
  Layers,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const DEFAULT_RATE_LIMITER_STATE: RateLimiterState = {
  minIntervalSeconds: 61,
  lastUpstreamCallTime: null,
  nextAvailableCallTime: null,
  secondsUntilNextSlot: 0,
  queueLength: 0,
  activeCall: null,
  cachedDatasets: {
    accounts: false,
    paperworkA: false,
    paperworkB: false,
    featureRequests: false,
    releaseNotes: false,
    flytbaseTeam: false,
    notes: false,
    signals: false,
  },
  lastSyncTime: null,
  syncInProgress: false,
};

const createInitialAccountState = (key: AccountKey): CRMExecutiveState => ({
  account: {
    id: `acc_${key}`,
    key,
    name: key === "A" ? "Eastern Counties Police Alliance" : "Aldermoor Industrial Group",
    industry: key === "A" ? "Police Alliance & Public Safety Corridors" : "Industrial Manufacturing & Security Patrols",
    arr: 0,
    healthScore: key === "A" ? 82 : 74,
    status: key === "A" ? "Expansion Underway" : "Renewal Risk",
    accountManager: key === "A" ? "Rhys Calder" : "Stefan Roy",
    accountManagerId: key === "A" ? "rhys_calder" : "stefan_roy",
    description: "Loading live account state from MCP server...",
    sourceId: `account_${key}`,
  },
  bookWorth: {
    totalVerifiedARR: 0,
    totalVerifiedPipeline: 0,
    totalClaimedUnbackedPipeline: 0,
    verifiedDeals: [],
    unbackedClaims: [],
  },
  powerMap: {
    stakeholders: [],
    byDeal: {},
    deciders: [],
    payers: [],
    operators: [],
    blockers: [],
  },
  topMoves: [],
  risks: [],
  knowledgeGaps: [],
  liveSignals: [],
  recentNotes: [],
  citations: {},
});

const INITIAL_ALL_BOOK: AllBookSummary = {
  totalVerifiedARR: 0,
  totalVerifiedPipeline: 0,
  totalUnbackedPipeline: 0,
  totalAccounts: 2,
  totalCriticalRisks: 0,
  accounts: [
    {
      key: "A",
      name: "Eastern Counties Police Alliance",
      verifiedPipeline: 0,
      unbackedPipeline: 0,
      criticalRisksCount: 0,
      topNextMove: "Loading...",
    },
    {
      key: "B",
      name: "Aldermoor Industrial Group",
      verifiedPipeline: 0,
      unbackedPipeline: 0,
      criticalRisksCount: 0,
      topNextMove: "Loading...",
    },
  ],
};

export default function CRMPage() {
  const [selectedAccount, setSelectedAccount] = useState<AccountKey | "ALL">("A");
  const [activeTab, setActiveTab] = useState<"all" | "q1" | "q2" | "q3" | "q4" | "q5">("all");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [isWriteNoteOpen, setIsWriteNoteOpen] = useState(false);
  const [isRawCacheOpen, setIsRawCacheOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Note prefill state for 1-click "Save to CRM" from Next Moves
  const [notePrefill, setNotePrefill] = useState<{
    account: AccountKey;
    kind: "note" | "task" | "risk" | "next_step";
    title: string;
    text: string;
  }>({
    account: "A",
    kind: "next_step",
    title: "",
    text: "",
  });

  // State data initialized dynamically
  const [rateLimiter, setRateLimiter] = useState<RateLimiterState>(DEFAULT_RATE_LIMITER_STATE);
  const [allBookSummary, setAllBookSummary] = useState<AllBookSummary>(INITIAL_ALL_BOOK);
  const [accountsState, setAccountsState] = useState<{
    A: CRMExecutiveState;
    B: CRMExecutiveState;
  }>({
    A: createInitialAccountState("A"),
    B: createInitialAccountState("B"),
  });
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const [recentNotes, setRecentNotes] = useState<CRMNote[]>([]);

  // Fetch full state from backend
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/crm/state");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        if (data.rateLimiter) setRateLimiter(data.rateLimiter);
        if (data.allBook) setAllBookSummary(data.allBook);
        if (data.accounts) setAccountsState(data.accounts);
        if (data.liveSignals) setLiveSignals(data.liveSignals);
        if (data.notes) setRecentNotes(data.notes);
      }
    } catch (err) {
      console.warn("Error fetching CRM state:", err);
    }
  }, []);

  // Poll state every 10 seconds for live signals and rate limiter
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Client-side smooth 1s ticker for rate limit countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRateLimiter((prev) => {
        if (!prev || prev.secondsUntilNextSlot <= 0) return prev;
        return {
          ...prev,
          secondsUntilNextSlot: Math.max(0, prev.secondsUntilNextSlot - 1),
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Upstream Sync handler
  const handleSyncUpstream = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/crm/sync", { method: "POST" });
      const data = await res.json();
      if (data.rateLimiter) setRateLimiter(data.rateLimiter);
      await fetchState();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit note handler
  const handleWriteNote = async (noteData: {
    account: AccountKey;
    kind: "note" | "task" | "risk" | "next_step";
    title: string;
    text: string;
  }) => {
    const res = await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(noteData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to write note");
    if (json.notes) setRecentNotes(json.notes);
    if (json.rateLimiter) setRateLimiter(json.rateLimiter);
    await fetchState();
  };

  // Save recommended move to CRM
  const handleSaveMoveToCRM = async (move: NextMove) => {
    await handleWriteNote({
      account: move.accountKey,
      kind: move.suggestedNoteKind,
      title: `[Priority #${move.rank}] ${move.title}`,
      text: `Owner: ${move.ownerName} | Target Date: ${move.targetDate} (Hard Deadline: ${move.hardDeadlineRef}) | Expected Impact: ${move.expectedImpact}`,
    });
  };

  // Resolve citation for currently selected sourceId
  const currentActiveAccountState =
    selectedAccount === "B" ? accountsState.B : accountsState.A;

  const currentCitation: SourceCitation | null = selectedSourceId
    ? currentActiveAccountState.citations[selectedSourceId] ||
      accountsState.A.citations[selectedSourceId] ||
      accountsState.B.citations[selectedSourceId] || {
        sourceId: selectedSourceId,
        title: "Audited Record",
        recordType: "Paperwork",
        exactQuoteOrFact: "Verified from remote MCP cache store.",
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Sticky Top Status & Account Navigation */}
      <HeaderStatus
        rateLimiter={rateLimiter}
        selectedAccount={selectedAccount}
        onSelectAccount={setSelectedAccount}
        onSyncClick={handleSyncUpstream}
        onOpenRawCache={() => setIsRawCacheOpen(true)}
        isSyncing={isSyncing}
        accountAName={accountsState.A.account.name}
        accountBName={accountsState.B.account.name}
      />

      {/* Main Workspace Layout */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6">
        {selectedAccount === "ALL" ? (
          <AllBookOverview
            summary={allBookSummary}
            onSelectAccount={(acc) => setSelectedAccount(acc)}
            onSourceClick={(sid) => setSelectedSourceId(sid)}
          />
        ) : (
          <div className="space-y-6">
            {/* Account Executive Header Banner */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 font-black text-white shadow-md">
                      {currentActiveAccountState.account.key}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                          {currentActiveAccountState.account.name}
                        </h2>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            currentActiveAccountState.account.status === "Renewal Risk"
                              ? "bg-amber-950/70 text-amber-300 border-amber-500/40"
                              : "bg-emerald-950/70 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {currentActiveAccountState.account.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {currentActiveAccountState.account.industry}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Details & Quick Note Action */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Account Manager
                    </span>
                    <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                      <User className="h-3.5 w-3.5 text-indigo-400" />
                      {currentActiveAccountState.account.accountManager}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Account Health
                    </span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <HeartPulse className="h-3.5 w-3.5" />
                      {currentActiveAccountState.account.healthScore} / 100
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setNotePrefill({
                        account: currentActiveAccountState.account.key,
                        kind: "next_step",
                        title: "",
                        text: "",
                      });
                      setIsWriteNoteOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Log CRM Note</span>
                  </button>
                </div>
              </div>

              {/* Account Description & Source ID */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-800/80 pt-3 text-xs gap-2">
                <p className="text-slate-300">
                  {currentActiveAccountState.account.description}
                </p>
                <button
                  onClick={() =>
                    setSelectedSourceId(currentActiveAccountState.account.sourceId)
                  }
                  className="self-start sm:self-auto font-mono text-[10px] text-sky-400 rounded bg-slate-950 px-2 py-0.5 border border-slate-800 hover:border-sky-500/50"
                >
                  [{currentActiveAccountState.account.sourceId}]
                </button>
              </div>
            </div>

            {/* Sub-navigation bar for Questions */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "all"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                All 5 Questions
              </button>
              <button
                onClick={() => setActiveTab("q1")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q1"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                1. Book Worth
              </button>
              <button
                onClick={() => setActiveTab("q2")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q2"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                2. Power Map
              </button>
              <button
                onClick={() => setActiveTab("q3")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q3"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                3. Next Moves
              </button>
              <button
                onClick={() => setActiveTab("q4")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q4"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                4. Risks Radar
              </button>
              <button
                onClick={() => setActiveTab("q5")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q5"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                5. Knowledge Gaps
              </button>
            </div>

            {/* Split Screen Layout: Questions Left (70%), Live Signals & Notes Right (30%) */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Executive Questions */}
              <div className="space-y-10 lg:col-span-8">
                {(activeTab === "all" || activeTab === "q1") && (
                  <Question1BookWorth
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                  />
                )}

                {(activeTab === "all" || activeTab === "q2") && (
                  <Question2PowerMap
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                  />
                )}

                {(activeTab === "all" || activeTab === "q3") && (
                  <Question3NextMoves
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                    onSaveToCRM={handleSaveMoveToCRM}
                  />
                )}

                {(activeTab === "all" || activeTab === "q4") && (
                  <Question4RisksRadar
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                  />
                )}

                {(activeTab === "all" || activeTab === "q5") && (
                  <Question5KnowledgeGaps
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                  />
                )}
              </div>

              {/* Right Column: Live Signals Stream */}
              <div className="space-y-6 lg:col-span-4">
                <LiveSignalsPanel
                  signals={liveSignals}
                  onSourceClick={(sid) => setSelectedSourceId(sid)}
                  activeAccount={selectedAccount}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <SourceCitationDrawer
        sourceId={selectedSourceId}
        citation={currentCitation}
        onClose={() => setSelectedSourceId(null)}
      />

      <WriteNoteModal
        isOpen={isWriteNoteOpen}
        onClose={() => setIsWriteNoteOpen(false)}
        onSubmitNote={handleWriteNote}
        recentNotes={recentNotes}
        defaultAccount={notePrefill.account}
        defaultKind={notePrefill.kind}
        defaultTitle={notePrefill.title}
        defaultText={notePrefill.text}
        accountAName={accountsState.A.account.name}
        accountBName={accountsState.B.account.name}
      />

      <RawCacheModal
        isOpen={isRawCacheOpen}
        onClose={() => setIsRawCacheOpen(false)}
      />
    </div>
  );
}

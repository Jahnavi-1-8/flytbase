"use client";

import React from "react";
import { RateLimiterState, AccountKey } from "@/types/crm";
import {
  Clock,
  Database,
  RefreshCw,
  Code2,
  Layers,
  Building2,
  ShieldAlert,
} from "lucide-react";

interface HeaderStatusProps {
  rateLimiter: RateLimiterState | null;
  selectedAccount: AccountKey | "ALL";
  onSelectAccount: (acc: AccountKey | "ALL") => void;
  onSyncClick: () => void;
  onOpenRawCache: () => void;
  isSyncing: boolean;
  accountAName?: string;
  accountBName?: string;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({
  rateLimiter,
  selectedAccount,
  onSelectAccount,
  onSyncClick,
  onOpenRawCache,
  isSyncing,
  accountAName = "Account A",
  accountBName = "Account B",
}) => {
  const secondsRemaining = rateLimiter?.secondsUntilNextSlot ?? 0;
  const isSlotReady = secondsRemaining === 0;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Banner: App Title & MCP Rate-Limit Telemetry */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 font-bold text-white shadow-lg shadow-indigo-500/20">
            AQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Account Quest
              </h1>
              <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400">
                FlytBase Live CRM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Monday Morning Executive Operating System • Strict 1-Req/Min MCP Rate Limit
            </p>
          </div>
        </div>

        {/* MCP Rate Limiter & Upstream Sync Status Strip */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rate Limit Clock */}
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isSlotReady
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                : "border-amber-500/40 bg-amber-950/40 text-amber-300"
            }`}
          >
            <Clock className="h-3.5 w-3.5 animate-spin-slow" />
            <span suppressHydrationWarning>
              {isSlotReady ? (
                <strong className="font-semibold text-emerald-400">Slot Ready (61s reset)</strong>
              ) : (
                <>
                  Next MCP Slot in:{" "}
                  <strong className="tabular-nums font-bold text-amber-400">
                    {secondsRemaining}s
                  </strong>
                </>
              )}
            </span>
            {rateLimiter?.queueLength ? (
              <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                Q: {rateLimiter.queueLength}
              </span>
            ) : null}
          </div>

          {/* Cached Dataset Status Pill */}
          <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 md:flex">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400">Cache:</span>
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                rateLimiter?.cachedDatasets.paperworkA &&
                rateLimiter?.cachedDatasets.paperworkB
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-[11px] text-slate-300">
              {rateLimiter?.cachedDatasets.paperworkA &&
              rateLimiter?.cachedDatasets.paperworkB
                ? "Static Synced (A & B)"
                : "Seeded / In Memory"}
            </span>
          </div>

          {/* Trigger Initial Sync Button */}
          <button
            onClick={onSyncClick}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-600/30 active:scale-95 disabled:opacity-50"
            title="Triggers rate-limited upstream MCP sync for static tools"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-indigo-400" : ""}`}
            />
            <span>{isSyncing ? "Syncing..." : "Sync Upstream (MCP)"}</span>
          </button>

          {/* Inspect Raw MCP Cache */}
          <button
            onClick={onOpenRawCache}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            title="Inspect raw cached MCP JSON response and real source IDs"
          >
            <Code2 className="h-3.5 w-3.5 text-sky-400" />
            <span>Raw Cache</span>
          </button>
        </div>
      </div>

      {/* Account Navigation Strip */}
      <div className="border-t border-slate-900 bg-slate-950/60 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => onSelectAccount("ALL")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedAccount === "ALL"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Book Overview</span>
          </button>

          <button
            onClick={() => onSelectAccount("A")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedAccount === "A"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Account A: {accountAName}</span>
          </button>

          <button
            onClick={() => onSelectAccount("B")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedAccount === "B"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Account B: {accountBName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};


"use client";

import React, { useState } from "react";
import { CRMExecutiveState, NextMove } from "@/types/crm";
import {
  ListOrdered,
  Calendar,
  User,
  Target,
  Zap,
  BookmarkCheck,
  Calculator,
  CheckCircle2,
  BookmarkPlus,
  Loader2,
} from "lucide-react";

interface Question3NextMovesProps {
  state: CRMExecutiveState;
  onSourceClick: (sourceId: string) => void;
  onSaveToCRM: (move: NextMove) => Promise<void>;
}

export const Question3NextMoves: React.FC<Question3NextMovesProps> = ({
  state,
  onSourceClick,
  onSaveToCRM,
}) => {
  const { topMoves } = state;
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleSave = async (move: NextMove) => {
    setSavingId(move.id);
    try {
      await onSaveToCRM(move);
      setSavedIds((prev) => new Set(prev).add(move.id));
    } finally {
      setSavingId(null);
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30";
      case 2:
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30";
      case 3:
        return "bg-sky-500/20 text-sky-300 border-sky-500/40 ring-1 ring-sky-500/30";
      default:
        return "bg-slate-800 text-slate-300";
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Question 3
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              What do you do first?
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Top 3 ranked next moves determined by deterministic algorithmic prioritization.
          </p>
        </div>

        {/* Transparent scoring rule indicator */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
          <Calculator className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            Rule:{" "}
            <code className="text-[11px] text-emerald-400 font-mono">
              (Urgency × Value × Blocker Clearance)
            </code>
          </span>
        </div>
      </div>

      {/* Top 3 Cards Stack */}
      <div className="space-y-4">
        {topMoves.map((move) => {
          const isSaved = savedIds.has(move.id);
          const isSaving = savingId === move.id;

          return (
            <div
              key={move.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg transition-all hover:border-slate-700"
            >
              {/* Rank Badge strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border text-sm font-black ${getRankBadge(
                      move.rank
                    )}`}
                  >
                    #{move.rank}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {move.title}
                    </h3>
                    <span className="text-xs text-slate-400">
                      Target Deal:{" "}
                      <strong className="text-slate-200">
                        {move.targetDeal}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Score & 1-Click Save to CRM button */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">
                      Algo Priority Score
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {move.score} / 10.0
                    </span>
                  </div>

                  <button
                    onClick={() => handleSave(move)}
                    disabled={isSaving || isSaved}
                    className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                      isSaved
                        ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                        : "border-indigo-500/40 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30"
                    }`}
                    title="Pushes this action item to MCP write_note queue"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                        <span>Saving...</span>
                      </>
                    ) : isSaved ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Saved to CRM</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        <span>Save to CRM (write_note)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Grid of Key Move Parameters */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                {/* Owner */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-400">
                    <User className="h-3.5 w-3.5 text-sky-400" />
                    Assigned Owner:
                  </span>
                  <div className="mt-1 font-semibold text-white">
                    {move.ownerName}
                  </div>
                  <span className="mt-0.5 inline-block text-[10px] text-slate-400">
                    Team: {move.ownerType} ({move.ownerId})
                  </span>
                </div>

                {/* Target Date vs Hard Deadline */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    Execution Target Date:
                  </span>
                  <div className="mt-1 font-mono font-bold text-amber-300">
                    {move.targetDate}
                  </div>
                  <span className="mt-0.5 inline-block text-[10px] text-rose-300">
                    Deadline: {move.hardDeadlineRef}
                  </span>
                </div>

                {/* Expected Impact */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-400">
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    Expected Impact:
                  </span>
                  <p className="mt-1 font-medium text-emerald-300 text-xs">
                    {move.expectedImpact}
                  </p>
                </div>
              </div>

              {/* Transparent scoring explanation */}
              <div className="mt-3 rounded-lg bg-slate-950/40 border border-slate-800/80 px-3 py-2 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Scoring Breakdown: </span>
                {move.scoreExplanation}
              </div>

              {/* Supporting Source IDs */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="font-semibold text-slate-500 uppercase">
                  Supporting Evidence:
                </span>
                {move.sourceIds.map((sid) => (
                  <button
                    key={sid}
                    onClick={() => onSourceClick(sid)}
                    className="rounded bg-slate-950 border border-slate-800 px-1.5 py-0.5 font-mono text-sky-400 hover:border-sky-500/50"
                  >
                    [{sid}]
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};


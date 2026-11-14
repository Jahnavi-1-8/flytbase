"use client";

import React from "react";
import { CRMExecutiveState, RiskItem, RiskCategory } from "@/types/crm";
import {
  AlertTriangle,
  Clock,
  Radio,
  ShieldAlert,
  Flame,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

interface Question4RisksRadarProps {
  state: CRMExecutiveState;
  onSourceClick: (sourceId: string) => void;
}

export const Question4RisksRadar: React.FC<Question4RisksRadarProps> = ({
  state,
  onSourceClick,
}) => {
  const { risks } = state;

  const getSeverityBadge = (severity: RiskItem["severity"]) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30";
      case "High":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Watch":
        return "bg-sky-500/20 text-sky-300 border-sky-500/30";
    }
  };

  const categories: RiskCategory[] = [
    "Deadlines at Risk",
    "People Going Cold / Leaving",
    "Stuck Deals",
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-400">
              Question 4
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              What is about to go wrong?
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Early-warning radar across deadlines, personnel changes, and stuck deals with exact countdowns.
          </p>
        </div>

        {/* Live Signal Alert Counter */}
        <div className="flex items-center gap-2">
          {risks.some((r) => r.isLiveSignalImpacted) && (
            <div className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-950/40 px-3 py-1 text-xs font-semibold text-sky-300 animate-pulse-subtle">
              <Radio className="h-3.5 w-3.5 text-sky-400 animate-spin-slow" />
              <span>Live Telemetry Correlated</span>
            </div>
          )}
        </div>
      </div>

      {/* 3 Categories Radar Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {categories.map((cat) => {
          const catRisks = risks.filter((r) => r.category === cat);

          return (
            <div
              key={cat}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{cat}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 font-semibold">
                      {catRisks.length}
                    </span>
                  </div>
                  {cat === "Deadlines at Risk" && (
                    <Clock className="h-4 w-4 text-rose-400" />
                  )}
                  {cat === "People Going Cold / Leaving" && (
                    <Flame className="h-4 w-4 text-amber-400" />
                  )}
                  {cat === "Stuck Deals" && (
                    <ShieldAlert className="h-4 w-4 text-sky-400" />
                  )}
                </div>

                {/* Cards in category */}
                <div className="mt-4 space-y-4">
                  {catRisks.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">
                      No active early warnings in this category.
                    </p>
                  ) : (
                    catRisks.map((risk) => (
                      <div
                        key={risk.id}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm"
                      >
                        {/* Title & Severity */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {risk.title}
                          </h4>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${getSeverityBadge(
                              risk.severity
                            )}`}
                          >
                            {risk.severity}
                          </span>
                        </div>

                        {/* Live Signal badge if impacted */}
                        {risk.isLiveSignalImpacted && (
                          <div className="mt-2 flex items-center gap-1.5 rounded bg-sky-950/60 border border-sky-500/30 px-2 py-1 text-[10px] font-bold text-sky-300">
                            <Radio className="h-3 w-3 text-sky-400" />
                            <span>LIVE SIGNAL DETECTED</span>
                            {risk.liveSignalId && (
                              <button
                                onClick={() => onSourceClick(risk.liveSignalId!)}
                                className="underline font-mono ml-auto"
                              >
                                [{risk.liveSignalId}]
                              </button>
                            )}
                          </div>
                        )}

                        {/* Exact Date It Turns Bad */}
                        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-[11px]">
                          <span className="text-slate-400 font-medium">
                            Turns Bad On:
                          </span>
                          <div className="flex items-center gap-1 font-mono font-bold text-rose-400">
                            <span>{risk.exactDateTurnsBad}</span>
                            {risk.countdownDays !== undefined && (
                              <span suppressHydrationWarning className="text-[10px] rounded bg-rose-950 px-1.5 py-0.2 border border-rose-500/40">
                                ({risk.countdownDays > 0 ? `${risk.countdownDays}d left` : "OVERDUE"})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Trigger Evidence */}
                        <div className="mt-3 text-xs">
                          <div className="flex items-center justify-between text-[10px] font-semibold uppercase text-slate-500">
                            <span>Trigger Evidence:</span>
                            <button
                              onClick={() => onSourceClick(risk.evidenceSourceId)}
                              className="font-mono text-sky-400 hover:underline"
                            >
                              [{risk.evidenceSourceId}]
                            </button>
                          </div>
                          <p className="mt-1 text-slate-300 italic text-[11px] leading-relaxed">
                            &ldquo;{risk.triggerEvidence}&rdquo;
                          </p>
                        </div>

                        {/* Mitigation Step */}
                        <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-xs">
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            <span>Executive Mitigation Plan:</span>
                          </div>
                          <p className="mt-1 text-emerald-200 text-[11px] leading-relaxed">
                            {risk.mitigationStep}
                          </p>
                        </div>

                        {/* Traceable source IDs */}
                        <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-850 pt-2 text-[10px]">
                          <span className="text-slate-500">Trace:</span>
                          {risk.sourceIds.map((sid) => (
                            <button
                              key={sid}
                              onClick={() => onSourceClick(sid)}
                              className="rounded bg-slate-900 px-1 py-0.5 font-mono text-slate-400 hover:text-sky-300"
                            >
                              [{sid}]
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};


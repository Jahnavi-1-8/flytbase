"use client";

import React, { useState, useEffect } from "react";
import { LiveSignal, AccountKey } from "@/types/crm";
import {
  Radio,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
} from "lucide-react";

interface LiveSignalsPanelProps {
  signals: LiveSignal[];
  onSourceClick: (sourceId: string) => void;
  activeAccount: AccountKey | "ALL";
}

function formatDeterministicTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    const seconds = String(d.getUTCSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds} UTC`;
  } catch {
    return isoString;
  }
}

export const LiveSignalsPanel: React.FC<LiveSignalsPanelProps> = ({
  signals,
  onSourceClick,
  activeAccount,
}) => {
  const [filterAccount, setFilterAccount] = useState<string>("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveFilter =
    filterAccount === "ALL" && activeAccount !== "ALL"
      ? activeAccount
      : filterAccount;

  const filteredSignals = signals.filter((s) => {
    if (effectiveFilter === "ALL") return true;
    return s.accountKey === effectiveFilter || s.accountKey === "ALL" || !s.accountKey;
  });

  const getSeverityIcon = (sev: LiveSignal["severity"]) => {
    switch (sev) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      default:
        return <Info className="h-4 w-4 text-sky-400" />;
    }
  };

  const getSeverityClass = (sev: LiveSignal["severity"]) => {
    switch (sev) {
      case "critical":
        return "border-rose-500/30 bg-rose-950/20";
      case "warning":
        return "border-amber-500/30 bg-amber-950/20";
      case "success":
        return "border-emerald-500/30 bg-emerald-950/20";
      default:
        return "border-slate-800 bg-slate-900/80";
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radio className="h-4 w-4 text-sky-400" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-sky-400 animate-ping" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Live Signals Stream</span>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-sky-300">
                Auto-polled 10s
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Synced from upstream MCP get_signals (rate-limited 65s)
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 text-xs">
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Signals</option>
            <option value="A">Account A</option>
            <option value="B">Account B</option>
          </select>
        </div>
      </div>

      {/* Stream list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
        {filteredSignals.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No live telemetry signals recorded yet.
          </div>
        ) : (
          filteredSignals.map((sig) => (
            <div
              key={sig.id}
              className={`rounded-xl border p-3.5 transition-all hover:border-slate-750 ${getSeverityClass(
                sig.severity
              )}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(sig.severity)}
                  <h4 className="text-xs font-bold text-white">
                    {sig.headline}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {sig.accountKey && (
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                      Acc {sig.accountKey}
                    </span>
                  )}
                  <button
                    onClick={() => onSourceClick(sig.sourceId)}
                    className="font-mono text-[10px] text-sky-400 rounded bg-slate-950 px-1.5 py-0.5 border border-slate-800 hover:border-sky-500/50"
                  >
                    [{sig.sourceId}]
                  </button>
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                {sig.details}
              </p>

              <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                <span
                  suppressHydrationWarning
                  className="flex items-center gap-1 font-mono text-slate-400"
                >
                  <Clock className="h-3 w-3" />
                  {formatDeterministicTime(sig.timestamp)}
                </span>
                <span className="font-mono text-emerald-400">
                  origin: {sig.toolOrigin}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

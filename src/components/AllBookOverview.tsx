"use client";

import React from "react";
import { AllBookSummary, AccountKey } from "@/types/crm";
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

interface AllBookOverviewProps {
  summary: AllBookSummary;
  onSelectAccount: (acc: AccountKey) => void;
  onSourceClick: (sourceId: string) => void;
}

export const AllBookOverview: React.FC<AllBookOverviewProps> = ({
  summary,
  onSelectAccount,
  onSourceClick,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(val);

  const accA = summary.accounts.find((a) => a.key === "A");
  const accB = summary.accounts.find((a) => a.key === "B");

  return (
    <div className="space-y-6">
      {/* Top Banner Strip */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Executive Portfolio Summary
              </span>
              <span className="text-xs text-slate-400">
                Monday Morning Master View
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              All Book Overview (Accounts A & B)
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Live dual-account telemetry, verified pipeline vs. quarantined unbacked claims, and critical deadlines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectAccount("A")}
              className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-950/40 px-4 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-900/50"
            >
              <span>{accA ? accA.name : "Account A"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSelectAccount("B")}
              className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/50"
            >
              <span>{accB ? accB.name : "Account B"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 4 Primary KPI Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total Verified ARR / Won */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Verified Won Contracts</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-400">
              {formatCurrency(summary.totalVerifiedARR)}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Won offer values backed by MCP offer records
            </p>
          </div>

          {/* 2. Total Verified Pipeline */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Verified Backed Pipeline</span>
              <TrendingUp className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-sky-400">
              {formatCurrency(summary.totalVerifiedPipeline)}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Backed by verified evidence files & opportunities
            </p>
          </div>

          {/* 3. Total Unbacked Claimed Pipeline (Quarantined) */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
            <div className="flex items-center justify-between text-xs text-amber-400">
              <span>Quarantined Verbal Claims</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-amber-300">
              {formatCurrency(summary.totalUnbackedPipeline)}
            </div>
            <p className="mt-1 text-[11px] text-amber-400/80">
              Excluded from official pipeline forecast
            </p>
          </div>

          {/* 4. Critical Hard Veto Risks */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
            <div className="flex items-center justify-between text-xs text-rose-400">
              <span>Critical Deadlines / Vetoes</span>
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-rose-400">
              {summary.totalCriticalRisks} Critical Risks
            </div>
            <p className="mt-1 text-[11px] text-rose-300/80">
              Requires immediate executive clearance
            </p>
          </div>
        </div>
      </div>

      {/* Account Comparison Matrix */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Account A Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-sky-500/20 bg-slate-900/70 p-6 shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold">
                  A
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{accA?.name || "Account A"}</h3>
                  <span className="text-xs text-slate-400">Police Alliance & Public Safety</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                Expansion Underway
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-slate-400">Verified Pipeline:</span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(accA?.verifiedPipeline || 0)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-slate-400">Quarantined Verbal Claims:</span>
                <span className="font-semibold text-amber-400">
                  {formatCurrency(accA?.unbackedPipeline || 0)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-slate-400">Critical Risks:</span>
                <span className="font-semibold text-rose-400">
                  {accA?.criticalRisksCount || 0} Critical
                </span>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-medium uppercase text-slate-500">
                  #1 Action Priority:
                </span>
                <p className="mt-1 text-xs font-medium text-slate-200">
                  {accA?.topNextMove || "Awaiting sync"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectAccount("A")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500"
          >
            <span>Open Executive View for {accA?.name || "Account A"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Account B Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-amber-500/20 bg-slate-900/70 p-6 shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                  B
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{accB?.name || "Account B"}</h3>
                  <span className="text-xs text-slate-400">Industrial Manufacturing & Perimeter</span>
                </div>
              </div>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-400">
                Renewal Risk
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-slate-400">Verified Pipeline:</span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(accB?.verifiedPipeline || 0)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-slate-400">Quarantined Verbal Claims:</span>
                <span className="font-semibold text-amber-400">
                  {formatCurrency(accB?.unbackedPipeline || 0)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-slate-400">Critical Risks:</span>
                <span className="font-semibold text-rose-400">
                  {accB?.criticalRisksCount || 0} Critical
                </span>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-medium uppercase text-slate-500">
                  #1 Action Priority:
                </span>
                <p className="mt-1 text-xs font-medium text-slate-200">
                  {accB?.topNextMove || "Awaiting sync"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectAccount("B")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500"
          >
            <span>Open Executive View for {accB?.name || "Account B"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

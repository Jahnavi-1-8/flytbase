"use client";

import React from "react";
import { CRMExecutiveState } from "@/types/crm";
import {
  DollarSign,
  ShieldCheck,
  AlertOctagon,
  FileText,
  BadgeAlert,
  Layers,
} from "lucide-react";

interface Question1BookWorthProps {
  state: CRMExecutiveState;
  onSourceClick: (sourceId: string) => void;
}

export const Question1BookWorth: React.FC<Question1BookWorthProps> = ({
  state,
  onSourceClick,
}) => {
  const { bookWorth, account } = state;

  const formatCurrency = (val: number) => {
    const symbol = account.key === "B" ? "€" : "£";
    return `${symbol}${val.toLocaleString()}`;
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-400">
              Question 1
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              What is the book worth?
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Strict separation of verified paperwork/contract-backed ARR from verbal unbacked claims.
          </p>
        </div>

        {/* Source Badge for Account Contract */}
        <button
          onClick={() => onSourceClick(account.sourceId)}
          className="self-start rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-mono text-sky-400 hover:border-sky-500/50 hover:bg-slate-850"
        >
          [{account.sourceId}]
        </button>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Verified Active ARR */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-300">
            <span>Verified Contracted ARR</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            {formatCurrency(bookWorth.totalVerifiedARR)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Current live ARR recognized in financial ledgers
          </p>
        </div>

        {/* Verified Expansion Pipeline */}
        <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-sky-300">
            <span>Verified Expansion Pipeline</span>
            <Layers className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-sky-400">
            {formatCurrency(bookWorth.totalVerifiedPipeline)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Backed by formal SOW quotes & pricing sheets
          </p>
        </div>

        {/* Unbacked Verbal Claims (Quarantined) */}
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-amber-300">
            <span>Unbacked Verbal Claims</span>
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300">
            {formatCurrency(bookWorth.totalClaimedUnbackedPipeline)}
          </div>
          <p className="mt-1 text-[11px] text-amber-400/80">
            Quarantined: Excluded from official forecast
          </p>
        </div>
      </div>

      {/* 1. Verified Deals Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="border-b border-slate-800 bg-slate-950/80 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                Verified / Backed Deals & Pipeline
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Audited against legal paperwork & finance ledger
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Deal / SOW Name</th>
                <th className="px-4 py-3">Stage & Prob.</th>
                <th className="px-4 py-3">Verified Value</th>
                <th className="px-4 py-3">Target Close</th>
                <th className="px-4 py-3">Audited Paperwork Ref</th>
                <th className="px-4 py-3">Source Traceability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {bookWorth.verifiedDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{deal.name}</div>
                    {deal.notesSummary && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {deal.notesSummary}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2 py-0.5 font-medium text-slate-300">
                      <span>{deal.stage}</span>
                      <span className="text-emerald-400 font-bold">
                        ({deal.probability}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-400 text-sm">
                    {formatCurrency(deal.verifiedAmount)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-mono">
                    {deal.targetCloseDate}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-300 border border-slate-800">
                      {deal.paperworkRef || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {deal.sourceIds.map((sid) => (
                        <button
                          key={sid}
                          onClick={() => onSourceClick(sid)}
                          className="rounded bg-sky-950 border border-sky-500/30 px-1.5 py-0.5 font-mono text-[10px] text-sky-300 hover:bg-sky-900"
                        >
                          [{sid}]
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Unbacked Verbal Claims Table (Amber Quarantine Box) */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/15 overflow-hidden shadow-sm">
        <div className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BadgeAlert className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-200">
                Unbacked Claim — Excluded from Verified Total
              </h3>
            </div>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300 uppercase tracking-wide">
              Data Integrity Rule: Quarantined
            </span>
          </div>
        </div>

        <div className="p-4 text-xs text-amber-200/90 leading-relaxed border-b border-amber-500/20 bg-amber-950/10">
          <strong>Strict Sales Integrity Guardrail:</strong> Verbal statements made by champions during informal calls or dinners that lack corresponding finance requisitions, ledger POs, or signed SOWs are quarantined here. They are <strong>excluded</strong> from executive ARR pipeline reports until formal paperwork is executed.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-amber-500/20 bg-amber-950/30 text-amber-300/80 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Claimed Initiative</th>
                <th className="px-4 py-3">Claimed Amount</th>
                <th className="px-4 py-3">Audit Reason for Exclusion</th>
                <th className="px-4 py-3">Verbal Source ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/20 text-slate-200">
              {bookWorth.unbackedClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-amber-950/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{claim.name}</div>
                    <div className="text-[11px] text-amber-300/70 mt-0.5">
                      Stage: {claim.stage}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-amber-400 text-sm">
                    {formatCurrency(claim.claimedAmount)}
                  </td>
                  <td className="px-4 py-3.5 text-amber-200/90 max-w-md">
                    {claim.unbackedReason}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {claim.sourceIds.map((sid) => (
                        <button
                          key={sid}
                          onClick={() => onSourceClick(sid)}
                          className="rounded bg-amber-950 border border-amber-500/40 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 hover:bg-amber-900"
                        >
                          [{sid}]
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};


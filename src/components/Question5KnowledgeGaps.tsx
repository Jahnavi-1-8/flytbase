"use client";

import React from "react";
import { CRMExecutiveState, KnowledgeGap } from "@/types/crm";
import {
  HelpCircle,
  AlertCircle,
  UserCheck,
  Briefcase,
  ExternalLink,
} from "lucide-react";

interface Question5KnowledgeGapsProps {
  state: CRMExecutiveState;
  onSourceClick: (sourceId: string) => void;
}

export const Question5KnowledgeGaps: React.FC<Question5KnowledgeGapsProps> = ({
  state,
  onSourceClick,
}) => {
  const { knowledgeGaps } = state;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-400">
              Question 5
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              What do you still not know?
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Critical decision and technical gaps that the current account plan rests on.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <HelpCircle className="h-4 w-4 text-indigo-400" />
          <span>
            {knowledgeGaps.length} Actionable Inquiries Identified
          </span>
        </div>
      </div>

      {/* Table / Cards of Gaps */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">What We Don't Know</th>
                <th className="px-4 py-3.5">Which Deal / Decision Depends On It</th>
                <th className="px-4 py-3.5">Why It Matters</th>
                <th className="px-4 py-3.5">Who To Ask (Target Stakeholder)</th>
                <th className="px-4 py-3.5">Audit Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {knowledgeGaps.map((gap) => (
                <tr key={gap.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* What We Don't Know */}
                  <td className="px-4 py-4 max-w-xs font-medium text-white">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{gap.whatWeDontKnow}</span>
                    </div>
                  </td>

                  {/* Which Deal Depends On It */}
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-800 px-2 py-1 font-semibold text-slate-200">
                      {gap.whichDealDependsOnIt}
                    </span>
                  </td>

                  {/* Why It Matters */}
                  <td className="px-4 py-4 max-w-sm text-slate-300">
                    {gap.whyItMatters}
                  </td>

                  {/* Who To Ask */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-bold text-sky-400">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>{gap.whoToAskName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {gap.whoToAskTitle}
                      </span>
                      <button
                        onClick={() => onSourceClick(gap.whoToAskPersonId)}
                        className="self-start rounded bg-slate-950 px-1.5 py-0.5 font-mono text-[10px] text-sky-400 border border-slate-800 hover:border-sky-500/50"
                      >
                        [{gap.whoToAskPersonId}]
                      </button>
                    </div>
                  </td>

                  {/* Audit Trace */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {gap.sourceIds.map((sid) => (
                        <button
                          key={sid}
                          onClick={() => onSourceClick(sid)}
                          className="rounded bg-slate-950 border border-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 hover:text-white"
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


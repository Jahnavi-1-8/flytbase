"use client";

import React, { useState } from "react";
import { CRMExecutiveState, StakeholderRole, Stakeholder } from "@/types/crm";
import {
  Users,
  ShieldCheck,
  CreditCard,
  UserCheck,
  AlertTriangle,
  MessageSquareQuote,
  CheckCircle2,
  Building,
} from "lucide-react";

interface Question2PowerMapProps {
  state: CRMExecutiveState;
  onSourceClick: (sourceId: string) => void;
}

export const Question2PowerMap: React.FC<Question2PowerMapProps> = ({
  state,
  onSourceClick,
}) => {
  const { powerMap } = state;
  const [activeTab, setActiveTab] = useState<"roles" | "deals">("roles");

  const getRoleBadge = (role: StakeholderRole) => {
    switch (role) {
      case "Decider":
        return {
          icon: <UserCheck className="h-3.5 w-3.5 text-purple-400" />,
          label: "Decider",
          className: "bg-purple-950/60 text-purple-300 border-purple-500/30",
        };
      case "Payer / Finance":
        return {
          icon: <CreditCard className="h-3.5 w-3.5 text-emerald-400" />,
          label: "Payer / Finance",
          className: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30",
        };
      case "User / Operator":
        return {
          icon: <Users className="h-3.5 w-3.5 text-sky-400" />,
          label: "User / Operator",
          className: "bg-sky-950/60 text-sky-300 border-sky-500/30",
        };
      case "Blocker":
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />,
          label: "Blocker",
          className: "bg-rose-950/60 text-rose-300 border-rose-500/40",
        };
    }
  };

  const getStanceBadge = (stance: Stakeholder["stance"]) => {
    switch (stance) {
      case "Supporter":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Neutral":
        return "bg-slate-800 text-slate-300 border-slate-700";
      case "Blocker":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold";
      case "Leaving / At Risk":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold animate-pulse-subtle";
    }
  };

  const rolesOrder: StakeholderRole[] = [
    "Decider",
    "Payer / Finance",
    "User / Operator",
    "Blocker",
  ];

  const renderStakeholderCard = (person: Stakeholder) => {
    const roleInfo = getRoleBadge(person.role);
    return (
      <div
        key={person.id}
        className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm hover:border-slate-700 transition-all"
      >
        <div>
          {/* Header with Name, Role & Stance */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{person.name}</h4>
                <button
                  onClick={() => onSourceClick(person.id)}
                  className="rounded bg-slate-950 px-1.5 py-0.5 font-mono text-[10px] text-sky-400 border border-slate-800 hover:border-sky-500/40"
                  title="Click to view person source record"
                >
                  [{person.id}]
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {person.title} • {person.department}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${roleInfo.className}`}
              >
                {roleInfo.icon}
                <span>{roleInfo.label}</span>
              </span>
              <span
                className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStanceBadge(
                  person.stance
                )}`}
              >
                {person.stance}
              </span>
            </div>
          </div>

          {/* Influence & Contact */}
          <div className="mt-3 flex items-center justify-between border-y border-slate-800/80 py-1.5 text-[11px] text-slate-400">
            <span>
              Influence:{" "}
              <strong
                className={
                  person.influence === "High"
                    ? "text-purple-400"
                    : person.influence === "Medium"
                    ? "text-sky-400"
                    : "text-slate-400"
                }
              >
                {person.influence}
              </strong>
            </span>
            {person.lastContactDate && (
              <span>Last Contact: {person.lastContactDate}</span>
            )}
          </div>

          {/* Key Quote / Evidence */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-slate-400">
              <span className="flex items-center gap-1">
                <MessageSquareQuote className="h-3 w-3 text-indigo-400" />
                Key Quote / Evidence:
              </span>
              <button
                onClick={() => onSourceClick(person.quoteSourceId)}
                className="font-mono text-[10px] text-sky-400 hover:underline"
              >
                [{person.quoteSourceId}]
              </button>
            </div>
            <p className="mt-1 rounded-md bg-slate-950/80 p-2.5 text-xs italic text-slate-200 border border-slate-850">
              &ldquo;{person.keyQuote}&rdquo;
            </p>
          </div>

          {/* What they need to say YES */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-emerald-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                What They Need to Say YES:
              </span>
              <button
                onClick={() => onSourceClick(person.needSourceId)}
                className="font-mono text-[10px] text-emerald-400 hover:underline"
              >
                [{person.needSourceId}]
              </button>
            </div>
            <p className="mt-1 rounded-md bg-emerald-950/20 border border-emerald-500/20 p-2.5 text-xs text-emerald-200">
              {person.whatTheyNeed}
            </p>
          </div>
        </div>

        {/* Supporting IDs footer */}
        <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-slate-800/80 pt-2 text-[10px]">
          <span className="text-slate-500">Trace:</span>
          {person.sourceIds.map((sid) => (
            <button
              key={sid}
              onClick={() => onSourceClick(sid)}
              className="rounded bg-slate-950 px-1 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800 hover:text-sky-300"
            >
              [{sid}]
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-400">
              Question 2
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Who holds the power?
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Categorized stakeholder power map: Deciders, Payers, Operators, and Blockers with verified stance and quotes.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
          <button
            onClick={() => setActiveTab("roles")}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              activeTab === "roles"
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            By 4 Explicit Roles
          </button>
          <button
            onClick={() => setActiveTab("deals")}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              activeTab === "deals"
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            By Deal & Corridors
          </button>
        </div>
      </div>

      {/* Grid of Stakeholders */}
      {activeTab === "roles" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {rolesOrder.map((role) => {
            const people = powerMap.stakeholders.filter((s) => s.role === role);
            if (people.length === 0) return null;

            return (
              <div key={role} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{role}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                      {people.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {role === "Blocker"
                      ? "Requires immediate clearance"
                      : role === "Decider"
                      ? "Direct executive signing power"
                      : role === "Payer / Finance"
                      ? "Budget disbursement control"
                      : "Daily operational buy-in"}
                  </span>
                </div>

                <div className="space-y-4">
                  {people.map(renderStakeholderCard)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(powerMap.byDeal).map(([dealKey, people]) => (
            <div
              key={dealKey}
              className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {dealKey.replace(/_/g, " ")}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {people.length} Stakeholders Attached
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {people.map(renderStakeholderCard)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};


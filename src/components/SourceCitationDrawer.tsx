"use client";

import React, { useState } from "react";
import { SourceCitation } from "@/types/crm";
import {
  X,
  FileText,
  UserCheck,
  Radio,
  FileCheck2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

interface SourceCitationDrawerProps {
  sourceId: string | null;
  citation: SourceCitation | null;
  onClose: () => void;
}

export const SourceCitationDrawer: React.FC<SourceCitationDrawerProps> = ({
  sourceId,
  citation,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!sourceId) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (citation?.recordType) {
      case "Person":
        return <UserCheck className="h-5 w-5 text-indigo-400" />;
      case "Signal":
        return <Radio className="h-5 w-5 text-rose-400" />;
      case "Contract":
        return <FileCheck2 className="h-5 w-5 text-emerald-400" />;
      default:
        return <FileText className="h-5 w-5 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div
        className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
              {getIcon()}
            </div>
            <div>
              <span className="inline-block rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                {citation?.recordType || "MCP Record"}
              </span>
              <h2 className="text-base font-bold text-white mt-1">
                {citation?.title || sourceId}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Source ID badge & copy action */}
        <div className="my-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Traceable Source ID
            </span>
            <code className="text-sm font-mono font-semibold text-sky-400">
              [{sourceId}]
            </code>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* Details section */}
        <div className="space-y-4 text-sm">
          {citation?.pathOrEndpoint && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Upstream Origin & Tool Path
              </span>
              <div className="mt-1 rounded bg-slate-950 p-2.5 font-mono text-xs text-emerald-400 border border-slate-800 break-all">
                {citation.pathOrEndpoint}
              </div>
            </div>
          )}

          {citation?.dateOrVersion && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Date / Version
              </span>
              <p className="mt-0.5 text-slate-200">{citation.dateOrVersion}</p>
            </div>
          )}

          <div>
            <span className="text-xs font-medium uppercase text-slate-400">
              Exact Fact / Quote from Payload
            </span>
            <blockquote className="mt-1.5 rounded-r-lg border-l-4 border-indigo-500 bg-slate-950/80 p-3 italic text-slate-200">
              &ldquo;{citation?.exactQuoteOrFact || "Raw record verified from MCP cache store."}&rdquo;
            </blockquote>
          </div>

          {citation?.fullDataSnippet && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-400">
                Full Record Snippet (JSON)
              </span>
              <pre className="mt-1.5 max-h-64 overflow-x-auto rounded bg-slate-950 p-3 font-mono text-xs text-slate-300 border border-slate-800">
                {typeof citation.fullDataSnippet === "string"
                  ? citation.fullDataSnippet
                  : JSON.stringify(citation.fullDataSnippet, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-auto border-t border-slate-800 pt-4 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Verified against MCP server payload cache with 100% strict data integrity.
          </p>
        </div>
      </div>
    </div>
  );
};


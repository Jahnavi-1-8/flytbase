"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, RefreshCw, Database, Code2 } from "lucide-react";

interface RawCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RawCacheModal: React.FC<RawCacheModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchRawCache = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/raw-cache");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching raw cache:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRawCache();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-4xl flex-col max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Raw Cached MCP Payload Store</span>
                <span className="rounded bg-sky-500/20 px-2 py-0.2 text-[10px] font-semibold text-sky-300">
                  .cache/mcp-store.json
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Audited persistent cache obeying 61s rate-limit boundary with verified source IDs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRawCache}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* JSON Preview Content */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-xs text-slate-400">
              Loading cached payload store...
            </div>
          ) : (
            <pre className="font-mono text-xs text-sky-300 leading-relaxed overflow-x-auto whitespace-pre">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};


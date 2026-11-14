"use client";

import React, { useState } from "react";
import { CRMNote, AccountKey } from "@/types/crm";
import {
  FilePlus2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Loader2,
  StickyNote,
  ListTodo,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface WriteNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNote: (note: {
    account: AccountKey;
    kind: "note" | "task" | "risk" | "next_step";
    title: string;
    text: string;
  }) => Promise<void>;
  recentNotes: CRMNote[];
  defaultAccount?: AccountKey;
  defaultKind?: "note" | "task" | "risk" | "next_step";
  defaultTitle?: string;
  defaultText?: string;
  accountAName?: string;
  accountBName?: string;
}

export const WriteNoteModal: React.FC<WriteNoteModalProps> = ({
  isOpen,
  onClose,
  onSubmitNote,
  recentNotes,
  defaultAccount = "A",
  defaultKind = "next_step",
  defaultTitle = "",
  defaultText = "",
  accountAName = "Eastern Counties",
  accountBName = "Aldermoor Industrial Group",
}) => {
  const [account, setAccount] = useState<AccountKey>(defaultAccount);
  const [kind, setKind] = useState<"note" | "task" | "risk" | "next_step">(defaultKind);
  const [title, setTitle] = useState(defaultTitle);
  const [text, setText] = useState(defaultText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      setError("Please fill out both Title and Note details.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmitNote({
        account,
        kind,
        title: title.trim(),
        text: text.trim(),
      });
      setTitle("");
      setText("");
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getKindIcon = (k: CRMNote["kind"]) => {
    switch (k) {
      case "task":
        return <ListTodo className="h-3.5 w-3.5 text-sky-400" />;
      case "risk":
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />;
      case "next_step":
        return <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <StickyNote className="h-3.5 w-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-2xl flex-col max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Log CRM Field Note (write_note)
              </h3>
              <p className="text-xs text-slate-400">
                Optimistically updates UI and queues rate-limited upstream MCP dispatch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Account & Kind Selectors */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Target Account
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value as AccountKey)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                >
                  <option value="A">Account A: {accountAName}</option>
                  <option value="B">Account B: {accountBName}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Note Kind
                </label>
                <select
                  value={kind}
                  onChange={(e) =>
                    setKind(e.target.value as "note" | "task" | "risk" | "next_step")
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                >
                  <option value="next_step">Next Step (High Priority)</option>
                  <option value="task">Operational Task</option>
                  <option value="risk">Risk / Blocker Warning</option>
                  <option value="note">General Field Note</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Note / Action Title
              </label>
              <input
                type="text"
                placeholder="e.g. Delivered Data-Flow Document Pack to DPO Fatima Osei"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Text */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Detailed Log & Meeting Outcomes
              </label>
              <textarea
                rows={3}
                placeholder="Record exact discussion, verified commitments, deliverables, or deadlines..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Queuing MCP Write...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit to CRM</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Recent Notes Log */}
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Recent Field Notes ({recentNotes.length})
            </h4>
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getKindIcon(note.kind)}
                      <span className="font-bold text-white">{note.title}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                        Acc {note.account}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        note.syncStatus === "synced"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-950 text-amber-300 border border-amber-500/30 animate-pulse-subtle"
                      }`}
                    >
                      {note.syncStatus === "synced" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Synced</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Pending Rate-Limit Slot</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="mt-1.5 text-slate-300 text-[11px] leading-relaxed">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


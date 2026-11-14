// src/lib/mcp/rate-limiter.ts
import { RateLimiterState } from "@/types/crm";
import { callRemoteMCPTool } from "./client";
import { getMCPStore, saveMCPStore, updateLastCallTime } from "./store";

const MIN_INTERVAL_MS = 61 * 1000; // 61 seconds strictly
const SIGNAL_POLL_INTERVAL_MS = 65 * 1000; // 65 seconds for live signals polling

export interface QueuedItem {
  id: string;
  toolName: string;
  args?: Record<string, unknown>;
  createdAt: number;
  priority: "high" | "normal";
}

class MCPRateLimiterQueue {
  private queue: QueuedItem[] = [];
  private activeCall: string | null = null;
  private isProcessing = false;
  private syncInProgress = false;

  constructor() {
    // Check if initial tools need queuing
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getActiveCall(): string | null {
    return this.activeCall;
  }

  public isSyncing(): boolean {
    return this.syncInProgress || this.queue.length > 0;
  }

  public getSecondsUntilNextSlot(): number {
    const store = getMCPStore();
    const lastCall = store.lastCallTimestamp;
    if (!lastCall) return 0;
    const elapsed = Date.now() - lastCall;
    const remaining = MIN_INTERVAL_MS - elapsed;
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  public getRateLimiterStatus(): RateLimiterState {
    const store = getMCPStore();
    const secondsRemaining = this.getSecondsUntilNextSlot();
    const lastCall = store.lastCallTimestamp;
    const nextSlot = lastCall ? lastCall + MIN_INTERVAL_MS : Date.now();

    return {
      minIntervalSeconds: 61,
      lastUpstreamCallTime: lastCall,
      nextAvailableCallTime: nextSlot,
      secondsUntilNextSlot: secondsRemaining,
      queueLength: this.queue.length,
      activeCall: this.activeCall,
      cachedDatasets: {
        accounts: Boolean(store.accounts),
        paperworkA: Boolean(store.paperworkA),
        paperworkB: Boolean(store.paperworkB),
        featureRequests: Boolean(store.featureRequests),
        releaseNotes: Boolean(store.releaseNotes),
        flytbaseTeam: Boolean(store.flytbaseTeam),
        notes: Array.isArray(store.notes) && store.notes.length > 0,
        signals: Array.isArray(store.signals) && store.signals.length > 0,
      },
      lastSyncTime: store.lastSyncTimestamp,
      syncInProgress: this.isSyncing(),
    };
  }

  public enqueue(
    toolName: string,
    args: Record<string, unknown> = {},
    priority: "high" | "normal" = "normal"
  ): QueuedItem {
    const existing = this.queue.find(
      (q) => q.toolName === toolName && JSON.stringify(q.args) === JSON.stringify(args)
    );
    if (existing) {
      return existing;
    }

    const item: QueuedItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      toolName,
      args,
      createdAt: Date.now(),
      priority,
    };

    if (priority === "high") {
      this.queue.unshift(item);
    } else {
      this.queue.push(item);
    }

    this.processQueue();
    return item;
  }

  public startInitialSyncQueue(): void {
    const store = getMCPStore();
    this.syncInProgress = true;

    const staticTools: Array<{ tool: string; args: Record<string, unknown>; cached: boolean }> = [
      { tool: "get_my_accounts", args: {}, cached: Boolean(store.accounts) },
      { tool: "get_all_paperwork", args: { account: "A" }, cached: Boolean(store.paperworkA) },
      { tool: "get_all_paperwork", args: { account: "B" }, cached: Boolean(store.paperworkB) },
      { tool: "get_feature_requests", args: {}, cached: Boolean(store.featureRequests) },
      { tool: "get_release_notes", args: {}, cached: Boolean(store.releaseNotes) },
      { tool: "get_flytbase_team", args: {}, cached: Boolean(store.flytbaseTeam) },
      { tool: "list_notes", args: {}, cached: false },
    ];

    for (const item of staticTools) {
      if (!item.cached) {
        this.enqueue(item.tool, item.args, "normal");
      }
    }

    this.processQueue();
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const secondsRemaining = this.getSecondsUntilNextSlot();
        if (secondsRemaining > 0) {
          // Rate limit window not open yet; stop and wait
          break;
        }

        const nextItem = this.queue.shift();
        if (!nextItem) break;

        this.activeCall = `${nextItem.toolName}(${JSON.stringify(nextItem.args || {})})`;

        try {
          const res = await callRemoteMCPTool(nextItem.toolName, nextItem.args);

          if (res.retryAfterSeconds && res.retryAfterSeconds > 0) {
            // Upstream told us to wait retryAfterSeconds
            const simulatedLastCall = Date.now() - (MIN_INTERVAL_MS - res.retryAfterSeconds * 1000);
            updateLastCallTime(simulatedLastCall);
            // Re-queue this item at front
            this.queue.unshift(nextItem);
            break;
          }

          updateLastCallTime(Date.now());

          if (res.success && res.data) {
            this.handleSuccessfulCall(nextItem.toolName, nextItem.args, res.data);
          } else {
            console.warn(`[MCP RateLimiter] Call returned error for ${nextItem.toolName}:`, res.error);
          }
        } catch (err) {
          console.error(`[MCP RateLimiter] Error executing ${nextItem.toolName}:`, err);
          updateLastCallTime(Date.now());
        } finally {
          this.activeCall = null;
        }

        // Must respect rate limit after one call
        break;
      }

      if (this.queue.length === 0) {
        this.syncInProgress = false;
        const store = getMCPStore();
        store.lastSyncTimestamp = Date.now();
        saveMCPStore(store);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private handleSuccessfulCall(
    toolName: string,
    args: Record<string, unknown> = {},
    data: unknown
  ): void {
    const store = getMCPStore();

    switch (toolName) {
      case "get_my_accounts":
        store.accounts = data;
        break;
      case "get_all_paperwork":
        if (args.account === "A") {
          store.paperworkA = data;
        } else if (args.account === "B") {
          store.paperworkB = data;
        }
        break;
      case "get_feature_requests":
        store.featureRequests = data;
        break;
      case "get_release_notes":
        store.releaseNotes = data;
        break;
      case "get_flytbase_team":
        store.flytbaseTeam = data;
        break;
      case "list_notes":
        if (Array.isArray(data)) {
          const remoteNotes = data as Array<{
            id?: string;
            account: "A" | "B";
            kind: "note" | "task" | "risk" | "next_step";
            title: string;
            text: string;
            createdAt?: string;
          }>;
          store.notes = remoteNotes.map((n, idx) => ({
            id: n.id || `remote_note_${idx}`,
            account: n.account,
            kind: n.kind,
            title: n.title,
            text: n.text,
            createdAt: n.createdAt || new Date().toISOString(),
            syncStatus: "synced" as const,
          }));
        }
        break;
      case "get_signals":
        if (Array.isArray(data)) {
          const newSignals = data as Array<{
            id?: string;
            accountKey?: "A" | "B";
            headline?: string;
            text?: string;
            details?: string;
            severity?: "critical" | "warning" | "info" | "success";
            timestamp?: string;
          }>;
          for (const s of newSignals) {
            const id = s.id || `sig_${Date.now()}`;
            if (!store.signals.some((existing) => existing.id === id)) {
              store.signals.unshift({
                id,
                accountKey: s.accountKey || "ALL",
                headline: s.headline || "Telemetry Update",
                details: s.details || s.text || "",
                severity: s.severity || "info",
                timestamp: s.timestamp || new Date().toISOString(),
                sourceId: id,
                toolOrigin: "get_signals",
              });
            }
          }
        }
        break;
      case "write_note":
        this.enqueue("list_notes", {}, "high");
        break;
    }

    saveMCPStore(store);
  }

  public checkAndPollSignalsIfEligible(): void {
    const store = getMCPStore();
    const lastCall = store.lastCallTimestamp;
    const now = Date.now();

    // Check if at least 65 seconds passed since last upstream call AND no items waiting
    if (!lastCall || now - lastCall >= SIGNAL_POLL_INTERVAL_MS) {
      if (this.queue.length === 0 && !this.activeCall) {
        this.enqueue("get_signals", {}, "normal");
      }
    }
  }
}

const globalForLimiter = globalThis as unknown as {
  mcpRateLimiterSingleton?: MCPRateLimiterQueue;
};

export const mcpRateLimiter =
  globalForLimiter.mcpRateLimiterSingleton ?? new MCPRateLimiterQueue();

if (process.env.NODE_ENV !== "production") {
  globalForLimiter.mcpRateLimiterSingleton = mcpRateLimiter;
}

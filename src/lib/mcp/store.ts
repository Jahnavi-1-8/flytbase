// src/lib/mcp/store.ts
import fs from "fs";
import path from "path";
import { CRMNote, LiveSignal } from "@/types/crm";
import defaultAccounts from "./default-accounts.json";

export interface MCPDiskStore {
  version: number;
  lastCallTimestamp: number | null;
  lastSyncTimestamp: number | null;
  accounts: unknown | null;
  paperworkA: unknown | null;
  paperworkB: unknown | null;
  featureRequests: unknown | null;
  releaseNotes: unknown | null;
  flytbaseTeam: unknown | null;
  notes: CRMNote[];
  signals: LiveSignal[];
  pendingWrites: Array<{
    id: string;
    account: "A" | "B";
    kind: "note" | "task" | "risk" | "next_step";
    title: string;
    text: string;
    createdAt: string;
  }>;
  customCitations: Record<string, unknown>;
}

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "mcp-store.json");

let memoryStore: MCPDiskStore = {
  version: 2,
  lastCallTimestamp: null,
  lastSyncTimestamp: Date.now(),
  accounts: defaultAccounts,
  paperworkA: null,
  paperworkB: null,
  featureRequests: null,
  releaseNotes: null,
  flytbaseTeam: null,
  notes: [],
  signals: [],
  pendingWrites: [],
  customCitations: {},
};

export function getMCPStore(): MCPDiskStore {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, "utf-8");
      const parsed = JSON.parse(content) as MCPDiskStore;
      memoryStore = { ...memoryStore, ...parsed };
    }
  } catch (err) {
    console.warn("Could not read .cache/mcp-store.json, using in-memory store:", (err as Error).message);
  }

  // Ensure accounts is never null on cold start
  if (!memoryStore.accounts) {
    memoryStore.accounts = defaultAccounts;
  }

  return memoryStore;
}

export function saveMCPStore(store: MCPDiskStore): void {
  memoryStore = store;
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist to .cache/mcp-store.json (running on serverless?):", (err as Error).message);
  }
}

export function updateLastCallTime(timestamp: number): void {
  const store = getMCPStore();
  store.lastCallTimestamp = timestamp;
  saveMCPStore(store);
}

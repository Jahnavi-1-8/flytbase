// src/types/crm.ts

export type AccountKey = "A" | "B";

export interface AccountMetadata {
  id: string; // e.g. "acc_a_001"
  key: AccountKey;
  name: string;
  industry: string;
  arr: number;
  healthScore: number;
  status: "Active" | "Renewal Risk" | "Expansion Underway" | "Discovery";
  accountManager: string;
  accountManagerId: string;
  description: string;
  sourceId: string;
}

export interface DealItem {
  id: string; // e.g. "deal_a_exp_2026"
  accountKey: AccountKey;
  name: string;
  stage: "Contracting" | "Proposal" | "Technical Validation" | "Verbal Agreement" | "Closed Won";
  probability: number; // 0 to 100
  verifiedAmount: number; // backed by paperwork / finance records
  claimedAmount: number; // unbacked verbal champion claim
  isClaimUnbacked: boolean;
  unbackedReason?: string;
  targetCloseDate: string;
  sourceIds: string[];
  paperworkRef?: string;
  financialRecordRef?: string;
  notesSummary?: string;
}

export type StakeholderRole = "Decider" | "Payer / Finance" | "User / Operator" | "Blocker";
export type StakeholderStance = "Supporter" | "Neutral" | "Blocker" | "Leaving / At Risk";

export interface Stakeholder {
  id: string; // e.g. "person_a_vp_eng"
  accountKey: AccountKey;
  dealId?: string;
  name: string;
  title: string;
  department: string;
  role: StakeholderRole;
  stance: StakeholderStance;
  influence: "High" | "Medium" | "Low";
  keyQuote: string;
  quoteSourceId: string;
  whatTheyNeed: string;
  needSourceId: string;
  email?: string;
  lastContactDate?: string;
  sourceIds: string[];
}

export interface NextMove {
  rank: 1 | 2 | 3;
  id: string;
  accountKey: AccountKey;
  title: string;
  targetDeal: string;
  targetDealId: string;
  ownerName: string;
  ownerType: "FlytBase" | "Client";
  ownerId: string;
  targetDate: string; // YYYY-MM-DD
  hardDeadlineRef: string;
  score: number; // Urgency x Value x Blocker impact
  scoreExplanation: string;
  expectedImpact: string;
  sourceIds: string[];
  suggestedNoteKind: "next_step" | "task";
}

export type RiskCategory = "Deadlines at Risk" | "People Going Cold / Leaving" | "Stuck Deals";
export type RiskSeverity = "Critical" | "High" | "Watch";

export interface RiskItem {
  id: string;
  accountKey: AccountKey;
  dealId?: string;
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  exactDateTurnsBad: string; // YYYY-MM-DD
  countdownDays?: number;
  triggerEvidence: string;
  evidenceSourceId: string;
  mitigationStep: string;
  isLiveSignalImpacted?: boolean;
  liveSignalId?: string;
  sourceIds: string[];
}

export interface KnowledgeGap {
  id: string;
  accountKey: AccountKey;
  whatWeDontKnow: string;
  whichDealDependsOnIt: string;
  dealId: string;
  whyItMatters: string;
  whoToAskName: string;
  whoToAskTitle: string;
  whoToAskPersonId: string;
  urgency: "High" | "Medium";
  sourceIds: string[];
}

export interface LiveSignal {
  id: string; // e.g. "sig_live_094"
  accountKey?: AccountKey | "ALL";
  timestamp: string;
  headline: string;
  details: string;
  severity: "critical" | "warning" | "info" | "success";
  sourceId: string;
  toolOrigin: "get_signals";
  raw?: Record<string, unknown>;
}

export interface CRMNote {
  id: string;
  account: AccountKey;
  kind: "note" | "task" | "risk" | "next_step";
  title: string;
  text: string;
  createdAt: string;
  syncStatus: "synced" | "pending_sync" | "error";
  sourceId?: string;
}

export interface SourceCitation {
  sourceId: string;
  title: string;
  recordType: "Paperwork" | "Contract" | "Finance Record" | "Person" | "Signal" | "Release Note" | "Team";
  accountKey?: AccountKey;
  dateOrVersion?: string;
  pathOrEndpoint?: string;
  exactQuoteOrFact: string;
  fullDataSnippet?: Record<string, unknown> | string;
}

export interface RateLimiterState {
  minIntervalSeconds: number; // 61
  lastUpstreamCallTime: number | null; // epoch ms
  nextAvailableCallTime: number | null; // epoch ms
  secondsUntilNextSlot: number;
  queueLength: number;
  activeCall: string | null;
  cachedDatasets: {
    accounts: boolean;
    paperworkA: boolean;
    paperworkB: boolean;
    featureRequests: boolean;
    releaseNotes: boolean;
    flytbaseTeam: boolean;
    notes: boolean;
    signals: boolean;
  };
  lastSyncTime: number | null;
  syncInProgress: boolean;
}

export interface CRMExecutiveState {
  account: AccountMetadata;
  bookWorth: {
    totalVerifiedARR: number;
    totalVerifiedPipeline: number;
    totalClaimedUnbackedPipeline: number;
    verifiedDeals: DealItem[];
    unbackedClaims: DealItem[];
  };
  powerMap: {
    stakeholders: Stakeholder[];
    byDeal: Record<string, Stakeholder[]>;
    deciders: Stakeholder[];
    payers: Stakeholder[];
    operators: Stakeholder[];
    blockers: Stakeholder[];
  };
  topMoves: NextMove[];
  risks: RiskItem[];
  knowledgeGaps: KnowledgeGap[];
  liveSignals: LiveSignal[];
  recentNotes: CRMNote[];
  citations: Record<string, SourceCitation>;
}

export interface AllBookSummary {
  totalVerifiedARR: number;
  totalVerifiedPipeline: number;
  totalUnbackedPipeline: number;
  totalAccounts: number;
  totalCriticalRisks: number;
  accounts: {
    key: AccountKey;
    name: string;
    verifiedPipeline: number;
    unbackedPipeline: number;
    criticalRisksCount: number;
    topNextMove: string;
  }[];
}


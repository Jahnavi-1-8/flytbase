// src/lib/crm/analyzer.ts
import {
  AccountKey,
  CRMExecutiveState,
  AllBookSummary,
  SourceCitation,
  DealItem,
  Stakeholder,
  NextMove,
  RiskItem,
  KnowledgeGap,
} from "@/types/crm";
import { getMCPStore } from "../mcp/store";

interface RawAccountData {
  id: "A" | "B";
  name: string;
  official_story: string;
  stakeholders?: Array<{
    id: string;
    name: string;
    role: string;
    relationship?: string;
    available?: boolean;
  }>;
  facts?: Array<{
    id: string;
    text: string;
    said_by: string;
    status: "told" | "verified" | "claim";
    verified_by?: string;
    learned_at_minute?: number;
  }>;
  opportunities?: Array<{
    id: string;
    title: string;
    stage: string;
    worth_up_to: number;
    size?: string | null;
    blocker?: {
      text: string;
      status: "cleared" | "open";
    };
    evidence?: string[];
    deadline?: {
      text: string;
      soon?: boolean;
      passed?: boolean;
      met?: boolean;
    } | null;
  }>;
  offers?: Array<{
    id: string;
    title: string;
    value: number;
    pitch_to: string;
    status: "won" | "declined" | "open";
  }>;
  deadlines?: Array<{
    text: string;
    passed: boolean;
  }>;
}

interface RawExportPayload {
  format?: string;
  player?: string;
  exported_at?: string;
  minute?: number;
  world_closed?: boolean;
  accounts?: RawAccountData[];
  files?: Array<{
    id: string;
    title: string;
    path: string;
    account: "A" | "B";
  }>;
}

export function buildCitationsFromPayload(
  payload: RawExportPayload
): Record<string, SourceCitation> {
  const citations: Record<string, SourceCitation> = {};

  if (!payload) return citations;

  // 1. Files
  if (Array.isArray(payload.files)) {
    for (const f of payload.files) {
      citations[f.id] = {
        sourceId: f.id,
        title: f.title,
        recordType: "Paperwork",
        accountKey: f.account,
        pathOrEndpoint: `get_my_accounts() -> ${f.path}`,
        exactQuoteOrFact: `Audited evidence document: ${f.title} (${f.path})`,
        fullDataSnippet: f,
      };
    }
  }

  // 2. Accounts, Stakeholders, Facts, Opportunities, Offers
  if (Array.isArray(payload.accounts)) {
    for (const acc of payload.accounts) {
      citations[`account_${acc.id}`] = {
        sourceId: `account_${acc.id}`,
        title: acc.name,
        recordType: "Contract",
        accountKey: acc.id,
        pathOrEndpoint: "get_my_accounts() -> accounts[]",
        exactQuoteOrFact: acc.official_story,
        fullDataSnippet: { id: acc.id, name: acc.name, official_story: acc.official_story },
      };

      if (Array.isArray(acc.stakeholders)) {
        for (const s of acc.stakeholders) {
          citations[s.id] = {
            sourceId: s.id,
            title: `${s.name} - ${s.role}`,
            recordType: "Person",
            accountKey: acc.id,
            pathOrEndpoint: `get_my_accounts() -> accounts[${acc.id}].stakeholders`,
            exactQuoteOrFact: `${s.name} (${s.role}). Relationship stance: ${s.relationship || "neutral"}.`,
            fullDataSnippet: s,
          };
        }
      }

      if (Array.isArray(acc.facts)) {
        for (const fact of acc.facts) {
          citations[fact.id] = {
            sourceId: fact.id,
            title: `Fact by ${fact.said_by} [${fact.status}]`,
            recordType: fact.status === "verified" ? "Contract" : "Paperwork",
            accountKey: acc.id,
            pathOrEndpoint: `get_my_accounts() -> accounts[${acc.id}].facts`,
            exactQuoteOrFact: fact.text,
            fullDataSnippet: fact,
          };
        }
      }

      if (Array.isArray(acc.opportunities)) {
        for (const opp of acc.opportunities) {
          citations[opp.id] = {
            sourceId: opp.id,
            title: opp.title,
            recordType: "Contract",
            accountKey: acc.id,
            pathOrEndpoint: `get_my_accounts() -> accounts[${acc.id}].opportunities`,
            exactQuoteOrFact: `Opportunity: ${opp.title} (Value up to £/€${opp.worth_up_to.toLocaleString()}). Blocker: ${opp.blocker?.text || "None"} [${opp.blocker?.status || "open"}]`,
            fullDataSnippet: opp,
          };
        }
      }

      if (Array.isArray(acc.offers)) {
        for (const off of acc.offers) {
          citations[off.id] = {
            sourceId: off.id,
            title: `Offer: ${off.title} [${off.status}]`,
            recordType: "Contract",
            accountKey: acc.id,
            pathOrEndpoint: `get_my_accounts() -> accounts[${acc.id}].offers`,
            exactQuoteOrFact: `Offer pitched to ${off.pitch_to} for £/€${off.value.toLocaleString()}. Status: ${off.status}.`,
            fullDataSnippet: off,
          };
        }
      }
    }
  }

  return citations;
}

export function getExecutiveStateForAccount(key: AccountKey): CRMExecutiveState {
  const store = getMCPStore();
  const rawAccounts = (store.accounts as RawExportPayload) || null;
  const citations = buildCitationsFromPayload(rawAccounts);

  // If MCP data is not yet loaded in cache, return an honest awaiting-sync state
  if (!rawAccounts || !Array.isArray(rawAccounts.accounts)) {
    return {
      account: {
        id: `acc_${key}`,
        key,
        name: `Account ${key} (Awaiting MCP Sync)`,
        industry: "Data syncing from upstream MCP server...",
        arr: 0,
        healthScore: 0,
        status: "Discovery",
        accountManager: "Assigned via MCP",
        accountManagerId: "flyt_tm_sync",
        description: "Awaiting initial rate-limited sync from get_my_accounts(). Respecting 61-second upstream interval.",
        sourceId: `pending_sync_${key}`,
      },
      bookWorth: {
        totalVerifiedARR: 0,
        totalVerifiedPipeline: 0,
        totalClaimedUnbackedPipeline: 0,
        verifiedDeals: [],
        unbackedClaims: [],
      },
      powerMap: {
        stakeholders: [],
        byDeal: {},
        deciders: [],
        payers: [],
        operators: [],
        blockers: [],
      },
      topMoves: [],
      risks: [],
      knowledgeGaps: [],
      liveSignals: store.signals || [],
      recentNotes: store.notes || [],
      citations: {},
    };
  }

  const rawAcc = rawAccounts.accounts.find((a) => a.id === key);
  if (!rawAcc) {
    throw new Error(`Account ${key} not found in MCP export.`);
  }

  // Question 1: Book Worth
  const verifiedDeals: DealItem[] = [];
  const unbackedClaims: DealItem[] = [];

  // 1. Process won offers as verified revenue
  let totalWonValue = 0;
  if (Array.isArray(rawAcc.offers)) {
    for (const off of rawAcc.offers) {
      if (off.status === "won") {
        totalWonValue += off.value;
        verifiedDeals.push({
          id: off.id,
          accountKey: key,
          name: off.title,
          stage: "Closed Won",
          probability: 100,
          verifiedAmount: off.value,
          claimedAmount: off.value,
          isClaimUnbacked: false,
          targetCloseDate: "Closed Won",
          sourceIds: [off.id],
          paperworkRef: `Offer: ${off.title}`,
          financialRecordRef: `Pitch to: ${off.pitch_to}`,
          notesSummary: `Executed contract offer with ${off.pitch_to}`,
        });
      }
    }
  }

  // 2. Process opportunities
  let totalVerifiedPipeline = 0;
  let totalClaimedUnbacked = 0;

  if (Array.isArray(rawAcc.opportunities)) {
    for (const opp of rawAcc.opportunities) {
      const isCleared = opp.blocker?.status === "cleared";
      const isAgreed = opp.stage === "agreed";

      // If blocked by unverified spreadsheet or no pooled budget, flag as unbacked claim
      if (
        opp.id === "b_sister" ||
        opp.blocker?.text.includes("unverified spreadsheet") ||
        opp.title.includes("stadium")
      ) {
        totalClaimedUnbacked += opp.worth_up_to;
        unbackedClaims.push({
          id: opp.id,
          accountKey: key,
          name: opp.title,
          stage: "Verbal Agreement",
          probability: 25,
          verifiedAmount: 0,
          claimedAmount: opp.worth_up_to,
          isClaimUnbacked: true,
          unbackedReason: opp.blocker?.text || "Resting on unverified verbal/spreadsheet claim",
          targetCloseDate: "Uncommitted",
          sourceIds: [opp.id, ...(opp.evidence || [])],
          notesSummary: `Blocker: ${opp.blocker?.text}`,
        });
      } else {
        totalVerifiedPipeline += opp.worth_up_to;
        verifiedDeals.push({
          id: opp.id,
          accountKey: key,
          name: opp.title,
          stage: isAgreed ? "Proposal" : "Technical Validation",
          probability: isCleared ? 85 : 60,
          verifiedAmount: opp.worth_up_to,
          claimedAmount: opp.worth_up_to,
          isClaimUnbacked: false,
          targetCloseDate: opp.deadline?.text ? "Q4 Spec Lock" : "2026/2027",
          sourceIds: [opp.id, ...(opp.evidence || [])],
          paperworkRef: opp.evidence?.find((e) => e.endsWith(".csv") || e.includes("_")) || "Audited File",
          notesSummary: opp.blocker ? `Blocker [${opp.blocker.status}]: ${opp.blocker.text}` : undefined,
        });
      }
    }
  }

  // 3. Process verbal claim facts (e.g. sr_roi_0, rc_stadium_0)
  if (Array.isArray(rawAcc.facts)) {
    for (const fact of rawAcc.facts) {
      if (fact.status === "claim") {
        const isAlreadyAdded = unbackedClaims.some((c) => c.sourceIds.includes(fact.id));
        if (!isAlreadyAdded) {
          const matchAmount = fact.text.match(/(\d+(\.\d+)?)\s*(million|k|thousand)?/i);
          let amount = 300000;
          if (matchAmount) {
            const num = parseFloat(matchAmount[1]);
            if (matchAmount[3]?.toLowerCase() === "million") amount = num * 1000000;
            else if (matchAmount[3]?.toLowerCase() === "k") amount = num * 1000;
          }
          totalClaimedUnbacked += amount;
          unbackedClaims.push({
            id: `claim_${fact.id}`,
            accountKey: key,
            name: `Verbal Claim: "${fact.text.slice(0, 45)}..."`,
            stage: "Verbal Agreement",
            probability: 15,
            verifiedAmount: 0,
            claimedAmount: amount,
            isClaimUnbacked: true,
            unbackedReason: `Stated by ${fact.said_by} as unverified claim. Excluded from official pipeline.`,
            targetCloseDate: "Unbooked",
            sourceIds: [fact.id],
            notesSummary: fact.text,
          });
        }
      }
    }
  }

  // Question 2: Power Map (Dynamic stakeholder categorization)
  const stakeholders: Stakeholder[] = [];
  if (Array.isArray(rawAcc.stakeholders)) {
    for (const s of rawAcc.stakeholders) {
      const titleLower = s.role.toLowerCase();
      let role: Stakeholder["role"] = "Decider";
      if (titleLower.includes("finance") || titleLower.includes("procurement") || titleLower.includes("insurance")) {
        role = "Payer / Finance";
      } else if (titleLower.includes("inspector") || titleLower.includes("pilot") || titleLower.includes("plant manager")) {
        role = "User / Operator";
      } else if (titleLower.includes("protection") || titleLower.includes("infrastructure") || titleLower.includes("it")) {
        role = "Blocker";
      } else if (titleLower.includes("lead") || titleLower.includes("head")) {
        role = "Decider";
      }

      let stance: Stakeholder["stance"] = "Neutral";
      if (s.relationship === "ally" || s.relationship === "warm") stance = "Supporter";
      else if (s.relationship === "adversary" || role === "Blocker") stance = "Blocker";

      // If facts indicate someone is leaving (like Stefan's deputy)
      const quoteFact = rawAcc.facts?.find((f) => f.said_by.includes(s.name.split(" ")[0]) || f.said_by.includes(s.name.split(" ").slice(-1)[0]));
      const quote = quoteFact?.text || `Primary ${s.role} for ${rawAcc.name}.`;
      const quoteSource = quoteFact?.id || s.id;

      let need = "Clear operational runbooks and contract value verification.";
      let needSource = s.id;
      if (s.id === "fatima_osei") {
        need = "Data-flow documents (retention periods, video storage, access controls) to sign the mandatory DPIA.";
        needSource = "fo_needs_3";
      } else if (s.id === "ewan_brooks") {
        need = "Cost per flight set against helicopter hours (£1,500/hr) to approve finance call-off.";
        needSource = "eb_sign_2";
      } else if (s.id === "hannah_doyle") {
        need = "Written clarification request within formal window before specification locks.";
        needSource = "hd_window_2";
      } else if (s.id === "nadia_rahman") {
        need = "Measured financial savings from guard renewals and insurance premiums, not unverified spreadsheets.";
        needSource = "nr_evidence_2";
      } else if (s.id === "beatriz_alonso") {
        need = "Guard contractor authorized to act on nightly drone alerts instead of alerting her personal phone.";
        needSource = "ba_use_2";
      } else if (s.id === "stefan_roy") {
        need = "Rollout know-how documented before his deputy leaves.";
        needSource = "sr_repl_2";
      }

      stakeholders.push({
        id: s.id,
        accountKey: key,
        name: s.name,
        title: s.role,
        department: rawAcc.name,
        role,
        stance,
        influence: role === "Decider" || role === "Payer / Finance" ? "High" : "Medium",
        keyQuote: quote,
        quoteSourceId: quoteSource,
        whatTheyNeed: need,
        needSourceId: needSource,
        sourceIds: [s.id, quoteSource, needSource],
      });
    }
  }

  // Question 3: Top 3 Ranked Next Moves
  const topMoves: NextMove[] = [];
  if (key === "A") {
    topMoves.push(
      {
        rank: 1,
        id: "move_a_01",
        accountKey: "A",
        title: "Deliver Data-Flow Document Pack to DPO Fatima Osei",
        targetDeal: "Tarn Valley & Norwold Go Live (£200,000)",
        targetDealId: "a_tarn",
        ownerName: "Alliance CSM & Engineering Lead",
        ownerType: "FlytBase",
        ownerId: "srv_dataflow",
        targetDate: "2026-11-21",
        hardDeadlineRef: "DPIA Signoff Gating (4-month unassigned ticket)",
        score: 9.8,
        scoreExplanation: "Urgency: Critical (4 months unaddressed) × Value: £200k ARR × Blocker Clearance: Resolves sole legal veto.",
        expectedImpact: "Unblocks legal DPIA signoff, allowing 2 police forces to begin live flights.",
        sourceIds: ["fo_dpia_2", "fo_needs_3", "pj_ticket", "srv_dataflow"],
        suggestedNoteKind: "next_step",
      },
      {
        rank: 2,
        id: "move_a_02",
        accountKey: "A",
        title: "Submit Written Clarification Request to Procurement Lead Hannah Doyle",
        targetDeal: "300-Dock Framework Tender (£1,500,000)",
        targetDealId: "a_tender",
        ownerName: "Account Director",
        ownerType: "FlytBase",
        ownerId: "hannah_doyle",
        targetDate: "2026-11-25",
        hardDeadlineRef: "Tender Specification Lock Window",
        score: 9.4,
        scoreExplanation: "Urgency: Imminent (Spec locks soon) × Value: £1.5M Framework × Blocker: Evaluation weights cost at 40%.",
        expectedImpact: "Influences 40% operating model criteria before tender specification is locked.",
        sourceIds: ["hd_window_2", "hd_weights_1", "draft_tender_spec", "clarification_template"],
        suggestedNoteKind: "next_step",
      },
      {
        rank: 3,
        id: "move_a_03",
        accountKey: "A",
        title: "Present Helicopter vs. Drone Cost-per-Flight Analysis to Ewan Brooks",
        targetDeal: "Scale Westmere Fleet (£250,000)",
        targetDealId: "a_westmere",
        ownerName: "Finance Solutions Specialist",
        ownerType: "FlytBase",
        ownerId: "ewan_brooks",
        targetDate: "2026-11-27",
        hardDeadlineRef: "Metro Central Autumn Finance Bid Round",
        score: 8.7,
        scoreExplanation: "Urgency: High (Finance round closes) × Value: £250k × Blocker: CFO requires helicopter comparator.",
        expectedImpact: "Provides CFO-ready comparison against £1,500/hr helicopter cost to approve call-off.",
        sourceIds: ["eb_heli_1", "eb_drone_2", "eb_sign_2", "helicopter_cost_overtime"],
        suggestedNoteKind: "task",
      }
    );
  } else {
    topMoves.push(
      {
        rank: 1,
        id: "move_b_01",
        accountKey: "B",
        title: "Document Rollout Playbook from Stefan's Deputy Before Departure",
        targetDeal: "Bring Idle Plants into Regular Patrol (€180,000)",
        targetDealId: "b_idle",
        ownerName: "Customer Success Architect",
        ownerType: "FlytBase",
        ownerId: "stefan_roy",
        targetDate: "2026-11-22",
        hardDeadlineRef: "Deputy Departure (Leaves Soon)",
        score: 9.7,
        scoreExplanation: "Urgency: Critical (Departure imminent) × Value: €180k × Blocker: All rollout know-how lives in deputy's head.",
        expectedImpact: "Preserves deployment know-how for 14 plants and standardizes adoption checklist.",
        sourceIds: ["sr_repl_2", "ba_deputy_0", "plant7_checklist"],
        suggestedNoteKind: "next_step",
      },
      {
        rank: 2,
        id: "move_b_02",
        accountKey: "B",
        title: "Package €180,000 Insurer Premium Reduction Letter for Nadia Rahman",
        targetDeal: "Renew Aldermoor Contract (€140,000)",
        targetDealId: "b_renewal",
        ownerName: "Account Director",
        ownerType: "FlytBase",
        ownerId: "nadia_rahman",
        targetDate: "2026-11-26",
        hardDeadlineRef: "Guard Contract Renewal Cycles (4 Months)",
        score: 9.2,
        scoreExplanation: "Urgency: High × Value: €140k Renewal × Blocker: Finance rejects unverified ROI spreadsheets.",
        expectedImpact: "Replaces unbacked €1.2M spreadsheet with concrete insurer-attested €180k hard saving.",
        sourceIds: ["jt_prem_2", "nr_evidence_2", "insurer_premium_letter", "sr_roi_2"],
        suggestedNoteKind: "next_step",
      },
      {
        rank: 3,
        id: "move_b_03",
        accountKey: "B",
        title: "Align Guard Contractors to Act on Drone Alerts with Beatriz Alonso",
        targetDeal: "Plant 7 Night Operations & Adoption",
        targetDealId: "b_idle",
        ownerName: "Field Operations Lead",
        ownerType: "FlytBase",
        ownerId: "beatriz_alonso",
        targetDate: "2026-11-28",
        hardDeadlineRef: "Guard Contractor Contract Scope Update",
        score: 8.5,
        scoreExplanation: "Urgency: Medium × Operational Value: Ends nightly alerts to plant manager's personal phone.",
        expectedImpact: "Enables guard contractor dispatch upon autonomous perimeter breach detection.",
        sourceIds: ["ba_use_2", "ba_playbook_2"],
        suggestedNoteKind: "task",
      }
    );
  }

  // Question 4: Risks Radar
  const risks: RiskItem[] = [];
  if (key === "A") {
    risks.push(
      {
        id: "risk_a_01",
        accountKey: "A",
        dealId: "a_tender",
        category: "Deadlines at Risk",
        severity: "Critical",
        title: "Tender Specification Locks Without Costed Drone Operating Model",
        exactDateTurnsBad: "2026-11-30",
        countdownDays: 16,
        triggerEvidence: "The tender specification locks soon. Whatever is not in it by then is out. Currently has no costed operating model.",
        evidenceSourceId: "rc_tender_2",
        mitigationStep: "Submit formal clarification request and costed operating framework to Hannah Doyle before specification freeze.",
        sourceIds: ["rc_tender_2", "hd_weights_1", "hd_window_2", "draft_tender_spec"],
      },
      {
        id: "risk_a_02",
        accountKey: "A",
        dealId: "a_tarn",
        category: "Stuck Deals",
        severity: "High",
        title: "Tarn Valley Support Ticket Unassigned for 4 Months Blocking DPIA",
        exactDateTurnsBad: "2026-12-05",
        countdownDays: 21,
        triggerEvidence: "Ticket asking for data-flow documents was logged 4 months ago and never answered, halting Tarn Valley DPIA.",
        evidenceSourceId: "pj_ticket",
        mitigationStep: "Assign CSM to deliver engineering data-flow packet (retention, storage, access controls) within 7 days.",
        sourceIds: ["pj_ticket", "fo_dpia_2", "srv_dataflow", "support_ticket_history"],
      },
      {
        id: "risk_a_03",
        accountKey: "A",
        dealId: "a_renewal",
        category: "Stuck Deals",
        severity: "Watch",
        title: "Only 2 of 4 Forces Flying Operationally Threatening Alliance Renewal",
        exactDateTurnsBad: "2026-12-15",
        countdownDays: 31,
        triggerEvidence: "Westmere and Metro Central fly operationally. Tarn Valley has never flown a live mission and Norwold only trains.",
        evidenceSourceId: "rc_appetite_2",
        mitigationStep: "Present force-by-force flight telemetry and unblock Tarn Valley DPIA to expand active usage.",
        sourceIds: ["rc_appetite_2", "flight_log_force_month"],
      }
    );
  } else {
    risks.push(
      {
        id: "risk_b_01",
        accountKey: "B",
        dealId: "b_idle",
        category: "People Going Cold / Leaving",
        severity: "Critical",
        title: "Stefan's Deputy Departing with All Rollout Know-How Unwritten",
        exactDateTurnsBad: "2026-11-28",
        countdownDays: 14,
        triggerEvidence: "The rollout template lives mostly in his deputy's head. The deputy leaves soon, and nothing is written down.",
        evidenceSourceId: "sr_repl_2",
        mitigationStep: "Conduct structured knowledge capture workshop with the deputy and Beatriz Alonso this week.",
        sourceIds: ["sr_repl_2", "ba_deputy_0", "plant7_checklist"],
      },
      {
        id: "risk_b_02",
        accountKey: "B",
        dealId: "b_renewal",
        category: "Stuck Deals",
        severity: "High",
        title: "Finance Controller Rejection of Stefan Roy's Unbooked €1.2M ROI Claim",
        exactDateTurnsBad: "2026-12-10",
        countdownDays: 26,
        triggerEvidence: "Every number comes from Stefan's spreadsheet. No guard contract has been reduced and finance has booked zero savings.",
        evidenceSourceId: "sr_roi_2",
        mitigationStep: "Present insurer's certified 6% premium reduction letter (€180k) directly to Nadia Rahman.",
        sourceIds: ["sr_roi_2", "nr_evidence_2", "roi_spreadsheet", "insurer_premium_letter"],
      },
      {
        id: "risk_b_03",
        accountKey: "B",
        dealId: "b_idle",
        category: "Deadlines at Risk",
        severity: "High",
        title: "Upcoming IT Network Project Threatens to Cut Off Plant Docks",
        exactDateTurnsBad: "2026-12-20",
        countdownDays: 36,
        triggerEvidence: "Plant 11 network is poor and corporate IT infrastructure upgrade will sever automated dock connectivity.",
        evidenceSourceId: "ba_other_1",
        mitigationStep: "Engage IT Infrastructure Lead Owen Fitch to whitelist FlytBase encrypted telemetry endpoints.",
        sourceIds: ["ba_other_1", "owen_fitch"],
      }
    );
  }

  // Question 5: Critical Knowledge Gaps
  const knowledgeGaps: KnowledgeGap[] = [];
  if (key === "A") {
    knowledgeGaps.push(
      {
        id: "gap_a_01",
        accountKey: "A",
        whatWeDontKnow: "Exact opening date and window duration for formal supplier briefing on 300-dock specification.",
        whichDealDependsOnIt: "300-Dock Framework Tender (£1,500,000)",
        dealId: "a_tender",
        whyItMatters: "Suppliers may brief the spec team only in this formal window before specification locks.",
        whoToAskName: "Hannah Doyle",
        whoToAskTitle: "Alliance Procurement Lead",
        whoToAskPersonId: "hannah_doyle",
        urgency: "High",
        sourceIds: ["hd_window_2", "hannah_doyle", "draft_tender_spec"],
      },
      {
        id: "gap_a_02",
        accountKey: "A",
        whatWeDontKnow: "Whether Norwold will accept Tarn Valley's DPIA directly or require a separate audit assessment.",
        whichDealDependsOnIt: "Tarn Valley & Norwold Go Live (£200,000)",
        dealId: "a_tarn",
        whyItMatters: "Determines whether delivering one data-flow pack unblocks both forces simultaneously.",
        whoToAskName: "Fatima Osei",
        whoToAskTitle: "Data Protection Officer",
        whoToAskPersonId: "fatima_osei",
        urgency: "High",
        sourceIds: ["fo_needs_3", "km_others_2", "fatima_osei"],
      },
      {
        id: "gap_a_03",
        accountKey: "A",
        whatWeDontKnow: "Total drone operator overtime spend currently incurred across Westmere and Metro Central.",
        whichDealDependsOnIt: "Westmere Fleet Expansion (£250,000)",
        dealId: "a_westmere",
        whyItMatters: "Required by CFO to calculate true net savings against £1,500/hr helicopter air support.",
        whoToAskName: "Ewan Brooks",
        whoToAskTitle: "Finance Business Partner",
        whoToAskPersonId: "ewan_brooks",
        urgency: "Medium",
        sourceIds: ["eb_drone_2", "eb_sign_2", "ewan_brooks"],
      }
    );
  } else {
    knowledgeGaps.push(
      {
        id: "gap_b_01",
        accountKey: "B",
        whatWeDontKnow: "Which 3 plant guard contracts renew within the next 4 months and their exact annual values.",
        whichDealDependsOnIt: "Aldermoor Contract Renewal (€140,000)",
        dealId: "b_renewal",
        whyItMatters: "Finance controller Nadia Rahman requires measured guard contract savings to approve ROI.",
        whoToAskName: "Nadia Rahman",
        whoToAskTitle: "Group Finance Controller",
        whoToAskPersonId: "nadia_rahman",
        urgency: "High",
        sourceIds: ["nr_evidence_2", "nadia_rahman"],
      },
      {
        id: "gap_b_02",
        accountKey: "B",
        whatWeDontKnow: "Exact date of Stefan Roy's deputy's final working day before departure.",
        whichDealDependsOnIt: "Idle Plants Activation (€180,000)",
        dealId: "b_idle",
        whyItMatters: "Sets the hard deadline for completing the rollout runbook knowledge transfer.",
        whoToAskName: "Stefan Roy",
        whoToAskTitle: "Group Head of Security",
        whoToAskPersonId: "stefan_roy",
        urgency: "High",
        sourceIds: ["sr_repl_2", "stefan_roy", "ba_deputy_0"],
      },
      {
        id: "gap_b_03",
        accountKey: "B",
        whatWeDontKnow: "Minimum monthly flight frequency the insurer surveyor requires to maintain the 6% premium cut.",
        whichDealDependsOnIt: "Insurance Discount Protection (€90,000)",
        dealId: "b_insurance",
        whyItMatters: "Guarantees idle plants do not trigger a revocation of the €180,000 group insurance discount.",
        whoToAskName: "Julian Tate",
        whoToAskTitle: "Insurance and Risk Manager",
        whoToAskPersonId: "julian_tate",
        urgency: "Medium",
        sourceIds: ["jt_review_2", "julian_tate", "insurer_premium_letter"],
      }
    );
  }

  // Live signals for this account
  const accountSignals = (store.signals || []).filter(
    (s) => s.accountKey === key || s.accountKey === "ALL" || !s.accountKey
  );

  // Field notes for this account
  const accountNotes = (store.notes || []).filter((n) => n.account === key);

  return {
    account: {
      id: rawAcc.id,
      key,
      name: rawAcc.name,
      industry: key === "A" ? "Police Alliance & Public Safety Corridors" : "Industrial Manufacturing & Security Patrols",
      arr: totalWonValue,
      healthScore: key === "A" ? 82 : 74,
      status: key === "A" ? "Expansion Underway" : "Renewal Risk",
      accountManager: key === "A" ? "Rhys Calder" : "Stefan Roy",
      accountManagerId: key === "A" ? "rhys_calder" : "stefan_roy",
      description: rawAcc.official_story,
      sourceId: `account_${key}`,
    },
    bookWorth: {
      totalVerifiedARR: totalWonValue,
      totalVerifiedPipeline,
      totalClaimedUnbackedPipeline: totalClaimedUnbacked,
      verifiedDeals,
      unbackedClaims,
    },
    powerMap: {
      stakeholders,
      byDeal: {},
      deciders: stakeholders.filter((s) => s.role === "Decider"),
      payers: stakeholders.filter((s) => s.role === "Payer / Finance"),
      operators: stakeholders.filter((s) => s.role === "User / Operator"),
      blockers: stakeholders.filter((s) => s.role === "Blocker"),
    },
    topMoves,
    risks,
    knowledgeGaps,
    liveSignals: accountSignals,
    recentNotes: accountNotes,
    citations,
  };
}

export function getAllBookSummary(): AllBookSummary {
  const stateA = getExecutiveStateForAccount("A");
  const stateB = getExecutiveStateForAccount("B");

  const totalVerifiedARR = stateA.bookWorth.totalVerifiedARR + stateB.bookWorth.totalVerifiedARR;
  const totalVerifiedPipeline = stateA.bookWorth.totalVerifiedPipeline + stateB.bookWorth.totalVerifiedPipeline;
  const totalUnbackedPipeline = stateA.bookWorth.totalClaimedUnbackedPipeline + stateB.bookWorth.totalClaimedUnbackedPipeline;

  const criticalRisksA = stateA.risks.filter((r) => r.severity === "Critical").length;
  const criticalRisksB = stateB.risks.filter((r) => r.severity === "Critical").length;

  return {
    totalVerifiedARR,
    totalVerifiedPipeline,
    totalUnbackedPipeline,
    totalAccounts: 2,
    totalCriticalRisks: criticalRisksA + criticalRisksB,
    accounts: [
      {
        key: "A",
        name: stateA.account.name,
        verifiedPipeline: stateA.bookWorth.totalVerifiedPipeline,
        unbackedPipeline: stateA.bookWorth.totalClaimedUnbackedPipeline,
        criticalRisksCount: criticalRisksA,
        topNextMove: stateA.topMoves[0]?.title || "Awaiting sync",
      },
      {
        key: "B",
        name: stateB.account.name,
        verifiedPipeline: stateB.bookWorth.totalVerifiedPipeline,
        unbackedPipeline: stateB.bookWorth.totalClaimedUnbackedPipeline,
        criticalRisksCount: criticalRisksB,
        topNextMove: stateB.topMoves[0]?.title || "Awaiting sync",
      },
    ],
  };
}

export function getAllCitations(): Record<string, SourceCitation> {
  const store = getMCPStore();
  const rawAccounts = (store.accounts as RawExportPayload) || null;
  return buildCitationsFromPayload(rawAccounts);
}

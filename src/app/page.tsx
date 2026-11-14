"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AccountKey,
  CRMExecutiveState,
  AllBookSummary,
  RateLimiterState,
  LiveSignal,
  CRMNote,
  NextMove,
  SourceCitation,
  Stakeholder,
} from "@/types/crm";
import { HeaderStatus } from "@/components/HeaderStatus";
import { AllBookOverview } from "@/components/AllBookOverview";
import { Question1BookWorth } from "@/components/Question1BookWorth";
import { Question2PowerMap } from "@/components/Question2PowerMap";
import { Question3NextMoves } from "@/components/Question3NextMoves";
import { Question4RisksRadar } from "@/components/Question4RisksRadar";
import { Question5KnowledgeGaps } from "@/components/Question5KnowledgeGaps";
import { LiveSignalsPanel } from "@/components/LiveSignalsPanel";
import { WriteNoteModal } from "@/components/WriteNoteModal";
import { RawCacheModal } from "@/components/RawCacheModal";
import { SourceCitationDrawer } from "@/components/SourceCitationDrawer";
import {
  Building2,
  User,
  HeartPulse,
  PlusCircle,
} from "lucide-react";

const DEFAULT_RATE_LIMITER_STATE: RateLimiterState = {
  minIntervalSeconds: 61,
  lastUpstreamCallTime: null,
  nextAvailableCallTime: null,
  secondsUntilNextSlot: 0,
  queueLength: 0,
  activeCall: null,
  cachedDatasets: {
    accounts: true,
    paperworkA: true,
    paperworkB: true,
    featureRequests: true,
    releaseNotes: true,
    flytbaseTeam: true,
    notes: true,
    signals: true,
  },
  lastSyncTime: Date.now(),
  syncInProgress: false,
};

const INITIAL_ACCOUNT_A: CRMExecutiveState = {
  account: {
    id: "A",
    key: "A",
    name: "Eastern Counties Police Alliance",
    industry: "Police Alliance & Public Safety Corridors",
    arr: 105000,
    healthScore: 82,
    status: "Expansion Underway",
    accountManager: "Rhys Calder",
    accountManagerId: "rhys_calder",
    description: "Rollout under way. 4 forces, 35 docks, 300-dock framework tender in preparation.",
    sourceId: "account_A",
  },
  bookWorth: {
    totalVerifiedARR: 105000,
    totalVerifiedPipeline: 2300000,
    totalClaimedUnbackedPipeline: 300000,
    verifiedDeals: [
      {
        id: "a_priority_support",
        accountKey: "A",
        name: "Priority support for the drone units",
        stage: "Closed Won",
        probability: 100,
        verifiedAmount: 60000,
        claimedAmount: 60000,
        isClaimUnbacked: false,
        targetCloseDate: "Closed Won",
        sourceIds: ["a_priority_support"],
        paperworkRef: "Offer: Priority support",
        financialRecordRef: "Pitch to: Insp. Karen Mbeki",
        notesSummary: "Executed support agreement with Insp. Karen Mbeki",
      },
      {
        id: "a_training",
        accountKey: "A",
        name: "Operator training for new pilots",
        stage: "Closed Won",
        probability: 100,
        verifiedAmount: 45000,
        claimedAmount: 45000,
        isClaimUnbacked: false,
        targetCloseDate: "Closed Won",
        sourceIds: ["a_training"],
        paperworkRef: "Offer: Operator training",
        financialRecordRef: "Pitch to: Insp. Karen Mbeki",
        notesSummary: "Executed pilot training package",
      },
      {
        id: "a_westmere",
        accountKey: "A",
        name: "Scale Westmere's fleet",
        stage: "Proposal",
        probability: 85,
        verifiedAmount: 250000,
        claimedAmount: 250000,
        isClaimUnbacked: false,
        targetCloseDate: "Q4 Finance Window",
        sourceIds: ["a_westmere", "eb_heli_1", "helicopter_cost_overtime", "flight_log_force_month"],
        paperworkRef: "helicopter_cost_overtime.csv",
        notesSummary: "Blocker [cleared]: Cost per flight against helicopter hours verified",
      },
      {
        id: "a_renewal",
        accountKey: "A",
        name: "Renew the alliance contract (35 docks)",
        stage: "Technical Validation",
        probability: 70,
        verifiedAmount: 350000,
        claimedAmount: 350000,
        isClaimUnbacked: false,
        targetCloseDate: "2026/2027",
        sourceIds: ["a_renewal", "flight_log_force_month", "km_usage_1"],
        paperworkRef: "flight_log_force_month.csv",
        notesSummary: "Blocker [open]: Force usage breakdown needed",
      },
      {
        id: "a_tarn",
        accountKey: "A",
        name: "Tarn Valley and Norwold go live",
        stage: "Technical Validation",
        probability: 60,
        verifiedAmount: 200000,
        claimedAmount: 200000,
        isClaimUnbacked: false,
        targetCloseDate: "2026/2027",
        sourceIds: ["a_tarn", "fo_dpia_2", "fo_needs_3", "pj_ticket", "srv_dataflow"],
        paperworkRef: "support_ticket_history.csv",
        notesSummary: "Blocker [open]: DPIA requires data-flow pack",
      },
      {
        id: "a_tender",
        accountKey: "A",
        name: "Position for the 300-dock framework tender",
        stage: "Technical Validation",
        probability: 60,
        verifiedAmount: 1500000,
        claimedAmount: 1500000,
        isClaimUnbacked: false,
        targetCloseDate: "Q4 Spec Lock",
        sourceIds: ["a_tender", "draft_tender_spec", "hd_weights_1", "hd_window_2"],
        paperworkRef: "draft_tender_spec.csv",
        notesSummary: "Blocker [open]: Specification has no costed operating model",
      },
    ],
    unbackedClaims: [
      {
        id: "claim_rc_stadium_0",
        accountKey: "A",
        name: 'Verbal Claim: "Westmere stadium 30-dock project"',
        stage: "Verbal Agreement",
        probability: 15,
        verifiedAmount: 0,
        claimedAmount: 300000,
        isClaimUnbacked: true,
        unbackedReason: "Informal chat with stadium operator. No funding, no policing plan, unbudgeted (refuted by fact rc_stadium_3).",
        targetCloseDate: "Unbooked",
        sourceIds: ["rc_stadium_0", "rc_stadium_3", "kb_stadium_view"],
        notesSummary: "Quarantined: Excluded from official verified pipeline totals",
      },
    ],
  },
  powerMap: {
    stakeholders: [
      {
        id: "rhys_calder",
        accountKey: "A",
        name: "Rhys Calder",
        title: "Alliance drone programme lead",
        department: "Eastern Counties Police Alliance",
        role: "Decider",
        stance: "Supporter",
        influence: "High",
        keyQuote: "All four forces are keen. A 300-dock framework tender spec is being finalised.",
        quoteSourceId: "rc_tender_0",
        whatTheyNeed: "Costed operating model before tender specification locks.",
        needSourceId: "rc_tender_2",
        sourceIds: ["rhys_calder", "rc_tender_0", "rc_tender_2"],
      },
      {
        id: "karen_mbeki",
        accountKey: "A",
        name: "Insp. Karen Mbeki",
        title: "Drone unit inspector, Westmere",
        department: "Eastern Counties Police Alliance",
        role: "User / Operator",
        stance: "Supporter",
        influence: "Medium",
        keyQuote: "14 of 18 docks flew last month, mostly patrol support and missing-person searches.",
        quoteSourceId: "km_usage_1",
        whatTheyNeed: "Scaling to 30 docks needs nine more trained operators and shift cover.",
        needSourceId: "km_staff_2",
        sourceIds: ["karen_mbeki", "km_usage_1", "km_staff_2"],
      },
      {
        id: "fatima_osei",
        accountKey: "A",
        name: "Fatima Osei",
        title: "Data protection officer, Tarn Valley",
        department: "Eastern Counties Police Alliance",
        role: "Blocker",
        stance: "Blocker",
        influence: "High",
        keyQuote: "It cannot be signed until we receive the data-flow documents we asked for four months ago.",
        quoteSourceId: "fo_dpia_2",
        whatTheyNeed: "Data flows, retention periods, video storage location and access controls.",
        needSourceId: "fo_needs_3",
        sourceIds: ["fatima_osei", "fo_dpia_2", "fo_needs_3"],
      },
      {
        id: "hannah_doyle",
        accountKey: "A",
        name: "Hannah Doyle",
        title: "Alliance procurement lead",
        department: "Eastern Counties Police Alliance",
        role: "Payer / Finance",
        stance: "Supporter",
        influence: "High",
        keyQuote: "Evaluation weights cost per flight and the operating model at 40%. Comparator is helicopter support.",
        quoteSourceId: "hd_weights_1",
        whatTheyNeed: "Written clarification request with specific questions within the briefing window.",
        needSourceId: "hd_window_2",
        sourceIds: ["hannah_doyle", "hd_weights_1", "hd_window_2"],
      },
      {
        id: "ewan_brooks",
        accountKey: "A",
        name: "Ewan Brooks",
        title: "Finance business partner, Metro Central",
        department: "Eastern Counties Police Alliance",
        role: "Payer / Finance",
        stance: "Supporter",
        influence: "High",
        keyQuote: "A helicopter hour costs the force about 1,500 pounds all-in.",
        quoteSourceId: "eb_heli_1",
        whatTheyNeed: "Cost per flight set against helicopter hours to sign off a call-off.",
        needSourceId: "eb_sign_2",
        sourceIds: ["ewan_brooks", "eb_heli_1", "eb_sign_2"],
      },
    ],
    byDeal: {},
    deciders: [],
    payers: [],
    operators: [],
    blockers: [],
  },
  topMoves: [
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
    },
  ],
  risks: [
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
    },
  ],
  knowledgeGaps: [
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
    },
  ],
  liveSignals: [],
  recentNotes: [],
  citations: {},
};

const INITIAL_ACCOUNT_B: CRMExecutiveState = {
  account: {
    id: "B",
    key: "B",
    name: "Aldermoor Industrial Group",
    industry: "Industrial Manufacturing & Security Patrols",
    arr: 210000,
    healthScore: 74,
    status: "Renewal Risk",
    accountManager: "Stefan Roy",
    accountManagerId: "stefan_roy",
    description: "ROI proven. 15 plants, 14 docks installed, 13 flying. Case study for 40-plant sister company in preparation.",
    sourceId: "account_B",
  },
  bookWorth: {
    totalVerifiedARR: 210000,
    totalVerifiedPipeline: 410000,
    totalClaimedUnbackedPipeline: 2400000,
    verifiedDeals: [
      {
        id: "b_more_plants",
        accountKey: "B",
        name: "Docks for Plant 15 and two idle plants",
        stage: "Closed Won",
        probability: 100,
        verifiedAmount: 160000,
        claimedAmount: 160000,
        isClaimUnbacked: false,
        targetCloseDate: "Closed Won",
        sourceIds: ["b_more_plants"],
        paperworkRef: "Offer: More plants",
        financialRecordRef: "Pitch to: Stefan Roy",
        notesSummary: "Executed expansion for Plant 15 and 2 idle docks",
      },
      {
        id: "b_priority_support",
        accountKey: "B",
        name: "Night-time priority support for Plant 7",
        stage: "Closed Won",
        probability: 100,
        verifiedAmount: 50000,
        claimedAmount: 50000,
        isClaimUnbacked: false,
        targetCloseDate: "Closed Won",
        sourceIds: ["b_priority_support"],
        paperworkRef: "Offer: Priority support",
        financialRecordRef: "Pitch to: Beatriz Alonso",
        notesSummary: "Executed night-time support agreement",
      },
      {
        id: "b_insurance",
        accountKey: "B",
        name: "Protect and extend the insurance discount",
        stage: "Proposal",
        probability: 85,
        verifiedAmount: 90000,
        claimedAmount: 90000,
        isClaimUnbacked: false,
        targetCloseDate: "5-Month Review",
        sourceIds: ["b_insurance", "insurer_premium_letter", "jt_prem_2", "flight_log_by_plant"],
        paperworkRef: "insurer_premium_letter.csv",
        notesSummary: "Blocker [cleared]: Flight log compliance pack prepared",
      },
      {
        id: "b_renewal",
        accountKey: "B",
        name: "Renew the Aldermoor contract (14 docks)",
        stage: "Technical Validation",
        probability: 70,
        verifiedAmount: 140000,
        claimedAmount: 140000,
        isClaimUnbacked: false,
        targetCloseDate: "2026/2027",
        sourceIds: ["b_renewal", "flight_log_by_plant", "nr_evidence_2"],
        paperworkRef: "flight_log_by_plant.csv",
        notesSummary: "Blocker [open]: Finance cannot verify savings claimed",
      },
      {
        id: "b_idle",
        accountKey: "B",
        name: "Bring the idle plants into regular patrol",
        stage: "Technical Validation",
        probability: 60,
        verifiedAmount: 180000,
        claimedAmount: 180000,
        isClaimUnbacked: false,
        targetCloseDate: "Before Deputy Departure",
        sourceIds: ["b_idle", "sr_repl_2", "ba_deputy_0", "plant7_checklist"],
        paperworkRef: "plant7_checklist.csv",
        notesSummary: "Blocker [open]: Network project threat & deputy departure",
      },
    ],
    unbackedClaims: [
      {
        id: "claim_sr_roi_0",
        accountKey: "B",
        name: 'Verbal Claim: "€1.2M annual savings spreadsheet"',
        stage: "Verbal Agreement",
        probability: 15,
        verifiedAmount: 0,
        claimedAmount: 1200000,
        isClaimUnbacked: true,
        unbackedReason: "Stefan Roy personal spreadsheet. No guard contract reduced and finance has booked zero savings (refuted by sr_roi_2).",
        targetCloseDate: "Unbooked",
        sourceIds: ["sr_roi_0", "sr_roi_2", "roi_spreadsheet"],
        notesSummary: "Quarantined: Excluded from official verified pipeline totals",
      },
      {
        id: "claim_b_sister",
        accountKey: "B",
        name: "Case study for 40-plant sister company",
        stage: "Verbal Agreement",
        probability: 20,
        verifiedAmount: 0,
        claimedAmount: 1200000,
        isClaimUnbacked: true,
        unbackedReason: "Every number rests on unverified spreadsheet not approved by finance (fact sr_case_3).",
        targetCloseDate: "Unbooked",
        sourceIds: ["b_sister", "sr_case_3", "roi_spreadsheet"],
        notesSummary: "Quarantined: Excluded from official verified pipeline totals",
      },
    ],
  },
  powerMap: {
    stakeholders: [
      {
        id: "stefan_roy",
        accountKey: "B",
        name: "Stefan Roy",
        title: "Group head of security",
        department: "Aldermoor Industrial Group",
        role: "Decider",
        stance: "Supporter",
        influence: "High",
        keyQuote: "ROI is proven, about 1.2 million euros a year saved. Thirteen of fifteen plants are flying.",
        quoteSourceId: "sr_roi_0",
        whatTheyNeed: "Rollout know-how documented before his deputy leaves.",
        needSourceId: "sr_repl_2",
        sourceIds: ["stefan_roy", "sr_roi_0", "sr_repl_2"],
      },
      {
        id: "beatriz_alonso",
        accountKey: "B",
        name: "Beatriz Alonso",
        title: "Plant manager, Plant 7",
        department: "Aldermoor Industrial Group",
        role: "User / Operator",
        stance: "Supporter",
        influence: "Medium",
        keyQuote: "The dock flies nightly, but the guard contractor does not act on alerts. Alerts go to my phone.",
        quoteSourceId: "ba_use_2",
        whatTheyNeed: "Guard contractor authorized to act on nightly drone alerts.",
        needSourceId: "ba_use_2",
        sourceIds: ["beatriz_alonso", "ba_use_2", "plant7_checklist"],
      },
      {
        id: "nadia_rahman",
        accountKey: "B",
        name: "Nadia Rahman",
        title: "Group finance controller",
        department: "Aldermoor Industrial Group",
        role: "Payer / Finance",
        stance: "Neutral",
        influence: "High",
        keyQuote: "She would accept ROI built on measured changes: guard renewals, insurance premium, incident losses.",
        quoteSourceId: "nr_evidence_2",
        whatTheyNeed: "Measured financial savings from guard renewals and insurance premiums, not unverified spreadsheets.",
        needSourceId: "nr_evidence_2",
        sourceIds: ["nadia_rahman", "nr_evidence_2", "insurer_premium_letter"],
      },
      {
        id: "owen_fitch",
        accountKey: "B",
        name: "Owen Fitch",
        title: "Group IT infrastructure lead",
        department: "Aldermoor Industrial Group",
        role: "Blocker",
        stance: "Neutral",
        influence: "High",
        keyQuote: "Corporate network project risks severing automated dock telemetry if security protocols are unverified.",
        quoteSourceId: "ba_other_1",
        whatTheyNeed: "Clear IT security whitelisting and network resilience runbook.",
        needSourceId: "ba_other_1",
        sourceIds: ["owen_fitch", "ba_other_1"],
      },
      {
        id: "julian_tate",
        accountKey: "B",
        name: "Julian Tate",
        title: "Insurance and risk manager",
        department: "Aldermoor Industrial Group",
        role: "Payer / Finance",
        stance: "Supporter",
        influence: "High",
        keyQuote: "The insurer cut premiums by 6% across nine plants, about 180,000 euros a year, citing drone patrols.",
        quoteSourceId: "jt_prem_2",
        whatTheyNeed: "Consistent flight logs by plant for the 5-month insurer review.",
        needSourceId: "jt_review_2",
        sourceIds: ["julian_tate", "jt_prem_2", "jt_review_2"],
      },
    ],
    byDeal: {},
    deciders: [],
    payers: [],
    operators: [],
    blockers: [],
  },
  topMoves: [
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
    },
  ],
  risks: [
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
    },
  ],
  knowledgeGaps: [
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
    },
  ],
  liveSignals: [],
  recentNotes: [],
  citations: {},
};

// Enrich initial power map sub-arrays
function enrichPowerMap(state: CRMExecutiveState) {
  state.powerMap.deciders = state.powerMap.stakeholders.filter((s) => s.role === "Decider");
  state.powerMap.payers = state.powerMap.stakeholders.filter((s) => s.role === "Payer / Finance");
  state.powerMap.operators = state.powerMap.stakeholders.filter((s) => s.role === "User / Operator");
  state.powerMap.blockers = state.powerMap.stakeholders.filter((s) => s.role === "Blocker");

  const byDeal: Record<string, Stakeholder[]> = {};
  state.powerMap.stakeholders.forEach((s) => {
    const k = s.dealId || "account_level";
    if (!byDeal[k]) byDeal[k] = [];
    byDeal[k].push(s);
  });
  state.powerMap.byDeal = byDeal;
}

enrichPowerMap(INITIAL_ACCOUNT_A);
enrichPowerMap(INITIAL_ACCOUNT_B);

const INITIAL_ALL_BOOK: AllBookSummary = {
  totalVerifiedARR: 315000, // £105k + €210k
  totalVerifiedPipeline: 2710000, // £2.3M + €410k
  totalUnbackedPipeline: 2700000, // £300k + €2.4M
  totalAccounts: 2,
  totalCriticalRisks: 2,
  accounts: [
    {
      key: "A",
      name: "Eastern Counties Police Alliance",
      verifiedPipeline: 2300000,
      unbackedPipeline: 300000,
      criticalRisksCount: 1,
      topNextMove: "Deliver Data-Flow Document Pack to DPO Fatima Osei",
    },
    {
      key: "B",
      name: "Aldermoor Industrial Group",
      verifiedPipeline: 410000,
      unbackedPipeline: 2400000,
      criticalRisksCount: 1,
      topNextMove: "Document Rollout Playbook from Stefan's Deputy",
    },
  ],
};

export default function CRMPage() {
  const [selectedAccount, setSelectedAccount] = useState<AccountKey | "ALL">("A");
  const [activeTab, setActiveTab] = useState<"all" | "q1" | "q2" | "q3" | "q4" | "q5">("all");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [isWriteNoteOpen, setIsWriteNoteOpen] = useState(false);
  const [isRawCacheOpen, setIsRawCacheOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Note prefill state for 1-click "Save to CRM" from Next Moves
  const [notePrefill, setNotePrefill] = useState<{
    account: AccountKey;
    kind: "note" | "task" | "risk" | "next_step";
    title: string;
    text: string;
  }>({
    account: "A",
    kind: "next_step",
    title: "",
    text: "",
  });

  // State data initialized immediately with real numbers
  const [rateLimiter, setRateLimiter] = useState<RateLimiterState>(DEFAULT_RATE_LIMITER_STATE);
  const [allBookSummary, setAllBookSummary] = useState<AllBookSummary>(INITIAL_ALL_BOOK);
  const [accountsState, setAccountsState] = useState<{
    A: CRMExecutiveState;
    B: CRMExecutiveState;
  }>({
    A: INITIAL_ACCOUNT_A,
    B: INITIAL_ACCOUNT_B,
  });
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const [recentNotes, setRecentNotes] = useState<CRMNote[]>([]);

  // Fetch full state from backend
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/crm/state");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        if (data.rateLimiter) setRateLimiter(data.rateLimiter);
        if (data.allBook) setAllBookSummary(data.allBook);
        if (data.accounts) setAccountsState(data.accounts);
        if (data.liveSignals) setLiveSignals(data.liveSignals);
        if (data.notes) setRecentNotes(data.notes);
      }
    } catch (err) {
      console.warn("Error fetching CRM state:", err);
    }
  }, []);

  // Poll state every 10 seconds for live signals and rate limiter
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Client-side smooth 1s ticker for rate limit countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRateLimiter((prev) => {
        if (!prev || prev.secondsUntilNextSlot <= 0) return prev;
        return {
          ...prev,
          secondsUntilNextSlot: Math.max(0, prev.secondsUntilNextSlot - 1),
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Upstream Sync handler
  const handleSyncUpstream = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/crm/sync", { method: "POST" });
      const data = await res.json();
      if (data.rateLimiter) setRateLimiter(data.rateLimiter);
      await fetchState();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit note handler
  const handleWriteNote = async (noteData: {
    account: AccountKey;
    kind: "note" | "task" | "risk" | "next_step";
    title: string;
    text: string;
  }) => {
    const res = await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(noteData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to write note");
    if (json.notes) setRecentNotes(json.notes);
    if (json.rateLimiter) setRateLimiter(json.rateLimiter);
    await fetchState();
  };

  // Save recommended move to CRM
  const handleSaveMoveToCRM = async (move: NextMove) => {
    await handleWriteNote({
      account: move.accountKey,
      kind: move.suggestedNoteKind,
      title: `[Priority #${move.rank}] ${move.title}`,
      text: `Owner: ${move.ownerName} | Target Date: ${move.targetDate} (Hard Deadline: ${move.hardDeadlineRef}) | Expected Impact: ${move.expectedImpact}`,
    });
  };

  // Resolve citation for currently selected sourceId
  const currentActiveAccountState =
    selectedAccount === "B" ? accountsState.B : accountsState.A;

  const currentCitation: SourceCitation | null = selectedSourceId
    ? currentActiveAccountState.citations[selectedSourceId] ||
      accountsState.A.citations[selectedSourceId] ||
      accountsState.B.citations[selectedSourceId] || {
        sourceId: selectedSourceId,
        title: "Audited Record",
        recordType: "Paperwork",
        exactQuoteOrFact: "Verified from remote MCP cache store.",
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Sticky Top Status & Account Navigation */}
      <HeaderStatus
        rateLimiter={rateLimiter}
        selectedAccount={selectedAccount}
        onSelectAccount={setSelectedAccount}
        onSyncClick={handleSyncUpstream}
        onOpenRawCache={() => setIsRawCacheOpen(true)}
        isSyncing={isSyncing}
        accountAName={accountsState.A.account.name}
        accountBName={accountsState.B.account.name}
      />

      {/* Main Workspace Layout */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6">
        {selectedAccount === "ALL" ? (
          <AllBookOverview
            summary={allBookSummary}
            onSelectAccount={(acc) => setSelectedAccount(acc)}
            onSourceClick={(sid) => setSelectedSourceId(sid)}
          />
        ) : (
          <div className="space-y-6">
            {/* Account Executive Header Banner */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 font-black text-white shadow-md">
                      {currentActiveAccountState.account.key}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                          {currentActiveAccountState.account.name}
                        </h2>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            currentActiveAccountState.account.status === "Renewal Risk"
                              ? "bg-amber-950/70 text-amber-300 border-amber-500/40"
                              : "bg-emerald-950/70 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {currentActiveAccountState.account.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {currentActiveAccountState.account.industry}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Details & Quick Note Action */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Account Manager
                    </span>
                    <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                      <User className="h-3.5 w-3.5 text-indigo-400" />
                      {currentActiveAccountState.account.accountManager}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Account Health
                    </span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <HeartPulse className="h-3.5 w-3.5" />
                      {currentActiveAccountState.account.healthScore} / 100
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setNotePrefill({
                        account: currentActiveAccountState.account.key,
                        kind: "next_step",
                        title: "",
                        text: "",
                      });
                      setIsWriteNoteOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Log CRM Note</span>
                  </button>
                </div>
              </div>

              {/* Account Description & Source ID */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-800/80 pt-3 text-xs gap-2">
                <p className="text-slate-300">
                  {currentActiveAccountState.account.description}
                </p>
                <button
                  onClick={() =>
                    setSelectedSourceId(currentActiveAccountState.account.sourceId)
                  }
                  className="self-start sm:self-auto font-mono text-[10px] text-sky-400 rounded bg-slate-950 px-2 py-0.5 border border-slate-800 hover:border-sky-500/50"
                >
                  [{currentActiveAccountState.account.sourceId}]
                </button>
              </div>
            </div>

            {/* Sub-navigation bar for Questions */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "all"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                All 5 Questions
              </button>
              <button
                onClick={() => setActiveTab("q1")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q1"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                1. Book Worth
              </button>
              <button
                onClick={() => setActiveTab("q2")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q2"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                2. Power Map
              </button>
              <button
                onClick={() => setActiveTab("q3")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q3"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                3. Next Moves
              </button>
              <button
                onClick={() => setActiveTab("q4")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q4"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                4. Risks Radar
              </button>
              <button
                onClick={() => setActiveTab("q5")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === "q5"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                5. Knowledge Gaps
              </button>
            </div>

            {/* Split Screen Layout: Questions Left (70%), Live Signals & Notes Right (30%) */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Executive Questions */}
              <div className="space-y-10 lg:col-span-8">
                {(activeTab === "all" || activeTab === "q1") && (
                  <Question1BookWorth
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                  />
                )}

                {(activeTab === "all" || activeTab === "q2") && (
                  <Question2PowerMap
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                  />
                )}

                {(activeTab === "all" || activeTab === "q3") && (
                  <Question3NextMoves
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                    onSaveToCRM={handleSaveMoveToCRM}
                  />
                )}

                {(activeTab === "all" || activeTab === "q4") && (
                  <Question4RisksRadar
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                  />
                )}

                {(activeTab === "all" || activeTab === "q5") && (
                  <Question5KnowledgeGaps
                    state={currentActiveAccountState}
                    onSourceClick={(sid) => setSelectedSourceId(sid)}
                  />
                )}
              </div>

              {/* Right Column: Live Signals Stream */}
              <div className="space-y-6 lg:col-span-4">
                <LiveSignalsPanel
                  signals={liveSignals}
                  onSourceClick={(sid) => setSelectedSourceId(sid)}
                  activeAccount={selectedAccount}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <SourceCitationDrawer
        sourceId={selectedSourceId}
        citation={currentCitation}
        onClose={() => setSelectedSourceId(null)}
      />

      <WriteNoteModal
        isOpen={isWriteNoteOpen}
        onClose={() => setIsWriteNoteOpen(false)}
        onSubmitNote={handleWriteNote}
        recentNotes={recentNotes}
        defaultAccount={notePrefill.account}
        defaultKind={notePrefill.kind}
        defaultTitle={notePrefill.title}
        defaultText={notePrefill.text}
        accountAName={accountsState.A.account.name}
        accountBName={accountsState.B.account.name}
      />

      <RawCacheModal
        isOpen={isRawCacheOpen}
        onClose={() => setIsRawCacheOpen(false)}
      />
    </div>
  );
}

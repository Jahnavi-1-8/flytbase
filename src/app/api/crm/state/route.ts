// src/app/api/crm/state/route.ts
import { NextResponse } from "next/server";
import { getExecutiveStateForAccount, getAllBookSummary } from "@/lib/crm/analyzer";
import { mcpRateLimiter } from "@/lib/mcp/rate-limiter";
import { getMCPStore } from "@/lib/mcp/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Process any pending queue items if rate limiter slot is available
    await mcpRateLimiter.processQueue();

    // 2. Check if it's time to poll signals (>=65s since last call)
    mcpRateLimiter.checkAndPollSignalsIfEligible();

    // 3. Assemble complete CRM state
    const store = getMCPStore();
    const rateLimiterStatus = mcpRateLimiter.getRateLimiterStatus();
    const stateA = getExecutiveStateForAccount("A");
    const stateB = getExecutiveStateForAccount("B");
    const allBook = getAllBookSummary();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      rateLimiter: rateLimiterStatus,
      allBook,
      accounts: {
        A: stateA,
        B: stateB,
      },
      liveSignals: store.signals,
      notes: store.notes,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}


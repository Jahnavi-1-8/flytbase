// src/app/api/crm/sync/route.ts
import { NextResponse } from "next/server";
import { mcpRateLimiter } from "@/lib/mcp/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    mcpRateLimiter.startInitialSyncQueue();
    await mcpRateLimiter.processQueue();
    const status = mcpRateLimiter.getRateLimiterStatus();

    return NextResponse.json({
      success: true,
      message: "Sync queue initiated. Respecting 61-second rate limit between upstream calls.",
      rateLimiter: status,
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

export async function GET() {
  try {
    await mcpRateLimiter.processQueue();
    const status = mcpRateLimiter.getRateLimiterStatus();
    return NextResponse.json({
      success: true,
      rateLimiter: status,
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


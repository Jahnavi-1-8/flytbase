// src/app/api/crm/raw-cache/route.ts
import { NextResponse } from "next/server";
import { getMCPStore } from "@/lib/mcp/store";
import { mcpRateLimiter } from "@/lib/mcp/rate-limiter";
import { getAllCitations } from "@/lib/crm/analyzer";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getMCPStore();
  const rateLimiter = mcpRateLimiter.getRateLimiterStatus();
  const citations = getAllCitations();

  return NextResponse.json({
    rateLimiter,
    store,
    citations,
  });
}


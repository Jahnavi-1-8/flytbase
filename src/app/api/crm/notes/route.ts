// src/app/api/crm/notes/route.ts
import { NextResponse } from "next/server";
import { getMCPStore, saveMCPStore } from "@/lib/mcp/store";
import { mcpRateLimiter } from "@/lib/mcp/rate-limiter";
import { CRMNote } from "@/types/crm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { account, kind, title, text } = body;

    if (!account || !["A", "B"].includes(account)) {
      return NextResponse.json({ success: false, error: "Invalid account. Must be 'A' or 'B'." }, { status: 400 });
    }
    if (!kind || !["note", "task", "risk", "next_step"].includes(kind)) {
      return NextResponse.json(
        { success: false, error: "Invalid kind. Must be 'note', 'task', 'risk', or 'next_step'." },
        { status: 400 }
      );
    }
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required." }, { status: 400 });
    }
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ success: false, error: "Text is required." }, { status: 400 });
    }

    const newNoteId = `note_local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNote: CRMNote = {
      id: newNoteId,
      account,
      kind,
      title: title.trim(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      syncStatus: "pending_sync",
      sourceId: `source_${newNoteId}`,
    };

    // 1. Optimistically store in local persistent cache immediately
    const store = getMCPStore();
    store.notes.unshift(newNote);
    saveMCPStore(store);

    // 2. Queue write_note tool call for upstream MCP server with High priority
    mcpRateLimiter.enqueue(
      "write_note",
      {
        account,
        kind,
        title: title.trim(),
        text: text.trim(),
      },
      "high"
    );

    // Try processing if slot is immediately available
    await mcpRateLimiter.processQueue();

    return NextResponse.json({
      success: true,
      note: newNote,
      notes: store.notes,
      rateLimiter: mcpRateLimiter.getRateLimiterStatus(),
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
    const store = getMCPStore();
    return NextResponse.json({
      success: true,
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


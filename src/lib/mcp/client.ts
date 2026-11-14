// src/lib/mcp/client.ts
import fs from "fs";
import path from "path";

/**
 * Remote MCP Server Client for Account Quest
 * Strictly server-side only. Never import this into Client Components.
 */

export interface MCPToolCallParams {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface MCPResponse<T = unknown> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: string;
  retryAfterSeconds?: number;
}

function resolveEnvTokenAndEndpoint(): { token: string; endpoint: string } {
  let token = process.env.AQ_TOKEN || "";
  let endpoint =
    process.env.AQ_MCP_ENDPOINT ||
    "https://questathon.aihackerscollective.com/api/public/mcp";

  // Fallback to reading .env.local from disk if process.env.AQ_TOKEN is unset
  if (!token || token.trim() === "" || token === "your_token_here") {
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const rawLine of content.split(/\r?\n/)) {
          const line = rawLine.trim();
          if (line.startsWith("#") || !line) continue;
          const idx = line.indexOf("=");
          if (idx !== -1) {
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim();
            if (key === "AQ_TOKEN" && val) token = val;
            if (key === "AQ_MCP_ENDPOINT" && val) endpoint = val;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return { token: token.trim(), endpoint: endpoint.trim() };
}

export async function callRemoteMCPTool<T = unknown>(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<MCPResponse<T>> {
  const { token, endpoint } = resolveEnvTokenAndEndpoint();

  if (!token || token === "your_token_here") {
    return {
      success: false,
      error: "AQ_TOKEN is not set in environment or .env.local.",
    };
  }

  const payload = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    const rawBody = await res.text();

    if (!res.ok) {
      return {
        success: false,
        rawText: rawBody,
        error: `MCP server responded with status ${res.status} (${res.statusText}): ${rawBody}`,
      };
    }

    let jsonRpcResult: unknown = null;

    // Handle SSE (Server-Sent Events) stream lines if returned
    if (contentType.includes("text/event-stream") || rawBody.startsWith("data:")) {
      const lines = rawBody.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data:")) {
          const jsonChunk = trimmed.slice(5).trim();
          if (jsonChunk && jsonChunk !== "[DONE]") {
            try {
              jsonRpcResult = JSON.parse(jsonChunk);
            } catch {
              // continue to next line
            }
          }
        }
      }
    } else {
      try {
        jsonRpcResult = JSON.parse(rawBody);
      } catch (err) {
        return {
          success: false,
          rawText: rawBody,
          error: `Failed to parse JSON-RPC response: ${(err as Error).message}`,
        };
      }
    }

    // Now parse result.content[0].text per MCP specification
    const rpcObj = jsonRpcResult as {
      result?: {
        content?: Array<{ type?: string; text?: string }>;
        isError?: boolean;
      };
      error?: { code?: number; message?: string };
    };

    if (rpcObj?.error) {
      return {
        success: false,
        error: `MCP JSON-RPC Error ${rpcObj.error.code}: ${rpcObj.error.message}`,
      };
    }

    const textContent = rpcObj?.result?.content?.[0]?.text;
    if (typeof textContent === "string") {
      try {
        const parsedData = JSON.parse(textContent);

        // Check if upstream returned rate limit error inside content[0].text
        if (parsedData?.error && typeof parsedData.retry_after_seconds === "number") {
          return {
            success: false,
            data: parsedData as T,
            rawText: textContent,
            retryAfterSeconds: parsedData.retry_after_seconds,
            error: parsedData.error,
          };
        }

        return {
          success: true,
          data: parsedData as T,
          rawText: textContent,
        };
      } catch {
        return {
          success: true,
          data: textContent as unknown as T,
          rawText: textContent,
        };
      }
    }

    // Fallback if content was not wrapped in content[0].text
    if (rpcObj?.result) {
      return {
        success: true,
        data: rpcObj.result as unknown as T,
        rawText: JSON.stringify(rpcObj.result),
      };
    }

    return {
      success: true,
      data: jsonRpcResult as T,
      rawText: rawBody,
    };
  } catch (err) {
    return {
      success: false,
      error: `Network or fetch exception connecting to MCP server: ${(err as Error).message}`,
    };
  }
}

import { apiClient } from "./client"
import type { AIRequest, AIExplainResponse } from "./types"

/**
 * POST /ai/explain
 * Sends a question + subject context to the AI service for RAG-based explanation.
 */
export async function aiExplain(
  question: string,
  subjectId: number
): Promise<AIExplainResponse> {
  const payload: AIRequest = { question, subjectId }
  return apiClient<AIExplainResponse>("/ai/explain", {
    method: "POST",
    body: payload,
  })
}

/* ---------- n8n Workflow Chat ---------- */

export async function n8nChat(query: string) {
  const res = await fetch(
    "https://edunexus.app.n8n.cloud/webhook/website-chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: query,
      }),
    }
  );

  const data = await res.json();

  return {
    output: data.answer ?? data.output ?? null,
    error: data.error,
  };
}

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

export interface N8nChatResponse {
  /** The main answer text from the n8n workflow */
  output?: string
  /** Error message if the workflow failed */
  error?: string
  /** Any extra data the workflow may return */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * POST /api/n8n-chat
 * Sends a query to the n8n webhook workflow via the Next.js proxy route.
 */
export async function n8nChat(query: string): Promise<N8nChatResponse> {
  const res = await fetch("/api/n8n-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    return { error: errBody.error || `n8n request failed (${res.status})` }
  }

  return res.json()
}

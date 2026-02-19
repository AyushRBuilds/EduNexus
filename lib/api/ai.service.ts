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
  /** The normalised answer text from the n8n workflow */
  output: string | null
  /** Hint / error description when something went wrong */
  error?: string
  hint?: string
}

/**
 * POST /api/n8n-chat  (proxied to the real n8n webhook)
 * Sends a search query to the n8n workflow and returns the answer.
 */
export async function n8nChat(query: string): Promise<N8nChatResponse> {
  const res = await fetch("/api/n8n-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    return {
      output: null,
      error: errBody.error || `n8n request failed (${res.status})`,
      hint: errBody.hint,
    }
  }

  const data = await res.json()
  return {
    output: data.output ?? null,
    error: data.error,
  }
}

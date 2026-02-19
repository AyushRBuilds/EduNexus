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

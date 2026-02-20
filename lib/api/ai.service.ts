import { apiClient } from "./client"
import type { AIRequest, AIExplainResponse } from "./types"
import {
  getKnowledgeEntry,
  formatKnowledgeEntryForAI,
  matchesKnowledgeBase,
} from "./ai-synthesis-kb"

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

/* ---------- AI Synthesis Search with Multiple Providers ---------- */

export interface AISynthesisResponse {
  query: string
  synthesis: string
  source: "knowledge-base" | "n8n" | "vercel-ai-gateway"
  providers: string[]
  isHardcoded: boolean
}

/**
 * AI Synthesis Search - Queries multiple AI providers for comprehensive answers
 * Prioritizes hardcoded knowledge base for Laplace, Data Structures, Transformers
 */
export async function aiSynthesisSearch(
  query: string
): Promise<AISynthesisResponse> {
  console.log("[v0] Starting AI synthesis search for:", query)

  // Check if query matches hardcoded knowledge base topics
  const kbMatches = matchesKnowledgeBase(query)
  if (kbMatches.length > 0) {
    console.log("[v0] Found KB matches:", kbMatches)
    const entry = getKnowledgeEntry(kbMatches[0])
    if (entry) {
      const synthesis = formatKnowledgeEntryForAI(entry)
      return {
        query,
        synthesis,
        source: "knowledge-base",
        providers: ["Hardcoded Knowledge Base"],
        isHardcoded: true,
      }
    }
  }

  // Fall back to n8n workflow for general queries
  try {
    const n8nResponse = await n8nChat(query)
    if (n8nResponse.output) {
      return {
        query,
        synthesis: n8nResponse.output,
        source: "n8n",
        providers: ["n8n Workflow"],
        isHardcoded: false,
      }
    }
  } catch (error) {
    console.error("[v0] n8n workflow error:", error)
  }

  // Fallback response
  return {
    query,
    synthesis: `Unable to find synthesis for "${query}". Please try rephrasing your question or searching for specific topics like Laplace Transform, Data Structures, or Transformers.`,
    source: "knowledge-base",
    providers: [],
    isHardcoded: false,
  }
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
  )

  const data = await res.json()

  return {
    output: data.answer ?? data.output ?? null,
    error: data.error,
  }
}

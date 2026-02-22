/**
 * AI Query Service — client-side wrapper
 *
 * All AI queries are routed through /api/ai-query (server-side)
 * which handles Gemini key rotation + Hugging Face fallback.
 * This avoids CORS issues with direct browser-to-API calls.
 */

export interface GeminiResponse {
  answer: string
  sources: string[]
  error?: string
  provider?: string
}

/**
 * Query AI for comprehensive answers (Gemini → HF fallback)
 */
export async function queryGemini(
  query: string,
  context?: string,
  history?: any[]
): Promise<GeminiResponse> {
  try {
    const res = await fetch('/api/ai-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context, history }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return {
        answer: errData.answer || `AI server error (${res.status})`,
        sources: [],
        error: errData.error || 'SERVER_ERROR',
      }
    }

    const data = await res.json()
    console.log(`[ai] Response from ${data.provider || 'unknown'}, length: ${data.answer?.length || 0}`)
    return {
      answer: data.answer || 'No response received.',
      sources: data.sources || [],
      error: data.error,
      provider: data.provider,
    }
  } catch (error) {
    console.error('[ai] Fetch error:', error)
    const msg = error instanceof Error ? error.message : 'Network error'
    return {
      answer: `Failed to reach AI service: ${msg}`,
      sources: [],
      error: 'NETWORK_ERROR',
    }
  }
}

/**
 * Query AI with document context (same endpoint, adds doc context)
 */
export async function queryGeminiWithDocuments(
  query: string,
  documentContext: {
    title: string
    content: string
    source: string
  }[],
  history?: any[]
): Promise<GeminiResponse> {
  // Build document context string for the server
  const contextStr = documentContext
    .map((doc, i) => `Document ${i + 1}: "${doc.title}"\n${doc.content.substring(0, 500)}`)
    .join('\n\n')

  const result = await queryGemini(query, contextStr, history)

  // Try to extract which documents were referenced
  if (result.answer && !result.error) {
    const sources = documentContext
      .filter((doc) => result.answer.toLowerCase().includes(doc.title.toLowerCase()))
      .map((doc) => doc.source)
    result.sources = sources
  }

  return result
}

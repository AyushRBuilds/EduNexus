/**
 * Hugging Face Inference API service with round-robin token rotation.
 * Used as a fallback when all Gemini API keys are exhausted (429 quota).
 * Uses the free Inference API with Mistral / Mixtral models.
 */

/* ------------------------------------------------------------------ */
/*  Round-Robin Token Rotation                                         */
/* ------------------------------------------------------------------ */

const HF_TOKENS: string[] = (() => {
    const multi = process.env.NEXT_PUBLIC_HF_API_TOKENS
    if (multi) {
        const tokens = multi.split(',').map((t) => t.trim()).filter(Boolean)
        if (tokens.length > 0) return tokens
    }
    return []
})()

let hfTokenIndex = 0

function getNextHFToken(): string {
    if (HF_TOKENS.length === 0) return ''
    const idx = hfTokenIndex % HF_TOKENS.length
    hfTokenIndex = (hfTokenIndex + 1) % HF_TOKENS.length
    console.log(`[huggingface] Using token ${idx + 1}/${HF_TOKENS.length}`)
    return HF_TOKENS[idx]
}

/* ------------------------------------------------------------------ */
/*  HF Inference API call                                              */
/* ------------------------------------------------------------------ */

// Using a good free model on HF Inference API
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3'
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`

interface HFResponse {
    generated_text?: string
    error?: string
}

async function callHF(prompt: string, token: string): Promise<string> {
    const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 1024,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true,
                return_full_text: false,
            },
        }),
    })

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(`HF API error ${response.status}: ${errText}`)
    }

    const data = await response.json()

    // HF returns an array of objects
    if (Array.isArray(data) && data.length > 0) {
        return (data[0] as HFResponse).generated_text || ''
    }
    if (typeof data === 'object' && data.generated_text) {
        return data.generated_text
    }
    if (typeof data === 'object' && data.error) {
        throw new Error(`HF model error: ${data.error}`)
    }

    return JSON.stringify(data)
}

/* ------------------------------------------------------------------ */
/*  Public API (mirrors GeminiResponse shape)                          */
/* ------------------------------------------------------------------ */

export interface HFQueryResponse {
    answer: string
    sources: string[]
    error?: string
}

export function isHFConfigured(): boolean {
    return HF_TOKENS.length > 0
}

export async function queryHuggingFace(
    query: string,
    context?: string
): Promise<HFQueryResponse> {
    if (HF_TOKENS.length === 0) {
        return {
            answer: 'Hugging Face API is not configured. Please add NEXT_PUBLIC_HF_API_TOKENS to your environment variables.',
            sources: [],
            error: 'HF_NOT_CONFIGURED',
        }
    }

    const systemPrompt = `You are an expert educational assistant. Provide a comprehensive, well-structured answer to the following question.

Guidelines:
- Be clear and detailed
- Use examples where appropriate
- Structure the answer logically
- Keep technical accuracy
- Be concise but thorough`

    const fullPrompt = `<s>[INST] ${systemPrompt}

${context ? `Context:\n${context}\n\n` : ''}Question: ${query} [/INST]`

    // Try each token on rate limit failure
    let lastError: unknown = null
    for (let attempt = 0; attempt < HF_TOKENS.length; attempt++) {
        const token = getNextHFToken()
        try {
            const answer = await callHF(fullPrompt, token)
            console.log('[huggingface] Response received, length:', answer.length)
            return { answer: answer.trim() || 'Unable to generate response.', sources: [] }
        } catch (err: unknown) {
            lastError = err
            const msg = err instanceof Error ? err.message : String(err)
            const isRateLimit = msg.includes('429') || msg.includes('rate') || msg.includes('quota')
            console.warn(`[huggingface] Token ${((hfTokenIndex - 1 + HF_TOKENS.length) % HF_TOKENS.length) + 1} failed${isRateLimit ? ' (rate limit)' : ''}: ${msg}`)
            if (!isRateLimit) break // Only rotate on rate limit errors
        }
    }

    const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown error'
    return {
        answer: `Error querying Hugging Face: ${errorMessage}`,
        sources: [],
        error: 'HF_ERROR',
    }
}

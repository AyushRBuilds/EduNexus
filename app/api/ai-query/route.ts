import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

/* ------------------------------------------------------------------ */
/*  Gemini Keys (server-side only)                                     */
/* ------------------------------------------------------------------ */

const GEMINI_KEYS: string[] = (() => {
    const multi = process.env.NEXT_PUBLIC_GEMINI_API_KEYS
    if (multi) {
        const keys = multi.split(',').map((k) => k.trim()).filter(Boolean)
        if (keys.length > 0) return keys
    }
    const single = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (single) return [single]
    return []
})()

let geminiIdx = 0

/* ------------------------------------------------------------------ */
/*  Hugging Face Tokens (server-side only)                             */
/* ------------------------------------------------------------------ */

const HF_TOKENS: string[] = (() => {
    const multi = process.env.NEXT_PUBLIC_HF_API_TOKENS
    if (multi) return multi.split(',').map((t) => t.trim()).filter(Boolean)
    return []
})()

let hfIdx = 0

/* ------------------------------------------------------------------ */
/*  Try Gemini (round-robin)                                           */
/* ------------------------------------------------------------------ */

async function tryGemini(query: string, context?: string, history?: any[]): Promise<string | null> {
    for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
        const idx = geminiIdx % GEMINI_KEYS.length
        geminiIdx = (geminiIdx + 1) % GEMINI_KEYS.length
        const key = GEMINI_KEYS[idx]

        try {
            console.log(`[ai-query] Trying Gemini key ${idx + 1}/${GEMINI_KEYS.length}`)
            const genAI = new GoogleGenerativeAI(key)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

            let prompt = `You are an expert educational assistant.`

            if (context) {
                prompt += `

CRITICAL INSTRUCTION: You must answer the user's question STRICTLY and EXCLUSIVELY using the information provided in the "Additional Context" below. 
Do not include any outside knowledge, facts, or external information that is not present in the context documents. 
If the context does not contain enough information to fully answer the question, state clearly what you cannot answer based on the provided documents.

Question: ${query}

Additional Context:\n${context}`
            } else {
                prompt += ` Provide a comprehensive, well-structured answer.

Question: ${query}

Guidelines:
- Be clear and detailed
- Use examples where appropriate
- Structure the answer logically
- Be concise but thorough`
            }

            // Clean up history to match required Gemini format (role must be 'user' or 'model')
            const geminiHistory = Array.isArray(history) ? history.map((msg: any) => ({
                role: msg.role === 'ai' || msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text || msg.parts?.[0]?.text || '' }]
            })) : undefined

            let answer = '';
            // If history is provided and has items, use startChat
            if (geminiHistory && geminiHistory.length > 0) {
                const chat = model.startChat({
                    history: geminiHistory,
                    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    ],
                });
                const result = await chat.sendMessage([{ text: prompt }]);
                answer = result.response.text();
            } else {
                // Otherwise do single shot
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    ],
                })
                answer = result.response.text()
            }
            if (answer) {
                console.log(`[ai-query] Gemini key ${idx + 1} succeeded, length: ${answer.length}`)
                return answer
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('rate')
            console.warn(`[ai-query] Gemini key ${idx + 1} failed${isRateLimit ? ' (rate limit)' : ''}: ${msg.substring(0, 120)}`)
            if (!isRateLimit) break
        }
    }
    return null
}

/* ------------------------------------------------------------------ */
/*  Try Hugging Face via Together provider (confirmed working)         */
/* ------------------------------------------------------------------ */

async function tryHuggingFace(query: string, context?: string, history?: any[]): Promise<string | null> {
    const userMsg = context ? `Context:\n${context}\n\nQuestion: ${query}` : query
    const systemPrompt = context
        ? 'You are an expert educational assistant. CRITICAL INSTRUCTION: You must answer questions STRICTLY and EXCLUSIVELY based on the provided Context. Do not include external knowledge. If the context is insufficient, state so clearly.'
        : 'You are an expert educational assistant. Be clear, detailed, and academically rigorous. Provide well-structured answers with examples where appropriate.'

    // Format history for Llama 3 API (roles: 'system', 'user', 'assistant')
    const hfHistory = Array.isArray(history) ? history.map((msg: any) => ({
        role: msg.role === 'ai' || msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.text || msg.content || msg.parts?.[0]?.text || ''
    })) : []

    const messages = [
        { role: 'system', content: systemPrompt },
        ...hfHistory,
        { role: 'user', content: userMsg }
    ]

    for (let attempt = 0; attempt < HF_TOKENS.length; attempt++) {
        const idx = hfIdx % HF_TOKENS.length
        hfIdx = (hfIdx + 1) % HF_TOKENS.length
        const token = HF_TOKENS[idx]

        try {
            console.log(`[ai-query] Trying HF token ${idx + 1}/${HF_TOKENS.length} (together/llama-3.3-70b)`)

            const res = await fetch('https://router.huggingface.co/together/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
                    messages: messages,
                    max_tokens: 1024,
                    temperature: 0.7,
                }),
            })

            if (res.ok) {
                const data = await res.json()
                if (data.choices?.[0]?.message?.content) {
                    const answer = data.choices[0].message.content.trim()
                    console.log(`[ai-query] HF together succeeded (token ${idx + 1}), length: ${answer.length}`)
                    return answer
                }
            } else {
                const errText = await res.text()
                const isRateLimit = res.status === 429
                console.warn(`[ai-query] HF token ${idx + 1} failed (${res.status})${isRateLimit ? ' rate limit' : ''}: ${errText.substring(0, 150)}`)
                if (!isRateLimit) break // Only rotate on rate limit
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            console.warn(`[ai-query] HF token ${idx + 1} error: ${msg.substring(0, 100)}`)
        }
    }
    return null
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
    try {
        const { query, context, history } = await request.json()

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ answer: 'Invalid query', error: 'INVALID_INPUT' }, { status: 400 })
        }

        // 1. Try Gemini first
        if (GEMINI_KEYS.length > 0) {
            const geminiAnswer = await tryGemini(query, context, history)
            if (geminiAnswer) {
                return NextResponse.json({ answer: geminiAnswer, sources: [], provider: 'gemini' })
            }
        }

        // 2. Fallback to Hugging Face
        if (HF_TOKENS.length > 0) {
            console.log('[ai-query] All Gemini keys exhausted, trying Hugging Face...')
            const hfAnswer = await tryHuggingFace(query, context, history)
            if (hfAnswer) {
                return NextResponse.json({ answer: hfAnswer, sources: [], provider: 'huggingface' })
            }
        }

        // 3. Nothing worked
        return NextResponse.json({
            answer: 'All AI providers are currently unavailable. Gemini quota is exhausted and Hugging Face tokens may need "Inference Providers" permission. Please try again later or update your HF tokens at huggingface.co/settings/tokens.',
            sources: [],
            error: 'ALL_PROVIDERS_EXHAUSTED',
        })
    } catch (error) {
        console.error('[ai-query] Unexpected error:', error)
        return NextResponse.json(
            { answer: 'An unexpected error occurred.', sources: [], error: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}

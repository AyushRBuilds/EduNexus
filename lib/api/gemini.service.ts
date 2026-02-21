import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface GeminiResponse {
  answer: string
  sources: string[]
  error?: string
}

/**
 * Query Gemini API for comprehensive answers
 * Used for smart search synthesis
 */
export async function queryGemini(
  query: string,
  context?: string
): Promise<GeminiResponse> {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return {
        answer: 'Gemini API is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.',
        sources: [],
        error: 'GEMINI_NOT_CONFIGURED',
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    let prompt = `You are an expert educational assistant. Provide a comprehensive, well-structured answer to the following question.

Question: ${query}

Guidelines:
- Be clear and detailed
- Use examples where appropriate
- Structure the answer logically
- Keep technical accuracy
- Be concise but thorough`

    if (context) {
      prompt += `\n\nAdditional Context from uploaded materials:\n${context}`
    }

    console.log('[v0] Querying Gemini with:', { query, hasContext: !!context })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    })

    const answer =
      result.response.text() ||
      'Unable to generate response. Please try again.'

    console.log('[v0] Gemini response received, length:', answer.length)

    return {
      answer,
      sources: [],
      error: undefined,
    }
  } catch (error) {
    console.error('[v0] Gemini API error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return {
      answer: `Error querying Gemini: ${errorMessage}`,
      sources: [],
      error: 'GEMINI_ERROR',
    }
  }
}

/**
 * Query Gemini with context from uploaded documents
 * Returns both the answer and relevant source documents
 */
export async function queryGeminiWithDocuments(
  query: string,
  documentContext: {
    title: string
    content: string
    source: string
  }[]
): Promise<GeminiResponse> {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return {
        answer: 'Gemini API is not configured.',
        sources: [],
        error: 'GEMINI_NOT_CONFIGURED',
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Build context from documents
    let contextStr = ''
    if (documentContext && documentContext.length > 0) {
      contextStr =
        'The following documents are relevant to this query:\n\n' +
        documentContext
          .map(
            (doc, i) =>
              `Document ${i + 1}: "${doc.title}"\nContent: ${doc.content.substring(0, 500)}...`
          )
          .join('\n\n')
    }

    let prompt = `You are an expert educational assistant for a college/university knowledge system called EduNexus.
You have access to materials uploaded by faculty to the college's institutional repository.

Question: ${query}

${contextStr}

Guidelines:
- Base your answer primarily on the provided college repository documents
- Clearly reference which documents you are drawing from (e.g., "According to [Document Title]...")
- Provide a well-structured overview of the topic as covered in the college materials
- If the documents only partially cover the topic, mention what is covered and supplement with general knowledge
- Be clear, detailed, and academically rigorous
- Use examples from the provided materials where appropriate
- At the end, briefly list the source documents you referenced`

    console.log('[v0] Querying Gemini with documents:', {
      query,
      docCount: documentContext?.length || 0,
    })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    })

    const answer =
      result.response.text() ||
      'Unable to generate response. Please try again.'

    // Extract document titles that were mentioned
    const sources = documentContext
      .filter((doc) => answer.toLowerCase().includes(doc.title.toLowerCase()))
      .map((doc) => doc.source)

    console.log('[v0] Gemini response with docs received, sources:', sources)

    return {
      answer,
      sources,
      error: undefined,
    }
  } catch (error) {
    console.error('[v0] Gemini with documents error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return {
      answer: `Error querying Gemini: ${errorMessage}`,
      sources: [],
      error: 'GEMINI_ERROR',
    }
  }
}

import { NextRequest, NextResponse } from "next/server"

/**
 * n8n Chat Trigger webhook proxy
 *
 * Production URL – works when the workflow toggle is ON in n8n.
 * Test URL       – works when you click "Listen for test event" in the editor.
 *
 * We try production first, fall back to test if it 404s.
 */
const N8N_PRODUCTION_URL =
  "https://ayushgiri05.app.n8n.cloud/webhook/website-chat"
const N8N_TEST_URL =
  "https://ayushgiri05.app.n8n.cloud/webhook-test/website-chat"

async function callWebhook(
  url: string,
  payload: object
): Promise<{ res: Response | null; networkError?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify(payload),
    })
    return { res }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { res: null, networkError: msg }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractAnswer(data: any): string | null {
  if (!data) return null
  if (typeof data === "string") return data
  if (typeof data.output === "string") return data.output
  if (typeof data.text === "string") return data.text
  if (typeof data.response === "string") return data.response
  if (typeof data.message === "string") return data.message
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = extractAnswer(item)
      if (found) return found
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' field" },
        { status: 400 }
      )
    }

    // n8n Chat Trigger expects chatInput + optional sessionId
    const payload = {
      chatInput: query,
      sessionId: `edunexus-${Date.now()}`,
    }

    // 1) Try production URL
    let { res: n8nRes } = await callWebhook(N8N_PRODUCTION_URL, payload)

    // 2) Fall back to test URL if production fails
    if (!n8nRes || n8nRes.status === 404) {
      const testResult = await callWebhook(N8N_TEST_URL, payload)
      if (testResult.res) {
        n8nRes = testResult.res
      }
    }

    // 3) Both failed
    if (!n8nRes) {
      return NextResponse.json(
        {
          error: "Could not reach the n8n workflow.",
          hint: "Ensure the workflow is active and the webhook URL is correct.",
        },
        { status: 502 }
      )
    }

    // 4) n8n returned an error status
    if (!n8nRes.ok) {
      const errorText = await n8nRes.text()
      return NextResponse.json(
        {
          error: "n8n workflow error",
          status: n8nRes.status,
          details: errorText,
          hint: "Toggle the workflow OFF then ON again in the n8n editor to re-register the webhook.",
        },
        { status: n8nRes.status }
      )
    }

    // 5) Success -- parse the response
    const rawText = await n8nRes.text()

    // Handle empty response body (n8n returns 200 with no body sometimes)
    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ output: null, error: "n8n returned an empty response" })
    }

    let answer: string | null = null
    try {
      const data = JSON.parse(rawText)
      answer = extractAnswer(data)
      return NextResponse.json({ output: answer, raw: data })
    } catch {
      // Not JSON -- treat as plain text
      answer = rawText
      return NextResponse.json({ output: answer })
    }
  } catch (error) {
    console.error("[Proxy] n8n-chat error:", error)
    return NextResponse.json(
      { error: "Failed to process n8n request" },
      { status: 500 }
    )
  }
}

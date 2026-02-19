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

    console.log("[v0] n8n-chat: sending to production URL with payload:", JSON.stringify(payload))

    // 1) Try production URL
    let { res: n8nRes, networkError } = await callWebhook(N8N_PRODUCTION_URL, payload)

    if (networkError) {
      console.log("[v0] n8n-chat: production network error:", networkError)
    }
    if (n8nRes) {
      console.log("[v0] n8n-chat: production response status:", n8nRes.status)
    }

    // 2) Fall back to test URL if production fails
    if (!n8nRes || n8nRes.status === 404) {
      console.log("[v0] n8n-chat: trying test URL...")
      const testResult = await callWebhook(N8N_TEST_URL, payload)
      if (testResult.networkError) {
        console.log("[v0] n8n-chat: test URL network error:", testResult.networkError)
      }
      if (testResult.res) {
        n8nRes = testResult.res
        console.log("[v0] n8n-chat: test URL response status:", n8nRes.status)
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
      console.log("[v0] n8n-chat: error body:", errorText)
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
    console.log("[v0] n8n-chat: raw response body:", rawText.slice(0, 500))

    let answer: string | null = null
    try {
      const data = JSON.parse(rawText)
      answer = extractAnswer(data)
      return NextResponse.json({ output: answer, raw: data })
    } catch {
      // Not JSON -- treat as plain text
      answer = rawText || null
      return NextResponse.json({ output: answer })
    }
  } catch (error) {
    console.error("[v0] n8n-chat: proxy error:", error)
    return NextResponse.json(
      { error: "Failed to process n8n request" },
      { status: 500 }
    )
  }
}

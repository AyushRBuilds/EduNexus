import { NextRequest, NextResponse } from "next/server"

/**
 * n8n webhook URLs
 * Production URL: works when the workflow is toggled ACTIVE in the n8n editor.
 * Test URL:       works when the workflow is open in the n8n editor and you
 *                 click "Listen for Test Event" / "Test Workflow".
 *
 * We try the production URL first; if it returns 404 (workflow inactive) we
 * automatically fall back to the test URL so development keeps working.
 */
const N8N_PRODUCTION_URL =
  "https://ayushgiri05.app.n8n.cloud/webhook/website-chat"
const N8N_TEST_URL =
  "https://ayushgiri05.app.n8n.cloud/webhook-test/website-chat"

/** Try a single n8n URL and return the Response (or null on network failure). */
async function tryWebhook(url: string, payload: object): Promise<Response | null> {
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch {
    return null
  }
}

/** Extract a usable answer string from whatever shape n8n returns. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractAnswer(data: any): string | null {
  if (!data) return null

  // n8n Chat trigger nodes typically return { output: "..." }
  if (typeof data === "string") return data
  if (typeof data.output === "string") return data.output
  if (typeof data.text === "string") return data.text
  if (typeof data.response === "string") return data.response
  if (typeof data.message === "string") return data.message

  // Sometimes n8n returns an array of node results
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

    const payload = { chatInput: query, action: "sendMessage" }

    // 1. Try production URL
    let n8nRes = await tryWebhook(N8N_PRODUCTION_URL, payload)

    // 2. If production returns 404 (workflow inactive), try the test URL
    if (!n8nRes || n8nRes.status === 404) {
      console.log("[n8n-chat] Production webhook unavailable, trying test URL...")
      n8nRes = await tryWebhook(N8N_TEST_URL, payload)
    }

    if (!n8nRes) {
      console.error("[n8n-chat] Both webhook URLs unreachable")
      return NextResponse.json(
        { error: "Could not reach the n8n workflow. Check that the workflow is active." },
        { status: 502 }
      )
    }

    if (!n8nRes.ok) {
      const errorText = await n8nRes.text()
      console.error("[n8n-chat] Webhook error:", n8nRes.status, errorText)
      return NextResponse.json(
        {
          error: "n8n workflow returned an error",
          details: errorText,
          hint: "Make sure the workflow is toggled ACTIVE in the n8n editor.",
        },
        { status: n8nRes.status }
      )
    }

    // Parse the response
    const contentType = n8nRes.headers.get("content-type")
    let answer: string | null = null

    if (contentType?.includes("application/json")) {
      const data = await n8nRes.json()
      answer = extractAnswer(data)
      // Return the full data too, in case the frontend needs extra fields
      return NextResponse.json({ output: answer, raw: data })
    }

    // Plain-text response
    answer = await n8nRes.text()
    return NextResponse.json({ output: answer })
  } catch (error) {
    console.error("[n8n-chat] Proxy error:", error)
    return NextResponse.json(
      { error: "Failed to reach n8n workflow" },
      { status: 502 }
    )
  }
}

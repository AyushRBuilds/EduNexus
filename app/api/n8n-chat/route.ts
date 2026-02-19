import { NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://ayushgiri05.app.n8n.cloud/webhook/website-chat"

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

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: query,
        action: "sendMessage",
      }),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error("[n8n-chat] Webhook error:", n8nResponse.status, errorText)
      return NextResponse.json(
        { error: "n8n workflow returned an error", details: errorText },
        { status: n8nResponse.status }
      )
    }

    const contentType = n8nResponse.headers.get("content-type")

    if (contentType?.includes("application/json")) {
      const data = await n8nResponse.json()
      return NextResponse.json(data)
    }

    // Some n8n webhooks return plain text
    const text = await n8nResponse.text()
    return NextResponse.json({ output: text })
  } catch (error) {
    console.error("[n8n-chat] Proxy error:", error)
    return NextResponse.json(
      { error: "Failed to reach n8n workflow" },
      { status: 502 }
    )
  }
}

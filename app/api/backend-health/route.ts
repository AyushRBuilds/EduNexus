import { NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://edunexus-backend-nv75.onrender.com"

/**
 * GET /api/backend-health
 *
 * Pings the Render backend to wake it up from cold-start.
 * Returns { status: "ok" | "waking" | "down", latencyMs }
 */
export async function GET() {
  const start = Date.now()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45_000)

    // A lightweight GET to see if the backend responds
    const res = await fetch(`${BACKEND_URL}/academic/subjects?email=ping`, {
      signal: controller.signal,
    })

    clearTimeout(timeout)
    const latencyMs = Date.now() - start

    if (res.ok) {
      return NextResponse.json({ status: "ok", latencyMs })
    }

    // Backend responded but with an error -- still alive
    return NextResponse.json({ status: "ok", latencyMs, httpStatus: res.status })
  } catch {
    const latencyMs = Date.now() - start
    return NextResponse.json({ status: "waking", latencyMs })
  }
}

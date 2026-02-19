import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://edunexus-backend-nv75.onrender.com"

/** Maximum number of retry attempts when the backend is cold-starting */
const MAX_RETRIES = 3
/** Delay between retries in ms (escalating: 5s, 10s, 15s) */
const RETRY_BASE_DELAY = 5000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const backendPath = "/" + path.join("/")
  const url = new URL(backendPath, BACKEND_URL)

  // Forward query params
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  const headers: HeadersInit = {}
  const contentType = req.headers.get("content-type")
  if (contentType) {
    headers["Content-Type"] = contentType
  }

  let body: BodyInit | undefined
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      body = await req.arrayBuffer()
      headers["Content-Type"] = contentType
    } else {
      body = await req.text()
    }
  }

  // Retry loop to handle Render free-tier cold starts (30-60s spin-up)
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      // Give the backend up to 30 seconds per attempt
      const timeout = setTimeout(() => controller.abort(), 30_000)

      const backendRes = await fetch(url.toString(), {
        method: req.method,
        headers,
        body,
        signal: controller.signal,
      })

      clearTimeout(timeout)

      const resContentType = backendRes.headers.get("content-type")
      let data: string | ArrayBuffer

      if (resContentType?.includes("application/json")) {
        data = await backendRes.text()
      } else {
        data = await backendRes.arrayBuffer()
      }

      return new NextResponse(data, {
        status: backendRes.status,
        statusText: backendRes.statusText,
        headers: {
          "Content-Type": resContentType || "application/json",
        },
      })
    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES
      if (isLastAttempt) {
        console.error(`[Proxy] Backend unreachable after ${MAX_RETRIES + 1} attempts:`, error)
        return NextResponse.json(
          {
            error: "Backend unreachable",
            message:
              "The backend server is likely cold-starting on Render. Please wait 30-60 seconds and try again.",
            retryAfter: 15,
          },
          { status: 502 }
        )
      }
      // Wait before retrying (escalating delay)
      const delay = RETRY_BASE_DELAY * (attempt + 1)
      console.log(`[Proxy] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }

  // Fallback (should not be reached)
  return NextResponse.json({ error: "Unexpected proxy error" }, { status: 500 })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const DELETE = proxyRequest
export const PATCH = proxyRequest

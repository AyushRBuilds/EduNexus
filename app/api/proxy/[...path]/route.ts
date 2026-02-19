import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://edunexus-backend-nv75.onrender.com"

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
      // For file uploads, forward the raw body and let fetch set the boundary
      body = await req.arrayBuffer()
      // Keep the original content-type with boundary
      headers["Content-Type"] = contentType
    } else {
      body = await req.text()
    }
  }

  try {
    console.log("[v0] Proxy forwarding:", req.method, url.toString())
    const backendRes = await fetch(url.toString(), {
      method: req.method,
      headers,
      body,
    })
    console.log("[v0] Proxy response:", backendRes.status, backendRes.statusText)

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
    console.error("[Proxy] Backend error:", error)
    return NextResponse.json(
      { error: "Backend unreachable. It may be cold-starting on Render (wait ~30s and retry)." },
      { status: 502 }
    )
  }
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const DELETE = proxyRequest
export const PATCH = proxyRequest

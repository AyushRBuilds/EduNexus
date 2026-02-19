/**
 * All browser requests go through /api/proxy/... which forwards server-side
 * to the real backend. This completely eliminates CORS issues.
 * Cache-bust: v10
 */
const PROXY_BASE = "/api/proxy"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...customHeaders,
  }

  const config: RequestInit = {
    ...rest,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  }

  // Route through the Next.js proxy: /api/proxy/auth/login -> backend /auth/login
  const url = `${PROXY_BASE}${endpoint}`

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorMessage: string
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      const errorBody = await response.json()
      errorMessage =
        errorBody.message || errorBody.error || JSON.stringify(errorBody)
    } else {
      errorMessage = await response.text()
    }
    throw new ApiError(errorMessage || response.statusText, response.status)
  }

  const contentType = response.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>
  }

  return response.text() as unknown as T
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://edunexus-backend-nv75.onrender.com"
}

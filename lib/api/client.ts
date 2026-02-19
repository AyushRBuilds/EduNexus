const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

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

  const headers: HeadersInit = {
    ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...customHeaders,
  }

  const config: RequestInit = {
    ...rest,
    headers,
    credentials: "include",
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  }

  const url = `${API_BASE_URL}${endpoint}`

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
  return API_BASE_URL
}

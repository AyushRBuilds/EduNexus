import { apiClient } from "./client"
import type { BackendUser, LoginRequest } from "./types"

/**
 * POST /auth/login
 * Logs in a user by email. Backend returns the User entity directly.
 */
export async function loginUser(email: string): Promise<BackendUser> {
  const payload: LoginRequest = { email }
  return apiClient<BackendUser>("/auth/login", {
    method: "POST",
    body: payload,
  })
}

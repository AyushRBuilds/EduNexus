"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { loginUser } from "@/lib/api/auth.service"
import {
  mapBackendUserToFrontend,
  type FrontendUser,
  type FrontendUserRole,
} from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"

export type UserRole = FrontendUserRole

export interface User {
  name: string
  email: string
  role: UserRole
  department: string
  avatar: string
  id: string
  semester?: number | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    department: string
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Fallback mock users for when the backend is unreachable
const MOCK_USERS: Record<string, User & { password: string }> = {
  "student@email.com": {
    id: "s1",
    name: "John Doe",
    email: "student@email.com",
    role: "student",
    department: "CS",
    avatar: "JD",
    password: "password",
    semester: 3,
  },
  "teacher@email.com": {
    id: "f1",
    name: "Prof Smith",
    email: "teacher@email.com",
    role: "faculty",
    department: "CS",
    avatar: "PS",
    password: "password",
  },
  "admin@email.com": {
    id: "a1",
    name: "Admin User",
    email: "admin@email.com",
    role: "admin",
    department: "AdminDept",
    avatar: "AU",
    password: "password",
  },
  // Legacy demo accounts (for backward compat)
  "student@edu.in": {
    id: "s2",
    name: "Aarav Sharma",
    email: "student@edu.in",
    role: "student",
    department: "Computer Science",
    avatar: "AS",
    password: "student123",
    semester: 3,
  },
  "faculty@edu.in": {
    id: "f2",
    name: "Dr. Priya Nair",
    email: "faculty@edu.in",
    role: "faculty",
    department: "Electrical Engineering",
    avatar: "PN",
    password: "faculty123",
  },
  "admin@edu.in": {
    id: "a2",
    name: "Rajesh Kumar",
    email: "admin@edu.in",
    role: "admin",
    department: "Administration",
    avatar: "RK",
    password: "admin123",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, _password: string) => {
    try {
      // Try the real backend first
      const backendUser = await loginUser(email)
      const frontendUser = mapBackendUserToFrontend(backendUser)
      setUser(frontendUser)
      return { success: true }
    } catch (err) {
      // If backend is unreachable (network error), fall back to mock data
      if (err instanceof ApiError) {
        // Backend responded with an error (e.g. 401 user not found)
        return {
          success: false,
          error: err.message || "Login failed. Check your credentials.",
        }
      }

      // Network error - backend not running, try mock fallback
      console.warn(
        "[EduNexus] Backend unreachable, falling back to mock auth"
      )
      const found = MOCK_USERS[email.toLowerCase()]
      if (!found) {
        return {
          success: false,
          error:
            "Backend is offline and no mock account found for this email.",
        }
      }
      if (found.password !== _password) {
        return { success: false, error: "Incorrect password (mock mode)" }
      }
      const { password: _, ...userWithoutPassword } = found
      setUser(userWithoutPassword)
      return { success: true }
    }
  }, [])

  const signup = useCallback(
    async (
      name: string,
      email: string,
      _password: string,
      role: UserRole,
      department: string
    ) => {
      // The current backend does not have a signup endpoint.
      // For now, create the user locally. When the backend adds POST /auth/register,
      // this can be wired up just like login.
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      const newUser: User = {
        id: `u_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        role,
        department,
        avatar: initials,
      }
      setUser(newUser)
      return { success: true }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

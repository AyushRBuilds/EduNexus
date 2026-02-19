"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import type { FrontendUserRole } from "@/lib/api/types"

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
  loading: boolean
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    department: string,
    semester?: number
  ) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function buildUserFromSupabase(
  supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  profile?: { name: string; role: string; department: string; semester: number | null } | null
): User {
  const name =
    profile?.name ||
    (supabaseUser.user_metadata?.name as string) ||
    supabaseUser.email?.split("@")[0] ||
    "User"
  const role =
    (profile?.role as UserRole) ||
    (supabaseUser.user_metadata?.role as UserRole) ||
    "student"
  const department =
    profile?.department ||
    (supabaseUser.user_metadata?.department as string) ||
    ""
  const semester =
    profile?.semester ??
    (supabaseUser.user_metadata?.semester as number | undefined) ??
    null

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return {
    id: supabaseUser.id,
    name,
    email: supabaseUser.email || "",
    role,
    department,
    avatar: initials,
    semester,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Restore session on mount and listen for auth changes
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser()

        if (supabaseUser) {
          // Fetch profile from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, role, department, semester")
            .eq("id", supabaseUser.id)
            .single()

          setUser(buildUserFromSupabase(supabaseUser, profile))
        }
      } catch {
        // No session — user stays null
      } finally {
        setLoading(false)
      }
    }

    restoreSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, role, department, semester")
          .eq("id", session.user.id)
          .single()

        setUser(buildUserFromSupabase(session.user, profile))
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          return { success: false, error: error.message }
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, role, department, semester")
            .eq("id", data.user.id)
            .single()

          setUser(buildUserFromSupabase(data.user, profile))
        }

        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Login failed",
        }
      }
    },
    [supabase]
  )

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
      department: string,
      semester?: number
    ) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
              `${window.location.origin}`,
            data: {
              name,
              role,
              department,
              semester: semester ?? null,
            },
          },
        })

        if (error) {
          return { success: false, error: error.message }
        }

        // If email confirmation is required, user won't have a session yet
        if (
          data.user &&
          data.user.identities &&
          data.user.identities.length === 0
        ) {
          return {
            success: false,
            error: "An account with this email already exists.",
          }
        }

        // Check if email confirmation is needed
        if (data.user && !data.session) {
          return {
            success: true,
            needsConfirmation: true,
          }
        }

        // Auto-confirmed (e.g. dev mode) — user is logged in immediately
        if (data.user && data.session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, role, department, semester")
            .eq("id", data.user.id)
            .single()

          setUser(buildUserFromSupabase(data.user, profile))
        }

        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Sign up failed",
        }
      }
    },
    [supabase]
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, signup, logout }}
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

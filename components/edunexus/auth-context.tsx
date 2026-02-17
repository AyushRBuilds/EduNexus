"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type UserRole = "student" | "faculty" | "admin"

export interface User {
  name: string
  email: string
  role: UserRole
  department: string
  avatar: string
  id: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USERS: Record<string, User & { password: string }> = {
  "student@edu.in": {
    id: "s1",
    name: "Aarav Sharma",
    email: "student@edu.in",
    role: "student",
    department: "Computer Science",
    avatar: "AS",
    password: "student123",
  },
  "faculty@edu.in": {
    id: "f1",
    name: "Dr. Priya Nair",
    email: "faculty@edu.in",
    role: "faculty",
    department: "Electrical Engineering",
    avatar: "PN",
    password: "faculty123",
  },
  "admin@edu.in": {
    id: "a1",
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

  const login = useCallback(async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockUser = MOCK_USERS[email.toLowerCase()]
    if (!mockUser) {
      return { success: false, error: "No account found with this email" }
    }
    if (mockUser.password !== password) {
      return { success: false, error: "Incorrect password" }
    }

    const { password: _, ...userWithoutPassword } = mockUser
    setUser(userWithoutPassword)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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

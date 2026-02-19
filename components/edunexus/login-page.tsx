"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { useTheme } from "next-themes"
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, Shield, Sun, Moon, UserPlus, ArrowLeft } from "lucide-react"
import { EduNexusLogo } from "./edunexus-logo"
import type { UserRole } from "./auth-context"

const DEMO_ACCOUNTS = [
  {
    label: "Student",
    email: "student@email.com",
    password: "password",
    icon: GraduationCap,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
    desc: "Browse courses, search knowledge, collaborate",
  },
  {
    label: "Faculty",
    email: "teacher@email.com",
    password: "password",
    icon: BookOpen,
    color: "text-sky-400",
    borderColor: "border-sky-500/30",
    bgColor: "bg-sky-500/10",
    desc: "Upload content, view insights, manage studio",
  },
  {
    label: "Admin",
    email: "admin@email.com",
    password: "password",
    icon: Shield,
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    desc: "Full platform control, analytics, moderation",
  },
]

export function LoginPage() {
  const { login, signup } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<UserRole>("student")
  const [department, setDepartment] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (isSignUp) {
      if (!name.trim()) {
        setError("Please enter your full name")
        setLoading(false)
        return
      }
      if (!department.trim()) {
        setError("Please enter your department")
        setLoading(false)
        return
      }
      const result = await signup(name, email, password, role, department)
      if (!result.success) {
        setError(result.error || "Sign up failed")
      }
    } else {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error || "Login failed")
      }
    }
    setLoading(false)
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError("")
    setLoading(true)

    const result = await login(demoEmail, demoPassword)
    if (!result.success) {
      setError(result.error || "Login failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid relative overflow-hidden">
      {/* Theme toggle - top right */}
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Toggle theme"
        suppressHydrationWarning
      >
        {mounted ? (
          resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </button>

      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md mx-4">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <EduNexusLogo size={48} />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              EduNexus
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Unified AI-Powered Knowledge Search for Smart Campuses
          </p>
        </div>

        {/* Login / Sign Up Card */}
        <div className="glass-strong rounded-2xl p-8 glow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            {isSignUp ? "Create account" : "Sign in"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {isSignUp
              ? "Join EduNexus to access your smart campus"
              : "Your role is automatically detected from your credentials"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            {/* Name field (sign-up only) */}
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu.in"
                className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                required
                suppressHydrationWarning
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Min. 6 characters" : "Enter your password"}
                  className="w-full h-11 px-4 pr-11 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                  required
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  suppressHydrationWarning
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role & Department (sign-up only) */}
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-secondary-foreground mb-1.5">
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-secondary-foreground mb-1.5">
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              suppressHydrationWarning
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Toggle sign-in / sign-up */}
          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "New to EduNexus?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary font-medium hover:underline transition-colors"
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>
        </div>

        {/* Demo Accounts (only on sign-in) */}
        {!isSignUp && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Quick Demo Access</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-3">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon
              return (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  disabled={loading}
                  className={`w-full glass rounded-xl p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all group disabled:opacity-50`}
                >
                  <div className={`w-10 h-10 rounded-lg ${account.bgColor} border ${account.borderColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${account.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{account.label}</span>
                      <span className="text-xs text-muted-foreground font-mono">{account.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{account.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Login
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

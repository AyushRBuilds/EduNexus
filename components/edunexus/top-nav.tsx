"use client"

import { useState } from "react"
import {
  Search,
  Bell,
  Upload,
  Sparkles,
  LogOut,
  GraduationCap,
  BookOpen,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth, type UserRole } from "./auth-context"

const roleConfig: Record<UserRole, { label: string; color: string; bgColor: string; icon: typeof GraduationCap }> = {
  student: { label: "Student", color: "text-emerald-400", bgColor: "bg-emerald-500/15", icon: GraduationCap },
  faculty: { label: "Faculty", color: "text-sky-400", bgColor: "bg-sky-500/15", icon: BookOpen },
  admin: { label: "Admin", color: "text-amber-400", bgColor: "bg-amber-500/15", icon: Shield },
}

export function TopNav({
  onSearch,
  onProfileClick,
}: {
  onSearch: (query: string) => void
  onProfileClick?: () => void
}) {
  const { user, logout } = useAuth()
  const [navSearch, setNavSearch] = useState("")

  const role = user?.role ?? "student"
  const config = roleConfig[role]
  const RoleIcon = config.icon

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        {/* Mobile logo - only shows on small screens where sidebar is hidden */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">EduNexus</span>
        </div>

        {/* Center Search */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search across lectures, papers, notes..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && navSearch.trim()) {
                  onSearch(navSearch.trim())
                  setNavSearch("")
                }
              }}
              className="h-10 w-full rounded-xl border border-border bg-secondary/40 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 focus:glow-sm transition-all"
            />
          </div>
        </div>

        {/* Right Nav */}
        <nav className="flex items-center gap-1.5">
          {(role === "faculty" || role === "admin") && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-muted-foreground hover:text-foreground hover:bg-secondary/60 sm:flex"
            >
              <Upload className="mr-1.5 h-4 w-4" />
              Upload
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/60 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Role Badge */}
          <div className={`hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${config.bgColor} sm:flex`}>
            <RoleIcon className={`h-3.5 w-3.5 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          </div>

          {/* User Avatar — opens profile panel */}
          <button
            onClick={onProfileClick}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform hover:scale-105 active:scale-95"
            aria-label="Open profile"
          >
            <Avatar className="h-8 w-8 cursor-pointer border border-border hover:border-primary/50 transition-colors">
              <AvatarFallback className="bg-primary/20 text-xs text-primary font-medium">
                {user?.avatar ?? "EN"}
              </AvatarFallback>
            </Avatar>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="hidden text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:flex"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}

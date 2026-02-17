"use client"

import { useState } from "react"
import {
  Search,
  Bell,
  Upload,
  Menu,
  X,
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
}: {
  onSearch: (query: string) => void
}) {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navSearch, setNavSearch] = useState("")

  const role = user?.role ?? "student"
  const config = roleConfig[role]
  const RoleIcon = config.icon

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-4 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">EduNexus</span>
        </div>

        {/* Center Search */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && navSearch.trim()) {
                  onSearch(navSearch.trim())
                  setNavSearch("")
                }
              }}
              className="h-9 w-full rounded-xl border border-border bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Right Nav */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {(role === "faculty" || role === "admin") && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/60"
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
          <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${config.bgColor} ml-1`}>
            <RoleIcon className={`h-3.5 w-3.5 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          </div>

          {/* User Avatar & Info */}
          <div className="flex items-center gap-2 ml-1">
            <Avatar className="h-8 w-8 cursor-pointer border border-border">
              <AvatarFallback className="bg-primary/20 text-xs text-primary font-medium">
                {user?.avatar ?? "EN"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden xl:flex flex-col">
              <span className="text-sm font-medium text-foreground leading-none">{user?.name}</span>
              <span className="text-xs text-muted-foreground leading-none mt-0.5">{user?.department}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-muted-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border px-4 pb-4 pt-3 md:hidden">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && navSearch.trim()) {
                  onSearch(navSearch.trim())
                  setNavSearch("")
                  setMobileMenuOpen(false)
                }
              }}
              className="h-9 w-full rounded-xl border border-border bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Mobile user info */}
          <div className="flex items-center gap-3 mb-3 px-2 py-2 rounded-xl bg-secondary/30">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/20 text-xs text-primary font-medium">
                {user?.avatar ?? "EN"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.department}</p>
            </div>
            <div className={`rounded-md px-2 py-0.5 ${config.bgColor}`}>
              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {(role === "faculty" || role === "admin") && (
              <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
            )}
            <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

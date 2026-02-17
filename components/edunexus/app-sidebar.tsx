"use client"

import { useState } from "react"
import {
  Search,
  Network,
  BookOpen,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRole } from "./auth-context"

interface SidebarItem {
  icon: typeof Search
  label: string
  id: string
  roles: UserRole[]
  color: string
}

const sidebarItems: SidebarItem[] = [
  { icon: Search, label: "Smart Search", id: "search", roles: ["student", "faculty", "admin"], color: "text-sky-400" },
  { icon: Network, label: "Knowledge Graph", id: "graph", roles: ["student", "faculty", "admin"], color: "text-emerald-400" },
  { icon: BookOpen, label: "Research Repo", id: "research", roles: ["student", "faculty", "admin"], color: "text-orange-400" },
  { icon: Handshake, label: "Research Collab", id: "collab", roles: ["student", "faculty", "admin"], color: "text-pink-400" },
  { icon: TrendingUp, label: "Trending", id: "trending", roles: ["student", "faculty", "admin"], color: "text-yellow-400" },
  { icon: GraduationCap, label: "Faculty Studio", id: "faculty", roles: ["faculty", "admin"], color: "text-indigo-400" },
  { icon: LayoutDashboard, label: "Admin Panel", id: "admin", roles: ["admin"], color: "text-amber-400" },
]

export type ViewId = "search" | "graph" | "research" | "collab" | "trending" | "faculty" | "admin"

export function AppSidebar({
  activeView,
  onNavigate,
  userRole,
}: {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  userRole: UserRole
}) {
  const [collapsed, setCollapsed] = useState(false)

  const visibleItems = sidebarItems.filter((item) => item.roles.includes(userRole))

  return (
    <aside
      className={cn(
        "hidden flex-col border-r border-border/60 bg-sidebar transition-all duration-300 ease-in-out lg:flex relative",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo area */}
      <div className={cn(
        "flex items-center gap-2.5 border-b border-border/40 px-4 h-16 shrink-0",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary glow-sm">
          <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-base font-bold text-foreground leading-tight">EduNexus</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Smart Campus</span>
          </div>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex flex-1 flex-col gap-1 px-2.5 py-4 overflow-y-auto">
        <p className={cn(
          "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5",
          collapsed ? "text-center" : "px-2.5"
        )}>
          {collapsed ? "---" : "Navigation"}
        </p>

        {visibleItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewId)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary/15 text-foreground glow-sm"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary" />
              )}

              <item.icon className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                isActive ? item.color : "group-hover:text-foreground"
              )} />

              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {/* Tooltip on collapsed */}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 rounded-lg bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border/50">
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border/40 p-2.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-muted-foreground/50 hover:bg-secondary/50 hover:text-foreground transition-all"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

/* ---- Mobile Bottom Nav ---- */
export function MobileBottomNav({
  activeView,
  onNavigate,
  userRole,
}: {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  userRole: UserRole
}) {
  const visibleItems = sidebarItems.filter((item) => item.roles.includes(userRole)).slice(0, 5)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/60 glass-strong py-1.5 px-1 lg:hidden safe-area-pb">
      {visibleItems.map((item) => {
        const isActive = activeView === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewId)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && item.color)} />
            <span className="text-[10px] font-medium leading-none">{item.label.split(" ")[0]}</span>
            {isActive && <span className="mt-0.5 h-0.5 w-4 rounded-full bg-primary" />}
          </button>
        )
      })}
    </nav>
  )
}

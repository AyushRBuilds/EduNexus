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
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRole } from "./auth-context"

interface SidebarItem {
  icon: typeof Search
  label: string
  id: string
  roles: UserRole[]
}

const sidebarItems: SidebarItem[] = [
  { icon: Search, label: "Smart Search", id: "search", roles: ["student", "faculty", "admin"] },
  { icon: Network, label: "Knowledge Graph", id: "graph", roles: ["student", "faculty", "admin"] },
  { icon: BookOpen, label: "Research Repository", id: "research", roles: ["student", "faculty", "admin"] },
  { icon: Handshake, label: "Research Collab", id: "collab", roles: ["student", "faculty", "admin"] },
  { icon: TrendingUp, label: "Trending", id: "trending", roles: ["student", "faculty", "admin"] },
  { icon: GraduationCap, label: "Faculty Studio", id: "faculty", roles: ["faculty", "admin"] },
  { icon: LayoutDashboard, label: "Admin Panel", id: "admin", roles: ["admin"] },
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
  const [collapsed, setCollapsed] = useState(true)

  const visibleItems = sidebarItems.filter((item) => item.roles.includes(userRole))

  return (
    <aside
      className={cn(
        "hidden flex-col border-r border-border bg-sidebar transition-all duration-300 lg:flex",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex flex-1 flex-col gap-1 px-2 py-4">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewId)}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              activeView === item.id
                ? "bg-sidebar-accent text-sidebar-primary glow-sm"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </div>

      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl py-2 text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}

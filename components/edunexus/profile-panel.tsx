"use client"

import {
  X,
  Mail,
  Building2,
  GraduationCap,
  BookOpen,
  Shield,
  Calendar,
  Clock,
  Award,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { User, UserRole } from "./auth-context"

const roleConfig: Record<
  UserRole,
  { label: string; color: string; bg: string; icon: typeof GraduationCap; borderColor: string }
> = {
  student: {
    label: "Student",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    icon: GraduationCap,
    borderColor: "border-emerald-500/30",
  },
  faculty: {
    label: "Faculty",
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    icon: BookOpen,
    borderColor: "border-sky-500/30",
  },
  admin: {
    label: "Administrator",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    icon: Shield,
    borderColor: "border-amber-500/30",
  },
}

const profileStats: Record<UserRole, { label: string; value: string }[]> = {
  student: [
    { label: "Courses Enrolled", value: "7" },
    { label: "Assignments Done", value: "23" },
    { label: "GPA", value: "8.7" },
    { label: "Attendance", value: "92%" },
  ],
  faculty: [
    { label: "Courses Teaching", value: "4" },
    { label: "Papers Published", value: "18" },
    { label: "Students", value: "245" },
    { label: "H-Index", value: "12" },
  ],
  admin: [
    { label: "Managed Users", value: "1,250" },
    { label: "Departments", value: "8" },
    { label: "Active Issues", value: "3" },
    { label: "Uptime", value: "99.9%" },
  ],
}

export function ProfilePanel({
  user,
  open,
  onClose,
  onLogout,
}: {
  user: User
  open: boolean
  onClose: () => void
  onLogout: () => void
}) {
  const config = roleConfig[user.role]
  const RoleIcon = config.icon
  const stats = profileStats[user.role]

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col border-l border-border/50 bg-card shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Profile</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center text-center">
            <div className={cn("rounded-full p-0.5 border-2", config.borderColor)}>
              <Avatar className="h-20 w-20 border-2 border-card">
                <AvatarFallback className="bg-primary/20 text-xl text-primary font-bold">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
            </div>
            <h2 className="mt-3 text-lg font-bold text-foreground">{user.name}</h2>
            <Badge className={cn("mt-1.5 gap-1.5", config.bg, config.color, "border-0")}>
              <RoleIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>

          <Separator className="my-5 bg-border/30" />

          {/* Info fields */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/20 border border-border/30 px-3.5 py-2.5">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Email
                </p>
                <p className="text-sm text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-secondary/20 border border-border/30 px-3.5 py-2.5">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Department
                </p>
                <p className="text-sm text-foreground">{user.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-secondary/20 border border-border/30 px-3.5 py-2.5">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Joined
                </p>
                <p className="text-sm text-foreground">August 2024</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-secondary/20 border border-border/30 px-3.5 py-2.5">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Last Active
                </p>
                <p className="text-sm text-foreground">Just now</p>
              </div>
            </div>
          </div>

          <Separator className="my-5 bg-border/30" />

          {/* Quick Stats */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-2">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-lg border border-border/30 bg-secondary/15 p-3"
                >
                  <span className="text-lg font-bold text-foreground">{stat.value}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {user.role === "student" && (
            <>
              <Separator className="my-5 bg-border/30" />
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Achievements
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Dean's List", "Perfect Attendance", "Top Performer", "Research Intern"].map(
                    (badge) => (
                      <Badge
                        key={badge}
                        variant="secondary"
                        className="gap-1 bg-primary/10 text-primary border-0 text-[11px]"
                      >
                        <Award className="h-3 w-3" />
                        {badge}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border/40 p-4 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-border/50 bg-secondary/20 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
            Account Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start gap-2 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}

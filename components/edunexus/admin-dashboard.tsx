"use client"

import {
  Users,
  Search,
  FileText,
  Handshake,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Building2,
  BarChart3,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/* ---------- Stat Card ---------- */
function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  change: string
  icon: typeof Users
  color: string
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        {change}
      </p>
    </div>
  )
}

/* ---------- User Row ---------- */
function UserRow({
  name,
  email,
  role,
  department,
  lastActive,
  status,
}: {
  name: string
  email: string
  role: string
  department: string
  lastActive: string
  status: "active" | "inactive"
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0">
      <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <span className="text-xs font-medium text-primary">
          {name.split(" ").map((n) => n[0]).join("")}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
      <Badge variant="outline" className="text-[10px] border-border bg-secondary/30 text-muted-foreground hidden sm:flex">
        {role}
      </Badge>
      <span className="text-xs text-muted-foreground hidden md:block">{department}</span>
      <span className="text-xs text-muted-foreground hidden lg:flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {lastActive}
      </span>
      <span className={`h-2 w-2 rounded-full shrink-0 ${status === "active" ? "bg-emerald-400" : "bg-muted-foreground/30"}`} />
    </div>
  )
}

/* ---------- Moderation Item ---------- */
function ModerationItem({
  title,
  type,
  flaggedBy,
  reason,
}: {
  title: string
  type: string
  flaggedBy: string
  reason: string
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
      <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {type} &middot; Flagged by {flaggedBy} &middot; {reason}
        </p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Button size="sm" className="h-7 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs px-2">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Approve
        </Button>
        <Button size="sm" className="h-7 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs px-2">
          Remove
        </Button>
      </div>
    </div>
  )
}

/* ---------- Department Stat ---------- */
function DepartmentStat({ name, students, faculty, content }: { name: string; students: number; faculty: number; content: number }) {
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-border/30 last:border-0">
      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-foreground flex-1">{name}</span>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{students} students</span>
        <span>{faculty} faculty</span>
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {content}
        </span>
      </div>
    </div>
  )
}

/* ---------- Main Component ---------- */
export function AdminDashboard() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          Admin Dashboard
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Platform overview, user management, and content moderation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value="4,832"
          change="+12.5% this month"
          icon={Users}
          color="bg-sky-500/15 text-sky-400"
        />
        <StatCard
          label="Searches Today"
          value="1,247"
          change="+8.3% vs yesterday"
          icon={Search}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          label="Content Indexed"
          value="12,456"
          change="+156 this week"
          icon={FileText}
          color="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          label="Active Collabs"
          value="89"
          change="+23 new this month"
          icon={Handshake}
          color="bg-primary/15 text-primary"
        />
      </div>

      {/* System Health */}
      <div className="glass rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          System Health
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "AI Engine", status: "Operational", ok: true },
            { label: "Search Index", status: "Operational", ok: true },
            { label: "File Storage", status: "Operational", ok: true },
            { label: "Auth Service", status: "Degraded", ok: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.ok ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
              <div>
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className={`text-[11px] ${item.ok ? "text-emerald-400" : "text-amber-400"}`}>{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Management */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Recent Users
            </h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 h-7">
              View All
            </Button>
          </div>
          <div>
            <UserRow name="Aarav Sharma" email="aarav@edu.in" role="Student" department="CS" lastActive="2 min ago" status="active" />
            <UserRow name="Dr. Priya Nair" email="priya.nair@edu.in" role="Faculty" department="EE" lastActive="15 min ago" status="active" />
            <UserRow name="Neha Patel" email="neha@edu.in" role="Student" department="CS" lastActive="1 hr ago" status="active" />
            <UserRow name="Prof. S. Iyer" email="s.iyer@edu.in" role="Faculty" department="CS" lastActive="3 hrs ago" status="inactive" />
            <UserRow name="Rahul Dev" email="rahul.d@edu.in" role="Student" department="ME" lastActive="1 day ago" status="inactive" />
          </div>
        </div>

        {/* Content Moderation */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Content Moderation Queue
              <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400 text-[10px] ml-1">
                3 pending
              </Badge>
            </h3>
          </div>
          <div>
            <ModerationItem
              title="Unofficial Exam Solutions - Maths III"
              type="PDF Upload"
              flaggedBy="System AI"
              reason="Potential copyright issue"
            />
            <ModerationItem
              title="Off-topic Discussion Post"
              type="Research Collab"
              flaggedBy="User report"
              reason="Spam / irrelevant content"
            />
            <ModerationItem
              title="Duplicate Research Paper Upload"
              type="Document"
              flaggedBy="System AI"
              reason="Duplicate detection"
            />
          </div>
        </div>
      </div>

      {/* Department Analytics */}
      <div className="glass rounded-xl p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Department Analytics
          </h3>
        </div>
        <div>
          <DepartmentStat name="Computer Science" students={1240} faculty={45} content={3420} />
          <DepartmentStat name="Electrical Engineering" students={890} faculty={38} content={2180} />
          <DepartmentStat name="Mechanical Engineering" students={780} faculty={32} content={1890} />
          <DepartmentStat name="Physics" students={420} faculty={22} content={1240} />
          <DepartmentStat name="Mathematics" students={350} faculty={18} content={980} />
        </div>
      </div>
    </section>
  )
}

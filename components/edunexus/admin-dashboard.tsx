"use client"

import { useState, useEffect } from "react"
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
  Loader2,
  Upload,
  Download,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "./auth-context"
import { getSubjects, getMaterials, uploadMaterial, addMaterial } from "@/lib/api/academic.service"
import { downloadMaterial, downloadAllMaterials } from "@/lib/api/download"
import { MaterialViewer } from "./material-viewer"
import type { BackendSubject, BackendMaterial } from "@/lib/api/types"

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

/* ---------- Admin Material Manager ---------- */
function MaterialManager({
  subjects,
  onMaterialAdded,
}: {
  subjects: BackendSubject[]
  onMaterialAdded: () => void
}) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.length > 0 ? String(subjects[0].id) : ""
  )
  const [materialType, setMaterialType] = useState<"PDF" | "LINK" | "VIDEO">("PDF")
  const [filePath, setFilePath] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const handleAddMaterial = async () => {
    if (!selectedSubjectId) return
    setUploading(true)
    setMessage(null)

    try {
      if (uploadFile) {
        await uploadMaterial(
          Number(selectedSubjectId),
          "PDF",
          uploadFile,
          description || undefined
        )
      } else {
        await addMaterial({
          subjectId: Number(selectedSubjectId),
          type: materialType,
          filePath,
          description,
          content,
        })
      }
      setMessage({ text: "Material added successfully!", type: "success" })
      setFilePath("")
      setDescription("")
      setContent("")
      setUploadFile(null)
      onMaterialAdded()
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to add material",
        type: "error",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Upload className="h-4 w-4 text-primary" />
        Add Material
      </h3>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Subject</label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="bg-secondary/30 border-border/40">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <Select value={materialType} onValueChange={(v) => setMaterialType(v as "PDF" | "LINK" | "VIDEO")}>
              <SelectTrigger className="bg-secondary/30 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="LINK">Link</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Chapter 1: Arrays and Linked Lists"
            className="bg-secondary/30 border-border/40"
          />
        </div>

        {materialType === "PDF" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Upload PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setUploadFile(e.target.files[0])
                }
              }}
              className="text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border file:border-primary/20 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
            />
            {uploadFile && (
              <p className="text-[11px] text-muted-foreground">Selected: {uploadFile.name}</p>
            )}
          </div>
        )}

        {materialType !== "PDF" && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {materialType === "LINK" ? "URL" : "File Path"}
              </label>
              <Input
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder={materialType === "LINK" ? "https://..." : "filename.pdf"}
                className="bg-secondary/30 border-border/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Content (optional)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Text content to index..."
                className="w-full h-20 px-3 py-2 text-sm rounded-lg bg-secondary/30 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </>
        )}

        {message && (
          <div
            className={`text-xs rounded-lg px-3 py-2 ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          onClick={handleAddMaterial}
          disabled={uploading || !selectedSubjectId}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Add Material
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

/* ---------- Main Component ---------- */
export function AdminDashboard() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<BackendSubject[]>([])
  const [allMaterials, setAllMaterials] = useState<BackendMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [backendConnected, setBackendConnected] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewerMaterial, setViewerMaterial] = useState<BackendMaterial | null>(null)

  // Load subjects and materials from backend with retry for cold-start
  useEffect(() => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    let cancelled = false
    const MAX_RETRIES = 3
    const RETRY_DELAY = 8000

    async function fetchWithRetry(attempt: number) {
      if (cancelled) return
      try {
        const subjectsData = await getSubjects(user!.email)
        if (cancelled) return
        setSubjects(subjectsData)
        setBackendConnected(true)

        // Load materials for each subject
        const mats: BackendMaterial[] = []
        for (const subj of subjectsData) {
          try {
            const m = await getMaterials(subj.id)
            mats.push(...m)
          } catch {
            // Skip individual material errors
          }
        }
        if (!cancelled) {
          setAllMaterials(mats)
          setLoading(false)
        }
      } catch {
        if (cancelled) return
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY))
          fetchWithRetry(attempt + 1)
        } else {
          setBackendConnected(false)
          setLoading(false)
        }
      }
    }

    setLoading(true)
    fetchWithRetry(0)

    return () => { cancelled = true }
  }, [user?.email, refreshKey])

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

      {/* Backend connection status */}
      {!loading && (
        <div className={`mb-4 glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs ${
          backendConnected
            ? "text-emerald-400 border border-emerald-500/20 bg-emerald-500/5"
            : "text-amber-400 border border-amber-500/20 bg-amber-500/5"
        }`}>
          <span className={`h-2 w-2 rounded-full ${backendConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
          {backendConnected
            ? `Connected to backend -- ${subjects.length} subjects, ${allMaterials.length} materials indexed`
            : "Backend not connected -- showing demo data"}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading dashboard...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
            <StatCard
              label="Total Users"
              value={backendConnected ? "3" : "4,832"}
              change={backendConnected ? "Backend connected" : "+12.5% this month"}
              icon={Users}
              color="bg-sky-500/15 text-sky-400"
            />
            <StatCard
              label="Subjects"
              value={backendConnected ? String(subjects.length) : "1,247"}
              change={backendConnected ? "From database" : "+8.3% vs yesterday"}
              icon={Search}
              color="bg-emerald-500/15 text-emerald-400"
            />
            <StatCard
              label="Materials Indexed"
              value={backendConnected ? String(allMaterials.length) : "12,456"}
              change={backendConnected ? "PDFs, Links, Videos" : "+156 this week"}
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
                { label: "Backend API", status: backendConnected ? "Operational" : "Offline", ok: backendConnected },
                { label: "AI Engine", status: "Operational", ok: true },
                { label: "Search Index", status: backendConnected ? "Operational" : "Fallback", ok: backendConnected },
                { label: "File Storage", status: "Operational", ok: true },
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
                <UserRow name="John Doe" email="student@email.com" role="Student" department="CS" lastActive="Seeded" status="active" />
                <UserRow name="Prof Smith" email="teacher@email.com" role="Teacher" department="CS" lastActive="Seeded" status="active" />
                <UserRow name="Admin User" email="admin@email.com" role="Admin" department="Admin" lastActive="Seeded" status="active" />
              </div>
            </div>

            {/* Admin Material Upload */}
            {backendConnected && subjects.length > 0 && (
              <MaterialManager
                subjects={subjects}
                onMaterialAdded={() => setRefreshKey((k) => k + 1)}
              />
            )}

            {/* Content Moderation (fallback when no backend) */}
            {(!backendConnected || subjects.length === 0) && (
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
            )}
          </div>

          {/* Backend Materials List */}
          {backendConnected && allMaterials.length > 0 && (
            <div className="glass rounded-xl p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Indexed Materials
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => downloadAllMaterials(allMaterials)}
                  >
                    <Download className="h-3 w-3" />
                    Download All ({allMaterials.length})
                  </Button>
                  <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/10 text-primary">
                    {allMaterials.length} total
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                {allMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="group flex items-center gap-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-secondary/10 rounded-lg transition-colors px-1 cursor-pointer"
                    onClick={() => setViewerMaterial(mat)}
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {mat.description || mat.filePath}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {mat.subject.name} &middot; {mat.type}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-400 border-sky-500/20 shrink-0">
                      {mat.type}
                    </Badge>
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadMaterial(mat) }}
                      className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department Analytics (always show) */}
          <div className="glass rounded-xl p-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Department Analytics
              </h3>
            </div>
            <div>
              {backendConnected && subjects.length > 0 ? (
                // Group subjects by department
                Object.entries(
                  subjects.reduce((acc, s) => {
                    if (!acc[s.department]) acc[s.department] = { count: 0, materials: 0 }
                    acc[s.department].count++
                    acc[s.department].materials += allMaterials.filter(
                      (m) => m.subject.department === s.department
                    ).length
                    return acc
                  }, {} as Record<string, { count: number; materials: number }>)
                ).map(([dept, data]) => (
                  <DepartmentStat
                    key={dept}
                    name={dept}
                    students={0}
                    faculty={0}
                    content={data.materials}
                  />
                ))
              ) : (
                <>
                  <DepartmentStat name="Computer Science" students={1240} faculty={45} content={3420} />
                  <DepartmentStat name="Electrical Engineering" students={890} faculty={38} content={2180} />
                  <DepartmentStat name="Mechanical Engineering" students={780} faculty={32} content={1890} />
                  <DepartmentStat name="Physics" students={420} faculty={22} content={1240} />
                  <DepartmentStat name="Mathematics" students={350} faculty={18} content={980} />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* In-app material viewer */}
      <MaterialViewer
        material={viewerMaterial}
        open={!!viewerMaterial}
        onClose={() => setViewerMaterial(null)}
      />
    </section>
  )
}

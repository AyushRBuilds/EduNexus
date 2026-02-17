"use client"

import { useState } from "react"
import {
  Handshake,
  Plus,
  Search,
  Users,
  Clock,
  Tag,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  BookOpen,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UserRole } from "./auth-context"

type CollabStatus = "open" | "in-progress" | "closed"
type LookingFor = "students" | "faculty" | "both"
type ViewMode = "browse" | "my-requests"

interface CollabRequest {
  id: string
  title: string
  description: string
  postedBy: string
  posterRole: "student" | "faculty"
  posterEmail: string
  department: string
  tags: string[]
  skills: string[]
  lookingFor: LookingFor
  status: CollabStatus
  applicants: number
  createdAt: string
}

const INITIAL_REQUESTS: CollabRequest[] = [
  {
    id: "1",
    title: "ML-Based Predictive Maintenance for Industrial IoT Systems",
    description: "Looking for research collaborators to develop machine learning models for predictive maintenance in IoT-enabled manufacturing environments. We have access to real sensor data from partner industries.",
    postedBy: "Dr. Priya Nair",
    posterRole: "faculty",
    posterEmail: "faculty@edu.in",
    department: "Electrical Engineering",
    tags: ["Machine Learning", "IoT", "Industry 4.0"],
    skills: ["Python", "TensorFlow", "Signal Processing"],
    lookingFor: "students",
    status: "open",
    applicants: 8,
    createdAt: "2 days ago",
  },
  {
    id: "2",
    title: "Blockchain-Based Academic Credential Verification",
    description: "Seeking faculty advisor and student collaborators for research on using blockchain technology for tamper-proof academic credential verification systems.",
    postedBy: "Aarav Sharma",
    posterRole: "student",
    posterEmail: "student@edu.in",
    department: "Computer Science",
    tags: ["Blockchain", "Security", "EdTech"],
    skills: ["Solidity", "React", "Cryptography"],
    lookingFor: "both",
    status: "open",
    applicants: 3,
    createdAt: "5 days ago",
  },
  {
    id: "3",
    title: "Natural Language Processing for Regional Language Education",
    description: "Research project focused on NLP techniques for creating educational content in regional Indian languages. Funded by UGC grant.",
    postedBy: "Dr. Priya Nair",
    posterRole: "faculty",
    posterEmail: "faculty@edu.in",
    department: "Computer Science",
    tags: ["NLP", "Education", "Linguistics"],
    skills: ["Python", "NLP", "Deep Learning", "Hindi/Marathi"],
    lookingFor: "students",
    status: "in-progress",
    applicants: 12,
    createdAt: "2 weeks ago",
  },
  {
    id: "4",
    title: "Sustainable Energy Harvesting from Piezoelectric Materials",
    description: "Looking for interdisciplinary collaborators from Mechanical and Electrical Engineering to work on energy harvesting solutions using novel piezoelectric composites.",
    postedBy: "Dr. M. Kulkarni",
    posterRole: "faculty",
    posterEmail: "kulkarni@edu.in",
    department: "Mechanical Engineering",
    tags: ["Energy", "Materials Science", "Sustainability"],
    skills: ["MATLAB", "FEM Analysis", "Lab Work"],
    lookingFor: "both",
    status: "open",
    applicants: 5,
    createdAt: "1 week ago",
  },
  {
    id: "5",
    title: "Computer Vision for Traffic Flow Optimization",
    description: "Student-led research initiative on using computer vision to optimize traffic flow in urban areas. Looking for more team members with CV experience.",
    postedBy: "Aarav Sharma",
    posterRole: "student",
    posterEmail: "student@edu.in",
    department: "Computer Science",
    tags: ["Computer Vision", "Smart City", "AI"],
    skills: ["OpenCV", "Python", "YOLO", "Data Analysis"],
    lookingFor: "students",
    status: "open",
    applicants: 6,
    createdAt: "3 days ago",
  },
  {
    id: "6",
    title: "Quantum Computing Applications in Drug Discovery",
    description: "Interdisciplinary research combining quantum computing algorithms with pharmaceutical chemistry for accelerated drug discovery. Closed to new applications.",
    postedBy: "Dr. R. Desai",
    posterRole: "faculty",
    posterEmail: "desai@edu.in",
    department: "Physics",
    tags: ["Quantum Computing", "Pharma", "Chemistry"],
    skills: ["Qiskit", "Python", "Molecular Modeling"],
    lookingFor: "students",
    status: "closed",
    applicants: 15,
    createdAt: "1 month ago",
  },
]

const statusConfig: Record<CollabStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  open: { label: "Open", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  "in-progress": { label: "In Progress", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
  closed: { label: "Closed", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertCircle },
}

const lookingForConfig: Record<LookingFor, { label: string; icon: typeof Users }> = {
  students: { label: "Looking for Students", icon: GraduationCap },
  faculty: { label: "Looking for Faculty", icon: BookOpen },
  both: { label: "Looking for Students & Faculty", icon: Users },
}

/* ---------- Current user email by role ---------- */
function getUserEmail(role: UserRole): string {
  if (role === "student") return "student@edu.in"
  if (role === "faculty") return "faculty@edu.in"
  return "admin@edu.in"
}

/* ---------- New / Edit Request Form ---------- */
function RequestForm({
  onClose,
  userRole,
  existingRequest,
  onSave,
}: {
  onClose: () => void
  userRole: UserRole
  existingRequest?: CollabRequest | null
  onSave: (data: Partial<CollabRequest>) => void
}) {
  const [title, setTitle] = useState(existingRequest?.title ?? "")
  const [description, setDescription] = useState(existingRequest?.description ?? "")
  const [department, setDepartment] = useState(existingRequest?.department ?? "Computer Science")
  const [lookingFor, setLookingFor] = useState(existingRequest?.lookingFor ?? "both")
  const [skills, setSkills] = useState(existingRequest?.skills.join(", ") ?? "")
  const [tags, setTags] = useState(existingRequest?.tags.join(", ") ?? "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description,
      department,
      lookingFor: lookingFor as LookingFor,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
      <div className="glass-strong w-full max-w-lg rounded-2xl p-6 glow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-foreground">
            {existingRequest ? "Edit Research Request" : "Post New Research Request"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-secondary-foreground mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Research project title" required className="w-full h-10 px-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-foreground mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the research project, goals, and what you're looking for..." rows={4} required className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-1.5">Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>Computer Science</option>
                <option>Electrical Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Physics</option>
                <option>Mathematics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-1.5">Looking For</label>
              <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {userRole === "student" && <option value="faculty">Faculty Advisor</option>}
                {userRole === "student" && <option value="students">Student Collaborators</option>}
                {userRole === "faculty" && <option value="students">Students</option>}
                {userRole === "faculty" && <option value="faculty">Faculty Co-PI</option>}
                <option value="both">Both Students & Faculty</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-foreground mb-1.5">Skills Required (comma separated)</label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Python, Machine Learning, MATLAB" className="w-full h-10 px-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-foreground mb-1.5">Tags (comma separated)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. AI, IoT, Sustainability" className="w-full h-10 px-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl text-muted-foreground hover:text-foreground">Cancel</Button>
            <Button type="submit" className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="mr-2 h-4 w-4" />
              {existingRequest ? "Save Changes" : "Post Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---------- Delete Confirmation ---------- */
function DeleteConfirm({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
      <div className="glass-strong w-full max-w-sm rounded-2xl p-6 glow-sm">
        <h3 className="text-base font-semibold text-foreground mb-2">Delete Request</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Are you sure you want to delete &ldquo;{title}&rdquo;? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
          <Button onClick={onConfirm} className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Collab Card ---------- */
function CollabCard({
  request,
  userRole,
  isOwn,
  onEdit,
  onDelete,
}: {
  request: CollabRequest
  userRole: UserRole
  isOwn: boolean
  onEdit?: () => void
  onDelete?: () => void
}) {
  const status = statusConfig[request.status]
  const looking = lookingForConfig[request.lookingFor]
  const StatusIcon = status.icon
  const LookingIcon = looking.icon

  return (
    <div className="glass rounded-xl p-5 transition-all hover:border-primary/20">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground leading-snug">{request.title}</h4>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">{request.postedBy}</span>
            <Badge variant="outline" className="text-[10px] border-border bg-secondary/30 text-muted-foreground">
              {request.posterRole === "faculty" ? "Faculty" : "Student"}
            </Badge>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {request.department}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isOwn && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={onEdit} aria-label="Edit request">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onDelete} aria-label="Delete request">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Badge variant="outline" className={`${status.bg} ${status.color} text-[10px] flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </div>

      <p className="text-xs text-secondary-foreground leading-relaxed mb-3 line-clamp-2">{request.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {request.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {request.skills.map((skill) => (
          <span key={skill} className="rounded-md border border-border bg-secondary/20 px-2 py-0.5 text-[10px] text-muted-foreground">{skill}</span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><LookingIcon className="h-3 w-3" />{looking.label}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{request.applicants} applied</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{request.createdAt}</span>
        </div>
        {!isOwn && request.status === "open" && (
          <Button size="sm" className="h-7 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 text-xs px-3">
            {userRole === "faculty" && request.posterRole === "student" ? "Offer Mentorship" : request.posterRole === "faculty" ? "Apply" : "Collaborate"}
          </Button>
        )}
      </div>
    </div>
  )
}

/* ---------- Main Component ---------- */
export function ResearchCollab({ userRole }: { userRole: UserRole }) {
  const [requests, setRequests] = useState<CollabRequest[]>(INITIAL_REQUESTS)
  const [viewMode, setViewMode] = useState<ViewMode>("browse")
  const [showForm, setShowForm] = useState(false)
  const [editingRequest, setEditingRequest] = useState<CollabRequest | null>(null)
  const [deletingRequest, setDeletingRequest] = useState<CollabRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<CollabStatus | "all">("all")
  const [deptFilter, setDeptFilter] = useState<string>("all")

  const currentEmail = getUserEmail(userRole)
  const departments = [...new Set(requests.map((r) => r.department))]

  const myRequests = requests.filter((r) => r.posterEmail === currentEmail)
  const myOpenCount = myRequests.filter((r) => r.status === "open").length
  const myProgressCount = myRequests.filter((r) => r.status === "in-progress").length
  const myClosedCount = myRequests.filter((r) => r.status === "closed").length

  const browsableRequests = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    if (deptFilter !== "all" && r.department !== deptFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.skills.some((s) => s.toLowerCase().includes(q))
      )
    }
    return true
  })

  const handleCreateRequest = (data: Partial<CollabRequest>) => {
    const newReq: CollabRequest = {
      id: `req-${Date.now()}`,
      title: data.title || "Untitled",
      description: data.description || "",
      postedBy: userRole === "student" ? "Aarav Sharma" : userRole === "faculty" ? "Dr. Priya Nair" : "Rajesh Kumar",
      posterRole: userRole === "admin" ? "faculty" : userRole,
      posterEmail: currentEmail,
      department: data.department || "Computer Science",
      tags: data.tags || [],
      skills: data.skills || [],
      lookingFor: data.lookingFor || "both",
      status: "open",
      applicants: 0,
      createdAt: "Just now",
    }
    setRequests((prev) => [newReq, ...prev])
  }

  const handleEditRequest = (data: Partial<CollabRequest>) => {
    if (!editingRequest) return
    setRequests((prev) =>
      prev.map((r) =>
        r.id === editingRequest.id
          ? { ...r, ...data }
          : r
      )
    )
    setEditingRequest(null)
  }

  const handleDeleteRequest = () => {
    if (!deletingRequest) return
    setRequests((prev) => prev.filter((r) => r.id !== deletingRequest.id))
    setDeletingRequest(null)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            Research Collaboration
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {userRole === "student"
              ? "Browse opportunities and manage your research collaboration requests"
              : userRole === "faculty"
                ? "Post research opportunities, manage your requests, or find collaborators"
                : "Manage and oversee all research collaboration requests"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(userRole === "student" || userRole === "faculty") && (
            <Button onClick={() => setShowForm(true)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Post Request
            </Button>
          )}
        </div>
      </div>

      {/* View Toggle + My Requests Summary */}
      {(userRole === "student" || userRole === "faculty") && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/20 p-1">
            <button
              onClick={() => setViewMode("browse")}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                viewMode === "browse"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Eye className="mr-1.5 inline h-3.5 w-3.5" />
              Browse All
            </button>
            <button
              onClick={() => setViewMode("my-requests")}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                viewMode === "my-requests"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Pencil className="mr-1.5 inline h-3.5 w-3.5" />
              My Requests
              {myRequests.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px] font-bold">
                  {myRequests.length}
                </span>
              )}
            </button>
          </div>

          {viewMode === "my-requests" && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {myOpenCount} Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {myProgressCount} In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {myClosedCount} Closed
              </span>
            </div>
          )}
        </div>
      )}

      {/* Browse Mode: Search & Filters */}
      {viewMode === "browse" && (
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects, skills, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CollabStatus | "all")} className="h-10 rounded-xl border border-border bg-secondary/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="h-10 rounded-xl border border-border bg-secondary/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="all">All Departments</option>
              {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
        </div>
      )}

      {/* Browse All */}
      {viewMode === "browse" && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {browsableRequests.map((request) => (
              <CollabCard
                key={request.id}
                request={request}
                userRole={userRole}
                isOwn={request.posterEmail === currentEmail}
                onEdit={() => setEditingRequest(request)}
                onDelete={() => setDeletingRequest(request)}
              />
            ))}
          </div>
          {browsableRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Handshake className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No collaboration requests match your filters</p>
            </div>
          )}
        </>
      )}

      {/* My Requests View */}
      {viewMode === "my-requests" && (
        <>
          {myRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {myRequests.map((request) => (
                <CollabCard
                  key={request.id}
                  request={request}
                  userRole={userRole}
                  isOwn={true}
                  onEdit={() => setEditingRequest(request)}
                  onDelete={() => setDeletingRequest(request)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Handshake className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No requests posted yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1 mb-4">Post your first research collaboration request</p>
              <Button onClick={() => setShowForm(true)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Post Request
              </Button>
            </div>
          )}
        </>
      )}

      {/* New form modal */}
      {showForm && (
        <RequestForm
          onClose={() => setShowForm(false)}
          userRole={userRole}
          onSave={handleCreateRequest}
        />
      )}

      {/* Edit form modal */}
      {editingRequest && (
        <RequestForm
          onClose={() => setEditingRequest(null)}
          userRole={userRole}
          existingRequest={editingRequest}
          onSave={handleEditRequest}
        />
      )}

      {/* Delete confirmation */}
      {deletingRequest && (
        <DeleteConfirm
          title={deletingRequest.title}
          onConfirm={handleDeleteRequest}
          onCancel={() => setDeletingRequest(null)}
        />
      )}
    </section>
  )
}

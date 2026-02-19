"use client"

import { useState, useEffect, useCallback } from "react"
import { EduNexusLogo } from "./edunexus-logo"
import {
  Upload,
  FileText,
  BarChart3,
  AlertTriangle,
  Eye,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  Video,
  BrainCircuit,
  Send,
  BookOpen,
  X,
  Trash2,
  ExternalLink,
  FolderOpen,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "./auth-context"

/* ============================================================
   Supabase Material type (from faculty_materials table)
   ============================================================ */
interface SupabaseMaterial {
  id: string
  created_at: string
  faculty_email: string
  faculty_name: string | null
  subject: string
  type: string
  title: string
  description: string | null
  file_url: string | null
  external_url: string | null
  file_path: string | null
  tags: string[]
}

/* ============================================================
   Common Subject Suggestions
   ============================================================ */
const SUBJECT_SUGGESTIONS = [
  "Data Structures & Algorithms",
  "Operating Systems",
  "Database Management Systems",
  "Computer Networks",
  "Applied Mathematics III",
  "Engineering Physics",
  "Digital Logic Design",
  "Software Engineering",
  "Machine Learning",
  "Artificial Intelligence",
  "Web Development",
  "Discrete Mathematics",
]

/* ============================================================
   Tab 1: Add Material (LINK or VIDEO) - now hits Supabase
   ============================================================ */
function AddMaterialTab() {
  const { user } = useAuth()
  const [subject, setSubject] = useState("")
  const [customSubject, setCustomSubject] = useState("")
  const [type, setType] = useState<"LINK" | "VIDEO">("LINK")
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const resolvedSubject = subject === "__custom" ? customSubject : subject

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolvedSubject || !url || !title) return

    setIsLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("facultyEmail", user?.email || "anonymous@edunexus.com")
      formData.append("facultyName", user?.name || "Faculty")
      formData.append("subject", resolvedSubject)
      formData.append("type", type)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("externalUrl", url)
      formData.append("tags", tags)

      const res = await fetch("/api/faculty-upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }))
        throw new Error(err.error || `Server returned ${res.status}`)
      }

      setMessage({ type: "success", text: "Material added successfully!" })
      setTitle("")
      setUrl("")
      setDescription("")
      setTags("")
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to add material",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Subject
          </label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="bg-secondary/30 border-border/40">
              <SelectValue placeholder="Select or type a subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_SUGGESTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
              <SelectItem value="__custom">Other (type below)</SelectItem>
            </SelectContent>
          </Select>
          {subject === "__custom" && (
            <Input
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Type subject name..."
              className="mt-1.5 bg-secondary/30 border-border/40"
              required
            />
          )}
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Type
          </label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as "LINK" | "VIDEO")}
          >
            <SelectTrigger className="bg-secondary/30 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LINK">
                <span className="flex items-center gap-2">
                  <LinkIcon className="h-3 w-3" /> Link / Resource
                </span>
              </SelectItem>
              <SelectItem value="VIDEO">
                <span className="flex items-center gap-2">
                  <Video className="h-3 w-3" /> Video
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Introduction to Dynamic Programming"
          className="bg-secondary/30 border-border/40"
          required
        />
      </div>

      {/* URL */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {type === "LINK" ? "Resource URL" : "Video URL"}
        </label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={
            type === "LINK"
              ? "https://example.com/notes.pdf"
              : "https://youtube.com/watch?v=..."
          }
          className="bg-secondary/30 border-border/40"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the resource"
          className="bg-secondary/30 border-border/40"
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Tags (comma-separated)
        </label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. algorithms, graphs, BFS"
          className="bg-secondary/30 border-border/40"
        />
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            message.type === "success"
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !resolvedSubject || !url || !title}
        className="w-full gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
        {isLoading ? "Saving..." : "Add Material"}
      </Button>
    </form>
  )
}

/* ============================================================
   Tab 2: Upload PDF / Document Files to Supabase Storage
   ============================================================ */
function UploadPdfTab() {
  const { user } = useAuth()
  const [subject, setSubject] = useState("")
  const [customSubject, setCustomSubject] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [dragging, setDragging] = useState(false)

  const resolvedSubject = subject === "__custom" ? customSubject : subject

  const ACCEPTED_TYPES = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
  ]

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolvedSubject || !selectedFile || !title) return

    setIsLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("facultyEmail", user?.email || "anonymous@edunexus.com")
      formData.append("facultyName", user?.name || "Faculty")
      formData.append("subject", resolvedSubject)
      formData.append("type", "PDF")
      formData.append("title", title || selectedFile.name)
      formData.append("description", description || selectedFile.name)
      formData.append("tags", tags)
      formData.append("file", selectedFile)

      const res = await fetch("/api/faculty-upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }))
        throw new Error(err.error || `Server returned ${res.status}`)
      }

      setMessage({
        type: "success",
        text: `"${selectedFile.name}" uploaded successfully!`,
      })
      setSelectedFile(null)
      setTitle("")
      setDescription("")
      setTags("")
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Upload failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileDrop = (files: FileList) => {
    const file = files[0]
    if (file) setSelectedFile(file)
  }

  return (
    <form onSubmit={handleUpload} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Subject
          </label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="bg-secondary/30 border-border/40">
              <SelectValue placeholder="Select or type a subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_SUGGESTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
              <SelectItem value="__custom">Other (type below)</SelectItem>
            </SelectContent>
          </Select>
          {subject === "__custom" && (
            <Input
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Type subject name..."
              className="mt-1.5 bg-secondary/30 border-border/40"
              required
            />
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chapter 5: Sorting Algorithms"
            className="bg-secondary/30 border-border/40"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Covers merge sort, quick sort, heap sort"
          className="bg-secondary/30 border-border/40"
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Tags (comma-separated)
        </label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. sorting, algorithms, notes"
          className="bg-secondary/30 border-border/40"
        />
      </div>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length > 0)
            handleFileDrop(e.dataTransfer.files)
        }}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-secondary/20"
        }`}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="mt-1 flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-foreground">
              Drag & drop a file here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOC, DOCX, PPT, PPTX, TXT, PNG, JPG (max 50 MB)
            </p>
            <label className="mt-3 cursor-pointer">
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSelectedFile(e.target.files[0])
                }}
              />
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                <Upload className="h-3 w-3" />
                Browse Files
              </span>
            </label>
          </>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            message.type === "success"
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !resolvedSubject || !selectedFile || !title}
        className="w-full gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isLoading ? "Uploading..." : "Upload File"}
      </Button>

      {/* Storage info */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <EduNexusLogo size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-foreground">
            Supabase Storage
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Files are uploaded to Supabase Storage and indexed in the database.
            Students can discover these materials through Smart Search alongside
            n8n workflow results.
          </p>
        </div>
      </div>
    </form>
  )
}

/* ============================================================
   Tab 3: Ask the AI (still uses n8n workflow)
   ============================================================ */
function AskAiTab() {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setAnswer(null)
    setError("")

    try {
      const res = await fetch("/api/n8n-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question.trim() }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `Server returned ${res.status}`)
      }

      const data = await res.json()
      setAnswer(data.output || data.message || JSON.stringify(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleAsk} className="space-y-4">
        {/* Question */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Your Question
          </label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Explain the concept of dynamic programming with examples..."
            className="min-h-[120px] bg-secondary/30 border-border/40 resize-none"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="w-full gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isLoading ? "Processing..." : "Ask AI"}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* AI Answer */}
      {answer && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <EduNexusLogo size={18} />
            <h4 className="text-sm font-semibold text-foreground">
              AI Response
            </h4>
          </div>
          <div className="text-sm leading-relaxed text-secondary-foreground whitespace-pre-wrap">
            {answer}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   Tab 4: Manage Uploads (view & delete existing materials)
   ============================================================ */
function ManageUploadsTab() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<SupabaseMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterSubject, setFilterSubject] = useState("")

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterSubject) params.set("subject", filterSubject)
      params.set("limit", "100")

      const res = await fetch(`/api/faculty-materials?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch materials")
      const data = await res.json()
      setMaterials(data.materials || [])
    } catch {
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }, [filterSubject])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  const handleDelete = async (mat: SupabaseMaterial) => {
    if (!confirm(`Delete "${mat.title}"? This cannot be undone.`)) return

    setDeleting(mat.id)
    try {
      const res = await fetch("/api/faculty-materials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mat.id, filePath: mat.file_path }),
      })

      if (!res.ok) throw new Error("Delete failed")
      setMaterials((prev) => prev.filter((m) => m.id !== mat.id))
    } catch {
      alert("Failed to delete material. Please try again.")
    } finally {
      setDeleting(null)
    }
  }

  // Derive unique subjects from loaded materials
  const uniqueSubjects = Array.from(
    new Set(materials.map((m) => m.subject))
  ).sort()

  return (
    <div className="space-y-4">
      {/* Filter by subject */}
      <div className="flex items-center gap-3">
        <Input
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          placeholder="Filter by subject..."
          className="flex-1 bg-secondary/30 border-border/40 text-xs h-9"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMaterials}
          className="shrink-0 h-9 text-xs"
        >
          Refresh
        </Button>
      </div>

      {/* Subject filter chips */}
      {uniqueSubjects.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterSubject("")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
              !filterSubject
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50"
            }`}
          >
            All
          </button>
          {uniqueSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setFilterSubject(sub)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filterSubject === sub
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Materials list */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3"
            >
              <div className="h-8 w-8 rounded-lg animate-pulse bg-secondary/50" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary/50" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-secondary/50" />
              </div>
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            No materials uploaded yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Use the other tabs to add links, videos, or upload files
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
          {materials.map((mat) => {
            const typeIcon =
              mat.type === "VIDEO"
                ? Video
                : mat.type === "LINK"
                  ? LinkIcon
                  : FileText
            const TypeIcon = typeIcon
            const isOwnMaterial = mat.faculty_email === user?.email

            return (
              <div
                key={mat.id}
                className="group flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3 hover:border-primary/20 transition-all"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <TypeIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {mat.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {mat.subject} &middot; {mat.type}
                    {mat.faculty_name ? ` &middot; ${mat.faculty_name}` : ""}
                  </p>
                  {mat.description && (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5 line-clamp-1">
                      {mat.description}
                    </p>
                  )}
                  {mat.tags && mat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {mat.tags.slice(0, 4).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 border-border/40"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {(mat.file_url || mat.external_url) && (
                    <a
                      href={mat.file_url || mat.external_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      title="Open"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {isOwnMaterial && (
                    <button
                      onClick={() => handleDelete(mat)}
                      disabled={deleting === mat.id}
                      className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === mat.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/60">
        {materials.length} material{materials.length !== 1 ? "s" : ""} total
      </p>
    </div>
  )
}

/* ============================================================
   Engagement Insights (sidebar panel)
   ============================================================ */
function EngagementInsights() {
  const insights = [
    {
      icon: AlertTriangle,
      title: "Concept Difficulty Spike",
      description: "Laplace inverse using partial fractions",
      metric: "72% struggle rate",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      icon: Eye,
      title: "High Rewatch Segments",
      description: "Lecture 14, 14:20 - 18:45",
      metric: "3.4x avg rewatches",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: TrendingUp,
      title: "High Interaction",
      description: "Problem Set 4, Q7-Q12",
      metric: "156 discussions",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Engagement Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-4"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${insight.bgColor}`}
            >
              <insight.icon className={`h-4 w-4 ${insight.color}`} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">
                {insight.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {insight.description}
              </p>
              <span className="mt-1 inline-block text-xs font-medium text-foreground">
                {insight.metric}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   AI Recommendations (sidebar panel)
   ============================================================ */
function AIRecommendations() {
  const suggestions = [
    "Create supplementary examples for partial fraction decomposition",
    "Add a visual diagram for the relationship between time and frequency domains",
    "Record a short recap video for inverse Laplace techniques",
    "Link related content from Signal Processing syllabus",
  ]

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Lightbulb className="h-4 w-4 text-accent" />
        AI Recommendations
      </h3>
      <div className="space-y-2.5">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-secondary-foreground">
              {s}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   Faculty Mode Root - 4 Tabbed Dashboard
   ============================================================ */
type TabId = "material" | "upload" | "ai" | "manage"

export function FacultyMode() {
  const [activeTab, setActiveTab] = useState<TabId>("upload")

  const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
    { id: "upload", label: "Upload File", icon: Upload },
    { id: "material", label: "Add Link/Video", icon: LinkIcon },
    { id: "manage", label: "My Uploads", icon: FolderOpen },
    { id: "ai", label: "Ask AI", icon: BrainCircuit },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15">
          <BarChart3 className="h-4.5 w-4.5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Faculty Studio
          </h2>
          <p className="text-xs text-muted-foreground">
            Upload resources, manage content, and interact with the AI
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main content - 3 columns */}
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-6">
            {/* Tab bar */}
            <div className="flex gap-1 rounded-xl bg-secondary/30 p-1 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "material" && <AddMaterialTab />}
            {activeTab === "upload" && <UploadPdfTab />}
            {activeTab === "ai" && <AskAiTab />}
            {activeTab === "manage" && <ManageUploadsTab />}
          </div>
        </div>

        {/* Sidebar insights - 2 columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <EngagementInsights />
          <AIRecommendations />
        </div>
      </div>
    </section>
  )
}

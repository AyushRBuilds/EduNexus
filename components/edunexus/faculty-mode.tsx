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

/**
 * All API calls go through /api/proxy which forwards server-side
 * to the real backend (https://edunexus-backend-nv75.onrender.com).
 * This avoids CORS issues entirely.
 */
const API = "/api/proxy"

interface SubjectData {
  id: number
  name: string
  semester: number
}

/* ============================================================
   Tab 1: Add Standard Material (LINK or VIDEO)
   ============================================================ */
function SubjectsUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-amber-400">
          Could not load subjects
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          The backend may be cold-starting. This usually takes 20-30 seconds.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 h-7 text-[11px] border-amber-500/20 text-amber-400 hover:bg-amber-500/10 gap-1.5"
        onClick={onRetry}
      >
        <Loader2 className="h-3 w-3" />
        Retry
      </Button>
    </div>
  )
}

function AddMaterialTab({
  subjects,
  subjectsLoading,
  onRetry,
}: {
  subjects: SubjectData[]
  subjectsLoading: boolean
  onRetry: () => void
}) {
  const [subjectId, setSubjectId] = useState("")
  const [type, setType] = useState<"LINK" | "VIDEO">("LINK")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectId || !url) return

    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`${API}/admin/material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: Number(subjectId),
          type,
          filePath: url,
          description,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `Server returned ${res.status}`)
      }

      setMessage({ type: "success", text: "Material added successfully!" })
      setUrl("")
      setDescription("")
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
          {subjectsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading subjects (backend may need ~30s to wake up)...
            </div>
          ) : subjects.length > 0 ? (
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="bg-secondary/30 border-border/40">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} (Sem {s.semester})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <SubjectsUnavailable onRetry={onRetry} />
          )
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
                  <LinkIcon className="h-3 w-3" /> Link
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

      {/* URL */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {type === "LINK" ? "File Path / URL" : "Video URL"}
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
        disabled={isLoading || !subjectId || !url}
        className="w-full gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
        {isLoading ? "Processing..." : "Add Material"}
      </Button>
    </form>
  )
}

/* ============================================================
   Tab 2: Upload PDF Notes
   ============================================================ */
function UploadPdfTab({
  subjects,
  subjectsLoading,
  onRetry,
}: {
  subjects: SubjectData[]
  subjectsLoading: boolean
  onRetry: () => void
}) {
  const [subjectId, setSubjectId] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectId || !selectedFile) return

    setIsLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("subjectId", subjectId)
      formData.append("type", "PDF")
      formData.append("description", description || selectedFile.name)
      formData.append("file", selectedFile)

      // CRITICAL: Do NOT set Content-Type header. The browser must set it
      // automatically with the correct multipart boundary.
      const res = await fetch(`${API}/admin/upload`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `Server returned ${res.status}`)
      }

      setMessage({
        type: "success",
        text: `"${selectedFile.name}" uploaded and indexed successfully!`,
      })
      setSelectedFile(null)
      setDescription("")
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
    const pdf = Array.from(files).find((f) => f.name.endsWith(".pdf"))
    if (pdf) setSelectedFile(pdf)
  }

  return (
    <form onSubmit={handleUpload} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Subject
          </label>
          {subjectsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading subjects (backend may need ~30s to wake up)...
            </div>
          ) : subjects.length > 0 ? (
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="bg-secondary/30 border-border/40">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} (Sem {s.semester})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <SubjectsUnavailable onRetry={onRetry} />
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Description
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Chapter 1: Arrays"
            className="bg-secondary/30 border-border/40"
          />
        </div>
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
              Drag & drop a PDF here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse
            </p>
            <label className="mt-3 cursor-pointer">
              <input
                type="file"
                accept=".pdf"
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
        disabled={isLoading || !subjectId || !selectedFile}
        className="w-full gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isLoading ? "Processing..." : "Upload & Index PDF"}
      </Button>

      {/* AI index info */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <EduNexusLogo size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-foreground">
            AI Auto-Index
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            PDFs are parsed via PDFBox, text is extracted and indexed for
            semantic search. Students can then ask the AI questions grounded
            in your uploaded content.
          </p>
        </div>
      </div>
    </form>
  )
}

/* ============================================================
   Tab 3: Ask the AI
   ============================================================ */
function AskAiTab({
  subjects,
  subjectsLoading,
  onRetry,
}: {
  subjects: SubjectData[]
  subjectsLoading: boolean
  onRetry: () => void
}) {
  const [subjectId, setSubjectId] = useState("")
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState("")

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectId || !question.trim()) return

    setIsLoading(true)
    setAnswer(null)
    setError("")

    try {
      const res = await fetch(`${API}/ai/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: Number(subjectId),
          question: question.trim(),
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `Server returned ${res.status}`)
      }

      const data = await res.json()
      setAnswer(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleAsk} className="space-y-4">
        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Subject Context
          </label>
          {subjectsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading subjects (backend may need ~30s to wake up)...
            </div>
          ) : subjects.length > 0 ? (
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="bg-secondary/30 border-border/40">
                <SelectValue placeholder="Select subject for context" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} (Sem {s.semester})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <SubjectsUnavailable onRetry={onRetry} />
          )}
        </div>

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
          disabled={isLoading || !subjectId || !question.trim()}
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
            {answer.answer || answer.message || JSON.stringify(answer, null, 2)}
          </div>
          {answer.scholarLink && (
            <a
              href={answer.scholarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <BookOpen className="h-3 w-3" />
              View on Google Scholar
            </a>
          )}
        </div>
      )}
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
   Faculty Mode Root - 3 Tabbed Dashboard
   ============================================================ */
type TabId = "material" | "upload" | "ai"

export function FacultyMode() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>("material")
  const [subjects, setSubjects] = useState<SubjectData[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [subjectsError, setSubjectsError] = useState(false)

  // Load subjects from backend with automatic retry for cold starts
  const fetchSubjects = useCallback(async () => {
    if (!user?.email) {
      setSubjectsLoading(false)
      return
    }
    setSubjectsLoading(true)
    setSubjectsError(false)

    const MAX_RETRIES = 3
    const RETRY_DELAY = 4000 // 4 seconds between retries for cold-start

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(
          `${API}/academic/subjects?email=${encodeURIComponent(user.email)}`
        )
        if (!res.ok) throw new Error("Backend error")
        const data = await res.json()
        setSubjects(data)
        setSubjectsError(false)
        setSubjectsLoading(false)
        return
      } catch {
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY))
        }
      }
    }

    // All retries failed
    setSubjectsError(true)
    setSubjectsLoading(false)
  }, [user?.email])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
    { id: "material", label: "Add Material", icon: LinkIcon },
    { id: "upload", label: "Upload PDF", icon: Upload },
    { id: "ai", label: "Ask the AI", icon: BrainCircuit },
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
            Manage content, upload resources, and interact with the AI
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
            {activeTab === "material" && (
              <AddMaterialTab
                subjects={subjects}
                subjectsLoading={subjectsLoading}
                onRetry={fetchSubjects}
              />
            )}
            {activeTab === "upload" && (
              <UploadPdfTab
                subjects={subjects}
                subjectsLoading={subjectsLoading}
                onRetry={fetchSubjects}
              />
            )}
            {activeTab === "ai" && (
              <AskAiTab
                subjects={subjects}
                subjectsLoading={subjectsLoading}
                onRetry={fetchSubjects}
              />
            )}
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

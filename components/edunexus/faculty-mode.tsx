"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "./auth-context"
import { getSubjects, uploadMaterial, addMaterial } from "@/lib/api/academic.service"
import type { BackendSubject, BackendMaterial } from "@/lib/api/types"

/* ----- Upload Panel ----- */
function UploadPanel() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<BackendSubject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<{ name: string; status: "uploading" | "indexed" | "error"; error?: string }[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(true)

  // Load subjects from backend
  useEffect(() => {
    if (!user?.email) {
      setSubjectsLoading(false)
      return
    }
    setSubjectsLoading(true)
    getSubjects(user.email)
      .then((data) => {
        setSubjects(data)
        if (data.length > 0) {
          setSelectedSubjectId(String(data[0].id))
        }
      })
      .catch(() => {
        // Backend unavailable
      })
      .finally(() => setSubjectsLoading(false))
  }, [user?.email])

  const handleFileUpload = async (fileList: FileList | File[]) => {
    const subjectId = Number(selectedSubjectId)
    if (!subjectId) return

    const newFiles = Array.from(fileList)
    for (const file of newFiles) {
      const fileName = file.name
      setFiles((prev) => [...prev, { name: fileName, status: "uploading" }])
      setUploading(true)

      try {
        await uploadMaterial(subjectId, "PDF", file, description || undefined)
        setFiles((prev) =>
          prev.map((f) => (f.name === fileName ? { ...f, status: "indexed" } : f))
        )
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === fileName
              ? { ...f, status: "error", error: err instanceof Error ? err.message : "Upload failed" }
              : f
          )
        )
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Content Upload & Indexing
      </h3>

      {/* Subject selector */}
      <div className="mb-4 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Target Subject</label>
          {subjectsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading subjects...
            </div>
          ) : subjects.length > 0 ? (
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="bg-secondary/30 border-border/40">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} ({s.department}, Sem {s.semester})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-xs text-amber-400 py-2">
              No subjects available. Backend may be offline.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Chapter 1: Arrays and Linked Lists"
            className="bg-secondary/30 border-border/40"
          />
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files)
          }
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-secondary/20"
        }`}
      >
        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-foreground">
          Drag & drop files here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDFs, Slides, Videos, Documents
        </p>
        <label className="mt-3 cursor-pointer">
          <input
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files)
              }
            }}
          />
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
            <Upload className="h-3 w-3" />
            Browse Files
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span className="flex-1 truncate text-sm text-foreground">
                {f.name}
              </span>
              {f.status === "uploading" && (
                <Badge
                  variant="outline"
                  className="border-sky-500/30 bg-sky-500/10 text-sky-400 text-[10px] gap-1"
                >
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  Uploading
                </Badge>
              )}
              {f.status === "indexed" && (
                <Badge
                  variant="outline"
                  className="border-green-500/30 bg-green-500/10 text-green-400 text-[10px]"
                >
                  Indexed
                </Badge>
              )}
              {f.status === "error" && (
                <Badge
                  variant="outline"
                  className="border-red-500/30 bg-red-500/10 text-red-400 text-[10px]"
                  title={f.error}
                >
                  Error
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Preview */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <EduNexusLogo size={16} className="mt-0.5" />
        <div>
          <p className="text-xs font-medium text-foreground">
            AI Auto-Index Preview
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Uploaded PDFs will be automatically parsed (text extracted via PDFBox), 
            and indexed for semantic search. The AI can then answer questions based 
            on the uploaded content.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ----- Engagement Insights ----- */
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

/* ----- AI Recommendations ----- */
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

/* ----- Faculty Mode Root ----- */
export function FacultyMode() {
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
            Manage content, view analytics, and get AI recommendations
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UploadPanel />
        <div className="flex flex-col gap-6">
          <EngagementInsights />
          <AIRecommendations />
        </div>
      </div>
    </section>
  )
}

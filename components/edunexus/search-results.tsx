"use client"

import { useState, useEffect, useCallback } from "react"
import { EduNexusLogo } from "./edunexus-logo"
import {
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Video,
  Presentation,
  Filter,
  Loader2,
  Sparkles,
  Bot,
  Zap,
  AlertTriangle,
  FolderOpen,
  GraduationCap,
  CheckCircle2,
  Upload,
  Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-context"
import { getSubjects, getMaterials } from "@/lib/api/academic.service"
import { aiExplain, n8nChat } from "@/lib/api/ai.service"
import { queryGeminiWithDocuments } from "@/lib/api/gemini.service"
import { downloadMaterial, downloadAllMaterials } from "@/lib/api/download"
import { MaterialViewer } from "./material-viewer"
import { FormattedMarkdown } from "./formatted-markdown"
import type { BackendMaterial, BackendSubject, SupabaseMaterial } from "@/lib/api/types"

/* ---------- Filter types ---------- */
export type ContentFilter = "all" | "research" | "ppt" | "video" | "notes"

const FILTERS: { id: ContentFilter; label: string; icon: typeof FileText }[] = [
  { id: "all", label: "All", icon: Filter },
  { id: "research", label: "Research Papers", icon: FileText },
  { id: "ppt", label: "PPT", icon: Presentation },
  { id: "video", label: "Video Lectures", icon: Video },
  { id: "notes", label: "Notes", icon: BookOpen },
]

/* ---------- Relevance scorer ---------- */
function scoreRelevance(material: BackendMaterial, query: string): number {
  const q = query.toLowerCase()
  const tokens = q.split(/\s+/).filter(Boolean)
  let score = 0

  const desc = (material.description || "").toLowerCase()
  const content = (material.content || "").toLowerCase()
  const subject = (material.subject?.name || "").toLowerCase()
  const filePath = (material.filePath || "").toLowerCase()

  // Full query match (highest weight)
  if (desc.includes(q)) score += 40
  if (content.includes(q)) score += 30
  if (subject.includes(q)) score += 25
  if (filePath.includes(q)) score += 15

  // Per-token matching
  for (const token of tokens) {
    if (token.length < 2) continue
    if (desc.includes(token)) score += 12
    if (content.includes(token)) score += 8
    if (subject.includes(token)) score += 6
    if (filePath.includes(token)) score += 4
  }

  // Normalize to 0-100
  return Math.min(100, Math.max(0, score))
}

/* ---------- Relevance scorer for Supabase materials ---------- */
function scoreSupabaseMaterial(mat: SupabaseMaterial, query: string): number {
  const q = query.toLowerCase()
  const tokens = q.split(/\s+/).filter(Boolean)
  let score = 0

  const title = (mat.title || "").toLowerCase()
  const desc = (mat.description || "").toLowerCase()
  const subject = (mat.subject || "").toLowerCase()
  const tagsStr = (mat.tags || []).join(" ").toLowerCase()

  if (title.includes(q)) score += 45
  if (desc.includes(q)) score += 35
  if (subject.includes(q)) score += 30
  if (tagsStr.includes(q)) score += 20

  for (const token of tokens) {
    if (token.length < 2) continue
    if (title.includes(token)) score += 14
    if (desc.includes(token)) score += 10
    if (subject.includes(token)) score += 8
    if (tagsStr.includes(token)) score += 6
  }

  return Math.min(100, Math.max(0, score))
}

/* ---------- Map Supabase type to filter type ---------- */
function mapSupabaseTypeToFilter(type: string): ContentFilter {
  switch (type) {
    case "PDF":
      return "notes"
    case "VIDEO":
      return "video"
    case "LINK":
      return "research"
    default:
      return "notes"
  }
}

/* ---------- Map backend type to filter type ---------- */
function mapTypeToFilter(type: string): ContentFilter {
  switch (type) {
    case "PDF":
      return "notes"
    case "VIDEO":
      return "video"
    case "LINK":
      return "research"
    default:
      return "notes"
  }
}

function mapTypeLabel(type: string): string {
  switch (type) {
    case "PDF":
      return "Notes / PDF"
    case "VIDEO":
      return "Video Lecture"
    case "LINK":
      return "Research / Link"
    default:
      return "Document"
  }
}

/* ---------- Unified result item ---------- */
interface ResultItem {
  title: string
  type: ContentFilter
  typeLabel: string
  subject: string
  author: string
  meta: string
  match: number
  detail: string
  backendMaterial?: BackendMaterial // present when from backend
  supabaseMaterial?: SupabaseMaterial // present when from Supabase faculty uploads
  isStatic?: boolean
}

/* ---------- Fallback static results ---------- */
const STATIC_RESULTS: ResultItem[] = [
  {
    title: "Laplace Transform: Theory and Applications in Engineering",
    type: "research",
    typeLabel: "Research Paper",
    subject: "Applied Mathematics III",
    author: "Prof. R. Sharma",
    meta: "2.4 MB",
    match: 62,
    detail: "Cited 45 times",
    isStatic: true,
  },
  {
    title: "Introduction to Laplace Transform & Properties",
    type: "video",
    typeLabel: "Video Lecture",
    subject: "Applied Mathematics III",
    author: "Prof. R. Sharma",
    meta: "45 min",
    match: 58,
    detail: "Relevant at 14:32",
    isStatic: true,
  },
  {
    title: "Integral Transforms - Lecture Slides (Week 7)",
    type: "ppt",
    typeLabel: "Presentation",
    subject: "Applied Mathematics III",
    author: "Prof. R. Sharma",
    meta: "5.2 MB",
    match: 55,
    detail: "42 slides",
    isStatic: true,
  },
  {
    title: "Study Material: Unit 4 - Integral Transforms",
    type: "notes",
    typeLabel: "Notes",
    subject: "Department Notes",
    author: "Dept. of Mathematics",
    meta: "3.1 MB",
    match: 50,
    detail: "Pages 142-158",
    isStatic: true,
  },
  {
    title: "GATE Preparation: Laplace Transform Problem Set",
    type: "notes",
    typeLabel: "Notes",
    subject: "Exam Prep",
    author: "Academic Cell",
    meta: "850 KB",
    match: 45,
    detail: "50 problems",
    isStatic: true,
  },
]

/* ---------- Type style map ---------- */
const typeIconMap: Record<ContentFilter, typeof FileText> = {
  all: Filter,
  research: FileText,
  ppt: Presentation,
  video: Video,
  notes: BookOpen,
}

const typeColorMap: Record<ContentFilter, { text: string; bg: string; border: string }> = {
  all: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  research: { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  ppt: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  video: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  notes: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
}

/* ---------- AI Synthesis Card ---------- */
function AISynthesisCard({
  query,
  materials,
  subjects,
  bestSubject,
  materialsLoading,
  supabaseMaterials,
}: {
  query: string
  materials: BackendMaterial[]
  subjects: BackendSubject[]
  bestSubject: BackendSubject | null
  materialsLoading: boolean
  supabaseMaterials: SupabaseMaterial[]
}) {
  const [expanded, setExpanded] = useState(false)
  const [viewerMaterial, setViewerMaterial] = useState<BackendMaterial | null>(null)

  // Gemini AI response with document sources
  const [geminiAnswer, setGeminiAnswer] = useState<string | null>(null)
  const [geminiLoading, setGeminiLoading] = useState(false)
  const [geminiError, setGeminiError] = useState(false)
  const [geminiSources, setGeminiSources] = useState<string[]>([])

  // n8n is the PRIMARY AI source for search & explain
  const [n8nAnswer, setN8nAnswer] = useState<string | null>(null)
  const [n8nLoading, setN8nLoading] = useState(false)
  const [n8nError, setN8nError] = useState(false)

  // Fallback: old backend AI explain (used only when n8n fails)
  const [fallbackAnswer, setFallbackAnswer] = useState<string | null>(null)
  const [fallbackLoading, setFallbackLoading] = useState(false)
  const [fallbackError, setFallbackError] = useState(false)
  const [scholarLink, setScholarLink] = useState<string | null>(null)

  // Compute repository source counts
  const repoSupabaseDocs = (supabaseMaterials || []).filter((m) => scoreSupabaseMaterial(m, query) > 20)
  const repoBackendDocs = (materials || []).filter((m) => scoreRelevance(m, query) > 20)
  const totalRepoSources = repoSupabaseDocs.length + repoBackendDocs.length
  const hasRepoSources = totalRepoSources > 0

  // 1. Call Gemini with document context (primary) whenever query changes
  useEffect(() => {
    if (!query) return

    // Build document context from faculty uploads (Supabase)
    const supabaseDocs = (supabaseMaterials || [])
      .filter((m) => scoreSupabaseMaterial(m, query) > 20)
      .slice(0, 5)
      .map((m) => ({
        title: m.title,
        content: [m.description, m.subject, (m.tags || []).join(", ")].filter(Boolean).join(" — "),
        source: m.file_url || m.external_url || m.title,
      }))

    // Build document context from backend materials
    const backendDocs = (materials || [])
      .filter((m) => scoreRelevance(m, query) > 20)
      .slice(0, 5)
      .map((m) => ({
        title: m.description || m.filePath || "Untitled",
        content: [m.content, m.description, m.subject?.name].filter(Boolean).join(" — "),
        source: m.filePath || m.description || m.subject?.name || "College Repository",
      }))

    // Merge both sources — Supabase first (faculty uploads), then backend
    const relevantDocs = [...supabaseDocs, ...backendDocs].slice(0, 8)

    // If no repo sources, skip Gemini call — show 'no sources' state
    if (relevantDocs.length === 0) {
      setGeminiLoading(false)
      setGeminiError(false)
      setGeminiAnswer(null)
      setGeminiSources([])
      return
    }

    setGeminiLoading(true)
    setGeminiError(false)
    setGeminiAnswer(null)
    setGeminiSources([])

    queryGeminiWithDocuments(query, relevantDocs)
      .then((res) => {
        if (res.error || !res.answer) {
          setGeminiError(true)
        } else {
          setGeminiAnswer(res.answer)
          setGeminiSources(res.sources)
        }
      })
      .catch(() => {
        setGeminiError(true)
      })
      .finally(() => setGeminiLoading(false))
  }, [query, supabaseMaterials, materials])

  // 2. Call n8n workflow as fallback
  useEffect(() => {
    if (!query) return
    if (!geminiError) return // Only call if Gemini failed

    setN8nLoading(true)
    setN8nError(false)
    setN8nAnswer(null)

    n8nChat(query)
      .then((res) => {
        if (res.error || !res.output) {
          setN8nError(true)
        } else {
          setN8nAnswer(res.output)
        }
      })
      .catch(() => {
        setN8nError(true)
      })
      .finally(() => setN8nLoading(false))
  }, [query, geminiError])

  // 3. Call backend /ai/explain as fallback when n8n fails
  useEffect(() => {
    // Only call fallback if n8n has finished and failed
    if (n8nLoading || !n8nError) return
    if (!bestSubject || !query) return

    setFallbackLoading(true)
    setFallbackError(false)
    setFallbackAnswer(null)
    setScholarLink(null)

    aiExplain(query, bestSubject.id)
      .then((res) => {
        if (res.error) {
          setFallbackError(true)
        } else {
          setFallbackAnswer(res.answer || res.message || null)
          setScholarLink(res.scholarLink || null)
        }
      })
      .catch(() => setFallbackError(true))
      .finally(() => setFallbackLoading(false))
  }, [query, bestSubject, n8nLoading, n8nError])

  // Derived: the best available answer (prioritizes Gemini)
  const aiAnswer = geminiAnswer || n8nAnswer || fallbackAnswer
  const aiLoading = geminiLoading || (geminiError && n8nLoading) || (geminiError && n8nError && fallbackLoading)
  const aiError = geminiError && n8nError && fallbackError
  const answerSource = geminiAnswer ? "Gemini AI" : n8nAnswer ? "n8n Workflow" : fallbackAnswer ? "Backend AI" : null

  // Derive related subjects from matched materials
  const relatedSubjects = Array.from(
    new Set(materials.map((m) => m.subject?.name).filter(Boolean))
  ).slice(0, 6)

  // Top materials for the repository section
  const topMaterials = materials.slice(0, 5)

  return (
    <div className="glass rounded-2xl p-6 glow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <EduNexusLogo size={28} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              AI Knowledge Synthesis
            </h2>
            <p className="text-xs text-muted-foreground">
              Searching your college repository for relevant materials
            </p>
          </div>
        </div>
      </div>

      {/* Repository source status banner */}
      {!materialsLoading && (
        <div className={`mb-4 rounded-xl border px-4 py-3 flex items-center gap-3 ${hasRepoSources
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-amber-500/30 bg-amber-500/5"
          }`}>
          {hasRepoSources ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  Found {totalRepoSources} source{totalRepoSources !== 1 ? "s" : ""} in College Repository
                </p>
                <p className="text-[11px] text-emerald-400/70">
                  {repoSupabaseDocs.length > 0 && `${repoSupabaseDocs.length} faculty upload${repoSupabaseDocs.length !== 1 ? "s" : ""}`}
                  {repoSupabaseDocs.length > 0 && repoBackendDocs.length > 0 && " · "}
                  {repoBackendDocs.length > 0 && `${repoBackendDocs.length} backend material${repoBackendDocs.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-300">
                  No sources found in College Repository
                </p>
                <p className="text-[11px] text-amber-400/70">
                  No faculty-uploaded materials match &ldquo;{query}&rdquo; — ask faculty to upload resources via Faculty Studio
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* AI-generated explanation */}
      <div className="space-y-4 text-sm leading-relaxed text-secondary-foreground">
        {(aiLoading || materialsLoading) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              <span className="text-xs">
                AI is analyzing your query across the college repository...
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-secondary/50" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-secondary/50" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-secondary/50" />
            </div>
          </div>
        )}

        {/* NO SOURCES state — clear message for demo */}
        {!aiLoading && !materialsLoading && !hasRepoSources && (
          <div className="text-center py-4">
            <FolderOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              No materials available for AI synthesis
            </h3>
            <p className="text-xs text-muted-foreground/70 max-w-sm mx-auto">
              The college repository doesn&rsquo;t have any documents on &ldquo;{query}&rdquo; yet.
              Faculty can upload study materials, notes, and links via <span className="text-primary font-medium">Faculty Studio</span> to make them available here.
            </p>
          </div>
        )}

        {/* HAS SOURCES + AI answer */}
        {!aiLoading && !materialsLoading && hasRepoSources && aiAnswer && (
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  AI Overview — Based on College Repository
                </h3>
                {answerSource && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <Zap className="h-2.5 w-2.5" />
                    {answerSource}
                  </span>
                )}
              </div>
              <FormattedMarkdown text={aiAnswer} />
            </div>

            {/* Show source documents when Gemini is used */}
            {geminiAnswer && geminiSources.length > 0 && (
              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Sources from College Repository
                </h4>
                <div className="space-y-2">
                  {geminiSources.map((source, idx) => {
                    const material = supabaseMaterials.find(
                      (m) => m.file_url === source || m.external_url === source || m.title === source
                    )
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {material?.title || source}
                          </p>
                          {material && (
                            <p className="text-[11px] text-muted-foreground">
                              Uploaded by {material.faculty_name || "Faculty"} • {material.subject}
                            </p>
                          )}
                        </div>
                        {material?.file_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="shrink-0 h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => window.open(material.file_url!, "_blank", "noopener,noreferrer")}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Show matched Supabase materials as sources even if Gemini didn't cite them */}
            {repoSupabaseDocs.length > 0 && (
              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Upload className="h-3 w-3" />
                  Faculty Uploaded Materials
                </h4>
                <div className="space-y-2">
                  {repoSupabaseDocs.slice(0, 5).map((mat) => (
                    <div
                      key={mat.id}
                      className="group flex items-start gap-2 rounded-lg border border-border bg-secondary/20 p-2.5 hover:border-emerald-500/20 transition-all cursor-pointer"
                      onClick={() => {
                        const url = mat.file_url || mat.external_url
                        if (url) window.open(url, "_blank", "noopener,noreferrer")
                      }}
                    >
                      <GraduationCap className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {mat.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {mat.faculty_name || "Faculty"} • {mat.subject} • {mat.type}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px]">
                        Faculty Upload
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HAS SOURCES but Gemini is loading */}
        {!aiLoading && !materialsLoading && hasRepoSources && !aiAnswer && !aiError && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            <span className="text-xs">Preparing AI overview from repository sources...</span>
          </div>
        )}

        {!aiLoading && !materialsLoading && hasRepoSources && aiError && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              AI Overview
            </h3>
            <p className="text-muted-foreground italic">
              AI synthesis is temporarily unavailable. Repository sources are listed above.
            </p>
          </div>
        )}

        {expanded && (
          <>
            {/* Related Subjects */}
            {relatedSubjects.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Related Subjects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relatedSubjects.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="border-border bg-secondary/40 text-secondary-foreground"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Scholar link */}
            {scholarLink && (
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Further Reading
                </h3>
                <a
                  href={scholarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary/80 hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="text-xs">Google Scholar Results</span>
                </a>
              </div>
            )}

            {/* Citations from backend materials */}
            {topMaterials.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Backend Sources
                </h3>
                <div className="flex flex-col gap-1.5">
                  {topMaterials.slice(0, 4).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setViewerMaterial(m)}
                      className="flex items-center gap-2 text-primary/80 transition-colors hover:text-primary text-left"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="text-xs line-clamp-1">
                        {m.description || m.filePath} - {m.subject.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {(hasRepoSources || topMaterials.length > 0) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Show more details <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}

      <p className="mt-3 text-[11px] italic text-muted-foreground/60">
        {hasRepoSources && answerSource
          ? `Powered by ${answerSource} — ${totalRepoSources} college repository source${totalRepoSources !== 1 ? "s" : ""} analyzed`
          : !hasRepoSources && !materialsLoading
            ? "No college repository sources available for this topic"
            : "Searching college repository..."}
      </p>

      {/* In-app material viewer */}
      <MaterialViewer
        material={viewerMaterial}
        open={!!viewerMaterial}
        onClose={() => setViewerMaterial(null)}
      />
    </div>
  )
}

/* ---------- Result Card ---------- */
function ResultCard({
  item,
  onView,
}: {
  item: ResultItem
  onView?: () => void
}) {
  const colors = typeColorMap[item.type]
  const Icon = typeIconMap[item.type]

  const isClickable = !!(item.backendMaterial || item.supabaseMaterial)

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    onView?.()
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.backendMaterial) {
      downloadMaterial(item.backendMaterial)
    } else if (item.supabaseMaterial) {
      const url =
        item.supabaseMaterial.file_url || item.supabaseMaterial.external_url
      if (url) {
        const a = document.createElement("a")
        a.href = url
        a.download = item.title.replace(/[^a-zA-Z0-9._-]/g, "_") || "download"
        a.target = "_blank"
        a.rel = "noopener noreferrer"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    }
  }

  return (
    <div
      className={`glass group flex items-start gap-4 rounded-xl p-4 transition-all hover:border-primary/30 hover:glow-sm ${isClickable ? "cursor-pointer" : ""
        }`}
      onClick={handleView}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}
      >
        <Icon className={`h-5 w-5 ${colors.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground line-clamp-1">
          {item.title}
        </h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.author} &middot; {item.subject}
        </p>
        {item.supabaseMaterial?.description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground/70 line-clamp-1">
            {item.supabaseMaterial.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`${colors.border} ${colors.bg} ${colors.text} text-[10px]`}
          >
            {item.typeLabel}
          </Badge>
          {item.supabaseMaterial && (
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px]"
            >
              Faculty Upload
            </Badge>
          )}
          <span className="text-[11px] text-muted-foreground">{item.meta}</span>
          <span className="text-[11px] text-muted-foreground">
            {item.detail}
          </span>
          {item.isStatic && (
            <Badge variant="outline" className="border-border text-[10px] text-muted-foreground/60">
              Suggested
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-1">
            <BarChart3 className="h-3 w-3 text-primary" />
            <span className="text-[11px] font-medium text-primary">
              {item.match}%
            </span>
          </div>
        </div>
      </div>
      {/* View & Download buttons — always visible for real materials */}
      {isClickable ? (
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            onClick={handleView}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      ) : (
        <div className="shrink-0 w-8" />
      )}
    </div>
  )
}

/* ---------- Main Search Results ---------- */
export function SearchResults({
  query,
  initialFilter,
}: {
  query: string
  initialFilter?: ContentFilter
}) {
  const { user } = useAuth()
  const [filter, setFilter] = useState<ContentFilter>(initialFilter || "all")
  const [results, setResults] = useState<ResultItem[]>([])
  const [allMaterials, setAllMaterials] = useState<BackendMaterial[]>([])
  const [allSupabaseMaterials, setAllSupabaseMaterials] = useState<SupabaseMaterial[]>([])
  const [subjects, setSubjects] = useState<BackendSubject[]>([])
  const [bestSubject, setBestSubject] = useState<BackendSubject | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewerMaterial, setViewerMaterial] = useState<BackendMaterial | null>(null)
  const [viewerSupabaseMaterial, setViewerSupabaseMaterial] = useState<SupabaseMaterial | null>(null)

  // Fetch materials from all subjects + Supabase faculty uploads and build result list
  const fetchAndScoreResults = useCallback(async () => {
    setLoading(true)

    try {
      // ----- 1. Fetch from Supabase faculty_materials (always available) -----
      let supabaseResults: ResultItem[] = []
      try {
        const supaRes = await fetch(
          `/api/faculty-materials?search=${encodeURIComponent(query)}&limit=50`
        )
        if (supaRes.ok) {
          const supaData = await supaRes.json()
          const supaMaterials: SupabaseMaterial[] = supaData.materials || []

          // Store all Supabase materials for AI synthesis
          setAllSupabaseMaterials(supaMaterials)

          supabaseResults = supaMaterials
            .map((mat) => ({
              title: mat.title || "Untitled",
              type: mapSupabaseTypeToFilter(mat.type),
              typeLabel:
                mat.type === "PDF"
                  ? "Faculty Notes"
                  : mat.type === "VIDEO"
                    ? "Video Lecture"
                    : "Faculty Resource",
              subject: mat.subject || "General",
              author: mat.faculty_name || "Faculty",
              meta:
                mat.type === "PDF"
                  ? "Uploaded File"
                  : mat.type === "VIDEO"
                    ? "Video"
                    : "Link",
              match: scoreSupabaseMaterial(mat, query),
              detail: mat.tags?.slice(0, 3).join(", ") || mat.subject,
              supabaseMaterial: mat,
            }))
            .filter((r) => r.match > 0)
            .sort((a, b) => b.match - a.match)
        }
      } catch {
        // Supabase query failed -- continue with backend results
      }

      // ----- 2. Fetch from old backend (may be offline) -----
      let backendResults: ResultItem[] = []

      if (user?.email) {
        try {
          let fetchedSubjects: BackendSubject[] = []
          const emails = [user.email, "redekarayush07@gmail.com"]

          for (const email of emails) {
            for (let attempt = 0; attempt < 2; attempt++) {
              try {
                fetchedSubjects = await getSubjects(email)
                break
              } catch {
                if (attempt < 1) {
                  await new Promise((r) => setTimeout(r, 3000))
                }
              }
            }
            if (fetchedSubjects.length > 0) break
          }
          setSubjects(fetchedSubjects)

          if (fetchedSubjects.length > 0) {
            const materialsPerSubject = await Promise.allSettled(
              fetchedSubjects.map((s) => getMaterials(s.id))
            )

            const allMats: BackendMaterial[] = []
            const subjectScores: Map<number, number> = new Map()

            materialsPerSubject.forEach((result, index) => {
              if (result.status === "fulfilled") {
                const mats = result.value
                allMats.push(...mats)

                const subjectId = fetchedSubjects[index].id
                let totalScore = 0
                for (const mat of mats) {
                  totalScore += scoreRelevance(mat, query)
                }
                subjectScores.set(subjectId, totalScore)
              }
            })

            setAllMaterials(allMats)

            let bestId: number | null = null
            let bestScore = 0
            subjectScores.forEach((score, id) => {
              if (score > bestScore) {
                bestScore = score
                bestId = id
              }
            })

            if (bestId !== null) {
              const best =
                fetchedSubjects.find((s) => s.id === bestId) || null
              setBestSubject(best)
            }

            backendResults = allMats
              .map((mat) => ({
                title:
                  mat.description || mat.filePath || "Untitled Material",
                type: mapTypeToFilter(mat.type),
                typeLabel: mapTypeLabel(mat.type),
                subject: mat.subject?.name || "Unknown Subject",
                author: mat.subject?.department || "Institution",
                meta: mat.type === "VIDEO" ? "Video" : "Document",
                match: scoreRelevance(mat, query),
                detail: mat.subject?.name || "",
                backendMaterial: mat,
              }))
              .filter((r) => r.match > 0)
              .sort((a, b) => b.match - a.match)
          }
        } catch {
          // Backend offline -- backendResults stays empty
        }
      }

      // ----- 3. Merge all sources -----
      let combined = [...supabaseResults, ...backendResults]

      // No static fallbacks — show only real results from college repository
      // This makes the "empty → upload → found" demo flow clear for judges

      // Deduplicate by title (prefer Supabase / backend over static)
      const seen = new Set<string>()
      combined = combined.filter((item) => {
        const key = item.title.toLowerCase().trim()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      // Sort by match score descending
      combined.sort((a, b) => b.match - a.match)
      setResults(combined)
    } catch {
      setResults(STATIC_RESULTS)
    } finally {
      setLoading(false)
    }
  }, [user?.email, query])

  useEffect(() => {
    fetchAndScoreResults()
  }, [fetchAndScoreResults])

  // Update filter when initialFilter prop changes
  useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter)
    }
  }, [initialFilter])

  const filtered =
    filter === "all" ? results : results.filter((r) => r.type === filter)

  // Compute counts from real data
  const countAll = results.length
  const countByType = (type: ContentFilter) =>
    results.filter((r) => r.type === type).length

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <p className="mb-6 text-sm text-muted-foreground">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Searching institutional knowledge base...
          </span>
        ) : (
          <>
            Showing results for{" "}
            <span className="font-medium text-foreground">
              &ldquo;{query}&rdquo;
            </span>
            <span className="ml-2 text-muted-foreground">
              &middot; {filtered.length} result
              {filtered.length !== 1 ? "s" : ""}
            </span>
          </>
        )}
      </p>

      {/* AI Synthesis */}
      <AISynthesisCard
        query={query}
        materials={allMaterials}
        subjects={subjects}
        bestSubject={bestSubject}
        materialsLoading={loading}
        supabaseMaterials={allSupabaseMaterials}
      />

      {/* Filter Bar */}
      <div className="mt-8 mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const Icon = f.icon
          const isActive = filter === f.id
          const count =
            f.id === "all" ? countAll : countByType(f.id)
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${isActive
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50 hover:text-foreground"
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {f.label}
              <span
                className={`ml-0.5 text-[10px] ${isActive
                  ? "text-primary/70"
                  : "text-muted-foreground/60"
                  }`}
              >
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass rounded-xl p-4 flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-lg animate-pulse bg-secondary/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-secondary/50" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-secondary/50" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-secondary/50" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item, i) => (
            <ResultCard
              key={item.backendMaterial?.id ?? item.supabaseMaterial?.id ?? `static-${i}`}
              item={item}
              onView={() => {
                if (item.backendMaterial) {
                  setViewerMaterial(item.backendMaterial)
                  setViewerSupabaseMaterial(null)
                } else if (item.supabaseMaterial) {
                  setViewerSupabaseMaterial(item.supabaseMaterial)
                  setViewerMaterial(null)
                }
              }}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <FolderOpen className="h-8 w-8 text-amber-400/60" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">
            No materials in college repository
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            There are no faculty-uploaded resources matching &ldquo;{query}&rdquo; in the college repository yet.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2 max-w-sm">
            Faculty members can upload documents, links, and videos through{" "}
            <span className="text-primary font-medium">Faculty Studio</span>{" "}
            to make them searchable here.
          </p>
        </div>
      )}

      {/* Material viewer dialog */}
      <MaterialViewer
        material={viewerMaterial}
        supabaseMaterial={viewerSupabaseMaterial}
        open={!!viewerMaterial || !!viewerSupabaseMaterial}
        onClose={() => {
          setViewerMaterial(null)
          setViewerSupabaseMaterial(null)
        }}
      />
    </section>
  )
}

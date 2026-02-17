"use client"

import { useState } from "react"
import {
  Sparkles,
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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/* ---------- Filter types ---------- */
type ContentFilter = "all" | "research" | "ppt" | "video" | "notes"

const FILTERS: { id: ContentFilter; label: string; icon: typeof FileText }[] = [
  { id: "all", label: "All", icon: Filter },
  { id: "research", label: "Research Papers", icon: FileText },
  { id: "ppt", label: "PPT", icon: Presentation },
  { id: "video", label: "Video Lectures", icon: Video },
  { id: "notes", label: "Notes", icon: BookOpen },
]

/* ---------- Synthesis Card ---------- */
function AISynthesisCard({ query }: { query: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="glass rounded-2xl p-6 glow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              AI Knowledge Synthesis
            </h2>
            <p className="text-xs text-muted-foreground">
              Generated from 12 Institutional Sources
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-primary/30 bg-primary/10 text-primary text-xs"
        >
          RAG-Powered
        </Badge>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-secondary-foreground">
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Concept Definition
          </h3>
          <p>
            The <strong className="text-foreground">{query || "Laplace Transform"}</strong> is an
            integral transform that converts a function of a real variable (often
            time) into a function of a complex variable (complex frequency). It
            is widely used in engineering and physics for solving differential
            equations, analyzing linear systems, and circuit analysis.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Context within Syllabus
          </h3>
          <p>
            Covered in <strong className="text-foreground">Applied Mathematics III</strong>, Unit 4
            &mdash; Integral Transforms. This topic builds upon concepts from
            Fourier Analysis (Unit 3) and leads into Z-Transforms (Unit 5).
          </p>
        </div>

        {expanded && (
          <>
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Related Units
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Fourier Series",
                  "Z-Transform",
                  "Transfer Functions",
                  "Circuit Analysis",
                  "Control Systems",
                ].map((u) => (
                  <Badge
                    key={u}
                    variant="outline"
                    className="border-border bg-secondary/40 text-secondary-foreground"
                  >
                    {u}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Academic Relevance
              </h3>
              <p>
                Exam weightage: <strong className="text-foreground">15-20 marks</strong>. Frequently
                appears in semester exams and GATE. High correlation with
                questions on inverse transforms and application-based problems.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Citations
              </h3>
              <div className="flex flex-col gap-1.5">
                {[
                  "Prof. R. Sharma - Lecture 14: Introduction to Laplace Transform",
                  "Engineering Mathematics, Kreyszig - Chapter 6",
                  "Department of Mathematics - Study Material, pg. 142-158",
                ].map((c, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex items-center gap-2 text-primary/80 transition-colors hover:text-primary"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="text-xs">{c}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

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

      <p className="mt-3 text-[11px] italic text-muted-foreground/60">
        Answer grounded in institutional academic content
      </p>
    </div>
  )
}

/* ---------- Unified result card ---------- */
interface ResultItem {
  title: string
  type: ContentFilter
  typeLabel: string
  subject: string
  author: string
  meta: string // size or duration
  match: number
  detail: string // page ref or timestamp
}

const ALL_RESULTS: ResultItem[] = [
  {
    title: "Laplace Transform: Theory and Applications in Engineering",
    type: "research",
    typeLabel: "Research Paper",
    subject: "Applied Mathematics III",
    author: "Prof. R. Sharma",
    meta: "2.4 MB",
    match: 97,
    detail: "Cited 45 times",
  },
  {
    title: "Introduction to Laplace Transform & Properties",
    type: "video",
    typeLabel: "Video Lecture",
    subject: "Applied Mathematics III",
    author: "Prof. R. Sharma",
    meta: "45 min",
    match: 96,
    detail: "Relevant at 14:32",
  },
  {
    title: "Integral Transforms - Lecture Slides (Week 7)",
    type: "ppt",
    typeLabel: "Presentation",
    subject: "Applied Mathematics III",
    author: "Prof. R. Sharma",
    meta: "5.2 MB",
    match: 94,
    detail: "42 slides",
  },
  {
    title: "Integral Transforms in Circuit Analysis",
    type: "research",
    typeLabel: "Research Paper",
    subject: "Electrical Engineering",
    author: "Prof. A. Mehta",
    meta: "1.8 MB",
    match: 92,
    detail: "Cited 22 times",
  },
  {
    title: "Laplace Transform in Circuit Analysis - RLC Circuits",
    type: "video",
    typeLabel: "Video Lecture",
    subject: "Network Theory",
    author: "Prof. A. Mehta",
    meta: "38 min",
    match: 91,
    detail: "Relevant at 08:15",
  },
  {
    title: "Study Material: Unit 4 - Integral Transforms",
    type: "notes",
    typeLabel: "Notes",
    subject: "Department Notes",
    author: "Dept. of Mathematics",
    meta: "3.1 MB",
    match: 89,
    detail: "Pages 142-158",
  },
  {
    title: "Control Systems & Transfer Functions - Slides",
    type: "ppt",
    typeLabel: "Presentation",
    subject: "Control Systems",
    author: "Prof. S. Gupta",
    meta: "3.8 MB",
    match: 88,
    detail: "56 slides",
  },
  {
    title: "Inverse Laplace Transform Techniques",
    type: "video",
    typeLabel: "Video Lecture",
    subject: "Applied Mathematics III",
    author: "Prof. R. Sharma",
    meta: "52 min",
    match: 87,
    detail: "Relevant at 22:05",
  },
  {
    title: "GATE Preparation: Laplace Transform Problem Set",
    type: "notes",
    typeLabel: "Notes",
    subject: "Exam Prep",
    author: "Academic Cell",
    meta: "850 KB",
    match: 84,
    detail: "50 problems",
  },
  {
    title: "Signal Processing: Time & Frequency Domain Methods",
    type: "research",
    typeLabel: "Research Paper",
    subject: "Signal Processing",
    author: "Prof. K. Rajan",
    meta: "2.1 MB",
    match: 79,
    detail: "Cited 18 times",
  },
]

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

function ResultCard({ item }: { item: ResultItem }) {
  const colors = typeColorMap[item.type]
  const Icon = typeIconMap[item.type]

  return (
    <div className="glass group flex items-start gap-4 rounded-xl p-4 transition-all hover:border-primary/30 hover:glow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
        <Icon className={`h-5 w-5 ${colors.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground line-clamp-1">{item.title}</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.author} &middot; {item.subject}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`${colors.border} ${colors.bg} ${colors.text} text-[10px]`}
          >
            {item.typeLabel}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{item.meta}</span>
          <span className="text-[11px] text-muted-foreground">{item.detail}</span>
          <div className="ml-auto flex items-center gap-1">
            <BarChart3 className="h-3 w-3 text-primary" />
            <span className="text-[11px] font-medium text-primary">{item.match}%</span>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="sr-only">Download</span>
      </Button>
    </div>
  )
}

/* ---------- Main Search Results ---------- */
export function SearchResults({ query }: { query: string }) {
  const [filter, setFilter] = useState<ContentFilter>("all")

  const filtered = filter === "all" ? ALL_RESULTS : ALL_RESULTS.filter((r) => r.type === filter)

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <p className="mb-6 text-sm text-muted-foreground">
        Showing results for{" "}
        <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
        <span className="ml-2 text-muted-foreground">
          &middot; {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </p>

      {/* AI Synthesis */}
      <AISynthesisCard query={query} />

      {/* Filter Bar */}
      <div className="mt-8 mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const Icon = f.icon
          const isActive = filter === f.id
          const count = f.id === "all" ? ALL_RESULTS.length : ALL_RESULTS.filter((r) => r.type === f.id).length
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {f.label}
              <span className={`ml-0.5 text-[10px] ${isActive ? "text-primary/70" : "text-muted-foreground/60"}`}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Results List */}
      <div className="flex flex-col gap-3">
        {filtered.map((item, i) => (
          <ResultCard key={i} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Filter className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No results found for this filter</p>
        </div>
      )}
    </section>
  )
}

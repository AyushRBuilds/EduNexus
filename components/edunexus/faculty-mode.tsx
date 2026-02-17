"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Upload,
  FileText,
  BarChart3,
  AlertTriangle,
  Eye,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/* ----- Upload Panel ----- */
function UploadPanel() {
  const [files, setFiles] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Content Upload & Indexing
      </h3>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const names = Array.from(e.dataTransfer.files).map((f) => f.name)
          setFiles((p) => [...p, ...names])
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
                {f}
              </span>
              <Badge
                variant="outline"
                className="border-green-500/30 bg-green-500/10 text-green-400 text-[10px]"
              >
                Indexed
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* AI Preview */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <Image src="/images/logo.png" alt="" width={16} height={16} className="mt-0.5 shrink-0 object-contain logo-blend" />
        <div>
          <p className="text-xs font-medium text-foreground">
            AI Auto-Index Preview
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Uploaded content will be automatically parsed, chunked, and indexed
            for semantic search. Key concepts, definitions, and formulas will be
            extracted for the knowledge graph.
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

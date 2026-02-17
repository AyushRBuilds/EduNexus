"use client"

import { useState } from "react"
import { Search, ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const filterChips = ["All", "Research Papers", "PPT", "Video Lectures", "Notes"] as const

const placeholders = [
  "Explain Laplace Transform applications in circuit analysis",
  "Research papers on renewable energy optimization",
  "Fourier series derivation from Applied Mathematics III",
  "Neural network backpropagation explained with examples",
  "Quantum computing principles and applications",
]

export function HeroSearch({
  onSearch,
}: {
  onSearch: (query: string) => void
}) {
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [placeholderIdx] = useState(() =>
    Math.floor(Math.random() * placeholders.length)
  )

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <section className="relative flex flex-col items-center px-4 pb-16 pt-20 lg:pt-28">
      {/* Ambient glow behind hero */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]" style={{ background: "radial-gradient(circle, oklch(0.55 0.20 250 / 0.4), transparent 70%)" }} />

      <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-Powered Semantic Search Engine
        </div>

        <h1 className="mb-4 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Search Across Your Entire Campus Knowledge Base
        </h1>

        <p className="mb-10 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          AI-powered semantic search across lectures, PDFs, research papers,
          recordings, and institutional content.
        </p>

        {/* Search Bar */}
        <div className="group relative w-full max-w-2xl">
          <div className="absolute -inset-0.5 rounded-2xl bg-primary/20 opacity-0 blur-lg transition-opacity group-focus-within:opacity-100" />
          <div className="relative flex items-center rounded-2xl border border-border bg-card shadow-lg transition-shadow focus-within:glow-md">
            <Search className="pointer-events-none ml-5 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={placeholders[placeholderIdx]}
              className="h-14 flex-1 bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none md:text-base"
            />
            <button
              onClick={handleSubmit}
              className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
              aria-label="Search"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {filterChips.map((chip) => (
            <Badge
              key={chip}
              variant={activeFilter === chip ? "default" : "outline"}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === chip
                  ? "border-primary bg-primary/15 text-primary hover:bg-primary/20"
                  : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40 hover:bg-secondary/50 hover:text-foreground"
              }`}
              onClick={() => setActiveFilter(chip)}
            >
              {chip}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}

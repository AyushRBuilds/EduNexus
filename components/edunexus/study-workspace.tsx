"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  MessageSquare,
  FileText,
  Network,
  Send,
  ArrowLeft,
  Clock,
  BookOpen,
  ChevronDown,
  Settings,
  Info,
  Search,
  Filter,
  Star,
  Users,
  GraduationCap,
  X,
  Sparkles,
  Loader2,
  Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Badge } from "@/components/ui/badge"
import { StudyMindMap } from "./study-mind-map"
import { queryGemini } from "@/lib/api/gemini.service"
import { FormattedMarkdown } from "./formatted-markdown"
import type { SupabaseMaterial } from "@/lib/api/types"

/* ------------------------------------------------------------------ */
/*  Video Lecture Catalog Data                                         */
/* ------------------------------------------------------------------ */

interface VideoLecture {
  id: string
  title: string
  course: string
  courseCode: string
  instructor: string
  department: string
  duration: string
  durationSeconds: number
  thumbnail: string
  views: number
  rating: number
  lectureNumber: number
  totalLectures: number
  tags: string[]
  date: string
  youtubeUrl?: string
  videoUrl?: string
  isSupabase?: boolean
  description?: string
}

const VIDEO_CATALOG: VideoLecture[] = [
  {
    id: "laplace",
    title: "Laplace Transform - Definition & Properties",
    course: "Signals & Systems",
    courseCode: "EE301",
    instructor: "Prof. Vikram Menon",
    department: "Electrical Engineering",
    duration: "5:00",
    durationSeconds: 300,
    thumbnail: "https://img.youtube.com/vi/n2y7n6jw5d0/mqdefault.jpg",
    views: 1247,
    rating: 4.8,
    lectureNumber: 14,
    totalLectures: 28,
    tags: ["Laplace", "Transforms", "s-domain"],
    date: "Feb 10, 2026",
    youtubeUrl: "https://www.youtube.com/watch?v=n2y7n6jw5d0",
  },
  {
    id: "dsa-trees",
    title: "Binary Trees & Traversal Algorithms",
    course: "Data Structures & Algorithms",
    courseCode: "CS201",
    instructor: "Prof. Ananya Rao",
    department: "Computer Science",
    duration: "42:15",
    durationSeconds: 2535,
    thumbnail: "BT",
    views: 2103,
    rating: 4.9,
    lectureNumber: 8,
    totalLectures: 24,
    tags: ["Trees", "BFS", "DFS", "Traversal"],
    date: "Feb 12, 2026",
  },
  {
    id: "dbms-normal",
    title: "Normalization - 1NF, 2NF, 3NF & BCNF",
    course: "Database Management Systems",
    courseCode: "CS301",
    instructor: "Dr. Meera Joshi",
    department: "Computer Science",
    duration: "38:40",
    durationSeconds: 2320,
    thumbnail: "NF",
    views: 980,
    rating: 4.6,
    lectureNumber: 6,
    totalLectures: 20,
    tags: ["Normalization", "Relational", "Schema"],
    date: "Feb 8, 2026",
  },
  {
    id: "os-scheduling",
    title: "CPU Scheduling - FCFS, SJF, Round Robin",
    course: "Operating Systems",
    courseCode: "CS302",
    instructor: "Prof. Karthik Iyer",
    department: "Computer Science",
    duration: "45:20",
    durationSeconds: 2720,
    thumbnail: "CS",
    views: 1560,
    rating: 4.7,
    lectureNumber: 10,
    totalLectures: 22,
    tags: ["Scheduling", "Processes", "CPU"],
    date: "Feb 14, 2026",
  },
  {
    id: "math-fourier",
    title: "Fourier Series & Fourier Transform",
    course: "Applied Mathematics III",
    courseCode: "MA301",
    instructor: "Prof. Vikram Menon",
    department: "Mathematics",
    duration: "50:00",
    durationSeconds: 3000,
    thumbnail: "FT",
    views: 870,
    rating: 4.5,
    lectureNumber: 18,
    totalLectures: 28,
    tags: ["Fourier", "Series", "Transform"],
    date: "Feb 6, 2026",
  },
  {
    id: "ml-regression",
    title: "Linear & Logistic Regression",
    course: "Machine Learning",
    courseCode: "CS401",
    instructor: "Dr. Priya Nair",
    department: "Computer Science",
    duration: "55:10",
    durationSeconds: 3310,
    thumbnail: "LR",
    views: 3200,
    rating: 4.9,
    lectureNumber: 4,
    totalLectures: 18,
    tags: ["Regression", "ML", "Supervised"],
    date: "Feb 15, 2026",
  },
  {
    id: "cn-tcp",
    title: "TCP/IP Protocol Suite - Deep Dive",
    course: "Computer Networks",
    courseCode: "CS303",
    instructor: "Prof. Suresh Pillai",
    department: "Computer Science",
    duration: "40:30",
    durationSeconds: 2430,
    thumbnail: "TCP",
    views: 740,
    rating: 4.4,
    lectureNumber: 12,
    totalLectures: 20,
    tags: ["TCP", "IP", "Networking", "Protocols"],
    date: "Feb 11, 2026",
  },
  {
    id: "thermo-laws",
    title: "Laws of Thermodynamics - Applications",
    course: "Engineering Thermodynamics",
    courseCode: "ME201",
    instructor: "Dr. M. Kulkarni",
    department: "Mechanical Engineering",
    duration: "47:45",
    durationSeconds: 2865,
    thumbnail: "TD",
    views: 620,
    rating: 4.3,
    lectureNumber: 7,
    totalLectures: 16,
    tags: ["Thermodynamics", "Entropy", "Energy"],
    date: "Feb 9, 2026",
  },
]

/* ------------------------------------------------------------------ */
/*  Video Search / Browse Landing                                      */
/* ------------------------------------------------------------------ */

function VideoSearchLanding({ onSelectVideo, catalog }: { onSelectVideo: (id: string) => void; catalog: VideoLecture[] }) {
  const [query, setQuery] = useState("")
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const DEPARTMENTS = [...new Set(catalog.map((v) => v.department))]

  const filtered = catalog.filter((v) => {
    if (deptFilter !== "all" && v.department !== deptFilter) return false
    if (query) {
      const q = query.toLowerCase()
      return (
        v.title.toLowerCase().includes(q) ||
        v.course.toLowerCase().includes(q) ||
        v.courseCode.toLowerCase().includes(q) ||
        v.instructor.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/40 px-6 py-5 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 glow-sm">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Study Mode</h1>
              <p className="text-xs text-muted-foreground">Browse video lectures and enter the immersive study workspace</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search lectures by topic, course, instructor..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-secondary/40 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className={cn(
                "h-11 rounded-xl border-border gap-2 text-sm",
                showFilters && "bg-primary/10 border-primary/30 text-primary"
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>

          {/* Filter row */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setDeptFilter("all")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  deptFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                All Departments
              </button>
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDeptFilter(d)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    deptFilter === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">
              {filtered.length} lecture{filtered.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video) => (
              <button
                key={video.id}
                onClick={() => onSelectVideo(video.id)}
                className="group glass rounded-xl overflow-hidden text-left transition-all hover:border-primary/30 hover:glow-sm"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-[#0a0e1a] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }} />
                  {video.thumbnail.startsWith("http") ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="absolute inset-0 h-full w-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="flex h-14 w-14 z-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <span className="text-sm font-bold text-primary">{video.thumbnail}</span>
                    </div>
                  )}
                  {/* Duration pill */}
                  <span className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
                    {video.duration}
                  </span>
                  {/* Play hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/0 opacity-0 transition-all group-hover:bg-background/20 group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                      <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5">
                  <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    {video.courseCode} &middot; {video.course}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {video.instructor}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        {video.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {video.views.toLocaleString()}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-border bg-secondary/20 text-muted-foreground">
                      Lec {video.lectureNumber}/{video.totalLectures}
                    </Badge>
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {video.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-md bg-primary/8 px-1.5 py-0.5 text-[9px] text-primary/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No lectures found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Force turbopack refresh

/* ------------------------------------------------------------------ */
/*  Transcript & Video Data                                            */
/* ------------------------------------------------------------------ */

interface TranscriptSegment {
  id: number
  start: number
  end: number
  speaker: string
  text: string
}

const TRANSCRIPT: TranscriptSegment[] = [
  { id: 1, start: 0, end: 18, speaker: "Prof. Menon", text: "Welcome back everyone. Today we are going to dive deep into the Laplace Transform, which is one of the most powerful tools in engineering mathematics." },
  { id: 2, start: 18, end: 38, speaker: "Prof. Menon", text: "The Laplace Transform converts a function of time, f(t), into a function of complex frequency, F(s). This is extremely useful because it transforms differential equations into algebraic equations." },
  { id: 3, start: 38, end: 55, speaker: "Prof. Menon", text: "The formal definition is: L of f(t) equals the integral from 0 to infinity of e to the negative s t times f(t) dt. Remember, s is a complex variable." },
  { id: 4, start: 55, end: 75, speaker: "Prof. Menon", text: "Let us start with the properties. The linearity property states that the Laplace Transform of a times f(t) plus b times g(t) equals a times F(s) plus b times G(s)." },
  { id: 5, start: 75, end: 95, speaker: "Prof. Menon", text: "The time-shifting property is also crucial. If we shift f(t) by a units, the Laplace Transform becomes e to the negative a s times F(s). This has direct applications in circuit analysis." },
  { id: 6, start: 95, end: 118, speaker: "Prof. Menon", text: "Now let us talk about the differentiation property. The Laplace Transform of f prime of t equals s times F(s) minus f(0). This is precisely why Laplace Transforms are so useful for solving ODEs." },
  { id: 7, start: 118, end: 140, speaker: "Prof. Menon", text: "For the second derivative, we get s squared F(s) minus s f(0) minus f prime of 0. Notice the pattern: each derivative introduces another power of s." },
  { id: 8, start: 140, end: 165, speaker: "Prof. Menon", text: "Let me show you a practical example. Consider a simple RLC circuit. Using Laplace Transform, we can convert the circuit differential equation into the s-domain and solve it algebraically." },
  { id: 9, start: 165, end: 190, speaker: "Prof. Menon", text: "The transfer function H(s) of the circuit becomes a ratio of polynomials in s. The poles of this transfer function determine the natural response of the circuit." },
  { id: 10, start: 190, end: 210, speaker: "Prof. Menon", text: "For the inverse Laplace Transform, we primarily use partial fraction decomposition. We break F(s) into simpler fractions and look up each one in our table of standard transforms." },
  { id: 11, start: 210, end: 235, speaker: "Prof. Menon", text: "The convolution theorem is another powerful tool. It states that the Laplace Transform of the convolution of two functions equals the product of their individual Laplace Transforms." },
  { id: 12, start: 235, end: 260, speaker: "Prof. Menon", text: "In control systems, we use Laplace Transforms to analyze stability. The location of poles in the s-plane tells us whether the system is stable, marginally stable, or unstable." },
  { id: 13, start: 260, end: 285, speaker: "Prof. Menon", text: "Finally, I want to mention the connection to the Fourier Transform. When we substitute s equals j omega, the Laplace Transform reduces to the Fourier Transform for causal signals." },
  { id: 14, start: 285, end: 300, speaker: "Prof. Menon", text: "That wraps up our lecture on Laplace Transforms. Please review the practice problems I have posted, and we will continue with Z-Transforms next week." },
]

const TOTAL_DURATION = 300

interface ChatMessage {
  id: number
  role: "user" | "ai"
  text: string
}

const INITIAL_CHAT: ChatMessage[] = [
  { id: 1, role: "ai", text: "Hi! I'm your AI study companion for this lecture on Laplace Transforms. Ask me anything about the concepts covered, or I can quiz you on the material." },
]

const AI_RESPONSES: Record<string, string> = {
  "default": "Great question! Based on the lecture content, the Laplace Transform is an integral transform that converts time-domain functions into the s-domain (complex frequency domain). This makes it much easier to solve differential equations by turning them into algebraic equations. Would you like me to explain any specific property in more detail?",
  "definition": "The formal definition is: L{f(t)} = F(s) = integral from 0 to infinity of e^(-st) f(t) dt, where s is a complex variable (s = sigma + j*omega). The transform essentially decomposes a time-domain signal into its complex exponential components.",
  "properties": "The key properties covered in this lecture are:\n1. Linearity: L{af(t) + bg(t)} = aF(s) + bG(s)\n2. Time-shifting: L{f(t - a)} = e^(-as)F(s)\n3. Differentiation: L{f'(t)} = sF(s) - f(0)\n4. Convolution: L{f*g} = F(s)G(s)\nEach property has practical applications in circuit analysis and control systems.",
  "circuit": "In circuit analysis, the Laplace Transform converts circuit differential equations (from KVL/KCL) into algebraic equations in the s-domain. Impedances become Z_R = R, Z_L = sL, Z_C = 1/(sC). The transfer function H(s) is a ratio of polynomials, and its poles determine the circuit's natural response.",
  "inverse": "The Inverse Laplace Transform recovers f(t) from F(s). The primary methods are:\n1. Partial fraction decomposition - break F(s) into simpler terms\n2. Table lookup - match each term to known transform pairs\n3. Convolution theorem - for products of transforms\n4. Complex contour integration (Bromwich integral) - for advanced cases",
}

const SUMMARY_SECTIONS = [
  {
    title: "Core Definition", items: [
      "L{f(t)} = F(s) = integral from 0 to infinity of e^(-st) f(t) dt",
      "Converts time-domain functions to complex frequency-domain (s-domain)",
      "s is a complex variable: s = sigma + j*omega",
    ]
  },
  {
    title: "Key Properties", items: [
      "Linearity: L{af(t) + bg(t)} = aF(s) + bG(s)",
      "Time-shifting: L{f(t - a)u(t-a)} = e^(-as)F(s)",
      "Differentiation: L{f'(t)} = sF(s) - f(0)",
      "Convolution: L{f * g(t)} = F(s)G(s)",
    ]
  },
  {
    title: "Applications Covered", items: [
      "RLC circuit analysis using impedance in s-domain",
      "Transfer function H(s) and pole analysis",
      "Solving ordinary differential equations (ODEs)",
      "Control system stability analysis",
    ]
  },
  {
    title: "Related Concepts", items: [
      "Inverse Laplace via partial fraction decomposition",
      "Connection to Fourier Transform (s = j*omega)",
      "Z-Transform for discrete-time signals (next lecture)",
    ]
  },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

/** Extracts a YouTube identifier */
function getYouTubeId(url?: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/)
  return match ? match[1] : null
}

/* ------------------------------------------------------------------ */
/*  Video Player                                                       */
/* ------------------------------------------------------------------ */

function VideoPlayer({
  currentTime,
  duration,
  isPlaying,
  isMuted,
  onPlayPause,
  onMute,
  onSeek,
  onSkip,
  lectureTitle,
  youtubeUrl,
  videoUrl,
}: {
  currentTime: number
  duration: number
  isPlaying: boolean
  isMuted: boolean
  onPlayPause: () => void
  onMute: () => void
  onSeek: (time: number) => void
  onSkip: (delta: number) => void
  lectureTitle?: string
  youtubeUrl?: string
  videoUrl?: string
}) {
  const progressRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ytId = getYouTubeId(youtubeUrl)
  const hasRealVideo = !!(ytId || videoUrl)

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    if (videoRef.current) {
      videoRef.current.currentTime = pct * videoRef.current.duration
    }
    onSeek(pct * duration)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0e1a]">
        {/* YouTube Embed */}
        {ytId && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            title={lectureTitle || "Video"}
          />
        )}

        {/* Direct video URL */}
        {!ytId && videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            muted={isMuted}
            autoPlay={isPlaying}
          />
        )}

        {/* Fallback placeholder when no real video */}
        {!hasRealVideo && (
          <>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="absolute inset-4 rounded-lg border border-border/30 bg-[#0c1220]">
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: "linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }} />
                <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8">
                  <div className="flex items-center gap-3 text-primary/70">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-xs font-medium uppercase tracking-widest">Lecture Preview</span>
                  </div>
                  <h2 className="text-center text-2xl font-bold text-foreground lg:text-3xl text-balance">
                    {lectureTitle || "Lecture"}
                  </h2>
                  <p className="text-sm text-muted-foreground">No video source available</p>
                </div>
              </div>
            </div>
            <button
              onClick={onPlayPause}
              className="absolute inset-0 z-10 flex items-center justify-center bg-transparent transition-colors hover:bg-background/10"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {!isPlaying && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30">
                  <Play className="ml-1 h-7 w-7" fill="currentColor" />
                </div>
              )}
            </button>
          </>
        )}
      </div>

      {/* Controls bar (only show for non-YouTube) */}
      {!ytId && (
        <div className="flex flex-col gap-1.5 border-t border-border bg-card/80 px-3 py-2 backdrop-blur-sm">
          <div
            ref={progressRef}
            className="group relative h-1.5 w-full cursor-pointer rounded-full bg-secondary"
            onClick={handleProgressClick}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={Math.floor(currentTime)}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all group-hover:h-2 group-hover:-top-[1px]" style={{ width: `${progress}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background shadow-sm opacity-0 transition-opacity group-hover:opacity-100" style={{ left: `calc(${progress}% - 7px)` }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60" onClick={() => onSkip(-10)} aria-label="Rewind 10s"><SkipBack className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-secondary/60" onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" fill="currentColor" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60" onClick={() => onSkip(10)} aria-label="Forward 10s"><SkipForward className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60" onClick={onMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <span className="ml-2 text-xs tabular-nums text-muted-foreground">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors">1x</button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60" aria-label="Fullscreen"><Maximize className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Transcript                                                         */
/* ------------------------------------------------------------------ */

function TranscriptPanel({ video, currentTime, onSeek }: { video: VideoLecture | null; currentTime: number; onSeek: (time: number) => void }) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>(TRANSCRIPT)
  const [loading, setLoading] = useState(false)
  const [needsGeneration, setNeedsGeneration] = useState(false)
  const activeRef = useRef<HTMLButtonElement>(null)

  const activeSegmentId = transcript.find((seg) => currentTime >= seg.start && currentTime < seg.end)?.id

  useEffect(() => {
    if (activeRef.current) activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [activeSegmentId])

  useEffect(() => {
    if (!video) return

    // For all videos, ask user to generate transcript
    setNeedsGeneration(true)
    setTranscript([])
  }, [video])

  const handleGenerateTranscript = async () => {
    if (!video) return
    setLoading(true)
    setNeedsGeneration(false)
    let isMounted = true

    try {
      const prompt = `Generate a detailed and realistic educational transcript for a video titled "${video.title}" that covers the entire topic in depth.
              Course: ${video.course}
              Instructor: ${video.instructor}
              ${video.description ? `Description: ${video.description}` : ""}

              Output ONLY a valid block of JSON array of objects (generate as many objects as needed to cover the full topic comprehensively). Each object MUST have:
              - "id": number (e.g. 1, 2, 3...)
              - "start": number (start time in seconds, starting from 0, e.g. 0, 30, 60...)
              - "end": number (end time in seconds, e.g. 30, 60, 90...)
              - "speaker": string (instructor name)
              - "text": string (the spoken text sentence or paragraph)

              Make the text highly relevant to the video title. Do NOT output any markdown blocks like \`\`\`json or \`\`\`, ONLY the raw JSON array.`

      const result = await queryGemini(prompt)
      let rawJson = result.answer.replace(/```json/gi, '').replace(/```/g, '').trim()

      const jsonStart = rawJson.indexOf('[')
      const jsonEnd = rawJson.lastIndexOf(']')
      if (jsonStart !== -1 && jsonEnd !== -1) {
        rawJson = rawJson.substring(jsonStart, jsonEnd + 1)
      }

      const parsed = JSON.parse(rawJson) as TranscriptSegment[]

      if (isMounted && Array.isArray(parsed) && parsed.length > 0) {
        setTranscript(parsed)
      } else {
        throw new Error("Invalid structure")
      }
    } catch (err) {
      console.error("Failed to generate transcript", err)
      if (isMounted) {
        setTranscript([
          { id: 1, start: 0, end: 3600, speaker: video.instructor, text: `Welcome to this lecture on ${video.title}. Our AI encountered an error processing the transcript. Please try generating it again later.` }
        ])
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  // effect removed as logic is now in handleGenerateTranscript

  return (
    <div className="flex flex-col h-full bg-card/60">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-xs font-semibold text-foreground">Transcript</h3>
          {video?.isSupabase && (
            <Badge variant="outline" className="ml-2 text-[9px] border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              AI Generated
            </Badge>
          )}
        </div>
        <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          Auto-scroll
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-0.5 p-2 h-full">
          {needsGeneration ? (
            <div className="flex flex-col items-center justify-center h-full py-12 gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">AI Transcript Available</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">Generate a full lecture transcript using Gemini AI, or maximize other tabs if you prefer.</p>
              </div>
              <Button onClick={handleGenerateTranscript} className="h-8 text-xs px-4" size="sm">
                Generate Transcript
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-xs">AI is transcribing lecture...</p>
            </div>
          ) : (
            transcript.map((seg) => {
              const isActive = seg.id === activeSegmentId
              const isPast = currentTime > seg.end
              return (
                <button
                  key={seg.id}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onSeek(seg.start)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-2 text-left transition-all",
                    isActive ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-secondary/40",
                  )}
                >
                  <span className={cn("mt-0.5 shrink-0 text-[10px] tabular-nums font-mono", isActive ? "text-primary font-semibold" : isPast ? "text-muted-foreground/50" : "text-muted-foreground")}>{formatTime(seg.start)}</span>
                  <p className={cn("text-xs leading-relaxed", isActive ? "text-foreground font-medium" : isPast ? "text-muted-foreground/60" : "text-secondary-foreground")}>{seg.text}</p>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Chat Tab                                                           */
/* ------------------------------------------------------------------ */

function ChatTab({ videoTitle, videoSubject }: { videoTitle?: string; videoSubject?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "ai", text: `Hi! I'm your AI study companion for this lecture${videoTitle ? ` on "${videoTitle}"` : ""}. Ask me anything about the concepts covered, request explanations, or I can quiz you on the material.` },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return
    const userMsg: ChatMessage = { id: Date.now(), role: "user", text: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    const question = input.trim()
    setInput("")
    setIsTyping(true)

    try {
      const context = [
        videoTitle ? `This is a lecture on: ${videoTitle}` : "",
        videoSubject ? `Subject: ${videoSubject}` : "",
        "Answer as a helpful tutor. Be concise but thorough. Use examples when helpful.",
      ].filter(Boolean).join("\n")

      const result = await queryGemini(question, context)
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        text: result.answer || "I couldn't generate a response. Please try again.",
      }])
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        text: "Sorry, I encountered an error. Please check that the Gemini API key is configured and try again.",
      }])
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, videoTitle, videoSubject])

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed",
                msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary/60 text-secondary-foreground rounded-bl-md"
              )}>
                {msg.role === "ai" && (
                  <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-primary">
                    <Bot className="h-3 w-3" />
                    EduNexus AI
                  </span>
                )}
                {msg.role === "ai" ? (
                  <FormattedMarkdown text={msg.text} compact />
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-secondary/60 px-4 py-3 rounded-bl-md">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  <span className="text-[10px] text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
            placeholder="Ask about the lecture..."
            className="h-9 flex-1 rounded-xl border border-border bg-secondary/30 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
          <Button size="icon" className="h-9 w-9 shrink-0 rounded-xl" onClick={handleSend} disabled={!input.trim() || isTyping}>
            {isTyping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground/50 text-center">Powered by Gemini AI — answers based on lecture context</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Summary Tab                                                        */
/* ------------------------------------------------------------------ */

function SummaryTab({ videoTitle, videoSubject }: { videoTitle?: string; videoSubject?: string }) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const generateSummary = useCallback(async () => {
    if (!videoTitle) return
    setLoading(true)
    try {
      const prompt = `Generate a comprehensive study summary for a lecture titled "${videoTitle}"${videoSubject ? ` (Subject: ${videoSubject})` : ""}.

                Format the summary as:
                1. **Key Concepts** - List the main concepts covered (4-6 bullet points)
                2. **Core Definitions** - Important definitions and formulas
                3. **Applications** - Real-world applications discussed
                4. **Study Tips** - 2-3 practical tips for studying this topic
                5. **Key Takeaways** - 3 most important things to remember

                Be academically rigorous and detailed. Use clear, student-friendly language.`

      const result = await queryGemini(prompt)
      setSummary(result.answer || "Could not generate summary.")
      setGenerated(true)
    } catch {
      setSummary("Error generating summary. Please check that the Gemini API key is configured.")
    } finally {
      setLoading(false)
    }
  }, [videoTitle, videoSubject])

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Key Summary</h3>
              <p className="text-[10px] text-muted-foreground">
                {generated ? "AI-generated from lecture topic" : "Click generate to create summary"}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={generateSummary}
            disabled={loading || !videoTitle}
            className="h-8 rounded-lg gap-1.5 text-xs"
          >
            {loading ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-3 w-3" /> {generated ? "Regenerate" : "Generate Summary"}</>
            )}
          </Button>
        </div>

        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-secondary/15 p-3.5">
                <div className="h-3 w-24 animate-pulse rounded bg-secondary/50 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-secondary/40" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-secondary/40" />
                  <div className="h-3 w-4/6 animate-pulse rounded bg-secondary/40" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && summary && (
          <div className="rounded-xl border border-border/60 bg-secondary/15 p-4">
            <FormattedMarkdown text={summary} className="text-xs" />
          </div>
        )}

        {!loading && !summary && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/20 mb-3" />
            <p className="text-xs text-muted-foreground">
              Click &ldquo;Generate Summary&rdquo; to create an AI-powered key summary of this lecture.
            </p>
          </div>
        )}

        {generated && (
          <div className="rounded-xl border border-border/40 bg-primary/5 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 text-primary/70" />
              <span className="text-[10px] font-semibold text-primary/70">Powered by Gemini AI</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This summary was generated by AI based on the lecture title. For best results, review it alongside the actual lecture content.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Study Workspace                                               */
/* ------------------------------------------------------------------ */

export function StudyWorkspace({ onBack }: { onBack: () => void }) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [catalog, setCatalog] = useState<VideoLecture[]>(VIDEO_CATALOG)
  const [currentTime, setCurrentTime] = useState(42)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function fetchFacultyVideos() {
      try {
        const res = await fetch("/api/faculty-materials?limit=100")
        if (res.ok) {
          const data = await res.json()
          const supaMaterials: SupabaseMaterial[] = data.materials || []

          const facultyVideos: VideoLecture[] = supaMaterials
            .filter(m => m.type === "VIDEO" || (m.type === "LINK" && m.external_url?.includes("youtu")))
            .map(m => {
              const isYoutube = m.external_url?.includes("youtu")
              const yId = isYoutube ? getYouTubeId(m.external_url!) : null
              const thumb = yId ? `https://img.youtube.com/vi/${yId}/mqdefault.jpg` : m.title.slice(0, 2).toUpperCase()
              return {
                id: m.id,
                title: m.title,
                course: m.subject || "General",
                courseCode: "FAC",
                instructor: m.faculty_name || "Faculty",
                department: "Uploaded",
                duration: isYoutube ? "YouTube" : "N/A",
                durationSeconds: 0,
                thumbnail: yId ? thumb : thumb, // Pass the thumb string (URL or initials) directly
                views: 0,
                rating: 5.0,
                lectureNumber: 1,
                totalLectures: 1,
                tags: m.tags || ["Faculty Upload"],
                date: new Date(m.created_at).toLocaleDateString(),
                youtubeUrl: isYoutube ? m.external_url! : undefined,
                videoUrl: !isYoutube ? (m.file_url || m.external_url || undefined) : undefined,
                isSupabase: true,
                description: m.description || undefined,
              }
            })

          setCatalog([...facultyVideos, ...VIDEO_CATALOG])
        }
      } catch (err) {
        console.error("Failed to load faculty videos", err)
      }
    }
    fetchFacultyVideos()
  }, [])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const dur = selectedLecture?.durationSeconds || TOTAL_DURATION
          if (prev >= dur) { setIsPlaying(false); return dur }
          return prev + 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, selectedLecture])

  const handleSeek = useCallback((time: number) => {
    const dur = selectedLecture?.durationSeconds || TOTAL_DURATION
    setCurrentTime(Math.max(0, Math.min(dur, time)))
  }, [selectedLecture])

  const handleSkip = useCallback((delta: number) => {
    const dur = selectedLecture?.durationSeconds || TOTAL_DURATION
    setCurrentTime((prev) => Math.max(0, Math.min(dur, prev + delta)))
  }, [selectedLecture])

  const handleSelectVideo = (id: string) => {
    setSelectedVideo(id)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const selectedLecture = selectedVideo ? (catalog.find((v) => v.id === selectedVideo) || null) : null

  // If no video selected, show the search landing
  if (!selectedVideo) {
    return (
      <div className="flex h-full flex-col bg-background">
        {/* Header with back button */}
        <div className="flex items-center gap-3 border-b border-border/60 bg-card/40 px-4 py-2.5 backdrop-blur-sm">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary/60" onClick={onBack} aria-label="Back to main view">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-semibold text-foreground">Study Mode</span>
          <span className="hidden text-[10px] text-muted-foreground sm:block">&middot; Select a lecture to enter the study workspace</span>
        </div>
        <VideoSearchLanding onSelectVideo={handleSelectVideo} catalog={catalog} />
      </div>
    )
  }

  // Full immersive workspace
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Study Mode Header */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card/40 px-4 py-2.5 backdrop-blur-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary/60" onClick={() => setSelectedVideo(null)} aria-label="Back to lecture list">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15">
            <BookOpen className="h-3 w-3 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground leading-none">
              {selectedLecture ? `${selectedLecture.courseCode} - ${selectedLecture.title}` : "EE301 - Laplace Transform"}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
              {selectedLecture ? `Lecture ${selectedLecture.lectureNumber} \u00b7 ${selectedLecture.instructor}` : "Lecture 14 \u00b7 Prof. Vikram Menon"}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary sm:block">Study Mode</span>
        </div>
      </div>

      {/* Split-screen content -- resizable */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel
          defaultSize={60}
          minSize={30}
          maxSize={80}
          className={cn("transition-all duration-300", isMaximized ? "!hidden" : "")}
        >
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={65} minSize={30}>
              <div className="flex h-full flex-col overflow-y-auto p-4 bg-background">
                <VideoPlayer
                  currentTime={currentTime}
                  duration={selectedLecture?.durationSeconds || TOTAL_DURATION}
                  isPlaying={isPlaying}
                  isMuted={isMuted}
                  onPlayPause={() => setIsPlaying((p) => !p)}
                  onMute={() => setIsMuted((m) => !m)}
                  onSeek={handleSeek}
                  onSkip={handleSkip}
                  lectureTitle={selectedLecture?.title}
                  youtubeUrl={selectedLecture?.youtubeUrl}
                  videoUrl={selectedLecture?.videoUrl}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="bg-border/30 transition-colors hover:bg-primary/20 data-[resize-handle-active]:bg-primary/40 [&>div]:border-border/50 [&>div]:bg-secondary/60 [&>div]:hover:bg-primary/30"
            />

            <ResizablePanel defaultSize={35} minSize={20}>
              <div className="h-full flex flex-col bg-card/60">
                <TranscriptPanel video={selectedLecture} currentTime={currentTime} onSeek={handleSeek} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className={cn(
            "bg-border/30 transition-colors hover:bg-primary/20 data-[resize-handle-active]:bg-primary/40 [&>div]:border-border/50 [&>div]:bg-secondary/60 [&>div]:hover:bg-primary/30",
            isMaximized ? "!hidden" : ""
          )}
        />

        <ResizablePanel
          defaultSize={40}
          minSize={25}
          maxSize={65}
          className={cn("transition-all duration-300", isMaximized ? "!flex-[1_1_100%] !max-w-full" : "")}
        >
          <div className="flex h-full flex-col overflow-hidden bg-card/30">
            <Tabs defaultValue="mindmap" className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border/60 px-2 pt-2">
                <TabsList className="w-full bg-secondary/30 h-9 relative">
                  <TabsTrigger value="chat" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Instant Chat</span>
                    <span className="sm:hidden">Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Key Summary</span>
                    <span className="sm:hidden">Summary</span>
                  </TabsTrigger>
                  <TabsTrigger value="mindmap" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none relative">
                    <Network className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mind Map</span>
                    <span className="sm:hidden">Map</span>
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? "Restore view layout" : "Maximize study tools"}
                >
                  {isMaximized ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
              <TabsContent value="chat" className="flex-1 data-[state=active]:flex flex-col overflow-hidden mt-0">
                <ChatTab videoTitle={selectedLecture?.title} videoSubject={selectedLecture?.course} />
              </TabsContent>
              <TabsContent value="summary" className="flex-1 data-[state=active]:flex flex-col overflow-hidden mt-0">
                <SummaryTab videoTitle={selectedLecture?.title} videoSubject={selectedLecture?.course} />
              </TabsContent>
              <TabsContent value="mindmap" className="flex-1 data-[state=active]:flex flex-col overflow-hidden mt-0">
                <StudyMindMap videoTitle={selectedLecture?.title} videoSubject={selectedLecture?.course} />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

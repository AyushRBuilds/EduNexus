"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StudyMindMap } from "./study-mind-map"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface TranscriptSegment {
  id: number
  start: number   // seconds
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

const TOTAL_DURATION = 300 // 5 minutes

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
  "properties": "The key properties covered in this lecture are:\n1. Linearity: L{af(t) + bg(t)} = aF(s) + bG(s)\n2. Time-shifting: L{f(t-a)} = e^(-as)F(s)\n3. Differentiation: L{f'(t)} = sF(s) - f(0)\n4. Convolution: L{f*g} = F(s)G(s)\nEach property has practical applications in circuit analysis and control systems.",
  "circuit": "In circuit analysis, the Laplace Transform converts circuit differential equations (from KVL/KCL) into algebraic equations in the s-domain. Impedances become Z_R = R, Z_L = sL, Z_C = 1/(sC). The transfer function H(s) is a ratio of polynomials, and its poles determine the circuit's natural response.",
  "inverse": "The Inverse Laplace Transform recovers f(t) from F(s). The primary methods are:\n1. Partial fraction decomposition - break F(s) into simpler terms\n2. Table lookup - match each term to known transform pairs\n3. Convolution theorem - for products of transforms\n4. Complex contour integration (Bromwich integral) - for advanced cases",
}

const SUMMARY_SECTIONS = [
  {
    title: "Core Definition",
    items: [
      "L{f(t)} = F(s) = integral from 0 to infinity of e^(-st) f(t) dt",
      "Converts time-domain functions to complex frequency-domain (s-domain)",
      "s is a complex variable: s = sigma + j*omega",
    ],
  },
  {
    title: "Key Properties",
    items: [
      "Linearity: L{af(t) + bg(t)} = aF(s) + bG(s)",
      "Time-shifting: L{f(t-a)u(t-a)} = e^(-as)F(s)",
      "Differentiation: L{f'(t)} = sF(s) - f(0)",
      "Convolution: L{f*g(t)} = F(s)G(s)",
    ],
  },
  {
    title: "Applications Covered",
    items: [
      "RLC circuit analysis using impedance in s-domain",
      "Transfer function H(s) and pole analysis",
      "Solving ordinary differential equations (ODEs)",
      "Control system stability analysis",
    ],
  },
  {
    title: "Related Concepts",
    items: [
      "Inverse Laplace via partial fraction decomposition",
      "Connection to Fourier Transform (s = j*omega)",
      "Z-Transform for discrete-time signals (next lecture)",
    ],
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

/* ------------------------------------------------------------------ */
/*  Video Player                                                       */
/* ------------------------------------------------------------------ */

function VideoPlayer({
  currentTime,
  isPlaying,
  isMuted,
  onPlayPause,
  onMute,
  onSeek,
  onSkip,
}: {
  currentTime: number
  isPlaying: boolean
  isMuted: boolean
  onPlayPause: () => void
  onMute: () => void
  onSeek: (time: number) => void
  onSkip: (delta: number) => void
}) {
  const progressRef = useRef<HTMLDivElement>(null)

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onSeek(pct * TOTAL_DURATION)
  }

  const progress = (currentTime / TOTAL_DURATION) * 100

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Video area (simulated) */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0e1a]">
        {/* Simulated lecture visual */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Chalkboard / slide background */}
          <div className="absolute inset-4 rounded-lg border border-border/30 bg-[#0c1220]">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: "linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />

            {/* Lecture content */}
            <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8">
              <div className="flex items-center gap-3 text-primary/70">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs font-medium uppercase tracking-widest">EE301 - Signals & Systems</span>
              </div>

              <h2 className="text-center text-2xl font-bold text-foreground lg:text-3xl">
                Laplace Transform
              </h2>

              <div className="flex flex-col items-center gap-2">
                <p className="font-mono text-sm text-primary lg:text-base">
                  {'L{f(t)} = F(s) = '}
                </p>
                <p className="font-mono text-sm text-primary lg:text-base">
                  {'integral(0, inf) e^(-st) f(t) dt'}
                </p>
              </div>

              {/* Animated equation highlights based on time */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: "Linearity", active: currentTime >= 55 },
                  { label: "Time-Shift", active: currentTime >= 75 },
                  { label: "Differentiation", active: currentTime >= 95 },
                  { label: "Convolution", active: currentTime >= 210 },
                ].map((prop) => (
                  <span
                    key={prop.label}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-500",
                      prop.active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/30 bg-secondary/20 text-muted-foreground/40"
                    )}
                  >
                    {prop.label}
                  </span>
                ))}
              </div>

              {/* Professor name */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  VM
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/80">Prof. Vikram Menon</p>
                  <p className="text-[10px] text-muted-foreground">Dept. of Electrical Engineering</p>
                </div>
              </div>

              {/* Time indicator */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg bg-secondary/40 px-2.5 py-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                Lecture 14 of 28
              </div>
            </div>
          </div>
        </div>

        {/* Play/Pause overlay on click */}
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
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-1.5 border-t border-border bg-card/80 px-3 py-2 backdrop-blur-sm">
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="group relative h-1.5 w-full cursor-pointer rounded-full bg-secondary"
          onClick={handleProgressClick}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={TOTAL_DURATION}
          aria-valuenow={Math.floor(currentTime)}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all group-hover:h-2 group-hover:-top-[1px]"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
            style={{ left: `calc(${progress}% - 7px)` }}
          />
        </div>

        {/* Buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60" onClick={() => onSkip(-10)} aria-label="Rewind 10s">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-secondary/60" onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" fill="currentColor" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60" onClick={() => onSkip(10)} aria-label="Forward 10s">
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60" onClick={onMute} aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <span className="ml-2 text-xs tabular-nums text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button className="rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors">
              1x
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60" aria-label="Settings">
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60" aria-label="Fullscreen">
              <Maximize className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Transcript                                                         */
/* ------------------------------------------------------------------ */

function TranscriptPanel({
  currentTime,
  onSeek,
}: {
  currentTime: number
  onSeek: (time: number) => void
}) {
  const activeRef = useRef<HTMLButtonElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const activeSegmentId = TRANSCRIPT.find(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  )?.id

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [activeSegmentId])

  return (
    <div className="flex flex-col border-t border-border bg-card/60">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-xs font-semibold text-foreground">Transcript</h3>
        </div>
        <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          Auto-scroll
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <ScrollArea className="h-[200px] lg:h-[240px]" ref={scrollAreaRef}>
        <div className="flex flex-col gap-0.5 p-2">
          {TRANSCRIPT.map((seg) => {
            const isActive = seg.id === activeSegmentId
            const isPast = currentTime > seg.end
            return (
              <button
                key={seg.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => onSeek(seg.start)}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2 text-left transition-all",
                  isActive
                    ? "bg-primary/10 ring-1 ring-primary/20"
                    : "hover:bg-secondary/40",
                )}
              >
                <span className={cn(
                  "mt-0.5 shrink-0 text-[10px] tabular-nums font-mono",
                  isActive ? "text-primary font-semibold" : isPast ? "text-muted-foreground/50" : "text-muted-foreground"
                )}>
                  {formatTime(seg.start)}
                </span>
                <p className={cn(
                  "text-xs leading-relaxed",
                  isActive ? "text-foreground font-medium" : isPast ? "text-muted-foreground/60" : "text-secondary-foreground"
                )}>
                  {seg.text}
                </p>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Chat Tab                                                           */
/* ------------------------------------------------------------------ */

function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const handleSend = useCallback(() => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { id: Date.now(), role: "user", text: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    const lower = input.toLowerCase()
    let response = AI_RESPONSES.default
    if (lower.includes("definition") || lower.includes("what is")) response = AI_RESPONSES.definition
    else if (lower.includes("propert")) response = AI_RESPONSES.properties
    else if (lower.includes("circuit") || lower.includes("rlc")) response = AI_RESPONSES.circuit
    else if (lower.includes("inverse")) response = AI_RESPONSES.inverse

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "ai", text: response }])
      setIsTyping(false)
    }, 1200)
  }, [input])

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary/60 text-secondary-foreground rounded-bl-md"
              )}>
                {msg.role === "ai" && (
                  <span className="mb-1 block text-[10px] font-semibold text-primary">EduNexus AI</span>
                )}
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-secondary/60 px-4 py-3 rounded-bl-md">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
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
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground/50 text-center">
          AI responses are based on lecture content
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Summary Tab                                                        */
/* ------------------------------------------------------------------ */

function SummaryTab() {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-5 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <FileText className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Lecture Summary</h3>
            <p className="text-[10px] text-muted-foreground">Auto-generated from transcript</p>
          </div>
        </div>

        {SUMMARY_SECTIONS.map((section) => (
          <div key={section.title} className="rounded-xl border border-border/60 bg-secondary/15 p-3.5">
            <h4 className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-primary/80">
              {section.title}
            </h4>
            <ul className="flex flex-col gap-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-secondary-foreground leading-relaxed">
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                  <span className="font-mono text-[11px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="rounded-xl border border-border/40 bg-primary/5 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-[10px] font-semibold text-primary/70">Study Tip</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Practice solving at least 3 ODE problems using Laplace Transforms before the next lecture. Focus on partial fraction decomposition for the inverse transform.
          </p>
        </div>
      </div>
    </ScrollArea>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Study Workspace                                               */
/* ------------------------------------------------------------------ */

export function StudyWorkspace({ onBack }: { onBack: () => void }) {
  const [currentTime, setCurrentTime] = useState(42)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Play/Pause timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false)
            return TOTAL_DURATION
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(TOTAL_DURATION, time)))
  }, [])

  const handleSkip = useCallback((delta: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(TOTAL_DURATION, prev + delta)))
  }, [])

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Study Mode Header */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card/40 px-4 py-2.5 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          onClick={onBack}
          aria-label="Back to main view"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15">
            <BookOpen className="h-3 w-3 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground leading-none">EE301 - Laplace Transform</span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">Lecture 14 &middot; Prof. Vikram Menon</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary sm:block">
            Study Mode
          </span>
        </div>
      </div>

      {/* Split-screen content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Panel — Video + Transcript (60%) */}
        <div className="flex w-full flex-col overflow-hidden lg:w-[60%] border-r border-border/40">
          <div className="flex-1 overflow-y-auto p-4">
            <VideoPlayer
              currentTime={currentTime}
              isPlaying={isPlaying}
              isMuted={isMuted}
              onPlayPause={() => setIsPlaying((p) => !p)}
              onMute={() => setIsMuted((m) => !m)}
              onSeek={handleSeek}
              onSkip={handleSkip}
            />
          </div>
          <TranscriptPanel currentTime={currentTime} onSeek={handleSeek} />
        </div>

        {/* Right Panel — AI Sidebar (40%) */}
        <div className="flex w-full flex-col overflow-hidden bg-card/30 lg:w-[40%]">
          <Tabs defaultValue="mindmap" className="flex h-full flex-col">
            <div className="border-b border-border/60 px-2 pt-2">
              <TabsList className="w-full bg-secondary/30 h-9">
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
                  {/* Glow indicator for Mind Map when active */}
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
              <ChatTab />
            </TabsContent>

            <TabsContent value="summary" className="flex-1 overflow-hidden mt-0">
              <SummaryTab />
            </TabsContent>

            <TabsContent value="mindmap" className="flex-1 overflow-hidden mt-0">
              <StudyMindMap />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

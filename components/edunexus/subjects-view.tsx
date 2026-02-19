"use client"

import { useState, useCallback, useEffect } from "react"
import {
  BookOpen,
  FlaskConical,
  ArrowLeft,
  FileText,
  HelpCircle,
  Download,
  ChevronRight,
  Plus,
  Trash2,
  GraduationCap,
  Clock,
  BarChart3,
  Users,
  Star,
  AlertTriangle,
  Loader2,
  Bot,
  Send,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UserRole } from "./auth-context"
import { useAuth } from "./auth-context"
import { getSubjects, getMaterials } from "@/lib/api/academic.service"
import { aiExplain } from "@/lib/api/ai.service"
import { downloadMaterial, downloadAllMaterials } from "@/lib/api/download"
import { MaterialViewer } from "./material-viewer"
import type {
  BackendSubject,
  BackendMaterial,
  AIExplainResponse,
} from "@/lib/api/types"

/* -------- Types -------- */
interface Paper {
  id: string
  label: string
  year: number
  semester: string
  difficulty: "Easy" | "Medium" | "Hard"
  pages: number
}

interface QuestionTopic {
  id: string
  topic: string
  questionCount: number
  difficulty: "Easy" | "Medium" | "Hard"
  lastUpdated: string
}

interface Subject {
  id: string
  backendId?: number
  name: string
  code: string
  category: "theory" | "lab"
  semester: number
  credits: number
  instructor: string
  students: number
  rating: number
  color: string
  papers: Paper[]
  questionTopics: QuestionTopic[]
}

/* -------- Fallback Data -------- */
const FALLBACK_SUBJECTS: Subject[] = [
  {
    id: "am3",
    name: "Applied Mathematics III",
    code: "MATH301",
    category: "theory",
    semester: 3,
    credits: 4,
    instructor: "Prof. Vikram Menon",
    students: 320,
    rating: 4.5,
    color: "from-sky-500/20 to-blue-600/20 border-sky-500/30",
    papers: [
      { id: "p1", label: "End Semester 2024", year: 2024, semester: "Even", difficulty: "Hard", pages: 8 },
      { id: "p2", label: "Mid Semester 2024", year: 2024, semester: "Even", difficulty: "Medium", pages: 4 },
    ],
    questionTopics: [
      { id: "q1", topic: "Laplace Transforms", questionCount: 25, difficulty: "Hard", lastUpdated: "Dec 2024" },
      { id: "q2", topic: "Fourier Series", questionCount: 20, difficulty: "Medium", lastUpdated: "Nov 2024" },
    ],
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    code: "CS201",
    category: "theory",
    semester: 3,
    credits: 4,
    instructor: "Dr. Priya Nair",
    students: 290,
    rating: 4.7,
    color: "from-emerald-500/20 to-green-600/20 border-emerald-500/30",
    papers: [
      { id: "p6", label: "End Semester 2024", year: 2024, semester: "Even", difficulty: "Hard", pages: 10 },
    ],
    questionTopics: [
      { id: "q6", topic: "Binary Trees & BST", questionCount: 30, difficulty: "Medium", lastUpdated: "Dec 2024" },
    ],
  },
]

const SUBJECT_COLORS = [
  "from-sky-500/20 to-blue-600/20 border-sky-500/30",
  "from-emerald-500/20 to-green-600/20 border-emerald-500/30",
  "from-amber-500/20 to-orange-600/20 border-amber-500/30",
  "from-rose-500/20 to-pink-600/20 border-rose-500/30",
  "from-teal-500/20 to-cyan-600/20 border-teal-500/30",
]

function mapBackendSubjectToFrontend(
  subj: BackendSubject,
  index: number
): Subject {
  return {
    id: `backend-${subj.id}`,
    backendId: subj.id,
    name: subj.name,
    code: `${subj.department.slice(0, 3).toUpperCase()}${subj.semester}0${index + 1}`,
    category: "theory",
    semester: subj.semester,
    credits: 3,
    instructor: subj.department,
    students: 0,
    rating: 0,
    color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
    papers: [],
    questionTopics: [],
  }
}

/* -------- Difficulty Badge -------- */
function DifficultyBadge({ difficulty }: { difficulty: "Easy" | "Medium" | "Hard" }) {
  const styles = {
    Easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    Hard: "bg-red-500/15 text-red-400 border-red-500/20",
  }
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", styles[difficulty])}>
      {difficulty}
    </Badge>
  )
}

/* -------- Star Rating -------- */
function StarRating({ rating }: { rating: number }) {
  if (rating === 0) return <span className="text-[11px] text-muted-foreground">No ratings yet</span>
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : i < rating
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1 text-[11px] text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

/* -------- Subject Card -------- */
function SubjectCard({
  subject,
  onClick,
  isAdmin,
  onDelete,
}: {
  subject: Subject
  onClick: () => void
  isAdmin: boolean
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        "group relative glass rounded-xl p-4 cursor-pointer transition-all duration-300",
        "hover:glow-sm hover:scale-[1.01] hover:border-primary/20",
        "border border-border/30"
      )}
      onClick={onClick}
    >
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute top-3 right-3 h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 z-10"
          title="Remove subject"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </button>
      )}

      <div className={cn("absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r", subject.color)} />

      <div className="flex items-start gap-3 mt-1">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", subject.color)}>
          {subject.category === "theory" ? (
            <BookOpen className="h-5 w-5 text-foreground/80" />
          ) : (
            <FlaskConical className="h-5 w-5 text-foreground/80" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                {subject.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {subject.code} &middot; Sem {subject.semester} &middot; {subject.credits} Credits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2.5">
            <StarRating rating={subject.rating} />
          </div>

          <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {subject.instructor}
            </span>
            {subject.students > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {subject.students}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-[10px] bg-secondary/30 border-border/40 text-muted-foreground gap-1">
              <FileText className="h-2.5 w-2.5" />
              {subject.papers.length} Papers
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-secondary/30 border-border/40 text-muted-foreground gap-1">
              <HelpCircle className="h-2.5 w-2.5" />
              {subject.questionTopics.reduce((sum, t) => sum + t.questionCount, 0)} Questions
            </Badge>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-1 shrink-0" />
      </div>
    </div>
  )
}

/* -------- Subject Detail View (with Materials + AI) -------- */
function SubjectDetail({
  subject,
  onBack,
}: {
  subject: Subject
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState<"papers" | "questions" | "materials" | "ai">(
    subject.backendId ? "materials" : "papers"
  )
  const [materials, setMaterials] = useState<BackendMaterial[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [materialsError, setMaterialsError] = useState<string | null>(null)

  // AI state
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiResponse, setAiResponse] = useState<AIExplainResponse | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (subject.backendId) {
      setMaterialsLoading(true)
      getMaterials(subject.backendId)
        .then((data) => {
          setMaterials(data)
          setMaterialsError(null)
        })
        .catch((err) => {
          setMaterialsError(err instanceof Error ? err.message : "Failed to load materials")
        })
        .finally(() => setMaterialsLoading(false))
    }
  }, [subject.backendId])

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !subject.backendId) return
    setAiLoading(true)
    setAiResponse(null)
    try {
      const response = await aiExplain(aiQuestion, subject.backendId)
      setAiResponse(response)
    } catch (err) {
      setAiResponse({
        error: err instanceof Error ? err.message : "AI service unavailable",
      })
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Subjects
      </button>

      <div className="glass rounded-xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", subject.color)}>
            {subject.category === "theory" ? (
              <BookOpen className="h-7 w-7 text-foreground/80" />
            ) : (
              <FlaskConical className="h-7 w-7 text-foreground/80" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground text-balance">{subject.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {subject.code} &middot; Semester {subject.semester} &middot; {subject.credits} Credits
            </p>
            <div className="flex items-center gap-4 mt-2">
              <StarRating rating={subject.rating} />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {subject.instructor}
              </span>
              {subject.students > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {subject.students} students
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {subject.backendId && (
          <>
            <button
              onClick={() => setActiveTab("materials")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                activeTab === "materials"
                  ? "bg-primary/15 text-primary glow-sm"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Materials
              <Badge variant="outline" className="ml-1 text-[10px] border-primary/20 bg-primary/10 text-primary">
                {materials.length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                activeTab === "ai"
                  ? "bg-primary/15 text-primary glow-sm"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Bot className="h-4 w-4" />
              Ask AI
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab("papers")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
            activeTab === "papers"
              ? "bg-primary/15 text-primary glow-sm"
              : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
        >
          <FileText className="h-4 w-4" />
          Previous Year Papers
          <Badge variant="outline" className="ml-1 text-[10px] border-primary/20 bg-primary/10 text-primary">
            {subject.papers.length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
            activeTab === "questions"
              ? "bg-primary/15 text-primary glow-sm"
              : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
        >
          <HelpCircle className="h-4 w-4" />
          Question Bank
          <Badge variant="outline" className="ml-1 text-[10px] border-primary/20 bg-primary/10 text-primary">
            {subject.questionTopics.length}
          </Badge>
        </button>
      </div>

      {/* Materials list (from backend) */}
      {activeTab === "materials" && (
        <div className="space-y-2">
          {/* Download All button */}
          {!materialsLoading && !materialsError && materials.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                {materials.length} material{materials.length !== 1 ? "s" : ""} available
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs border-primary/20 text-primary hover:bg-primary/10"
                onClick={() => downloadAllMaterials(materials)}
              >
                <Download className="h-3.5 w-3.5" />
                Download All
              </Button>
            </div>
          )}
          {materialsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading materials...</span>
            </div>
          )}
          {materialsError && (
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-sm text-red-400">{materialsError}</p>
            </div>
          )}
          {!materialsLoading && !materialsError && materials.length === 0 && (
            <div className="glass rounded-xl p-8 flex flex-col items-center gap-2 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No materials uploaded yet for this subject</p>
            </div>
          )}
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="glass rounded-xl p-4 flex items-start gap-4 hover:border-primary/20 transition-all group cursor-pointer"
              onClick={() => setViewerMaterial(mat)}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">
                  {mat.description || mat.filePath}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-400 border-sky-500/20">
                    {mat.type}
                  </Badge>
                  {mat.filePath && (
                    <span className="truncate max-w-[200px]">{mat.filePath}</span>
                  )}
                </div>
                {mat.content && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {mat.content}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                  onClick={(e) => { e.stopPropagation(); setViewerMaterial(mat) }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                  onClick={(e) => { e.stopPropagation(); downloadMaterial(mat) }}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Ask tab */}
      {activeTab === "ai" && subject.backendId && (
        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Ask AI about {subject.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Ask any question and the AI will answer using the materials uploaded for this subject (RAG-based).
            </p>
            <div className="flex gap-2">
              <Input
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                placeholder={`e.g. Explain linked lists from ${subject.name}`}
                className="bg-secondary/30 border-border/40 flex-1"
              />
              <Button
                onClick={handleAskAI}
                disabled={aiLoading || !aiQuestion.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Ask
              </Button>
            </div>
          </div>

          {aiResponse && (
            <div className="glass rounded-xl p-5">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                AI Response
              </h4>
              {aiResponse.error && (
                <p className="text-sm text-red-400">{aiResponse.error}</p>
              )}
              {aiResponse.message && (
                <div>
                  <p className="text-sm text-muted-foreground">{aiResponse.message}</p>
                  {aiResponse.scholarLink && (
                    <a
                      href={aiResponse.scholarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Search on Google Scholar
                    </a>
                  )}
                </div>
              )}
              {aiResponse.answer && (
                <p className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
                  {aiResponse.answer}
                </p>
              )}
              {/* Handle HuggingFace raw response (could be array or string) */}
              {!aiResponse.answer && !aiResponse.message && !aiResponse.error && (
                <p className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
                  {typeof aiResponse === "string"
                    ? aiResponse
                    : JSON.stringify(aiResponse, null, 2)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Papers list */}
      {activeTab === "papers" && (
        <div className="space-y-2">
          {subject.papers.map((paper) => (
            <div
              key={paper.id}
              className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary/20 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">{paper.label}</h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {paper.semester} Sem {paper.year}
                  </span>
                  <span>{paper.pages} pages</span>
                </div>
              </div>
              <DifficultyBadge difficulty={paper.difficulty} />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
            </div>
          ))}
          {subject.papers.length === 0 && (
            <div className="glass rounded-xl p-8 flex flex-col items-center gap-2 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No papers available</p>
            </div>
          )}
        </div>
      )}

      {/* Question bank */}
      {activeTab === "questions" && (
        <div className="space-y-2">
          {subject.questionTopics.map((topic) => (
            <div
              key={topic.id}
              className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary/20 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <HelpCircle className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">{topic.topic}</h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {topic.questionCount} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {topic.lastUpdated}
                  </span>
                </div>
              </div>
              <DifficultyBadge difficulty={topic.difficulty} />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                View
              </Button>
            </div>
          ))}
          {subject.questionTopics.length === 0 && (
            <div className="glass rounded-xl p-8 flex flex-col items-center gap-2 text-center">
              <HelpCircle className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No questions available</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* -------- Add Subject Dialog -------- */
function AddSubjectDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdd: (subject: Subject) => void
}) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [category, setCategory] = useState<"theory" | "lab">("theory")
  const [semester, setSemester] = useState("3")
  const [credits, setCredits] = useState("3")
  const [instructor, setInstructor] = useState("")

  const handleAdd = () => {
    if (!name.trim() || !code.trim() || !instructor.trim()) return

    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category,
      semester: parseInt(semester),
      credits: parseInt(credits),
      instructor: instructor.trim(),
      students: 0,
      rating: 0,
      color: SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)],
      papers: [],
      questionTopics: [],
    }

    onAdd(newSubject)
    setName("")
    setCode("")
    setCategory("theory")
    setSemester("3")
    setCredits("3")
    setInstructor("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/40 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Subject
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Subject Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Networks"
              className="bg-secondary/30 border-border/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Course Code</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS401"
                className="bg-secondary/30 border-border/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={category} onValueChange={(v: "theory" | "lab") => setCategory(v)}>
                <SelectTrigger className="bg-secondary/30 border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="lab">Practical Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Semester</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="bg-secondary/30 border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Credits</label>
              <Select value={credits} onValueChange={setCredits}>
                <SelectTrigger className="bg-secondary/30 border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((c) => (
                    <SelectItem key={c} value={String(c)}>{c} Credits</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Instructor</label>
            <Input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="e.g. Dr. Priya Nair"
              className="bg-secondary/30 border-border/40"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!name.trim() || !code.trim() || !instructor.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* -------- Delete Confirm Dialog -------- */
function DeleteConfirmDialog({
  open,
  onOpenChange,
  subject,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  subject: Subject | null
  onConfirm: () => void
}) {
  if (!subject) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/40 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remove Subject
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to remove <span className="font-medium text-foreground">{subject.name}</span> ({subject.code})?
          This will remove all associated papers and question banks.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-destructive !text-white hover:bg-destructive/90 font-semibold gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ================================================================
   Main Export
   ================================================================ */
export function SubjectsView({ userRole }: { userRole: UserRole }) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>(FALLBACK_SUBJECTS)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [backendError, setBackendError] = useState<string | null>(null)
  const [viewerMaterial, setViewerMaterial] = useState<BackendMaterial | null>(null)
  
  const isAdmin = userRole === "admin"

  // Fetch subjects from backend
  useEffect(() => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    setLoading(true)
    getSubjects(user.email)
      .then((backendSubjects) => {
        if (backendSubjects.length > 0) {
          const mapped = backendSubjects.map((s, i) =>
            mapBackendSubjectToFrontend(s, i)
          )
          setSubjects(mapped)
        }
        // If backend returns empty, keep fallback subjects
        setBackendError(null)
      })
      .catch((err) => {
        console.warn("[EduNexus] Could not fetch subjects from backend, using fallback:", err)
        setBackendError("Using offline data - backend not connected")
      })
      .finally(() => setLoading(false))
  }, [user?.email])

  const theorySubjects = subjects.filter((s) => s.category === "theory")
  const labSubjects = subjects.filter((s) => s.category === "lab")

  const handleAdd = useCallback((subject: Subject) => {
    setSubjects((prev) => [...prev, subject])
  }, [])

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return
    setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleteDialogOpen(false)
  }, [deleteTarget])

  // Detail view
  if (selectedSubject) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <SubjectDetail
          subject={selectedSubject}
          onBack={() => setSelectedSubject(null)}
        />
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Subjects
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse courses, access previous year papers, and question banks
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        )}
      </div>

      {/* Connection status */}
      {backendError && (
        <div className="mb-4 glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-amber-400 border border-amber-500/20 bg-amber-500/5">
          <AlertTriangle className="h-3.5 w-3.5" />
          {backendError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading subjects...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-4 mb-6 glass rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-medium text-foreground">{theorySubjects.length}</span> Theory
            </div>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FlaskConical className="h-3.5 w-3.5 text-violet-400" />
              <span className="font-medium text-foreground">{labSubjects.length}</span> Practical Labs
            </div>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium text-foreground">
                {subjects.reduce((sum, s) => sum + s.papers.length, 0)}
              </span> Total Papers
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-280px)]">
            {/* Theory Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-sky-500/15 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Theory Courses</h3>
                <span className="text-xs text-muted-foreground ml-1">({theorySubjects.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {theorySubjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onClick={() => setSelectedSubject(subject)}
                    isAdmin={isAdmin}
                    onDelete={() => {
                      setDeleteTarget(subject)
                      setDeleteDialogOpen(true)
                    }}
                  />
                ))}
                {theorySubjects.length === 0 && (
                  <div className="col-span-2 glass rounded-xl p-8 flex flex-col items-center gap-2 text-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No theory courses added yet</p>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAddDialogOpen(true)}
                        className="text-primary text-xs mt-1"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add one
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Practical Labs Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <FlaskConical className="h-4 w-4 text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Practical Labs</h3>
                <span className="text-xs text-muted-foreground ml-1">({labSubjects.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {labSubjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onClick={() => setSelectedSubject(subject)}
                    isAdmin={isAdmin}
                    onDelete={() => {
                      setDeleteTarget(subject)
                      setDeleteDialogOpen(true)
                    }}
                  />
                ))}
                {labSubjects.length === 0 && (
                  <div className="col-span-2 glass rounded-xl p-8 flex flex-col items-center gap-2 text-center">
                    <FlaskConical className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No lab courses added yet</p>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAddDialogOpen(true)}
                        className="text-primary text-xs mt-1"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add one
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </>
      )}

      {/* Admin dialogs */}
      <AddSubjectDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAdd}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        subject={deleteTarget}
        onConfirm={handleDelete}
      />

      {/* In-app material viewer */}
      <MaterialViewer
        material={viewerMaterial}
        open={!!viewerMaterial}
        onClose={() => setViewerMaterial(null)}
      />
    </section>
  )
}

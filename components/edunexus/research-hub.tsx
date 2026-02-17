"use client"

import { useState, useMemo } from "react"
import {
  BookOpen,
  Search,
  ExternalLink,
  Download,
  FileText,
  GraduationCap,
  Building2,
  Calendar,
  Users,
  Star,
  Filter,
  SortAsc,
  ChevronDown,
  Eye,
  Quote,
  ArrowUpRight,
  Tag,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { EduNexusLogo } from "./edunexus-logo"

/* ---------- Types ---------- */
type Department =
  | "All"
  | "Computer Science"
  | "Electrical Engineering"
  | "Mechanical Engineering"
  | "Civil Engineering"
  | "Physics"
  | "Mathematics"
  | "Chemistry"

type AuthorType = "faculty" | "alumni" | "student"

interface ResearchPaper {
  id: string
  title: string
  abstract: string
  authors: { name: string; type: AuthorType }[]
  department: Department
  year: number
  journal: string
  citations: number
  downloads: number
  views: number
  tags: string[]
  doi?: string
  pdfUrl?: string
  featured?: boolean
}

/* ---------- Mock data ---------- */
const ALL_DEPARTMENTS: Department[] = [
  "All",
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Physics",
  "Mathematics",
  "Chemistry",
]

const PAPERS: ResearchPaper[] = [
  {
    id: "p1",
    title: "Deep Reinforcement Learning for Autonomous Traffic Management in Smart Cities",
    abstract:
      "This paper proposes a novel deep reinforcement learning framework for real-time traffic signal optimization. Experimental results on simulated urban networks show a 35% improvement in average travel time compared to conventional adaptive controllers.",
    authors: [
      { name: "Dr. Priya Nair", type: "faculty" },
      { name: "Aarav Sharma", type: "student" },
    ],
    department: "Computer Science",
    year: 2025,
    journal: "IEEE Transactions on Intelligent Transportation Systems",
    citations: 18,
    downloads: 142,
    views: 890,
    tags: ["Deep Learning", "Reinforcement Learning", "Smart City", "Traffic"],
    doi: "10.1109/TITS.2025.3041234",
    pdfUrl: "#",
    featured: true,
  },
  {
    id: "p2",
    title: "Energy-Efficient IoT Sensor Networks Using Adaptive Duty Cycling",
    abstract:
      "We present an adaptive duty-cycling scheme for IoT sensor nodes that reduces energy consumption by 42% while maintaining 98% event detection rate. Field trials in an industrial monitoring environment validate the proposed approach.",
    authors: [
      { name: "Prof. A. Mehta", type: "faculty" },
      { name: "Ravi Deshmukh", type: "alumni" },
    ],
    department: "Electrical Engineering",
    year: 2025,
    journal: "Elsevier - Journal of Network and Computer Applications",
    citations: 9,
    downloads: 88,
    views: 534,
    tags: ["IoT", "Energy Efficiency", "Sensor Networks", "Industry 4.0"],
    doi: "10.1016/j.jnca.2025.102345",
    pdfUrl: "#",
  },
  {
    id: "p3",
    title: "Blockchain-Based Tamper-Proof Academic Credential Verification System",
    abstract:
      "A decentralized system for academic credential verification using Ethereum smart contracts. The system ensures immutability and transparency of academic records, reducing verification time from days to seconds.",
    authors: [
      { name: "Aarav Sharma", type: "student" },
      { name: "Dr. R. Kulkarni", type: "faculty" },
    ],
    department: "Computer Science",
    year: 2024,
    journal: "Springer - Blockchain: Research and Applications",
    citations: 7,
    downloads: 210,
    views: 1240,
    tags: ["Blockchain", "EdTech", "Security", "Smart Contracts"],
    doi: "10.1007/s42979-024-02891",
    pdfUrl: "#",
    featured: true,
  },
  {
    id: "p4",
    title: "Topology Optimization of Lattice Structures for Additive Manufacturing",
    abstract:
      "This research investigates multi-scale topology optimization methods for lattice structures fabricated via selective laser melting. Experimental compression tests confirm a 28% improvement in specific stiffness.",
    authors: [
      { name: "Prof. V. Patil", type: "faculty" },
      { name: "Sneha Joshi", type: "alumni" },
    ],
    department: "Mechanical Engineering",
    year: 2024,
    journal: "Additive Manufacturing",
    citations: 14,
    downloads: 76,
    views: 412,
    tags: ["Additive Manufacturing", "Topology Optimization", "Materials", "3D Printing"],
    pdfUrl: "#",
  },
  {
    id: "p5",
    title: "NLP-Driven Sentiment Analysis for Regional Language Social Media",
    abstract:
      "A transformer-based sentiment analysis model fine-tuned for Hindi and Marathi social media text. The model achieves 89.2% accuracy on a newly curated benchmark dataset of 50,000 labeled posts.",
    authors: [
      { name: "Prof. S. Iyer", type: "faculty" },
      { name: "Neha Patel", type: "student" },
      { name: "Ankit Gupta", type: "alumni" },
    ],
    department: "Computer Science",
    year: 2025,
    journal: "ACL Findings",
    citations: 22,
    downloads: 305,
    views: 1680,
    tags: ["NLP", "Sentiment Analysis", "Deep Learning", "Regional Languages"],
    doi: "10.18653/v1/2025.findings-acl.123",
    pdfUrl: "#",
    featured: true,
  },
  {
    id: "p6",
    title: "Seismic Retrofitting of RC Structures Using FRP Composites: A Comparative Study",
    abstract:
      "Comparative analysis of carbon-fiber and glass-fiber reinforced polymer wrapping techniques for seismic retrofitting of reinforced-concrete columns. Push-over analyses validate improvement in ductility by up to 40%.",
    authors: [
      { name: "Dr. M. Rao", type: "faculty" },
      { name: "Vikram Singh", type: "alumni" },
    ],
    department: "Civil Engineering",
    year: 2023,
    journal: "Engineering Structures",
    citations: 31,
    downloads: 189,
    views: 920,
    tags: ["Structural Engineering", "FRP", "Seismic", "Retrofitting"],
    pdfUrl: "#",
  },
  {
    id: "p7",
    title: "Quantum Error Correction Codes for Noisy Intermediate-Scale Quantum Devices",
    abstract:
      "We develop surface-code error correction strategies optimized for NISQ-era processors and demonstrate their effectiveness on IBM Quantum hardware with up to 27 qubits.",
    authors: [
      { name: "Dr. R. Desai", type: "faculty" },
      { name: "Arjun Naik", type: "student" },
    ],
    department: "Physics",
    year: 2024,
    journal: "Physical Review A",
    citations: 12,
    downloads: 67,
    views: 380,
    tags: ["Quantum Computing", "Error Correction", "NISQ", "Qubits"],
    doi: "10.1103/PhysRevA.109.042312",
    pdfUrl: "#",
  },
  {
    id: "p8",
    title: "Stochastic Differential Equations in Mathematical Finance: New Approaches",
    abstract:
      "Novel numerical schemes for solving SDEs arising in financial derivative pricing. The proposed methods show superior convergence rates compared to classical Euler-Maruyama schemes for jump-diffusion models.",
    authors: [
      { name: "Prof. K. Rajan", type: "faculty" },
    ],
    department: "Mathematics",
    year: 2024,
    journal: "SIAM Journal on Financial Mathematics",
    citations: 8,
    downloads: 54,
    views: 290,
    tags: ["Stochastic Analysis", "Financial Mathematics", "SDEs", "Numerical Methods"],
    pdfUrl: "#",
  },
  {
    id: "p9",
    title: "Green Synthesis of Nanoparticles Using Plant Extracts: A Sustainable Approach",
    abstract:
      "This paper reviews the eco-friendly synthesis of silver and gold nanoparticles using various plant extracts. Characterization via XRD, SEM, and TEM confirms stable nanoparticle formation with potential antimicrobial applications.",
    authors: [
      { name: "Dr. L. Deshmukh", type: "faculty" },
      { name: "Pooja Kamble", type: "alumni" },
    ],
    department: "Chemistry",
    year: 2023,
    journal: "Journal of Cleaner Production",
    citations: 45,
    downloads: 320,
    views: 2100,
    tags: ["Nanotechnology", "Green Chemistry", "Nanoparticles", "Sustainability"],
    pdfUrl: "#",
    featured: true,
  },
  {
    id: "p10",
    title: "Piezoelectric Energy Harvesting from Ambient Vibrations in Bridge Structures",
    abstract:
      "Design and optimization of a piezoelectric cantilever array for harvesting ambient vibration energy from highway bridges. Field deployment generated sustained power output of 2.3 mW, sufficient for wireless sensor operation.",
    authors: [
      { name: "Dr. M. Kulkarni", type: "faculty" },
      { name: "Rahul Verma", type: "student" },
    ],
    department: "Mechanical Engineering",
    year: 2025,
    journal: "Smart Materials and Structures",
    citations: 5,
    downloads: 48,
    views: 310,
    tags: ["Energy Harvesting", "Piezoelectric", "Smart Structures", "Vibrations"],
    doi: "10.1088/1361-665X/2025/012003",
    pdfUrl: "#",
  },
]

/* ---------- Author badge colors ---------- */
const authorColors: Record<AuthorType, { text: string; bg: string }> = {
  faculty: { text: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
  student: { text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  alumni: { text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
}

const sortOptions = [
  { id: "citations", label: "Most Cited" },
  { id: "downloads", label: "Most Downloaded" },
  { id: "views", label: "Most Viewed" },
  { id: "year", label: "Newest First" },
] as const

type SortBy = (typeof sortOptions)[number]["id"]

/* ---------- Paper Detail View ---------- */
function PaperDetail({ paper, onBack }: { paper: ResearchPaper; onBack: () => void }) {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
        Back to Research Hub
      </button>

      <div className="glass rounded-2xl p-6 glow-sm">
        {/* Title */}
        <h1 className="text-xl font-bold text-foreground leading-snug">{paper.title}</h1>

        {/* Authors */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {paper.authors.map((a) => {
            const c = authorColors[a.type]
            return (
              <Badge key={a.name} variant="outline" className={`${c.bg} ${c.text} text-xs gap-1`}>
                {a.type === "faculty" ? (
                  <BookOpen className="h-3 w-3" />
                ) : a.type === "alumni" ? (
                  <GraduationCap className="h-3 w-3" />
                ) : (
                  <Users className="h-3 w-3" />
                )}
                {a.name}
                <span className="opacity-60 text-[10px] capitalize">({a.type})</span>
              </Badge>
            )
          })}
        </div>

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {paper.department}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {paper.year}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {paper.journal}
          </span>
        </div>

        <Separator className="my-5 bg-border/30" />

        {/* Abstract */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Abstract</h3>
          <p className="text-sm leading-relaxed text-secondary-foreground">{paper.abstract}</p>
        </div>

        {/* Tags */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {paper.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] text-primary"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>

        <Separator className="my-5 bg-border/30" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-lg border border-border/30 bg-secondary/15 p-3">
            <Quote className="h-4 w-4 text-sky-400 mb-1" />
            <span className="text-lg font-bold text-foreground">{paper.citations}</span>
            <span className="text-[10px] text-muted-foreground">Citations</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-border/30 bg-secondary/15 p-3">
            <Download className="h-4 w-4 text-emerald-400 mb-1" />
            <span className="text-lg font-bold text-foreground">{paper.downloads}</span>
            <span className="text-[10px] text-muted-foreground">Downloads</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-border/30 bg-secondary/15 p-3">
            <Eye className="h-4 w-4 text-amber-400 mb-1" />
            <span className="text-lg font-bold text-foreground">{paper.views}</span>
            <span className="text-[10px] text-muted-foreground">Views</span>
          </div>
        </div>

        {/* DOI + Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              DOI: {paper.doi}
            </a>
          )}
          {paper.pdfUrl && (
            <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Paper Card ---------- */
function PaperCard({
  paper,
  onSelect,
}: {
  paper: ResearchPaper
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="glass group text-left rounded-xl p-5 transition-all hover:border-primary/30 hover:glow-sm w-full"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {paper.title}
        </h4>
        {paper.featured && (
          <Badge variant="outline" className="shrink-0 border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] gap-1">
            <Star className="h-2.5 w-2.5 fill-amber-400" />
            Featured
          </Badge>
        )}
      </div>

      <p className="text-xs text-secondary-foreground leading-relaxed line-clamp-2 mb-3">
        {paper.abstract}
      </p>

      {/* Authors */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {paper.authors.map((a) => {
          const c = authorColors[a.type]
          return (
            <span key={a.name} className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] ${c.bg} ${c.text}`}>
              {a.name}
              <span className="opacity-60 capitalize">({a.type})</span>
            </span>
          )
        })}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {paper.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md bg-primary/8 px-2 py-0.5 text-[10px] text-primary/80">
            {tag}
          </span>
        ))}
        {paper.tags.length > 3 && (
          <span className="text-[10px] text-muted-foreground">+{paper.tags.length - 3} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {paper.department}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {paper.year}
          </span>
          <span className="flex items-center gap-1">
            <Quote className="h-3 w-3" />
            {paper.citations}
          </span>
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
    </button>
  )
}

/* ---------- Google Scholar Fallback ---------- */
function GoogleScholarFallback({ query }: { query: string }) {
  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`

  return (
    <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-5">
        <EduNexusLogo size={36} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">
        {"No matching papers in institutional repository"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-2 leading-relaxed">
        {"Your search for "}
        <span className="font-medium text-foreground">{`"${query}"`}</span>
        {" didn't match any papers in our institutional database."}
      </p>
      <p className="text-xs text-muted-foreground/70 max-w-sm mb-6">
        {"Try different keywords or explore Google Scholar to find papers across global academic databases."}
      </p>
      <a
        href={scholarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
      >
        <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-5">
          <ExternalLink className="h-4 w-4" />
          {"Search \"" + query + "\" on Google Scholar"}
        </Button>
      </a>
      <p className="mt-3 text-[11px] text-muted-foreground/50 flex items-center gap-1">
        <ArrowUpRight className="h-3 w-3" />
        Opens scholar.google.com in a new tab
      </p>
    </div>
  )
}

/* ---------- Main Component ---------- */
export function ResearchHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [department, setDepartment] = useState<Department>("All")
  const [sortBy, setSortBy] = useState<SortBy>("citations")
  const [authorFilter, setAuthorFilter] = useState<AuthorType | "all">("all")
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null)

  const filtered = useMemo(() => {
    let result = [...PAPERS]

    // Department filter
    if (department !== "All") {
      result = result.filter((p) => p.department === department)
    }

    // Author type filter
    if (authorFilter !== "all") {
      result = result.filter((p) => p.authors.some((a) => a.type === authorFilter))
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.abstract.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.authors.some((a) => a.name.toLowerCase().includes(q)) ||
          p.journal.toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "citations":
          return b.citations - a.citations
        case "downloads":
          return b.downloads - a.downloads
        case "views":
          return b.views - a.views
        case "year":
          return b.year - a.year
        default:
          return 0
      }
    })

    return result
  }, [searchQuery, department, sortBy, authorFilter])

  // Detail view
  if (selectedPaper) {
    return <PaperDetail paper={selectedPaper} onBack={() => setSelectedPaper(null)} />
  }

  // Featured papers
  const featured = PAPERS.filter((p) => p.featured)

  // Stats
  const totalPapers = PAPERS.length
  const totalDepartments = new Set(PAPERS.map((p) => p.department)).size
  const totalCitations = PAPERS.reduce((sum, p) => sum + p.citations, 0)
  const totalAuthors = new Set(PAPERS.flatMap((p) => p.authors.map((a) => a.name))).size

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <EduNexusLogo size={22} />
            Institutional Research Hub
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Research papers by faculty and students across all departments
          </p>
        </div>
        <a
          href="https://scholar.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="rounded-xl border-border/50 text-muted-foreground hover:text-foreground gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Google Scholar
          </Button>
        </a>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          { label: "Total Papers", value: totalPapers, icon: FileText, color: "text-primary" },
          { label: "Departments", value: totalDepartments, icon: Building2, color: "text-sky-400" },
          { label: "Total Citations", value: totalCitations, icon: Quote, color: "text-amber-400" },
          { label: "Unique Authors", value: totalAuthors, icon: Users, color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-3.5 flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/40`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">{stat.value}</span>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Papers */}
      {!searchQuery && department === "All" && authorFilter === "all" && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            Featured Research
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {featured.map((paper) => (
              <PaperCard key={paper.id} paper={paper} onSelect={() => setSelectedPaper(paper)} />
            ))}
          </div>
          <Separator className="mt-6 bg-border/30" />
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search papers, authors, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department)}
            className="h-10 rounded-xl border border-border bg-secondary/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {ALL_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
            ))}
          </select>

          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value as AuthorType | "all")}
            className="h-10 rounded-xl border border-border bg-secondary/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Authors</option>
            <option value="faculty">Faculty</option>
            <option value="student">Students</option>
            <option value="alumni">Alumni</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-10 rounded-xl border border-border bg-secondary/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(department !== "All" || authorFilter !== "all" || searchQuery) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {department !== "All" && (
            <Badge
              variant="outline"
              className="text-[10px] gap-1 border-border bg-secondary/30 text-foreground cursor-pointer hover:bg-destructive/15 hover:text-destructive transition-colors"
              onClick={() => setDepartment("All")}
            >
              {department}
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          {authorFilter !== "all" && (
            <Badge
              variant="outline"
              className="text-[10px] gap-1 border-border bg-secondary/30 text-foreground cursor-pointer hover:bg-destructive/15 hover:text-destructive transition-colors capitalize"
              onClick={() => setAuthorFilter("all")}
            >
              {authorFilter}
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          {searchQuery && (
            <Badge
              variant="outline"
              className="text-[10px] gap-1 border-border bg-secondary/30 text-foreground cursor-pointer hover:bg-destructive/15 hover:text-destructive transition-colors"
              onClick={() => setSearchQuery("")}
            >
              {`"${searchQuery}"`}
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          <button
            onClick={() => {
              setDepartment("All")
              setAuthorFilter("all")
              setSearchQuery("")
            }}
            className="text-[10px] text-primary hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results count + sort indicator */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {filtered.length} paper{filtered.length !== 1 ? "s" : ""} found
        </p>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <SortAsc className="h-3 w-3" />
          {sortOptions.find((s) => s.id === sortBy)?.label}
        </span>
      </div>

      {/* Paper grid or fallback */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((paper) => (
            <PaperCard key={paper.id} paper={paper} onSelect={() => setSelectedPaper(paper)} />
          ))}
        </div>
      ) : (
        <GoogleScholarFallback query={searchQuery || "research papers"} />
      )}
    </section>
  )
}

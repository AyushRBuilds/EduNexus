"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Info, Zap, Plus, Trash2, Pencil, Check, X, ZoomIn, ZoomOut, Undo2, GripHorizontal, Move, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { queryGemini } from "@/lib/api/gemini.service"

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

interface MindNode {
  id: string
  label: string
  subtitle?: string
  color: string
  bgColor: string
  glowColor: string
  glowStrong: string
  x: number // percentage 0-100
  y: number // percentage 0-100
  type: "core" | "branch" | "leaf"
  parentId?: string
}

interface Edge {
  from: string
  to: string
}

const INITIAL_NODES: MindNode[] = [
  {
    id: "core",
    label: "Laplace\nTransform",
    color: "rgb(56, 189, 248)",
    bgColor: "rgba(56, 189, 248, 0.12)",
    glowColor: "rgba(56, 189, 248, 0.25)",
    glowStrong: "rgba(56, 189, 248, 0.50)",
    x: 50,
    y: 50,
    type: "core",
  },
  {
    id: "definition",
    label: "Definition",
    subtitle: "L{f(t)} = F(s)",
    color: "rgb(52, 211, 153)",
    bgColor: "rgba(52, 211, 153, 0.08)",
    glowColor: "rgba(52, 211, 153, 0.18)",
    glowStrong: "rgba(52, 211, 153, 0.40)",
    x: 20,
    y: 22,
    type: "branch",
    parentId: "core",
  },
  {
    id: "properties",
    label: "Properties",
    subtitle: "Linearity, Shifting",
    color: "rgb(192, 132, 252)",
    bgColor: "rgba(192, 132, 252, 0.08)",
    glowColor: "rgba(192, 132, 252, 0.18)",
    glowStrong: "rgba(192, 132, 252, 0.40)",
    x: 80,
    y: 18,
    type: "branch",
    parentId: "core",
  },
  {
    id: "inverse",
    label: "Inverse",
    subtitle: "Partial Fractions",
    color: "rgb(45, 212, 191)",
    bgColor: "rgba(45, 212, 191, 0.08)",
    glowColor: "rgba(45, 212, 191, 0.18)",
    glowStrong: "rgba(45, 212, 191, 0.40)",
    x: 15,
    y: 68,
    type: "branch",
    parentId: "core",
  },
  {
    id: "ode",
    label: "Solving ODEs",
    subtitle: "Algebraic Methods",
    color: "rgb(248, 113, 113)",
    bgColor: "rgba(248, 113, 113, 0.08)",
    glowColor: "rgba(248, 113, 113, 0.18)",
    glowStrong: "rgba(248, 113, 113, 0.40)",
    x: 50,
    y: 88,
    type: "branch",
    parentId: "core",
  },
  {
    id: "circuits",
    label: "Circuit Analysis",
    subtitle: "RLC Networks",
    color: "rgb(251, 146, 60)",
    bgColor: "rgba(251, 146, 60, 0.08)",
    glowColor: "rgba(251, 146, 60, 0.18)",
    glowStrong: "rgba(251, 146, 60, 0.40)",
    x: 85,
    y: 65,
    type: "branch",
    parentId: "core",
  },
  {
    id: "control",
    label: "Control Systems",
    subtitle: "Transfer Functions",
    color: "rgb(250, 204, 21)",
    bgColor: "rgba(250, 204, 21, 0.08)",
    glowColor: "rgba(250, 204, 21, 0.18)",
    glowStrong: "rgba(250, 204, 21, 0.40)",
    x: 88,
    y: 40,
    type: "branch",
    parentId: "core",
  },
  /* Leaf nodes */
  {
    id: "integral",
    label: "Integral Form",
    color: "rgb(52, 211, 153)",
    bgColor: "rgba(52, 211, 153, 0.05)",
    glowColor: "rgba(52, 211, 153, 0.12)",
    glowStrong: "rgba(52, 211, 153, 0.30)",
    x: 7,
    y: 8,
    type: "leaf",
    parentId: "definition",
  },
  {
    id: "convergence",
    label: "ROC",
    color: "rgb(52, 211, 153)",
    bgColor: "rgba(52, 211, 153, 0.05)",
    glowColor: "rgba(52, 211, 153, 0.12)",
    glowStrong: "rgba(52, 211, 153, 0.30)",
    x: 33,
    y: 8,
    type: "leaf",
    parentId: "definition",
  },
  {
    id: "linearity",
    label: "Linearity",
    color: "rgb(192, 132, 252)",
    bgColor: "rgba(192, 132, 252, 0.05)",
    glowColor: "rgba(192, 132, 252, 0.12)",
    glowStrong: "rgba(192, 132, 252, 0.30)",
    x: 70,
    y: 5,
    type: "leaf",
    parentId: "properties",
  },
  {
    id: "differentiation",
    label: "Differentiation",
    color: "rgb(192, 132, 252)",
    bgColor: "rgba(192, 132, 252, 0.05)",
    glowColor: "rgba(192, 132, 252, 0.12)",
    glowStrong: "rgba(192, 132, 252, 0.30)",
    x: 93,
    y: 5,
    type: "leaf",
    parentId: "properties",
  },
  {
    id: "stability",
    label: "Stability",
    color: "rgb(250, 204, 21)",
    bgColor: "rgba(250, 204, 21, 0.05)",
    glowColor: "rgba(250, 204, 21, 0.12)",
    glowStrong: "rgba(250, 204, 21, 0.30)",
    x: 95,
    y: 55,
    type: "leaf",
    parentId: "control",
  },
]

const NODE_DETAILS: Record<string, { title: string; desc: string; formula?: string }> = {
  core: {
    title: "Laplace Transform",
    desc: "An integral transform that converts time-domain functions into the complex frequency domain (s-domain). Fundamental tool for engineering mathematics, signal processing, and control theory.",
    formula: "L{f(t)} = F(s) = integral(0,inf) e^(-st) f(t) dt",
  },
  definition: {
    title: "Definition",
    desc: "The formal mathematical definition of the Laplace Transform involving integration of the product of the input function and a decaying exponential.",
    formula: "F(s) = integral from 0 to inf of e^(-st) f(t) dt",
  },
  properties: {
    title: "Properties",
    desc: "Key algebraic properties that make Laplace Transforms useful: linearity, time-shifting, frequency-shifting, differentiation, and integration.",
  },
  inverse: {
    title: "Inverse Laplace Transform",
    desc: "Methods to recover the time-domain function from its s-domain representation, primarily using partial fraction decomposition and table lookup.",
  },
  ode: {
    title: "Solving ODEs",
    desc: "Converting ordinary differential equations into algebraic equations in the s-domain, solving for F(s), then applying the inverse transform.",
  },
  circuits: {
    title: "Circuit Analysis",
    desc: "Applying Laplace Transform to analyze RLC circuits. Impedances become Z_R=R, Z_L=sL, Z_C=1/(sC) in the s-domain.",
  },
  control: {
    title: "Control Systems",
    desc: "Using transfer functions H(s) for stability analysis, feedback loop design, and system characterization via pole-zero plots.",
  },
  integral: {
    title: "Integral Form",
    desc: "The integral definition where convergence depends on the real part of s exceeding the abscissa of convergence.",
  },
  convergence: {
    title: "Region of Convergence (ROC)",
    desc: "The set of values of s for which the Laplace integral converges. Determines the valid range of the transform.",
  },
  linearity: {
    title: "Linearity Property",
    desc: "L{a*f(t) + b*g(t)} = a*F(s) + b*G(s). Allows decomposition of complex signals into simpler components.",
  },
  differentiation: {
    title: "Differentiation Property",
    desc: "L{f'(t)} = s*F(s) - f(0). Each derivative introduces another power of s, turning differential equations into algebraic ones.",
  },
  stability: {
    title: "Stability Analysis",
    desc: "A system is BIBO stable if all poles of H(s) lie in the left half of the s-plane (negative real parts).",
  },
}

const BRANCH_COLORS = [
  { color: "rgb(56, 189, 248)", bgColor: "rgba(56, 189, 248, 0.08)", glowColor: "rgba(56, 189, 248, 0.18)", glowStrong: "rgba(56, 189, 248, 0.40)" },
  { color: "rgb(52, 211, 153)", bgColor: "rgba(52, 211, 153, 0.08)", glowColor: "rgba(52, 211, 153, 0.18)", glowStrong: "rgba(52, 211, 153, 0.40)" },
  { color: "rgb(192, 132, 252)", bgColor: "rgba(192, 132, 252, 0.08)", glowColor: "rgba(192, 132, 252, 0.18)", glowStrong: "rgba(192, 132, 252, 0.40)" },
  { color: "rgb(248, 113, 113)", bgColor: "rgba(248, 113, 113, 0.08)", glowColor: "rgba(248, 113, 113, 0.18)", glowStrong: "rgba(248, 113, 113, 0.40)" },
  { color: "rgb(251, 146, 60)", bgColor: "rgba(251, 146, 60, 0.08)", glowColor: "rgba(251, 146, 60, 0.18)", glowStrong: "rgba(251, 146, 60, 0.40)" },
  { color: "rgb(250, 204, 21)", bgColor: "rgba(250, 204, 21, 0.08)", glowColor: "rgba(250, 204, 21, 0.18)", glowStrong: "rgba(250, 204, 21, 0.40)" },
  { color: "rgb(45, 212, 191)", bgColor: "rgba(45, 212, 191, 0.08)", glowColor: "rgba(45, 212, 191, 0.18)", glowStrong: "rgba(45, 212, 191, 0.40)" },
]

/* ------------------------------------------------------------------ */
/*  Animated Edge SVG                                                  */
/* ------------------------------------------------------------------ */

function AnimatedEdge({
  x1, y1, x2, y2,
  color, isActive, delay,
}: {
  x1: string; y1: string; x2: string; y2: string
  color: string; isActive: boolean; delay: number
}) {
  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isActive ? color : "rgba(100, 130, 180, 0.12)"}
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray={isActive ? "none" : "4 6"}
        style={{ transition: "all 0.4s ease" }}
      />
      {isActive && (
        <circle r="3" fill={color} opacity="0.8">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            begin={`${delay}s`}
            path={`M${x1} ${y1} L${x2} ${y2}`}
          />
        </circle>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/*  Draggable Interactive Node                                         */
/* ------------------------------------------------------------------ */

function DraggableMindMapNode({
  node,
  isHovered,
  isSelected,
  isConnected,
  isDragging,
  isEditing,
  editLabel,
  onHover,
  onSelect,
  onDragStart,
  onEditLabelChange,
  onEditConfirm,
  onEditCancel,
}: {
  node: MindNode
  isHovered: boolean
  isSelected: boolean
  isConnected: boolean
  isDragging: boolean
  isEditing: boolean
  editLabel: string
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
  onDragStart: (id: string, e: React.MouseEvent | React.TouchEvent) => void
  onEditLabelChange: (val: string) => void
  onEditConfirm: () => void
  onEditCancel: () => void
}) {
  const active = isHovered || isSelected || isConnected

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking inside the edit input
    if ((e.target as HTMLElement).tagName === "INPUT") return
    e.preventDefault()
    e.stopPropagation()
    onDragStart(node.id, e)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return
    onDragStart(node.id, e)
  }

  const sharedStyle: React.CSSProperties = {
    left: `${node.x}%`,
    top: `${node.y}%`,
    transform: "translate(-50%, -50%)",
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
    touchAction: "none",
  }

  if (node.type === "core") {
    return (
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(node.id === (isSelected ? node.id : null) ? null : node.id)
        }}
        className={cn(
          "absolute flex items-center justify-center rounded-full transition-shadow duration-500 select-none",
          isDragging && "z-50 scale-105"
        )}
        style={{
          ...sharedStyle,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${node.bgColor} 0%, rgba(10, 14, 26, 0.85) 70%)`,
          border: `2px solid ${node.color}`,
          boxShadow: isDragging
            ? `0 0 60px ${node.glowStrong}, 0 0 120px ${node.glowColor}`
            : isHovered || isSelected
              ? `0 0 50px ${node.glowStrong}, 0 0 100px ${node.glowColor}, inset 0 0 30px ${node.glowColor}`
              : `0 0 30px ${node.glowColor}, inset 0 0 15px ${node.glowColor}`,
          zIndex: isDragging ? 50 : 10,
        }}
        role="button"
        tabIndex={0}
        aria-label={`Mind map node: ${node.label.replace("\n", " ")}`}
      >
        {isEditing ? (
          <div className="flex flex-col items-center gap-1 px-2">
            <input
              autoFocus
              value={editLabel}
              onChange={(e) => onEditLabelChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditConfirm()
                if (e.key === "Escape") onEditCancel()
              }}
              className="w-full rounded-md bg-background/60 px-1.5 py-1 text-center text-[11px] font-bold text-foreground outline-none ring-1 ring-primary/50"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEditConfirm() }} className="rounded-md bg-primary/20 p-0.5 text-primary hover:bg-primary/30"><Check className="h-3 w-3" /></button>
              <button onClick={(e) => { e.stopPropagation(); onEditCancel() }} className="rounded-md bg-secondary/40 p-0.5 text-muted-foreground hover:bg-secondary/60"><X className="h-3 w-3" /></button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-sm font-bold text-center leading-tight whitespace-pre-line" style={{ color: node.color }}>
              {node.label}
            </span>
            {isDragging && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/30">
                <Move className="h-3 w-3 text-primary" />
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  if (node.type === "branch") {
    return (
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(node.id === (isSelected ? node.id : null) ? null : node.id)
        }}
        className={cn(
          "absolute flex flex-col items-center justify-center rounded-xl transition-shadow duration-300 select-none",
          isDragging && "z-50 scale-105"
        )}
        style={{
          ...sharedStyle,
          padding: "10px 16px",
          minWidth: 100,
          background: active || isDragging ? node.bgColor : "rgba(10, 14, 26, 0.7)",
          border: `1.5px solid ${active || isDragging ? node.color : `${node.color}40`}`,
          boxShadow: isDragging
            ? `0 0 35px ${node.glowStrong}, 0 0 70px ${node.glowColor}`
            : active
              ? `0 0 25px ${node.glowColor}, 0 0 50px ${node.glowColor}`
              : "none",
          zIndex: isDragging ? 50 : 5,
          backdropFilter: "blur(12px)",
        }}
        role="button"
        tabIndex={0}
        aria-label={`Mind map node: ${node.label}`}
      >
        {isEditing ? (
          <div className="flex flex-col items-center gap-1">
            <input
              autoFocus
              value={editLabel}
              onChange={(e) => onEditLabelChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditConfirm()
                if (e.key === "Escape") onEditCancel()
              }}
              className="w-full rounded-md bg-background/60 px-1.5 py-0.5 text-center text-[11px] font-semibold text-foreground outline-none ring-1 ring-primary/50"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEditConfirm() }} className="rounded-md bg-primary/20 p-0.5 text-primary hover:bg-primary/30"><Check className="h-3 w-3" /></button>
              <button onClick={(e) => { e.stopPropagation(); onEditCancel() }} className="rounded-md bg-secondary/40 p-0.5 text-muted-foreground hover:bg-secondary/60"><X className="h-3 w-3" /></button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: active || isDragging ? node.color : `${node.color}aa` }}>
              {node.label}
            </span>
            {node.subtitle && (
              <span className="text-[9px] mt-0.5 whitespace-nowrap" style={{ color: active || isDragging ? `${node.color}cc` : `${node.color}55` }}>
                {node.subtitle}
              </span>
            )}
          </>
        )}
      </div>
    )
  }

  // leaf
  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(node.id === (isSelected ? node.id : null) ? null : node.id)
      }}
      className={cn(
        "absolute flex items-center justify-center rounded-lg transition-shadow duration-300 select-none",
        isDragging && "z-50 scale-105"
      )}
      style={{
        ...sharedStyle,
        padding: "6px 12px",
        background: active || isDragging ? node.bgColor : "rgba(10, 14, 26, 0.5)",
        border: `1px solid ${active || isDragging ? `${node.color}80` : `${node.color}20`}`,
        boxShadow: isDragging
          ? `0 0 20px ${node.glowStrong}`
          : active
            ? `0 0 15px ${node.glowColor}`
            : "none",
        zIndex: isDragging ? 50 : 3,
        backdropFilter: "blur(8px)",
      }}
      role="button"
      tabIndex={0}
      aria-label={`Mind map node: ${node.label}`}
    >
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={editLabel}
            onChange={(e) => onEditLabelChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditConfirm()
              if (e.key === "Escape") onEditCancel()
            }}
            className="w-20 rounded-md bg-background/60 px-1 py-0.5 text-center text-[10px] font-medium text-foreground outline-none ring-1 ring-primary/50"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); onEditConfirm() }} className="rounded bg-primary/20 p-0.5 text-primary hover:bg-primary/30"><Check className="h-2.5 w-2.5" /></button>
        </div>
      ) : (
        <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: active || isDragging ? `${node.color}dd` : `${node.color}55` }}>
          {node.label}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Mind Map Container                                                 */
/* ------------------------------------------------------------------ */

export function StudyMindMap({ videoTitle, videoSubject }: { videoTitle?: string; videoSubject?: string } = {}) {
  const [nodes, setNodes] = useState<MindNode[]>(() => JSON.parse(JSON.stringify(INITIAL_NODES)))
  const [history, setHistory] = useState<MindNode[][]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const edges: Edge[] = nodes.filter((n) => n.parentId).map((n) => ({
    from: n.parentId!,
    to: n.id,
  }))

  // Determine connected nodes for hover/select highlighting
  const activeId = hoveredNode ?? selectedNode
  const connectedIds = new Set<string>()
  if (activeId) {
    connectedIds.add(activeId)
    const node = nodes.find((n) => n.id === activeId)
    if (node?.parentId) connectedIds.add(node.parentId)
    nodes.filter((n) => n.parentId === activeId).forEach((n) => connectedIds.add(n.id))
  }

  /* ---------- save to history for undo ---------- */
  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-20), JSON.parse(JSON.stringify(nodes))])
  }, [nodes])

  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setNodes(last)
      return prev.slice(0, -1)
    })
  }, [])

  const [aiGenerating, setAiGenerating] = useState(false)

  /* ---------- AI generate mind map ---------- */
  const handleAIGenerate = useCallback(async () => {
    if (!videoTitle || aiGenerating) return
    setAiGenerating(true)
    try {
      const prompt = `Generate a mind map structure for the topic: "${videoTitle}"${videoSubject ? ` (Subject: ${videoSubject})` : ""}.

Return ONLY a JSON object with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "center": "Main Topic",
  "branches": [
    {
      "label": "Branch 1",
      "children": ["Leaf 1", "Leaf 2"]
    },
    {
      "label": "Branch 2",
      "children": ["Leaf 3", "Leaf 4"]
    }
  ]
}

Create 4-6 branches with 2-3 children each. Make them academically relevant to the topic.`

      const result = await queryGemini(prompt)
      const text = result.answer || ""

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("No JSON found")

      const data = JSON.parse(jsonMatch[0])
      if (!data.center || !data.branches) throw new Error("Invalid structure")

      const newNodes: MindNode[] = []
      const coreColor = BRANCH_COLORS[0]

      newNodes.push({
        id: "core",
        label: data.center,
        color: coreColor.color,
        bgColor: coreColor.bgColor,
        glowColor: coreColor.glowColor,
        glowStrong: coreColor.glowStrong,
        x: 50, y: 50, type: "core",
      })

      const branchAngles = data.branches.map((_: unknown, i: number) =>
        (i / data.branches.length) * Math.PI * 2 - Math.PI / 2
      )

      data.branches.forEach((branch: { label: string; children?: string[] }, bi: number) => {
        const c = BRANCH_COLORS[(bi + 1) % BRANCH_COLORS.length]
        const angle = branchAngles[bi]
        const bx = 50 + Math.cos(angle) * 30
        const by = 50 + Math.sin(angle) * 30
        const branchId = `ai-branch-${bi}`

        newNodes.push({
          id: branchId, label: branch.label,
          color: c.color, bgColor: c.bgColor, glowColor: c.glowColor, glowStrong: c.glowStrong,
          x: Math.max(8, Math.min(92, bx)), y: Math.max(8, Math.min(92, by)),
          type: "branch", parentId: "core",
        })

        if (branch.children) {
          branch.children.forEach((child: string, ci: number) => {
            const leafAngle = angle + ((ci - (branch.children!.length - 1) / 2) * 0.4)
            const lx = bx + Math.cos(leafAngle) * 15
            const ly = by + Math.sin(leafAngle) * 15
            newNodes.push({
              id: `ai-leaf-${bi}-${ci}`, label: child,
              color: c.color, bgColor: c.bgColor, glowColor: c.glowColor, glowStrong: c.glowStrong,
              x: Math.max(5, Math.min(95, lx)), y: Math.max(5, Math.min(95, ly)),
              type: "leaf", parentId: branchId,
            })
          })
        }
      })

      pushHistory()
      setNodes(newNodes)
      setSelectedNode(null)
      setEditingNode(null)
    } catch (err) {
      console.error("AI mind map generation failed:", err)
    } finally {
      setAiGenerating(false)
    }
  }, [videoTitle, videoSubject, aiGenerating, pushHistory])

  /* ---------- drag logic ---------- */
  const handleDragStart = useCallback((id: string, e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return
    pushHistory()
    setDraggingNode(id)

    const rect = containerRef.current.getBoundingClientRect()
    const node = nodes.find((n) => n.id === id)
    if (!node) return

    let clientX: number, clientY: number
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Calculate the offset between the mouse position and the node center
    const nodeCenterX = rect.left + ((node.x / 100) * rect.width * zoom) + pan.x
    const nodeCenterY = rect.top + ((node.y / 100) * rect.height * zoom) + pan.y
    dragOffsetRef.current = {
      x: clientX - nodeCenterX,
      y: clientY - nodeCenterY,
    }
  }, [nodes, pushHistory, zoom, pan])

  useEffect(() => {
    if (!draggingNode) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()

      let clientX: number, clientY: number
      if ("touches" in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      // Calculate new percentage position accounting for zoom and pan
      const relX = (clientX - dragOffsetRef.current.x - rect.left - pan.x) / (rect.width * zoom) * 100
      const relY = (clientY - dragOffsetRef.current.y - rect.top - pan.y) / (rect.height * zoom) * 100

      const clampedX = Math.max(3, Math.min(97, relX))
      const clampedY = Math.max(3, Math.min(97, relY))

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNode
            ? { ...n, x: clampedX, y: clampedY }
            : n
        )
      )
    }

    const handleUp = () => {
      setDraggingNode(null)
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)
    window.addEventListener("touchmove", handleMove, { passive: false })
    window.addEventListener("touchend", handleUp)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleUp)
    }
  }, [draggingNode, zoom, pan])

  /* ---------- canvas pan (middle-click or background drag) ---------- */
  const handleCanvasPanStart = useCallback((e: React.MouseEvent) => {
    // Only pan on middle click or when clicking the background (not a node)
    if (e.button === 1 || (e.target === containerRef.current || (e.target as HTMLElement).dataset.canvas === "true")) {
      setIsPanning(true)
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
    }
  }, [pan])

  useEffect(() => {
    if (!isPanning) return

    const handlePanMove = (e: MouseEvent) => {
      const dx = e.clientX - panStartRef.current.x
      const dy = e.clientY - panStartRef.current.y
      setPan({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy })
    }
    const handlePanEnd = () => setIsPanning(false)

    window.addEventListener("mousemove", handlePanMove)
    window.addEventListener("mouseup", handlePanEnd)
    return () => {
      window.removeEventListener("mousemove", handlePanMove)
      window.removeEventListener("mouseup", handlePanEnd)
    }
  }, [isPanning])

  /* ---------- zoom ---------- */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((prev) => Math.max(0.4, Math.min(2.5, prev - e.deltaY * 0.001)))
  }, [])

  /* ---------- add child node ---------- */
  const handleAddChild = useCallback(() => {
    if (!selectedNode) return
    pushHistory()
    const parent = nodes.find((n) => n.id === selectedNode)
    if (!parent) return

    const colorIndex = nodes.length % BRANCH_COLORS.length
    const c = BRANCH_COLORS[colorIndex]

    // Place new node offset from parent
    const angle = Math.random() * Math.PI * 2
    const dist = 15 + Math.random() * 8
    const nx = Math.max(5, Math.min(95, parent.x + Math.cos(angle) * dist))
    const ny = Math.max(5, Math.min(95, parent.y + Math.sin(angle) * dist))

    const newNode: MindNode = {
      id: `node-${Date.now()}`,
      label: "New Concept",
      color: c.color,
      bgColor: c.bgColor,
      glowColor: c.glowColor,
      glowStrong: c.glowStrong,
      x: nx,
      y: ny,
      type: parent.type === "core" ? "branch" : "leaf",
      parentId: parent.id,
    }

    setNodes((prev) => [...prev, newNode])
    setSelectedNode(newNode.id)
    setEditingNode(newNode.id)
    setEditLabel("New Concept")
  }, [selectedNode, nodes, pushHistory])

  /* ---------- delete node ---------- */
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode || selectedNode === "core") return
    pushHistory()
    // Remove this node and all its descendants
    const toRemove = new Set<string>([selectedNode])
    let changed = true
    while (changed) {
      changed = false
      nodes.forEach((n) => {
        if (n.parentId && toRemove.has(n.parentId) && !toRemove.has(n.id)) {
          toRemove.add(n.id)
          changed = true
        }
      })
    }
    setNodes((prev) => prev.filter((n) => !toRemove.has(n.id)))
    setSelectedNode(null)
    setEditingNode(null)
  }, [selectedNode, nodes, pushHistory])

  /* ---------- edit node ---------- */
  const handleStartEdit = useCallback(() => {
    if (!selectedNode) return
    const node = nodes.find((n) => n.id === selectedNode)
    if (!node) return
    setEditingNode(selectedNode)
    setEditLabel(node.label.replace("\n", " "))
  }, [selectedNode, nodes])

  const handleConfirmEdit = useCallback(() => {
    if (!editingNode || !editLabel.trim()) {
      setEditingNode(null)
      return
    }
    pushHistory()
    setNodes((prev) =>
      prev.map((n) =>
        n.id === editingNode ? { ...n, label: editLabel.trim() } : n
      )
    )
    setEditingNode(null)
  }, [editingNode, editLabel, pushHistory])

  const handleCancelEdit = useCallback(() => {
    setEditingNode(null)
    setEditLabel("")
  }, [])

  /* ---------- reset ---------- */
  const handleReset = useCallback(() => {
    pushHistory()
    setNodes(JSON.parse(JSON.stringify(INITIAL_NODES)))
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedNode(null)
    setEditingNode(null)
  }, [pushHistory])

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 border-b border-border/40 px-3 py-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15">
          <Zap className="h-3 w-3 text-primary" />
        </div>
        <span className="text-xs font-semibold text-foreground">Interactive Concept Map</span>

        <div className="ml-auto flex items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-lg border border-border/40 bg-secondary/20 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <span className="px-1 text-[10px] tabular-nums text-muted-foreground font-mono min-w-[32px] text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            onClick={handleUndo}
            disabled={history.length === 0}
            aria-label="Undo"
          >
            <Undo2 className="h-3 w-3" />
          </Button>

          <div className="h-4 w-px bg-border/40 mx-0.5" />

          {selectedNode && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                onClick={handleAddChild}
                aria-label="Add child node"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                onClick={handleStartEdit}
                aria-label="Rename node"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              {selectedNode !== "core" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDeleteNode}
                  aria-label="Delete node"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
            onClick={handleAIGenerate}
            disabled={aiGenerating || !videoTitle}
          >
            {aiGenerating ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-3 w-3" /> AI Generate</>
            )}
          </Button>

          <button
            onClick={handleReset}
            className="ml-0.5 rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Hint bar */}
      <div className="flex items-center gap-3 border-b border-border/20 bg-secondary/10 px-3 py-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
          <GripHorizontal className="h-3 w-3" />
          <span>Drag nodes to move</span>
        </div>
        <span className="text-[10px] text-muted-foreground/40">|</span>
        <span className="text-[10px] text-muted-foreground/70">Select + <kbd className="rounded border border-border/50 bg-secondary/30 px-1 py-px text-[9px] font-mono">+</kbd> to add child</span>
        <span className="text-[10px] text-muted-foreground/40">|</span>
        <span className="text-[10px] text-muted-foreground/70">Scroll to zoom</span>
      </div>

      {/* Map area */}
      <div
        ref={containerRef}
        className={cn(
          "relative flex-1 min-h-[400px] overflow-hidden",
          isPanning && "cursor-grabbing",
          !isPanning && !draggingNode && "cursor-default"
        )}
        onMouseDown={handleCanvasPanStart}
        onWheel={handleWheel}
        onClick={() => {
          if (!draggingNode) {
            setSelectedNode(null)
            setEditingNode(null)
          }
        }}
        data-canvas="true"
      >
        {/* Dark grid background */}
        <div className="absolute inset-0 pointer-events-none" data-canvas="true" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.03) 0%, transparent 60%), linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 50px 50px, 50px 50px",
        }} />

        {/* Zoomable/Pannable layer */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: draggingNode || isPanning ? "none" : "transform 0.2s ease-out",
          }}
          data-canvas="true"
        >
          {/* SVG edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 1 }}>
            {edges.map((edge, i) => {
              const from = nodes.find((n) => n.id === edge.from)!
              const to = nodes.find((n) => n.id === edge.to)!
              if (!from || !to) return null
              const isActive = connectedIds.has(edge.from) && connectedIds.has(edge.to)
              return (
                <AnimatedEdge
                  key={`${edge.from}-${edge.to}`}
                  x1={`${from.x}`}
                  y1={`${from.y}`}
                  x2={`${to.x}`}
                  y2={`${to.y}`}
                  color={to.color}
                  isActive={isActive}
                  delay={i * 0.3}
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <DraggableMindMapNode
              key={node.id}
              node={node}
              isHovered={hoveredNode === node.id}
              isSelected={selectedNode === node.id}
              isConnected={connectedIds.has(node.id) && node.id !== (hoveredNode ?? selectedNode)}
              isDragging={draggingNode === node.id}
              isEditing={editingNode === node.id}
              editLabel={editingNode === node.id ? editLabel : ""}
              onHover={setHoveredNode}
              onSelect={(id) => {
                setSelectedNode(id === selectedNode ? null : id)
                setEditingNode(null)
              }}
              onDragStart={handleDragStart}
              onEditLabelChange={setEditLabel}
              onEditConfirm={handleConfirmEdit}
              onEditCancel={handleCancelEdit}
            />
          ))}
        </div>

        {/* Detail panel (fixed, outside the zoom layer) */}
        {selectedNode && NODE_DETAILS[selectedNode] && !editingNode && (
          <div
            className="absolute bottom-3 left-3 right-3 glass-strong rounded-xl p-3.5 flex items-start gap-3 border border-border/30"
            style={{ zIndex: 60 }}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{
              background: nodes.find((n) => n.id === selectedNode)?.bgColor,
              border: `1px solid ${nodes.find((n) => n.id === selectedNode)?.color}40`,
            }}>
              <Info className="h-3.5 w-3.5" style={{ color: nodes.find((n) => n.id === selectedNode)?.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-foreground mb-0.5">
                {NODE_DETAILS[selectedNode].title}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {NODE_DETAILS[selectedNode].desc}
              </p>
              {NODE_DETAILS[selectedNode].formula && (
                <p className="mt-1.5 rounded-md bg-secondary/40 px-2.5 py-1.5 font-mono text-[10px] text-primary">
                  {NODE_DETAILS[selectedNode].formula}
                </p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedNode(null) }}
              className="shrink-0 rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Node count badge */}
        <div className="absolute top-3 right-3 rounded-lg bg-secondary/40 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur-sm border border-border/20" style={{ zIndex: 60 }}>
          {nodes.length} nodes
        </div>
      </div>
    </div>
  )
}

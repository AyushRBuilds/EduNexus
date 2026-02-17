"use client"

import { useState } from "react"
import { Info, Zap } from "lucide-react"

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
  x: number
  y: number
  type: "core" | "branch" | "leaf"
  parentId?: string
}

const NODES: MindNode[] = [
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

const EDGES = NODES.filter((n) => n.parentId).map((n) => ({
  from: n.parentId!,
  to: n.id,
}))

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

/* ------------------------------------------------------------------ */
/*  Animated particle along edges                                      */
/* ------------------------------------------------------------------ */

function AnimatedEdge({
  x1,
  y1,
  x2,
  y2,
  color,
  isActive,
  delay,
}: {
  x1: string; y1: string; x2: string; y2: string
  color: string; isActive: boolean; delay: number
}) {
  return (
    <g>
      {/* Base line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isActive ? color : "rgba(100, 130, 180, 0.12)"}
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray={isActive ? "none" : "4 6"}
        style={{ transition: "all 0.4s ease" }}
      />
      {/* Animated particle */}
      {isActive && (
        <circle r="3" fill={color} opacity="0.8">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            begin={`${delay}s`}
            path={`M${x1.replace('%', '')} ${y1.replace('%', '')} L${x2.replace('%', '')} ${y2.replace('%', '')}`}
          />
        </circle>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/*  Interactive Node                                                   */
/* ------------------------------------------------------------------ */

function MindMapNode({
  node,
  isHovered,
  isSelected,
  isConnected,
  onHover,
  onSelect,
}: {
  node: MindNode
  isHovered: boolean
  isSelected: boolean
  isConnected: boolean
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
}) {
  const active = isHovered || isSelected || isConnected

  if (node.type === "core") {
    return (
      <button
        onClick={() => onSelect(node.id === (isSelected ? node.id : null) ? null : node.id)}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        className="absolute flex items-center justify-center rounded-full transition-all duration-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{
          left: `${node.x}%`,
          top: `${node.y}%`,
          transform: "translate(-50%, -50%)",
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${node.bgColor} 0%, rgba(10, 14, 26, 0.85) 70%)`,
          border: `2px solid ${node.color}`,
          boxShadow: isHovered || isSelected
            ? `0 0 50px ${node.glowStrong}, 0 0 100px ${node.glowColor}, inset 0 0 30px ${node.glowColor}`
            : `0 0 30px ${node.glowColor}, inset 0 0 15px ${node.glowColor}`,
          zIndex: 10,
          animation: "float 5s ease-in-out infinite",
        }}
      >
        <span className="text-sm font-bold text-center leading-tight whitespace-pre-line" style={{ color: node.color }}>
          {node.label}
        </span>
      </button>
    )
  }

  if (node.type === "branch") {
    return (
      <button
        onClick={() => onSelect(node.id === (isSelected ? node.id : null) ? null : node.id)}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        className="absolute flex flex-col items-center justify-center rounded-xl transition-all duration-400 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{
          left: `${node.x}%`,
          top: `${node.y}%`,
          transform: "translate(-50%, -50%)",
          padding: "10px 16px",
          minWidth: 100,
          background: active ? node.bgColor : "rgba(10, 14, 26, 0.7)",
          border: `1.5px solid ${active ? node.color : `${node.color}40`}`,
          boxShadow: active ? `0 0 25px ${node.glowColor}, 0 0 50px ${node.glowColor}` : "none",
          zIndex: 5,
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: active ? node.color : `${node.color}aa` }}>
          {node.label}
        </span>
        {node.subtitle && (
          <span className="text-[9px] mt-0.5 whitespace-nowrap" style={{ color: active ? `${node.color}cc` : `${node.color}55` }}>
            {node.subtitle}
          </span>
        )}
      </button>
    )
  }

  // leaf
  return (
    <button
      onClick={() => onSelect(node.id === (isSelected ? node.id : null) ? null : node.id)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      className="absolute flex items-center justify-center rounded-lg transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: "translate(-50%, -50%)",
        padding: "6px 12px",
        background: active ? node.bgColor : "rgba(10, 14, 26, 0.5)",
        border: `1px solid ${active ? `${node.color}80` : `${node.color}20`}`,
        boxShadow: active ? `0 0 15px ${node.glowColor}` : "none",
        zIndex: 3,
        backdropFilter: "blur(8px)",
      }}
    >
      <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: active ? `${node.color}dd` : `${node.color}55` }}>
        {node.label}
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Mind Map Container                                                 */
/* ------------------------------------------------------------------ */

export function StudyMindMap() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Determine which nodes are "connected" to the hovered/selected node
  const activeId = hoveredNode ?? selectedNode
  const connectedIds = new Set<string>()
  if (activeId) {
    connectedIds.add(activeId)
    // Find parent
    const node = NODES.find((n) => n.id === activeId)
    if (node?.parentId) connectedIds.add(node.parentId)
    // Find children
    NODES.filter((n) => n.parentId === activeId).forEach((n) => connectedIds.add(n.id))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Map header */}
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15">
          <Zap className="h-3 w-3 text-primary" />
        </div>
        <span className="text-xs font-semibold text-foreground">Interactive Concept Map</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{NODES.length} nodes</span>
      </div>

      {/* Map area */}
      <div className="relative flex-1 min-h-[400px] overflow-hidden">
        {/* Dark grid bg */}
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.03) 0%, transparent 60%), linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 50px 50px, 50px 50px",
        }} />

        {/* SVG edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {EDGES.map((edge, i) => {
            const from = NODES.find((n) => n.id === edge.from)!
            const to = NODES.find((n) => n.id === edge.to)!
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
        {NODES.map((node) => (
          <MindMapNode
            key={node.id}
            node={node}
            isHovered={hoveredNode === node.id}
            isSelected={selectedNode === node.id}
            isConnected={connectedIds.has(node.id) && node.id !== (hoveredNode ?? selectedNode)}
            onHover={setHoveredNode}
            onSelect={(id) => setSelectedNode(id === selectedNode ? null : id)}
          />
        ))}

        {/* Detail panel */}
        {selectedNode && NODE_DETAILS[selectedNode] && (
          <div
            className="absolute bottom-3 left-3 right-3 glass-strong rounded-xl p-3.5 flex items-start gap-3 border border-border/30"
            style={{ zIndex: 20 }}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{
              background: NODES.find((n) => n.id === selectedNode)?.bgColor,
              border: `1px solid ${NODES.find((n) => n.id === selectedNode)?.color}40`,
            }}>
              <Info className="h-3.5 w-3.5" style={{ color: NODES.find((n) => n.id === selectedNode)?.color }} />
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
              onClick={() => setSelectedNode(null)}
              className="shrink-0 rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

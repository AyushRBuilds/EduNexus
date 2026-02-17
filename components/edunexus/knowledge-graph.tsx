"use client"

import { useState } from "react"
import { Info, MessageSquare, FileText, Network } from "lucide-react"

interface MindMapNode {
  id: string
  label: string
  color: string // border & text color
  bgColor: string // bg tint
  glowColor: string
  x: number // percentage positioning
  y: number // percentage positioning
  type: "core" | "satellite"
}

const MIND_MAP_NODES: MindMapNode[] = [
  {
    id: "core",
    label: "Laplace\nTransform",
    color: "rgb(56, 189, 248)", // sky-400
    bgColor: "rgba(56, 189, 248, 0.15)",
    glowColor: "rgba(56, 189, 248, 0.35)",
    x: 50,
    y: 50,
    type: "core",
  },
  {
    id: "def",
    label: "Definition",
    color: "rgb(52, 211, 153)", // emerald-400
    bgColor: "rgba(52, 211, 153, 0.08)",
    glowColor: "rgba(52, 211, 153, 0.2)",
    x: 22,
    y: 28,
    type: "satellite",
  },
  {
    id: "props",
    label: "Properties",
    color: "rgb(192, 132, 252)", // purple-400
    bgColor: "rgba(192, 132, 252, 0.08)",
    glowColor: "rgba(192, 132, 252, 0.2)",
    x: 78,
    y: 25,
    type: "satellite",
  },
  {
    id: "inv",
    label: "Inverse Laplace",
    color: "rgb(45, 212, 191)", // teal-400
    bgColor: "rgba(45, 212, 191, 0.08)",
    glowColor: "rgba(45, 212, 191, 0.2)",
    x: 25,
    y: 72,
    type: "satellite",
  },
  {
    id: "circuit",
    label: "Circuit Apps",
    color: "rgb(251, 146, 60)", // orange-400
    bgColor: "rgba(251, 146, 60, 0.08)",
    glowColor: "rgba(251, 146, 60, 0.2)",
    x: 80,
    y: 70,
    type: "satellite",
  },
  {
    id: "ode",
    label: "Solving ODEs",
    color: "rgb(248, 113, 113)", // red-400
    bgColor: "rgba(248, 113, 113, 0.08)",
    glowColor: "rgba(248, 113, 113, 0.2)",
    x: 50,
    y: 88,
    type: "satellite",
  },
  {
    id: "control",
    label: "Control Systems",
    color: "rgb(250, 204, 21)", // yellow-400
    bgColor: "rgba(250, 204, 21, 0.08)",
    glowColor: "rgba(250, 204, 21, 0.2)",
    x: 85,
    y: 47,
    type: "satellite",
  },
]

const EDGES = [
  { from: "core", to: "def" },
  { from: "core", to: "props" },
  { from: "core", to: "inv" },
  { from: "core", to: "circuit" },
  { from: "core", to: "ode" },
  { from: "core", to: "control" },
]

const NODE_DETAILS: Record<string, { title: string; desc: string }> = {
  core: { title: "Laplace Transform", desc: "An integral transform converting time-domain functions to complex frequency-domain (s-domain). Fundamental to signal processing and control theory." },
  def: { title: "Definition", desc: "L{f(t)} = F(s) = integral from 0 to infinity of e^(-st) f(t) dt. Converts time-domain to frequency-domain." },
  props: { title: "Properties", desc: "Linearity, time-shifting, frequency-shifting, time-scaling, differentiation, and integration properties." },
  inv: { title: "Inverse Laplace", desc: "Recovering f(t) from F(s) using partial fractions, convolution theorem, or complex integration." },
  circuit: { title: "Circuit Applications", desc: "Analyzing RLC circuits by transforming differential equations into algebraic equations in s-domain." },
  ode: { title: "Solving ODEs", desc: "Converting ordinary differential equations to algebraic equations for easier solving." },
  control: { title: "Control Systems", desc: "Transfer functions, stability analysis, and feedback loop design using s-domain representation." },
}

function MindMapView() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  return (
    <div className="relative w-full" style={{ height: 480 }}>
      {/* Grid background */}
      <div className="absolute inset-0 rounded-xl bg-grid opacity-50" />

      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {EDGES.map((edge) => {
          const from = MIND_MAP_NODES.find((n) => n.id === edge.from)!
          const to = MIND_MAP_NODES.find((n) => n.id === edge.to)!
          const isActive = hoveredNode === edge.from || hoveredNode === edge.to || selectedNode === edge.to
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke={isActive ? to.color : "rgba(100, 130, 180, 0.2)"}
              strokeWidth={isActive ? 2 : 1}
              strokeDasharray={isActive ? "none" : "6 4"}
              style={{ transition: "all 0.3s ease" }}
            />
          )
        })}
      </svg>

      {/* DOM nodes */}
      {MIND_MAP_NODES.map((node) => {
        const isHovered = hoveredNode === node.id
        const isSelected = selectedNode === node.id

        if (node.type === "core") {
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute flex items-center justify-center rounded-full transition-all duration-300 animate-float cursor-pointer focus:outline-none"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
                width: 110,
                height: 110,
                background: `radial-gradient(circle, ${node.bgColor} 0%, rgba(15, 23, 42, 0.8) 70%)`,
                border: `2px solid ${node.color}`,
                boxShadow: isHovered
                  ? `0 0 40px ${node.glowColor}, 0 0 80px ${node.glowColor}`
                  : `0 0 25px ${node.glowColor}`,
                zIndex: 10,
              }}
            >
              <span className="text-sm font-semibold text-center leading-tight whitespace-pre-line" style={{ color: node.color }}>
                {node.label}
              </span>
            </button>
          )
        }

        return (
          <button
            key={node.id}
            onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer focus:outline-none"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
              padding: "10px 20px",
              background: isHovered || isSelected ? node.bgColor : "rgba(15, 23, 42, 0.7)",
              border: `1.5px solid ${isHovered || isSelected ? node.color : `${node.color}80`}`,
              boxShadow: isHovered || isSelected ? `0 0 20px ${node.glowColor}` : "none",
              zIndex: 5,
              backdropFilter: "blur(10px)",
            }}
          >
            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{ color: isHovered || isSelected ? node.color : `${node.color}cc` }}
            >
              {node.label}
            </span>
          </button>
        )
      })}

      {/* Detail card overlay */}
      {selectedNode && NODE_DETAILS[selectedNode] && (
        <div
          className="absolute bottom-4 left-4 right-4 glass-strong rounded-xl p-4 flex items-start gap-3"
          style={{ zIndex: 20 }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {NODE_DETAILS[selectedNode].title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {NODE_DETAILS[selectedNode].desc}
            </p>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="ml-auto shrink-0 text-muted-foreground hover:text-foreground text-xs"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

function SummaryView({ query }: { query: string }) {
  return (
    <div className="p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Concept Summary: {query || "Laplace Transform"}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Definitions",
            items: [
              "Integral transform converting time-domain to frequency-domain",
              "Defined as L{f(t)} = F(s) = integral from 0 to infinity",
            ],
          },
          {
            title: "Applications",
            items: [
              "Circuit analysis (RLC networks)",
              "Solving ordinary differential equations",
              "Control system design & transfer functions",
            ],
          },
          {
            title: "Related Concepts",
            items: [
              "Inverse Laplace Transform",
              "Partial fraction decomposition",
              "Convolution theorem",
            ],
          },
          {
            title: "Cross-Disciplinary Links",
            items: [
              "Fourier Transform (continuous spectra)",
              "Z-Transform (discrete signals)",
              "Signal Processing & Communications",
            ],
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-border bg-secondary/20 p-4"
          >
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h4>
            <ul className="space-y-1.5">
              {section.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-secondary-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export function KnowledgeGraph({ query }: { query: string }) {
  const [view, setView] = useState<"mindmap" | "summary">("mindmap")

  const tabs = [
    { id: "mindmap" as const, label: "Mind Map", icon: Network },
    { id: "summary" as const, label: "Key Summary", icon: FileText },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Knowledge Graph
        </h2>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/30 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === tab.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {view === "mindmap" ? (
          <MindMapView />
        ) : (
          <SummaryView query={query} />
        )}
      </div>

      {/* Bottom info */}
      <div className="mt-3 flex items-center gap-2 px-2">
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          This map visualizes the key concepts from the lecture. Click on any node to see details.
        </p>
      </div>
    </section>
  )
}

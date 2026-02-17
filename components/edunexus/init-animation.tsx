"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { EduNexusLogo } from "./edunexus-logo"

/* ------------------------------------------------------------------ */
/*  Deterministic grid nodes – positions are fixed to avoid hydration  */
/* ------------------------------------------------------------------ */
function generateNodes(count: number) {
  const nodes: { x: number; y: number; delay: number; size: number }[] = []
  // Use a simple seeded approach for deterministic values
  for (let i = 0; i < count; i++) {
    const seed = (i * 1327 + 947) % 1000
    nodes.push({
      x: (seed % 100),
      y: (Math.floor(seed / 3.7) % 100),
      delay: (i % 10) * 0.15,
      size: 1.5 + (seed % 3) * 0.5,
    })
  }
  return nodes
}

/* Deterministic edges between nearby nodes */
function generateEdges(nodes: { x: number; y: number }[]) {
  const edges: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 20 && edges.length < 40) {
        edges.push({
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[j].x,
          y2: nodes[j].y,
          delay: (i + j) * 0.05,
        })
      }
    }
  }
  return edges
}

const STATUS_LINES = [
  "Connecting to knowledge graph...",
  "Loading institutional data...",
  "Indexing research papers...",
  "Preparing AI models...",
  "Initializing Campus Knowledge Engine...",
]

export function InitAnimation({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [statusIdx, setStatusIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  const nodes = useMemo(() => generateNodes(35), [])
  const edges = useMemo(() => generateEdges(nodes), [nodes])

  useEffect(() => {
    // Progress bar fills over ~2.6s
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + 1.2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  // Cycle through status lines
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((i) => (i < STATUS_LINES.length - 1 ? i + 1 : i))
    }, 550)
    return () => clearInterval(interval)
  }, [])

  // Trigger fade-out at 100%
  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => setVisible(false), 400)
      return () => clearTimeout(timeout)
    }
  }, [progress])

  return (
    <AnimatePresence
      onExitComplete={onComplete}
    >
      {visible && (
        <motion.div
          key="init-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0b1120 0%, #111b33 40%, #0f1729 100%)",
          }}
        >
          {/* ----- Neural network background ----- */}
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            {/* Edges */}
            {edges.map((e, i) => (
              <motion.line
                key={`e-${i}`}
                x1={`${e.x1}%`}
                y1={`${e.y1}%`}
                x2={`${e.x2}%`}
                y2={`${e.y2}%`}
                stroke="rgba(100,160,220,0.12)"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: e.delay, ease: "easeOut" }}
              />
            ))}

            {/* Nodes */}
            {nodes.map((n, i) => (
              <motion.circle
                key={`n-${i}`}
                cx={`${n.x}%`}
                cy={`${n.y}%`}
                r={n.size}
                fill="rgba(100,170,230,0.25)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.6, 0.3], scale: [0, 1.2, 1] }}
                transition={{
                  duration: 1.6,
                  delay: n.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </svg>

          {/* Subtle radial glow behind center */}
          <div
            className="pointer-events-none absolute h-[500px] w-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(60,130,200,0.08) 0%, transparent 70%)",
            }}
          />

          {/* ----- Center content ----- */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <EduNexusLogo size={44} />
              <div className="flex flex-col">
                <span
                  className="text-3xl font-bold tracking-tight"
                  style={{ color: "rgba(220,235,255,0.95)" }}
                >
                  EduNexus
                </span>
                <span
                  className="text-[11px] font-medium tracking-widest uppercase"
                  style={{ color: "rgba(140,175,220,0.6)" }}
                >
                  Smart Campus
                </span>
              </div>
            </motion.div>

            {/* Status text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="h-5 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs font-medium tracking-wide text-center"
                  style={{ color: "rgba(160,190,230,0.7)" }}
                >
                  {STATUS_LINES[statusIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-64 overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", height: 3 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, rgba(80,150,220,0.7), rgba(100,200,240,0.5))",
                  width: `${Math.min(progress, 100)}%`,
                }}
                transition={{ ease: "linear" }}
              />
            </motion.div>

            {/* Percentage */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] font-mono tabular-nums"
              style={{ color: "rgba(130,170,220,0.5)" }}
            >
              {Math.min(Math.round(progress), 100)}%
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

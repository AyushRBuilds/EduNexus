"use client"

import { useEffect, useState, useCallback } from "react"

export type BackendStatus = "unknown" | "waking" | "ok" | "down"

/**
 * Pings /api/backend-health to wake up the Render free-tier backend.
 * Re-exports a `status` and a manual `retry()` function.
 */
export function useBackendHealth() {
  const [status, setStatus] = useState<BackendStatus>("unknown")
  const [attempt, setAttempt] = useState(0)

  const ping = useCallback(async () => {
    try {
      setStatus("waking")
      const res = await fetch("/api/backend-health")
      const data = await res.json()
      if (data.status === "ok") {
        setStatus("ok")
        return true
      }
    } catch {
      // Network error
    }
    return false
  }, [])

  useEffect(() => {
    let cancelled = false

    async function warmUp() {
      // Try up to 4 times (total ~2 min for worst-case cold start)
      for (let i = 0; i < 4; i++) {
        if (cancelled) return
        const ok = await ping()
        if (ok) return
        // Wait 15s before next attempt
        if (i < 3) {
          await new Promise((r) => setTimeout(r, 15_000))
        }
      }
      if (!cancelled) setStatus("down")
    }

    warmUp()
    return () => { cancelled = true }
  }, [ping, attempt])

  const retry = useCallback(() => {
    setStatus("unknown")
    setAttempt((a) => a + 1)
  }, [])

  return { status, retry }
}

'use client';

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Loket } from "@/lib/supabase"
import { getAllLokets } from "@/lib/loket-service"

export function useRealtimeLokets() {
  const [lokets, setLokets] = useState<Loket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLokets = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllLokets()
      setLokets(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching lokets:", err)
      setError("Gagal memuat data loket")
    } finally {
      setLoading(false)
    }
  }, [])

  // Optimistic update for loket
  const updateLoketOptimistic = useCallback((loketId: string, updates: Partial<Loket>) => {
    setLokets((current) =>
      current.map((l) => (l.id === loketId ? { ...l, ...updates } : l))
    )
  }, [])

  useEffect(() => {
    fetchLokets()

    // Subscribe to lokets changes with Supabase Realtime
    const loketsSubscription = supabase
      .channel("lokets-realtime-v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "lokets" }, (payload) => {
        console.log("[v0] Loket realtime event:", payload.eventType, payload.new)
        if (payload.eventType === "INSERT") {
          setLokets((current) => {
            // Avoid duplicates
            if (current.some((l) => l.id === (payload.new as Loket).id)) return current
            return [...current, payload.new as Loket]
          })
        } else if (payload.eventType === "UPDATE") {
          setLokets((current) => current.map((l) => (l.id === payload.new.id ? (payload.new as Loket) : l)))
        } else if (payload.eventType === "DELETE") {
          setLokets((current) => current.filter((l) => l.id !== payload.old.id))
        }
      })
      .subscribe((status) => {
        console.log("[v0] Lokets subscription status:", status)
      })

    return () => {
      supabase.removeChannel(loketsSubscription)
    }
  }, [fetchLokets])

  return {
    lokets,
    loading,
    error,
    refetch: fetchLokets,
    updateLoketOptimistic,
  }
}

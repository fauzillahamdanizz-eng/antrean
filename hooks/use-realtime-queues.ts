"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Queue, QueueEntry } from "@/lib/supabase"
import { getQueues, getQueueEntries } from "@/lib/supabase-service"

export function useRealtimeQueues() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      const [queuesData, entriesData] = await Promise.all([getQueues(), getQueueEntries()])
      setQueues(queuesData)
      setQueueEntries(entriesData)
    } catch (err) {
      console.error("[v0] Error refetching data:", err)
    }
  }, [])

  // Optimistic update for queue entry status
  const updateEntryOptimistic = useCallback((entryId: string, newStatus: string) => {
    setQueueEntries((current) =>
      current.map((e) =>
        e.id === entryId
          ? { ...e, status: newStatus as QueueEntry["status"], updated_at: new Date().toISOString() }
          : e
      )
    )
  }, [])

  // Optimistic update for queue
  const updateQueueOptimistic = useCallback((queueId: string, updates: Partial<Queue>) => {
    setQueues((current) =>
      current.map((q) => (q.id === queueId ? { ...q, ...updates } : q))
    )
  }, [])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [queuesData, entriesData] = await Promise.all([getQueues(), getQueueEntries()])

        setQueues(queuesData)
        setQueueEntries(entriesData)
      } catch (err) {
        console.error("[v0] Error fetching initial data:", err)
        setError("Gagal memuat data antrian. Silakan refresh halaman.")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()

    // Subscribe to queues changes (INSERT, UPDATE, DELETE)
    const queuesSubscription = supabase
      .channel("queues-realtime-v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "queues" }, (payload) => {
        console.log("[v0] Queue realtime event:", payload.eventType, payload.new)
        if (payload.eventType === "INSERT") {
          setQueues((current) => [...current, payload.new as Queue])
        } else if (payload.eventType === "UPDATE") {
          setQueues((current) => current.map((q) => (q.id === payload.new.id ? (payload.new as Queue) : q)))
        } else if (payload.eventType === "DELETE") {
          setQueues((current) => current.filter((q) => q.id !== payload.old.id))
        }
      })
      .subscribe((status) => {
        console.log("[v0] Queues subscription status:", status)
      })

    // Subscribe to queue_entries changes (INSERT, UPDATE, DELETE)
    const entriesSubscription = supabase
      .channel("queue-entries-realtime-v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_entries" }, (payload) => {
        console.log("[v0] Entry realtime event:", payload.eventType, payload.new)
        if (payload.eventType === "INSERT") {
          const newEntry = payload.new as QueueEntry
          setQueueEntries((current) => {
            // Avoid duplicates
            if (current.some((e) => e.id === newEntry.id)) return current
            return [newEntry, ...current]
          })
        } else if (payload.eventType === "UPDATE") {
          const updatedEntry = payload.new as QueueEntry
          setQueueEntries((current) => current.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)))
        } else if (payload.eventType === "DELETE") {
          setQueueEntries((current) => current.filter((e) => e.id !== payload.old.id))
        }
      })
      .subscribe((status) => {
        console.log("[v0] Entries subscription status:", status)
      })

    return () => {
      supabase.removeChannel(queuesSubscription)
      supabase.removeChannel(entriesSubscription)
    }
  }, [])

  return { 
    queues, 
    queueEntries, 
    loading, 
    error, 
    refetch,
    updateEntryOptimistic,
    updateQueueOptimistic
  }
}

import { v4 as uuidv4 } from "uuid"
import type { Queue, QueueEntry, Announcement } from "@/lib/supabase"

// Local storage keys
const QUEUES_KEY = "queue_management_queues"
const QUEUE_ENTRIES_KEY = "queue_management_entries"
const ANNOUNCEMENTS_KEY = "queue_management_announcements"

// Initialize mock data
const initializeMockData = (): void => {
  if (typeof window === "undefined") return

  try {
    // Initialize queues
    const existingQueues = localStorage.getItem(QUEUES_KEY)
    if (!existingQueues) {
      const defaultQueues: Queue[] = [
        {
          id: uuidv4(),
          name: "Pelayanan Umum",
          description: "Antrian untuk layanan umum",
          current_number: 1,
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          name: "Administrasi",
          description: "Antrian untuk layanan administrasi",
          current_number: 1,
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          name: "Klaim",
          description: "Antrian untuk layanan klaim",
          current_number: 1,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ]
      localStorage.setItem(QUEUES_KEY, JSON.stringify(defaultQueues))
    }

    // Initialize queue entries
    const existingEntries = localStorage.getItem(QUEUE_ENTRIES_KEY)
    if (!existingEntries) {
      localStorage.setItem(QUEUE_ENTRIES_KEY, JSON.stringify([]))
    }
  } catch (error) {
    console.error("Error initializing mock data:", error)
  }
}

// Queue functions
export async function getQueues(): Promise<Queue[]> {
  if (typeof window === "undefined") return []

  try {
    initializeMockData()
    const data = localStorage.getItem(QUEUES_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error getting queues:", error)
    return []
  }
}

export async function createQueue(queue: Omit<Queue, "id" | "created_at">): Promise<Queue> {
  if (typeof window === "undefined") throw new Error("Cannot create queue on server side")

  try {
    const queues = await getQueues()
    const newQueue: Queue = {
      ...queue,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    }
    queues.push(newQueue)
    localStorage.setItem(QUEUES_KEY, JSON.stringify(queues))
    return newQueue
  } catch (error) {
    console.error("Error creating queue:", error)
    throw error
  }
}

export async function updateQueue(id: string, updates: Partial<Queue>): Promise<Queue> {
  if (typeof window === "undefined") throw new Error("Cannot update queue on server side")

  try {
    const queues = await getQueues()
    const index = queues.findIndex((q) => q.id === id)
    if (index === -1) throw new Error("Queue not found")

    queues[index] = { ...queues[index], ...updates }
    localStorage.setItem(QUEUES_KEY, JSON.stringify(queues))
    return queues[index]
  } catch (error) {
    console.error("Error updating queue:", error)
    throw error
  }
}

export async function deleteQueue(id: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("Cannot delete queue on server side")

  try {
    const queues = await getQueues()
    const filtered = queues.filter((q) => q.id !== id)
    localStorage.setItem(QUEUES_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error deleting queue:", error)
    throw error
  }
}

// Queue Entry functions
export async function getQueueEntries(): Promise<QueueEntry[]> {
  if (typeof window === "undefined") return []

  try {
    initializeMockData()
    const data = localStorage.getItem(QUEUE_ENTRIES_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error getting queue entries:", error)
    return []
  }
}

export async function createQueueEntry(
  entry: Omit<QueueEntry, "id" | "created_at" | "completed_at">,
): Promise<QueueEntry> {
  if (typeof window === "undefined") throw new Error("Cannot create entry on server side")

  try {
    const entries = await getQueueEntries()
    const newEntry: QueueEntry = {
      ...entry,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      completed_at: null,
    }
    entries.push(newEntry)
    localStorage.setItem(QUEUE_ENTRIES_KEY, JSON.stringify(entries))
    return newEntry
  } catch (error) {
    console.error("Error creating queue entry:", error)
    throw error
  }
}

export async function updateQueueEntry(id: string, updates: Partial<QueueEntry>): Promise<QueueEntry> {
  if (typeof window === "undefined") throw new Error("Cannot update entry on server side")

  try {
    const entries = await getQueueEntries()
    const index = entries.findIndex((e) => e.id === id)
    if (index === -1) throw new Error("Entry not found")

    entries[index] = { ...entries[index], ...updates }
    localStorage.setItem(QUEUE_ENTRIES_KEY, JSON.stringify(entries))
    return entries[index]
  } catch (error) {
    console.error("Error updating queue entry:", error)
    throw error
  }
}

export async function deleteQueueEntry(id: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("Cannot delete entry on server side")

  try {
    const entries = await getQueueEntries()
    const filtered = entries.filter((e) => e.id !== id)
    localStorage.setItem(QUEUE_ENTRIES_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error deleting queue entry:", error)
    throw error
  }
}

// Announcement functions
export async function getAnnouncements(): Promise<Announcement[]> {
  if (typeof window === "undefined") return []

  try {
    initializeMockData()
    const data = localStorage.getItem(ANNOUNCEMENTS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error getting announcements:", error)
    return []
  }
}

export async function createAnnouncement(announcement: Omit<Announcement, "id" | "created_at">): Promise<Announcement> {
  if (typeof window === "undefined") throw new Error("Cannot create announcement on server side")

  try {
    const announcements = await getAnnouncements()
    const newAnnouncement: Announcement = {
      ...announcement,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    }
    announcements.push(newAnnouncement)
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements))
    return newAnnouncement
  } catch (error) {
    console.error("Error creating announcement:", error)
    throw error
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("Cannot delete announcement on server side")

  try {
    const announcements = await getAnnouncements()
    const filtered = announcements.filter((a) => a.id !== id)
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error deleting announcement:", error)
    throw error
  }
}

// Additional helper functions
export async function getActiveQueues(): Promise<Queue[]> {
  const queues = await getQueues()
  return queues.filter((q) => q.status === "active")
}

export async function getUserQueueEntries(userId: string): Promise<QueueEntry[]> {
  const entries = await getQueueEntries()
  return entries.filter((e) => e.user_id === userId)
}

export async function getActiveUserQueueEntry(userId: string): Promise<QueueEntry | null> {
  const entries = await getUserQueueEntries(userId)
  const active = entries.find((e) => e.status === "waiting" || e.status === "serving")
  return active || null
}

import { v4 as uuidv4 } from "uuid"
import type { Queue, QueueEntry, Announcement } from "@/lib/supabase"

// Storage keys
const QUEUES_KEY = "queue_management_queues"
const QUEUE_ENTRIES_KEY = "queue_management_entries"
const ANNOUNCEMENTS_KEY = "queue_management_announcements"

// Initialize with sample data
const initializeData = () => {
  if (typeof window === "undefined") return

  // Initialize queues if not exist
  if (!localStorage.getItem(QUEUES_KEY)) {
    const sampleQueues: Queue[] = [
      {
        id: uuidv4(),
        name: "Customer Service",
        description: "General customer service inquiries",
        current_number: 10,
        status: "active",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Technical Support",
        description: "Technical issues and troubleshooting",
        current_number: 5,
        status: "active",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Billing",
        description: "Billing inquiries and payment issues",
        current_number: 8,
        status: "paused",
        created_at: new Date().toISOString(),
      },
    ]
    localStorage.setItem(QUEUES_KEY, JSON.stringify(sampleQueues))
  }

  // Initialize queue entries if not exist
  if (!localStorage.getItem(QUEUE_ENTRIES_KEY)) {
    localStorage.setItem(QUEUE_ENTRIES_KEY, JSON.stringify([]))
  }
}

// Queue operations
export const getQueues = async (): Promise<Queue[]> => {
  if (typeof window === "undefined") return []

  initializeData()
  try {
    const queues = localStorage.getItem(QUEUES_KEY)
    return queues ? JSON.parse(queues) : []
  } catch (error) {
    console.error("Error getting queues:", error)
    return []
  }
}

export const getActiveQueues = async (): Promise<Queue[]> => {
  const queues = await getQueues()
  return queues.filter((queue) => queue.status === "active")
}

export const createQueue = async (queueData: Omit<Queue, "id" | "created_at">): Promise<Queue> => {
  if (typeof window === "undefined") throw new Error("Cannot create queue on server side")

  const queues = await getQueues()

  const newQueue: Queue = {
    ...queueData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  }

  localStorage.setItem(QUEUES_KEY, JSON.stringify([...queues, newQueue]))
  return newQueue
}

export const updateQueue = async (id: string, queueData: Partial<Queue>): Promise<Queue> => {
  if (typeof window === "undefined") throw new Error("Cannot update queue on server side")

  const queues = await getQueues()
  const queueIndex = queues.findIndex((q) => q.id === id)

  if (queueIndex === -1) {
    throw new Error("Queue not found")
  }

  const updatedQueue = {
    ...queues[queueIndex],
    ...queueData,
  }

  queues[queueIndex] = updatedQueue
  localStorage.setItem(QUEUES_KEY, JSON.stringify(queues))

  return updatedQueue
}

export const deleteQueue = async (id: string): Promise<void> => {
  if (typeof window === "undefined") return

  const queues = await getQueues()
  const updatedQueues = queues.filter((q) => q.id !== id)

  localStorage.setItem(QUEUES_KEY, JSON.stringify(updatedQueues))
}

// Queue entries operations
export const getQueueEntries = async (): Promise<QueueEntry[]> => {
  if (typeof window === "undefined") return []

  initializeData()
  try {
    const entries = localStorage.getItem(QUEUE_ENTRIES_KEY)
    return entries ? JSON.parse(entries) : []
  } catch (error) {
    console.error("Error getting queue entries:", error)
    return []
  }
}

export const getUserQueueEntries = async (userId: string): Promise<QueueEntry[]> => {
  const entries = await getQueueEntries()
  return entries.filter((entry) => entry.user_id === userId)
}

export const getActiveUserQueueEntry = async (userId: string): Promise<QueueEntry | null> => {
  const entries = await getQueueEntries()
  return entries.find((entry) => entry.user_id === userId && ["waiting", "serving"].includes(entry.status)) || null
}

export const createQueueEntry = async (userId: string, queueId: string, queueNumber: number): Promise<QueueEntry> => {
  if (typeof window === "undefined") throw new Error("Cannot create queue entry on server side")

  const entries = await getQueueEntries()

  const newEntry: QueueEntry = {
    id: uuidv4(),
    user_id: userId,
    queue_number: queueNumber,
    status: "waiting",
    created_at: new Date().toISOString(),
    completed_at: null,
  }

  localStorage.setItem(QUEUE_ENTRIES_KEY, JSON.stringify([...entries, newEntry]))

  // Update queue current number
  const queues = await getQueues()
  const queueIndex = queues.findIndex((q) => q.id === queueId)

  if (queueIndex !== -1) {
    queues[queueIndex].current_number = queueNumber
    localStorage.setItem(QUEUES_KEY, JSON.stringify(queues))
  }

  return newEntry
}

export const updateQueueEntry = async (id: string, data: Partial<QueueEntry>): Promise<QueueEntry> => {
  if (typeof window === "undefined") throw new Error("Cannot update queue entry on server side")

  const entries = await getQueueEntries()
  const entryIndex = entries.findIndex((e) => e.id === id)

  if (entryIndex === -1) {
    throw new Error("Queue entry not found")
  }

  const updatedEntry = {
    ...entries[entryIndex],
    ...data,
    ...(data.status === "completed" ? { completed_at: new Date().toISOString() } : {}),
  }

  entries[entryIndex] = updatedEntry
  localStorage.setItem(QUEUE_ENTRIES_KEY, JSON.stringify(entries))

  return updatedEntry
}

// Announcements operations
export const getAnnouncements = async (): Promise<Announcement[]> => {
  if (typeof window === "undefined") return []

  initializeData()
  try {
    const announcements = localStorage.getItem(ANNOUNCEMENTS_KEY)
    return announcements ? JSON.parse(announcements) : []
  } catch (error) {
    console.error("Error getting announcements:", error)
    return []
  }
}

export const createAnnouncement = async (data: Omit<Announcement, "id" | "created_at">): Promise<Announcement> => {
  if (typeof window === "undefined") throw new Error("Cannot create announcement on server side")

  const announcements = await getAnnouncements()

  const newAnnouncement: Announcement = {
    ...data,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  }

  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify([...announcements, newAnnouncement]))

  return newAnnouncement
}

export const updateAnnouncement = async (id: string, data: Partial<Announcement>): Promise<Announcement> => {
  if (typeof window === "undefined") throw new Error("Cannot update announcement on server side")

  const announcements = await getAnnouncements()
  const announcementIndex = announcements.findIndex((a) => a.id === id)

  if (announcementIndex === -1) {
    throw new Error("Announcement not found")
  }

  const updatedAnnouncement = {
    ...announcements[announcementIndex],
    ...data,
  }

  announcements[announcementIndex] = updatedAnnouncement
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements))

  return updatedAnnouncement
}

export const deleteAnnouncement = async (id: string): Promise<void> => {
  if (typeof window === "undefined") return

  const announcements = await getAnnouncements()
  const updatedAnnouncements = announcements.filter((a) => a.id !== id)

  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(updatedAnnouncements))
}

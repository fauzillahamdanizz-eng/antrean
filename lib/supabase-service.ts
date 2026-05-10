import { supabase } from "@/lib/supabase"
import type {
  Profile,
  Queue,
  QueueEntry,
  Announcement,
  QueueStatistic,
  ServiceRating,
  StaffMember,
  QueueHistory,
} from "@/lib/supabase"

// Queues - Using Supabase
export async function getQueues(): Promise<Queue[]> {
  try {
    const { data, error } = await supabase.from("queues").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Supabase error getting queues:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting queues:", error)
    return []
  }
}

export async function getActiveQueues(): Promise<Queue[]> {
  try {
    const { data, error } = await supabase
      .from("queues")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Supabase error getting active queues:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting active queues:", error)
    return []
  }
}

export async function getQueueById(id: string): Promise<Queue | null> {
  try {
    const { data, error } = await supabase.from("queues").select("*").eq("id", id).single()

    if (error) {
      console.error("Supabase error getting queue:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error getting queue:", error)
    return null
  }
}

export async function createQueue(queue: Omit<Queue, "id" | "created_at">): Promise<Queue> {
  try {
    const { data, error } = await supabase.from("queues").insert([queue]).select().single()

    if (error) {
      console.error("Supabase error creating queue:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error creating queue:", error)
    throw error
  }
}

export async function updateQueue(id: string, updates: Partial<Queue>): Promise<Queue> {
  try {
    const { data, error } = await supabase.from("queues").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Supabase error updating queue:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error updating queue:", error)
    throw error
  }
}

export async function deleteQueue(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("queues").delete().eq("id", id)

    if (error) {
      console.error("Supabase error deleting queue:", error)
      throw error
    }
  } catch (error) {
    console.error("Error deleting queue:", error)
    throw error
  }
}

// Queue Entries - Using Supabase
export async function getQueueEntries(): Promise<QueueEntry[]> {
  try {
    const { data, error } = await supabase.from("queue_entries").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error getting queue entries:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting queue entries:", error)
    return []
  }
}

export async function getUserQueueEntries(userId: string): Promise<QueueEntry[]> {
  try {
    const { data, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error getting user queue entries:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting user queue entries:", error)
    return []
  }
}

export async function getActiveUserQueueEntry(userId: string): Promise<QueueEntry | null> {
  try {
    const { data, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["waiting", "serving"])
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Supabase error getting active user queue entry:", error)
      throw error
    }
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error("Error getting active user queue entry:", error)
    return null
  }
}

export async function createQueueEntry(
  entry: Omit<QueueEntry, "id" | "created_at" | "completed_at">,
): Promise<QueueEntry> {
  try {
    const { data, error } = await supabase
      .from("queue_entries")
      .insert([{ ...entry, completed_at: null }])
      .select()
      .single()

    if (error) {
      console.error("Supabase error creating queue entry:", error)
      throw error
    }

    // Send queue_joined notification
    if (data) {
      try {
        const queue = await getQueueById(entry.queue_id);
        const user = await getProfileById(entry.user_id);

        if (queue && user) {
          console.log("[v0] Triggering queue_joined notification for:", user.email);
          const response = await fetch("/api/notifications/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventType: "queue_joined",
              userId: user.id,
              queueEntryId: data.id,
              queueName: queue.name,
              queueNumber: data.queue_number,
            }),
          });
          
          const result = await response.json();
          console.log("[v0] queue_joined notification response:", result);
          
          if (!response.ok) {
            console.error("Error sending queue_joined notification:", result);
          }
        }
      } catch (notifError) {
        console.error("Error triggering queue_joined notification:", notifError);
        // Don't throw, notification is not critical
      }
    }

    return data
  } catch (error) {
    console.error("Error creating queue entry:", error)
    throw error
  }
}

export async function updateQueueEntry(id: string, updates: Partial<QueueEntry>): Promise<QueueEntry> {
  try {
    const { data, error } = await supabase.from("queue_entries").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Supabase error updating queue entry:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error updating queue entry:", error)
    throw error
  }
}

export async function deleteQueueEntry(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("queue_entries").delete().eq("id", id)

    if (error) {
      console.error("Supabase error deleting queue entry:", error)
      throw error
    }
  } catch (error) {
    console.error("Error deleting queue entry:", error)
    throw error
  }
}

export async function cancelQueueEntry(id: string): Promise<QueueEntry> {
  try {
    const { data, error } = await supabase
      .from("queue_entries")
      .update({
        status: "cancelled",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error cancelling queue entry:", error)
      throw error
    }

    // Send queue_cancelled notification
    if (data) {
      try {
        const queue = await getQueueById(data.queue_id);
        const user = await getProfileById(data.user_id);

        if (queue && user) {
          console.log("[v0] Triggering queue_cancelled notification for:", user.email);
          const response = await fetch("/api/notifications/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventType: "queue_cancelled",
              userId: user.id,
              queueEntryId: data.id,
              queueName: queue.name,
              queueNumber: data.queue_number,
              reason: "Dibatalkan oleh pengguna",
            }),
          });
          
          const result = await response.json();
          console.log("[v0] queue_cancelled notification response:", result);
          
          if (!response.ok) {
            console.error("Error sending queue_cancelled notification:", result);
          }
        }
      } catch (notifError) {
        console.error("Error triggering queue_cancelled notification:", notifError);
        // Don't throw, notification is not critical
      }
    }

    return data
  } catch (error) {
    console.error("Error cancelling queue entry:", error)
    throw error
  }
}

export async function callQueueEntry(id: string, calledBy?: string): Promise<QueueEntry> {
  try {
    const updates: Partial<QueueEntry> = {
      status: "serving",
    }

    const { data, error } = await supabase.from("queue_entries").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Supabase error calling queue entry:", error)
      throw error
    }

    // Send queue_serving notification to the customer being called (isNextInQueue: false = "sedang dilayani")
    // and queue_serving notification to the NEXT customer (isNextInQueue: true = "segera dipanggil")
    if (data) {
      try {
        const queue = await getQueueById(data.queue_id)
        const user = await getProfileById(data.user_id)

        if (queue && user) {
          const response = await fetch("/api/notifications/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventType: "queue_serving",
              userId: user.id,
              queueEntryId: data.id,
              queueName: queue.name,
              queueNumber: data.queue_number,
              windowNumber: calledBy || "1",
              isNextInQueue: false, // This customer is CURRENTLY BEING SERVED
            }),
          })

          if (!response.ok) {
            const result = await response.json()
            console.error("Error sending queue_serving notification:", result)
          }
        }
      } catch (notifError) {
        console.error("Error triggering queue_serving notification for being served:", notifError)
        // Don't throw, notification is not critical
      }

      // Also send queue_serving notification to NEXT customer (with isNextInQueue: true)
      try {
        const queue = await getQueueById(data.queue_id)
        
        if (queue) {
          // Get the next customer (queue_number = current_called_number + 1)
          const nextQueueNumber = data.queue_number + 1
          
          // Find the next waiting entry with this queue number
          const { data: nextEntries, error: nextError } = await supabase
            .from("queue_entries")
            .select("*")
            .eq("queue_id", data.queue_id)
            .eq("queue_number", nextQueueNumber)
            .eq("status", "waiting")
            .limit(1)
          
          if (nextError) {
            console.error("Error finding next customer:", nextError)
          } else if (nextEntries && nextEntries.length > 0) {
            const nextEntry = nextEntries[0]
            const nextUser = await getProfileById(nextEntry.user_id)
            
            if (nextUser) {
              const response = await fetch("/api/notifications/send", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  eventType: "queue_serving",
                  userId: nextUser.id,
                  queueEntryId: nextEntry.id,
                  queueName: queue.name,
                  queueNumber: nextEntry.queue_number,
                  windowNumber: calledBy || "1",
                  isNextInQueue: true, // This customer WILL BE CALLED SOON
                }),
              })

              if (!response.ok) {
                const result = await response.json()
                console.error("Error sending queue_serving notification:", result)
              }
            }
          }
        }
      } catch (notifError) {
        console.error("Error triggering queue_serving notification for next customer:", notifError)
        // Don't throw, notification is not critical
      }
    }

    return data
  } catch (error) {
    console.error("Error calling queue entry:", error)
    throw error
  }
}

export async function getCompletedEntriesToday(): Promise<QueueEntry[]> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const { data, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("status", "completed")
      .gte("completed_at", todayISO)
      .order("completed_at", { ascending: false })

    if (error) {
      console.error("Supabase error getting completed entries:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting completed entries:", error)
    return []
  }
}

export async function getCancelledEntriesToday(): Promise<QueueEntry[]> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const { data, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("status", "cancelled")
      .gte("completed_at", todayISO)
      .order("completed_at", { ascending: false })

    if (error) {
      console.error("Supabase error getting cancelled entries:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting cancelled entries:", error)
    return []
  }
}

export async function completeQueueEntry(id: string): Promise<QueueEntry> {
  try {
    const { data, error } = await supabase
      .from("queue_entries")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error completing queue entry:", error)
      throw error
    }

    // Update the loket's total_served_today via loket_assignments
    try {
      // Find the loket assignment for this queue entry
      const { data: assignment } = await supabase
        .from("loket_assignments")
        .select("loket_id")
        .eq("queue_entry_id", id)
        .single()

      if (assignment?.loket_id) {
        // Get current loket data
        const { data: loket } = await supabase
          .from("lokets")
          .select("total_served_today")
          .eq("id", assignment.loket_id)
          .single()

        // Update loket to increment total_served_today and set back to available
        await supabase
          .from("lokets")
          .update({
            status: "available",
            current_serving_entry_id: null,
            total_served_today: (loket?.total_served_today || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", assignment.loket_id)

        // Update the assignment with completion timestamp
        await supabase
          .from("loket_assignments")
          .update({
            completed_at: new Date().toISOString(),
          })
          .eq("queue_entry_id", id)
      }
    } catch (loketError) {
      console.error("Error updating loket stats:", loketError)
      // Don't throw, loket update is not critical for queue completion
    }

    // Send queue_completed notification via API route
    if (data) {
      try {
        const queue = await getQueueById(data.queue_id)
        const user = await getProfileById(data.user_id)

        if (queue && user) {
          // Use API route for consistency with queue_joined and queue_cancelled
          const response = await fetch("/api/notifications/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventType: "queue_completed",
              userId: user.id,
              queueEntryId: data.id,
              queueName: queue.name,
              queueNumber: data.queue_number,
            }),
          })

          if (!response.ok) {
            const result = await response.json()
            console.error("Error sending queue_completed notification:", result)
          }
        }
      } catch (notifError) {
        console.error("Error triggering queue_completed notification:", notifError)
        // Don't throw, notification is not critical
      }
    }

    return data
  } catch (error) {
    console.error("Error completing queue entry:", error)
    throw error
  }
}

// Announcements - Using Supabase
// Profiles/Users - Using Supabase
export async function getProfiles(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error getting profiles:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting profiles:", error)
    return []
  }
}

export async function getProfileById(id: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

    if (error) {
      console.error("Supabase error getting profile:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error getting profile:", error)
    return null
  }
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single()

    if (error) {
      console.error("Supabase error getting profile by email:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error getting profile by email:", error)
    return null
  }
}

export async function createProfile(profile: Omit<Profile, "created_at">): Promise<Profile> {
  try {
    const { data, error } = await supabase.from("profiles").insert([profile]).select().single()

    if (error) {
      console.error("Supabase error creating profile:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error creating profile:", error)
    throw error
  }
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
  try {
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Supabase error updating profile:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

export async function deleteProfile(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("profiles").delete().eq("id", id)

    if (error) {
      console.error("Supabase error deleting profile:", error)
      throw error
    }
  } catch (error) {
    console.error("Error deleting profile:", error)
    throw error
  }
}

// Placeholder implementations for advanced features
export async function getQueueStatistics(queueId: string, days = 7): Promise<QueueStatistic[]> {
  return []
}

export async function createQueueStatistic(stat: Omit<QueueStatistic, "id" | "created_at">): Promise<QueueStatistic> {
  throw new Error("Not implemented")
}

export async function getServiceRatings(queueEntryId: string): Promise<ServiceRating[]> {
  return []
}

export async function createServiceRating(rating: Omit<ServiceRating, "id" | "created_at">): Promise<ServiceRating> {
  throw new Error("Not implemented")
}

export async function getStaffMembers(queueId?: string): Promise<StaffMember[]> {
  return []
}

export async function updateStaffStatus(staffId: string, status: string): Promise<StaffMember> {
  throw new Error("Not implemented")
}

export async function getQueueHistory(queueId: string): Promise<QueueHistory[]> {
  return []
}

export async function createQueueHistory(history: Omit<QueueHistory, "id">): Promise<QueueHistory> {
  throw new Error("Not implemented")
}

export async function getPriorityQueueEntries(queueId: string): Promise<QueueEntry[]> {
  return []
}

export async function validateQueueWorkflow(queueId: string): Promise<{
  isValid: boolean
  errors: string[]
  warnings: string[]
  summary: string
}> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Get queue data
    const queue = await getQueueById(queueId)
    if (!queue) {
      errors.push("Queue not found")
      return { isValid: false, errors, warnings, summary: "Queue does not exist" }
    }

    // Get all entries in this queue
    const entries = await getQueueEntries()
    const queueEntries = entries.filter((e) => e.queue_id === queueId)

    // Validate queue number consistency
    console.log("[v0] ===== QUEUE VALIDATION REPORT =====")
    console.log("[v0] Queue:", queue.name, "| Current Number:", queue.current_number)
    console.log("[v0] Total Entries:", queueEntries.length)

    // Check waiting entries
    const waitingEntries = queueEntries.filter((e) => e.status === "waiting").sort((a, b) => a.queue_number - b.queue_number)
    const servingEntries = queueEntries.filter((e) => e.status === "serving")
    const completedEntries = queueEntries.filter((e) => e.status === "completed")
    const cancelledEntries = queueEntries.filter((e) => e.status === "cancelled")

    console.log("[v0] Waiting:", waitingEntries.length, "| Serving:", servingEntries.length, "| Completed:", completedEntries.length, "| Cancelled:", cancelledEntries.length)

    // Validate queue numbers are sequential
    if (waitingEntries.length > 0) {
      const waitingNumbers = waitingEntries.map((e) => e.queue_number)
      console.log("[v0] Waiting Queue Numbers:", waitingNumbers.join(", "))

      for (let i = 0; i < waitingNumbers.length - 1; i++) {
        if (waitingNumbers[i + 1] !== waitingNumbers[i] + 1) {
          warnings.push(`Queue numbers not sequential in waiting list: ${waitingNumbers[i]} -> ${waitingNumbers[i + 1]}`)
        }
      }
    }

    // Validate first waiting number should be >= current_number
    if (waitingEntries.length > 0 && waitingEntries[0].queue_number <= queue.current_number) {
      errors.push(`First waiting entry (${waitingEntries[0].queue_number}) should be > current_number (${queue.current_number})`)
    }

    // Validate serving count
    if (servingEntries.length > 0) {
      console.log("[v0] Serving Numbers:", servingEntries.map((e) => e.queue_number).join(", "))
      if (servingEntries.length > 5) {
        warnings.push(`Too many serving entries (${servingEntries.length}) - should be <= 5`)
      }
    }

    console.log("[v0] Validation Errors:", errors.length > 0 ? errors.join("; ") : "None")
    console.log("[v0] Validation Warnings:", warnings.length > 0 ? warnings.join("; ") : "None")
    console.log("[v0] ===== END VALIDATION =====")

    const summary = errors.length === 0
      ? warnings.length === 0
        ? "All systems OK"
        : `${warnings.length} warning(s) found`
      : `${errors.length} critical issue(s) found`

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary,
    }
  } catch (error) {
    console.error("Error validating queue workflow:", error)
    return {
      isValid: false,
      errors: ["Validation check failed: " + String(error)],
      warnings: [],
      summary: "Validation error",
    }
  }
}

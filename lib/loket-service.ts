import { supabase } from "@/lib/supabase"
import type { Loket, LoketAssignment } from "@/lib/supabase"

// Create a new global loket
export async function createLoket(loketName: string) {
  try {
    // Get the highest loket number to increment
    const { data: existingLokets } = await supabase
      .from("lokets")
      .select("loket_number")
      .order("loket_number", { ascending: false })
      .limit(1)

    const nextNumber = (existingLokets?.[0]?.loket_number ?? 0) + 1

    const { data, error } = await supabase
      .from("lokets")
      .insert([
        {
          loket_number: nextNumber,
          loket_name: loketName,
          status: "available",
          total_served_today: 0,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating loket:", error)
    throw error
  }
}

// Get all global lokets
export async function getAllLokets(): Promise<Loket[]> {
  try {
    const { data, error } = await supabase
      .from("lokets")
      .select("*")
      .order("loket_number", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting lokets:", error)
    return []
  }
}

// Get available lokets only
export async function getAvailableLokets(): Promise<Loket[]> {
  try {
    const { data, error } = await supabase
      .from("lokets")
      .select("*")
      .eq("status", "available")
      .order("loket_number", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting available lokets:", error)
    return []
  }
}

// Get lokets by queue (keep this for backward compatibility but it will get all lokets)
export async function getLoketsByQueue(queueId: string): Promise<Loket[]> {
  // Since lokets are now global, this just returns all lokets
  return getAllLokets()
}

// Delete a loket
export async function deleteLoket(loketId: string) {
  try {
    const { error } = await supabase
      .from("lokets")
      .delete()
      .eq("id", loketId)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting loket:", error)
    throw error
  }
}

// Update loket status
export async function updateLoketStatus(loketId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from("lokets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", loketId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating loket status:", error)
    throw error
  }
}

// Assign queue entry to loket
export async function assignQueueEntryToLoket(loketId: string, queueEntryId: string, staffId?: string) {
  try {
    console.log("[v0] Assigning entry", queueEntryId, "to loket", loketId)

    // Check if assignment already exists for this entry
    const { data: existingAssignment } = await supabase
      .from("loket_assignments")
      .select("*")
      .eq("queue_entry_id", queueEntryId)
      .single()

    if (existingAssignment) {
      console.log("[v0] Updating existing assignment for entry:", queueEntryId)
      // Update existing assignment to new loket
      const { data: updated, error: updateError } = await supabase
        .from("loket_assignments")
        .update({
          loket_id: loketId,
          started_serving_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("queue_entry_id", queueEntryId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update loket
      await supabase
        .from("lokets")
        .update({
          status: "busy",
          current_serving_entry_id: queueEntryId,
          assigned_staff_id: staffId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", loketId)

      return updated
    } else {
      console.log("[v0] Creating new assignment for entry:", queueEntryId)
      // Create new assignment
      const { data: assignment, error: assignError } = await supabase
        .from("loket_assignments")
        .insert([
          {
            loket_id: loketId,
            queue_entry_id: queueEntryId,
            started_serving_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (assignError) throw assignError

      // Update loket to mark as busy and set current serving
      await supabase
        .from("lokets")
        .update({
          status: "busy",
          current_serving_entry_id: queueEntryId,
          assigned_staff_id: staffId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", loketId)

      return assignment
    }
  } catch (error) {
    console.error("Error assigning queue entry to loket:", error)
    throw error
  }
}

// Complete service at loket
export async function completeLoketService(loketId: string, queueEntryId: string) {
  try {
    // Get the assignment
    const { data: assignment } = await supabase
      .from("loket_assignments")
      .select("*")
      .eq("queue_entry_id", queueEntryId)
      .eq("loket_id", loketId)
      .single()

    // Calculate service duration
    let serviceDuration = 0
    if (assignment?.assigned_at) {
      const startTime = new Date(assignment.assigned_at)
      const endTime = new Date()
      serviceDuration = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
    }

    // Update assignment with completion
    await supabase
      .from("loket_assignments")
      .update({
        completed_at: new Date().toISOString(),
        service_duration_minutes: serviceDuration,
      })
      .eq("queue_entry_id", queueEntryId)

    // Update loket back to available
    const { data: loket } = await supabase
      .from("lokets")
      .select("total_served_today")
      .eq("id", loketId)
      .single()

    await supabase
      .from("lokets")
      .update({
        status: "available",
        current_serving_entry_id: null,
        total_served_today: (loket?.total_served_today || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", loketId)

    return {
      success: true,
      serviceDuration,
    }
  } catch (error) {
    console.error("Error completing loket service:", error)
    throw error
  }
}

// Get loket statistics
export async function getLoketStats(loketId: string) {
  try {
    const { data: loket } = await supabase
      .from("lokets")
      .select("*")
      .eq("id", loketId)
      .single()

    const { data: assignments } = await supabase
      .from("loket_assignments")
      .select("*")
      .eq("loket_id", loketId)
      .not("completed_at", "is", null)

    const completedAssignments = assignments || []
    const avgServiceTime =
      completedAssignments.length > 0
        ? completedAssignments.reduce((sum, a) => sum + (a.service_duration_minutes || 0), 0) /
          completedAssignments.length
        : 0

    return {
      loket,
      totalCompleted: completedAssignments.length,
      averageServiceTime: Math.round(avgServiceTime * 10) / 10,
    }
  } catch (error) {
    console.error("Error getting loket stats:", error)
    return null
  }
}

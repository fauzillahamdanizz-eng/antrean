import { supabase } from "./supabase"

export async function checkDatabaseSetup(): Promise<{
  isSetUp: boolean
  missingTables: string[]
}> {
  try {
    // List of tables that should exist
    const requiredTables = ["profiles", "queues", "queue_entries", "announcements"]
    const missingTables: string[] = []

    // Check each table
    for (const table of requiredTables) {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

      if (error && error.message.includes("does not exist")) {
        missingTables.push(table)
      }
    }

    return {
      isSetUp: missingTables.length === 0,
      missingTables,
    }
  } catch (error) {
    console.error("Error checking database setup:", error)
    return {
      isSetUp: false,
      missingTables: ["unknown"],
    }
  }
}

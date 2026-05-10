import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton Supabase client
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Export singleton instance for direct use
export const supabase = getSupabaseClient()

export type UserRole = "admin" | "user" | "staff"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  avatar_url?: string
  phone?: string
  department?: string
}

export interface QueueEntry {
  id: string
  queue_id: string
  user_id: string
  customer_name: string
  queue_number: number
  status: "waiting" | "serving" | "completed" | "cancelled" | "no_show"
  created_at: string
  completed_at: string | null
  service_time_minutes?: number
  rating?: number
  notes?: string
  priority: "normal" | "high" | "vip"
  loket_id?: string
  assigned_staff_id?: string
}

export interface Queue {
  id: string
  name: string
  description: string
  current_number: number
  status: "active" | "paused" | "closed"
  created_at: string
  category?: string
  average_service_time?: number
  daily_target?: number
}

export interface QueueStatistic {
  id: string
  queue_id: string
  date: string
  total_served: number
  total_cancelled: number
  total_no_show: number
  average_wait_time: number
  average_service_time: number
  peak_hour: string
  created_at: string
}

export interface ServiceRating {
  id: string
  queue_entry_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface StaffMember {
  id: string
  user_id: string
  queue_id: string
  status: "available" | "busy" | "break" | "offline"
  total_served_today: number
  break_until?: string
  created_at: string
}

export interface QueueHistory {
  id: string
  queue_id: string
  action: "reset" | "pause" | "resume" | "close" | "open"
  performed_by: string
  timestamp: string
  notes?: string
}

export interface Loket {
  id: string
  queue_id: string
  loket_number: number
  loket_name: string
  status: "available" | "busy" | "offline" | "break"
  assigned_staff_id?: string
  current_serving_entry_id?: string
  total_served_today: number
  created_at: string
  updated_at: string
}

export interface LoketAssignment {
  id: string
  loket_id: string
  queue_entry_id: string
  assigned_at: string
  started_serving_at?: string
  completed_at?: string
  service_duration_minutes?: number
  notes?: string
}

import { getSupabaseClient } from "@/lib/supabase"
import type { Profile, UserRole } from "@/lib/supabase"

interface StoredUser {
  id: string
  email: string
  password: string
  fullName: string
  role: UserRole
  createdAt: string
}

// Local storage keys
const USERS_STORAGE_KEY = "queue_management_users"
const CURRENT_USER_KEY = "queue_management_current_user"

const initializeUsers = (): void => {
  if (typeof window === "undefined") return

  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
    if (!storedUsers) {
      const defaultAdmin: StoredUser = {
        id: "default-admin-id",
        email: "admin@example.com",
        password: "admin123",
        fullName: "Admin User",
        role: "admin",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultAdmin]))
    }
  } catch (error) {
    console.error("Error initializing users:", error)
  }
}

// Get stored users from localStorage
const getStoredUsers = (): StoredUser[] => {
  if (typeof window === "undefined") return []
  try {
    initializeUsers()
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
    return storedUsers ? JSON.parse(storedUsers) : []
  } catch (error) {
    console.error("Error getting users:", error)
    return []
  }
}

// Save users to localStorage
const saveStoredUsers = (users: StoredUser[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const registerUserFallback = async (email: string, password: string, fullName: string): Promise<Profile> => {
  const users = getStoredUsers()

  // Check if email already exists
  if (users.some((u) => u.email === email)) {
    throw new Error("Email sudah terdaftar")
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    fullName,
    role: "user",
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveStoredUsers(users)

  // Save current user
  if (typeof window !== "undefined") {
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.fullName,
        role: newUser.role,
      }),
    )
  }

  return {
    id: newUser.id,
    email: newUser.email,
    full_name: newUser.fullName,
    role: newUser.role,
  } as Profile
}

const loginUserFallback = async (email: string, password: string): Promise<Profile> => {
  const users = getStoredUsers()
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("Email atau kata sandi salah")
  }

  // Save current user
  if (typeof window !== "undefined") {
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
      }),
    )
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
  } as Profile
}

// Register with Supabase fallback to localStorage
export const registerUser = async (email: string, password: string, fullName: string): Promise<Profile> => {
  const supabase = getSupabaseClient()

  try {
    // Try Supabase first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) throw authError

    const profile = {
      id: authData.user?.id || `user-${Date.now()}`,
      email,
      full_name: fullName,
      role: "user",
    } as Profile

    // Try to save to Supabase profiles table
    try {
      await supabase
        .from("profiles")
        .insert([
          {
            id: profile.id,
            email,
            full_name: fullName,
            role: "user",
          },
        ])
        .select()
    } catch (profileError) {
      console.warn("Could not save profile to Supabase, but auth succeeded:", profileError)
    }

    return profile
  } catch (error: any) {
    console.warn("Supabase registration failed, using fallback:", error.message)
    return registerUserFallback(email, password, fullName)
  }
}

// Login with Supabase fallback to localStorage
export const loginUser = async (email: string, password: string): Promise<Profile> => {
  const supabase = getSupabaseClient()

  try {
    // Try Supabase first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    if (profile) {
      // Save to localStorage as backup
      if (typeof window !== "undefined") {
        localStorage.setItem(
          CURRENT_USER_KEY,
          JSON.stringify({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
          }),
        )
      }
      return profile as Profile
    }

    throw new Error("Profile not found")
  } catch (error: any) {
    console.warn("Supabase login failed, using fallback:", error.message)
    return loginUserFallback(email, password)
  }
}

// Logout user
export const logoutUser = async (): Promise<void> => {
  const supabase = getSupabaseClient()

  try {
    // Try Supabase logout
    await supabase.auth.signOut()
  } catch (error) {
    console.warn("Supabase logout failed, clearing local session:", error)
  }

  // Always clear localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

// Get current user from localStorage or Supabase session
export const getCurrentUser = async (): Promise<Profile | null> => {
  // First check localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY)
      if (stored) {
        return JSON.parse(stored) as Profile
      }
    } catch (error) {
      console.warn("Error reading stored user:", error)
    }
  }

  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) return null

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single()

    return (profile as Profile) || null
  } catch (error) {
    console.warn("Could not get user from Supabase:", error)
    return null
  }
}

// Get all users (admin function)
export const getAllUsers = async (): Promise<Profile[]> => {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase.from("profiles").select("*")

    if (error) throw error

    return data as Profile[]
  } catch (error: any) {
    console.error("Get all users error:", error)
    return []
  }
}

// Update user role (admin function)
export const updateUserRole = async (userId: string, newRole: string): Promise<void> => {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

    if (error) throw error
  } catch (error: any) {
    console.error("Update user role error:", error)
    throw error
  }
}

// Delete user (admin function)
export const deleteUser = async (userId: string): Promise<void> => {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase.from("profiles").delete().eq("id", userId)

    if (error) throw error
  } catch (error: any) {
    console.error("Delete user error:", error)
    throw error
  }
}

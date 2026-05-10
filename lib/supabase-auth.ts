import { getSupabaseClient } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"

// Register with Supabase Auth
export const registerUser = async (email: string, password: string, fullName: string): Promise<Profile> => {
  const supabase = getSupabaseClient()

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
    },
  })

  if (authError) {
    console.error("Supabase auth error:", authError)
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error("Gagal membuat akun")
  }

  // Create profile in profiles table
  const profile = {
    id: authData.user.id,
    email: authData.user.email!,
    full_name: fullName,
    role: "user" as const,
  }

  const { error: profileError } = await supabase.from("profiles").insert([profile])

  if (profileError) {
    console.error("Profile creation error:", profileError)
    // Don't throw here as auth user is already created
    // The profile might already exist from a database trigger
  }

  return profile as Profile
}

// Login with Supabase Auth
export const loginUser = async (email: string, password: string): Promise<Profile> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Supabase login error:", error)
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error("Login gagal")
  }

  // Get or create profile
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()

  // If profile doesn't exist, create it
  if (profileError && profileError.code === "PGRST116") {
    const newProfile = {
      id: data.user.id,
      email: data.user.email!,
      full_name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
      role: "user" as const,
    }

    const { data: createdProfile, error: createError } = await supabase
      .from("profiles")
      .insert([newProfile])
      .select()
      .single()

    if (createError) {
      console.error("Profile creation error:", createError)
      // Return basic profile even if DB insert fails
      return newProfile as Profile
    }

    profile = createdProfile
  } else if (profileError) {
    console.error("Profile fetch error:", profileError)
    throw new Error("Gagal mengambil profil pengguna")
  }

  return profile as Profile
}

// Logout user
export const logoutUser = async (): Promise<void> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Logout error:", error)
    throw new Error(error.message)
  }
}

// Get current user from Supabase session
export const getCurrentUser = async (): Promise<Profile | null> => {
  const supabase = getSupabaseClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("Session error:", error)
    return null
  }

  if (!session?.user) {
    return null
  }

  // Get profile from database
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    console.error("Profile fetch error:", profileError)

    // If profile doesn't exist, create it
    if (profileError.code === "PGRST116") {
      const newProfile = {
        id: session.user.id,
        email: session.user.email!,
        full_name: session.user.user_metadata?.full_name || session.user.email!.split("@")[0],
        role: "user" as const,
      }

      const { data: createdProfile } = await supabase.from("profiles").insert([newProfile]).select().single()

      return (createdProfile as Profile) || null
    }

    return null
  }

  return profile as Profile
}

// Get all users (admin function)
export const getAllUsers = async (): Promise<Profile[]> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Get all users error:", error)
    return []
  }

  return (data as Profile[]) || []
}

// Update user role (admin function)
export const updateUserRole = async (userId: string, newRole: string): Promise<void> => {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

  if (error) {
    console.error("Update user role error:", error)
    throw new Error(error.message)
  }
}

// Delete user (admin function)
export const deleteUser = async (userId: string): Promise<void> => {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("profiles").delete().eq("id", userId)

  if (error) {
    console.error("Delete user error:", error)
    throw new Error(error.message)
  }
}

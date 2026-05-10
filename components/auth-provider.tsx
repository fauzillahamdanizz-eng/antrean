"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { loginUser, registerUser, getCurrentUser, logoutUser } from "@/lib/supabase-auth"
import type { Profile } from "@/lib/supabase"

interface AuthContextType {
  user: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Handle navigation based on auth state
  useEffect(() => {
    if (loading) return

    if (user) {
      // If user is logged in and on an auth page, redirect to dashboard
      if (pathname?.includes("/login") || pathname?.includes("/register")) {
        router.push("/dashboard")
      }
    } else {
      // If user is not logged in and not on an auth page or setup page, redirect to login
      if (
        !pathname?.includes("/login") &&
        !pathname?.includes("/register") &&
        !pathname?.includes("/setup") &&
        pathname !== "/"
      ) {
        router.push("/login")
      }
    }
  }, [user, loading, pathname, router])

  const signIn = async (email: string, password: string) => {
    try {
      const profile = await loginUser(email, password)
      setUser(profile)
    } catch (error: any) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Validate email format
      if (!isValidEmail(email)) {
        throw new Error("Silakan masukkan alamat email yang valid.")
      }

      // Validate password
      if (password.length < 6) {
        throw new Error("Kata sandi harus minimal 6 karakter.")
      }

      const profile = await registerUser(email, password, fullName)
      setUser(profile)
    } catch (error: any) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await logoutUser()
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  // Helper function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: user?.role === "admin", signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

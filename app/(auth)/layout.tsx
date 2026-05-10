"use client"

import type React from "react"
import { AuthProvider } from "@/components/auth-provider"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">{children}</div>
    </AuthProvider>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { UserDashboard } from "@/components/dashboards/user-dashboard"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (loading || !isClient) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return <div>Unauthorized</div>
  }

  return user.role === "admin" ? <AdminDashboard /> : <UserDashboard />
}

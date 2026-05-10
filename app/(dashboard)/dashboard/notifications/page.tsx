"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Bell, CheckCircle, Mail, Clock, Users, Award, Volume2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface NotificationPreferences {
  queue_joined: boolean
  queue_called: boolean
  queue_serving: boolean
  queue_completed: boolean
  queue_cancelled: boolean
  position_updates: boolean
  announcements: boolean
}

export default function NotificationPreferencesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch preferences
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchPreferences = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/notifications/preferences?userId=${user.id}`)

        if (!response.ok) {
          throw new Error("Gagal memuat preferensi")
        }

        const data = await response.json()
        setPreferences(data.preferences)
        setError(null)
      } catch (err) {
        console.error("Error fetching preferences:", err)
        setError("Gagal memuat preferensi notifikasi")
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [user, router])

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    })
  }

  const handleSave = async () => {
    if (!user || !preferences) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          preferences,
        }),
      })

      if (!response.ok) {
        throw new Error("Gagal menyimpan preferensi")
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Error saving preferences:", err)
      setError("Gagal menyimpan preferensi")
    } finally {
      setSaving(false)
    }
  }

  const notificationTypes = [
    {
      key: "queue_joined" as const,
      icon: UserPlus,
      title: "Bergabung Antrian",
      description: "Notifikasi saat Anda berhasil bergabung dengan antrian",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      key: "queue_called" as const,
      icon: Phone,
      title: "Antrian Dipanggil",
      description: "Notifikasi ketika nomor Anda segera dipanggil",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      key: "queue_serving" as const,
      icon: Clock,
      title: "Sedang Dilayani",
      description: "Notifikasi saat nomor Anda sedang dilayani",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "queue_completed" as const,
      icon: Award,
      title: "Pelayanan Selesai",
      description: "Notifikasi saat pelayanan Anda selesai",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      key: "queue_cancelled" as const,
      icon: LogOut,
      title: "Antrian Dibatalkan",
      description: "Notifikasi saat antrian Anda dibatalkan",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      key: "position_updates" as const,
      icon: Users,
      title: "Update Posisi",
      description: "Notifikasi berkala tentang posisi Anda dalam antrian",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      key: "announcements" as const,
      icon: Volume2,
      title: "Pengumuman Sistem",
      description: "Notifikasi pengumuman penting dari sistem",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat preferensi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Preferensi Notifikasi
        </h1>
        <p className="page-subtitle">Kelola notifikasi email untuk aktivitas antrian Anda</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-status-completed/20 text-status-completed-foreground border-status-completed">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Berhasil</AlertTitle>
          <AlertDescription>Preferensi notifikasi telah disimpan</AlertDescription>
        </Alert>
      )}

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertTitle>Email Notifikasi</AlertTitle>
        <AlertDescription>
          Semua notifikasi akan dikirim ke email Anda: <strong>{user.email}</strong>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {notificationTypes.map(({ key, icon: Icon, title, description, color, bgColor }) => (
          <Card key={key} className={`overflow-hidden border-l-4 ${bgColor}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${bgColor} border border-current/20`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription className="text-sm">{description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={preferences?.[key] ? "default" : "secondary"}>
                    {preferences?.[key] ? "Aktif" : "Nonaktif"}
                  </Badge>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences?.[key] ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences?.[key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Pengaturan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(preferences || {}).map(([key, value]) => (
              <div key={key} className="text-sm">
                <p className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                <Badge variant={value ? "default" : "secondary"} className="mt-1">
                  {value ? "✓ Aktif" : "✗ Nonaktif"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 md:flex-none"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 md:flex-none"
        >
          Kembali
        </Button>
      </div>
    </div>
  )
}

// Icons
function UserPlus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}

function Phone(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

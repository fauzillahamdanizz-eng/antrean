"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertCircle,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface EmailNotification {
  id: string
  user_id: string
  queue_entry_id: string | null
  email_type: string
  recipient_email: string
  subject: string
  status: "sent" | "failed"
  error_message: string | null
  created_at: string
  sent_at: string | null
  user_name?: string
}

export default function NotificationHistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<EmailNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchEmail, setSearchEmail] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "sent" | "failed">("all")
  const [filterType, setFilterType] = useState<string>("all")

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchNotifications()
  }, [user, router])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      // Admin sees all notifications, user sees only their own
      let query: string;
      if (isAdmin) {
        query = `/api/notifications/history?isAdmin=true&limit=200`;
      } else {
        query = `/api/notifications/history?userId=${user?.id}&limit=100`;
      }

      console.log('[v0] Fetching notifications:', query);

      const response = await fetch(query)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[v0] API error response:', errorData);
        throw new Error(errorData.error || "Gagal memuat riwayat notifikasi")
      }

      const data = await response.json()
      console.log('[v0] Received notifications:', data);
      
      // Fetch user names for admin view
      if (isAdmin && data.history) {
        const notificationsWithNames = await Promise.all(
          data.history.map(async (notif: EmailNotification) => {
            try {
              const res = await fetch(`/api/users/${notif.user_id}`)
              const userData = await res.json()
              return {
                ...notif,
                user_name: userData.full_name || "Unknown",
              }
            } catch {
              return {
                ...notif,
                user_name: "Unknown",
              }
            }
          })
        )
        setNotifications(notificationsWithNames)
      } else {
        setNotifications(data.history || [])
      }
      setError(null)
    } catch (err) {
      console.error("Error fetching history:", err)
      setError(err instanceof Error ? err.message : "Gagal memuat riwayat notifikasi")
    } finally {
      setLoading(false)
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      queue_joined: "Bergabung Antrian",
      queue_called: "Antrian Dipanggil",
      queue_serving: "Sedang Dilayani",
      queue_completed: "Pelayanan Selesai",
      queue_cancelled: "Antrian Dibatalkan",
      position_update: "Update Posisi",
      system_announcement: "Pengumuman Sistem",
    }
    return labels[type] || type
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredNotifications = notifications.filter((notif) => {
    const matchesEmail = notif.recipient_email.toLowerCase().includes(searchEmail.toLowerCase())
    const matchesStatus = filterStatus === "all" || notif.status === filterStatus
    const matchesType = filterType === "all" || notif.email_type === filterType
    return matchesEmail && matchesStatus && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat riwayat notifikasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Mail className="h-8 w-8" />
          {isAdmin ? "Riwayat Notifikasi Sistem" : "Riwayat Notifikasi"}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Pantau semua notifikasi email yang dikirim ke user"
            : "Lihat semua notifikasi email yang telah dikirim kepada Anda"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="sent">Terkirim</SelectItem>
            <SelectItem value="failed">Gagal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="queue_joined">Bergabung Antrian</SelectItem>
            <SelectItem value="queue_called">Dipanggil</SelectItem>
            <SelectItem value="queue_serving">Sedang Dilayani</SelectItem>
            <SelectItem value="queue_completed">Selesai</SelectItem>
            <SelectItem value="queue_cancelled">Dibatalkan</SelectItem>
            <SelectItem value="position_update">Update Posisi</SelectItem>
            <SelectItem value="system_announcement">Pengumuman</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={fetchNotifications}
          disabled={loading}
          variant="outline"
          className="w-full md:w-auto bg-transparent"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Notifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredNotifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Terkirim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredNotifications.filter((n) => n.status === "sent").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gagal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredNotifications.filter((n) => n.status === "failed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            {isAdmin ? "Semua notifikasi sistem" : "Notifikasi personal Anda"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Penerima</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Subject</TableHead>
                    {isAdmin && <TableHead>User</TableHead>}
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notif) => (
                    <TableRow key={notif.id} className="hover:bg-muted/50">
                      <TableCell>{getStatusIcon(notif.status)}</TableCell>
                      <TableCell className="font-mono text-xs">{notif.recipient_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getNotificationTypeLabel(notif.notification_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{notif.subject}</TableCell>
                      {isAdmin && <TableCell className="text-sm">{notif.user_name}</TableCell>}
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(notif.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Failed Notifications Details */}
      {filteredNotifications.some((n) => n.status === "failed") && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Failed Notifications</CardTitle>
            <CardDescription>Detail error untuk notifikasi yang gagal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredNotifications
              .filter((n) => n.status === "failed")
              .map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-background rounded border border-red-200 dark:border-red-900"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-mono text-sm">{notif.recipient_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {getNotificationTypeLabel(notif.notification_type)}
                      </p>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400">{notif.error_message}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import type { QueueEntry, Queue } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserQueueEntries, getQueues } from "@/lib/supabase-service"
import { 
  History, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Hourglass, 
  Filter,
  TrendingUp,
  Calendar,
  Timer,
  Hash,
  ArrowUpRight,
  BarChart3,
} from "lucide-react"

interface QueueEntryWithQueue extends QueueEntry {
  queue: Queue
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<QueueEntryWithQueue[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("all")

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return

      setLoading(true)
      try {
        const queues = await getQueues()
        const userEntries = await getUserQueueEntries(user.id)

        let filteredEntries = userEntries
        if (timeRange !== "all") {
          const now = new Date()
          let startDate: Date

          switch (timeRange) {
            case "today":
              startDate = new Date(now.setHours(0, 0, 0, 0))
              filteredEntries = userEntries.filter((entry) => new Date(entry.created_at) >= startDate)
              break
            case "week":
              startDate = new Date(now)
              startDate.setDate(startDate.getDate() - 7)
              filteredEntries = userEntries.filter((entry) => new Date(entry.created_at) >= startDate)
              break
            case "month":
              startDate = new Date(now)
              startDate.setMonth(startDate.getMonth() - 1)
              filteredEntries = userEntries.filter((entry) => new Date(entry.created_at) >= startDate)
              break
          }
        }

        const entriesWithQueue = filteredEntries.map((entry) => {
          const queue = queues.find((q) => q.id === entry.queue_id) || {
            id: "unknown",
            name: "Tidak Diketahui",
            description: "",
            current_number: 0,
            status: "closed" as const,
            created_at: "",
          }
          return { ...entry, queue }
        })

        entriesWithQueue.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setEntries(entriesWithQueue)
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user, timeRange])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "waiting":
        return { label: "Menunggu", icon: Hourglass, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" }
      case "serving":
        return { label: "Dilayani", icon: Clock, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" }
      case "completed":
        return { label: "Selesai", icon: CheckCircle, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" }
      case "cancelled":
        return { label: "Dibatalkan", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" }
      default:
        return { label: status, icon: Clock, color: "text-muted-foreground", bg: "bg-muted", border: "border-border" }
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Stats
  const completedCount = entries.filter(e => e.status === "completed").length
  const cancelledCount = entries.filter(e => e.status === "cancelled").length
  const totalCount = entries.length
  const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Average wait time
  const completedEntries = entries.filter(e => e.status === "completed" && e.completed_at)
  const avgWaitTime = completedEntries.length > 0
    ? Math.round(
        completedEntries.reduce((sum, e) => {
          const created = new Date(e.created_at).getTime()
          const completed = new Date(e.completed_at!).getTime()
          return sum + (completed - created) / (1000 * 60)
        }, 0) / completedEntries.length
      )
    : 0

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, QueueEntryWithQueue[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Riwayat Antrian</h1>
          <p className="text-muted-foreground text-sm mt-1">Catatan semua aktivitas antrian Anda</p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Waktu</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">7 Hari Terakhir</SelectItem>
              <SelectItem value="month">30 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats - Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Hash className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight">{totalCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Antrian</p>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-2xl border border-border bg-card hover:border-accent/40 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
              <CheckCircle className="w-5 h-5 text-accent" />
            </div>
            <div className="flex items-center gap-1 text-accent text-xs font-medium">
              <ArrowUpRight className="w-3 h-3" />
              {successRate}%
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-accent">{completedCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Selesai</p>
        </div>

        {/* Cancelled */}
        <div className="p-5 rounded-2xl border border-border bg-card hover:border-destructive/40 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/15 transition-colors">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-destructive">{cancelledCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Dibatalkan</p>
        </div>

        {/* Average Wait Time */}
        <div className="p-5 rounded-2xl border border-border bg-card hover:border-amber-500/40 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
              <Timer className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight">
            {avgWaitTime}
            <span className="text-lg text-muted-foreground ml-1">mnt</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">Rata-rata Tunggu</p>
        </div>
      </div>

      {/* Success Rate Progress */}
      {totalCount > 0 && (
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Tingkat Keberhasilan</h3>
                <p className="text-xs text-muted-foreground">Persentase antrian selesai</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-accent">{successRate}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden flex">
            <div 
              className="h-full bg-accent rounded-l-full transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
            {cancelledCount > 0 && (
              <div 
                className="h-full bg-destructive rounded-r-full transition-all duration-500"
                style={{ width: `${100 - successRate}%` }}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Selesai: {completedCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              Batal: {cancelledCount}
            </span>
          </div>
        </div>
      )}

      {/* List */}
      {entries.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{date}</span>
                <span className="text-muted-foreground">({dateEntries.length} antrian)</span>
              </div>
              
              {/* Entries */}
              <div className="space-y-2">
                {dateEntries.map((entry) => {
                  const statusConfig = getStatusConfig(entry.status)
                  const StatusIcon = statusConfig.icon
                  const duration = entry.completed_at
                    ? Math.round((new Date(entry.completed_at).getTime() - new Date(entry.created_at).getTime()) / (1000 * 60))
                    : null

                  return (
                    <div
                      key={entry.id}
                      className={`p-5 rounded-2xl border bg-card hover:shadow-lg transition-all ${statusConfig.border}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Number */}
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.bg}`}>
                          <span className={`text-3xl font-bold ${statusConfig.color}`}>{entry.queue_number}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold truncate">{entry.queue?.name}</p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(entry.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {entry.customer_name && (
                              <span className="truncate">{entry.customer_name}</span>
                            )}
                          </div>
                        </div>

                        {/* Duration */}
                        {duration !== null && (
                          <div className="text-right hidden sm:block">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                              <Timer className="w-3 h-3" />
                              Durasi
                            </div>
                            <p className="text-lg font-semibold">{duration} mnt</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl border-2 border-dashed border-border text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Belum Ada Riwayat</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Riwayat antrian Anda akan muncul di sini setelah Anda mengambil nomor antrian.
          </p>
        </div>
      )}
    </div>
  )
}

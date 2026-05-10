"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  Layers,
  TrendingUp,
  Zap,
  Activity,
  BarChart3,
  Timer,
  UserCheck,
  Bell,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Target,
  Sparkles,
  Monitor,
  Server,
  Database,
  Cpu,
  Wifi,
  Globe,
  Shield,
  RefreshCw,
  Eye,
  Play,
  Pause,
} from "lucide-react"
import { useRealtimeQueues } from "@/hooks/use-realtime-queues"
import { useEffect, useState } from "react"
import {
  getCompletedEntriesToday,
  getCancelledEntriesToday,
} from "@/lib/supabase-service"
import type { QueueEntry } from "@/lib/supabase"
import Link from "next/link"

export function AdminDashboard() {
  const { user } = useAuth()
  const { queues, queueEntries, loading, error } = useRealtimeQueues()

  const [completedEntries, setCompletedEntries] = useState<QueueEntry[]>([])
  const [cancelledEntries, setCancelledEntries] = useState<QueueEntry[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const fetchHistoricalData = async () => {
      const [completed, cancelled] = await Promise.all([getCompletedEntriesToday(), getCancelledEntriesToday()])
      setCompletedEntries(completed)
      setCancelledEntries(cancelled)
    }
    fetchHistoricalData()
  }, [])

  useEffect(() => {
    const refreshHistoricalData = async () => {
      const [completed, cancelled] = await Promise.all([getCompletedEntriesToday(), getCancelledEntriesToday()])
      setCompletedEntries(completed)
      setCancelledEntries(cancelled)
    }
    if (!loading && queueEntries.length > 0) {
      refreshHistoricalData()
    }
  }, [queueEntries.length, loading])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Gagal memuat data</p>
            <p className="text-sm text-destructive/70 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const activeQueuesCount = queues.filter((q) => q.status === "active").length
  const waitingCount = queueEntries.filter((e) => e.status === "waiting").length
  const servingCount = queueEntries.filter((e) => e.status === "serving").length
  const completedTodayCount = completedEntries.length
  const cancelledTodayCount = cancelledEntries.length
  const totalInSystem = waitingCount + servingCount
  const totalProcessed = completedTodayCount + cancelledTodayCount

  const avgWaitTime =
    completedEntries.length > 0
      ? Math.round(
          completedEntries.reduce((sum, e) => {
            const created = new Date(e.created_at).getTime()
            const completed = e.completed_at ? new Date(e.completed_at).getTime() : created
            return sum + (completed - created) / (1000 * 60)
          }, 0) / completedEntries.length,
        )
      : 0

  const successRate = totalProcessed > 0 ? Math.round((completedTodayCount / totalProcessed) * 100) : 100

  const recentActivity = [...queueEntries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = new Date().getHours() - 11 + i
    const count = completedEntries.filter(e => {
      const entryHour = new Date(e.completed_at || e.created_at).getHours()
      return entryHour === (hour < 0 ? hour + 24 : hour)
    }).length
    return { hour: hour < 0 ? hour + 24 : hour, count }
  })

  const maxHourlyCount = Math.max(...hourlyData.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Dashboard</h1>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-muted-foreground">
            {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {" / "}
            <span className="font-mono text-foreground">
              {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-10 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Link href="/dashboard/queues">
            <Button size="sm" className="gap-2 h-10">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Kelola Antrian</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Bento Grid - Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Total Queue - Large Hero Card */}
        <div className="col-span-2 lg:col-span-5 lg:row-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden border border-slate-700/50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBoLTQweiIvPjxwYXRoIGQ9Ik00MCAyMGgtNDBNMjAgNDB2LTQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Antrian</p>
                  <p className="text-xs text-white/40">Realtime monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Active</span>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-8xl sm:text-9xl font-bold tracking-tighter leading-none">{totalInSystem}</p>
              <p className="text-white/50 text-sm mt-3">orang dalam sistem saat ini</p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-white/60 text-xs">Menunggu</span>
                </div>
                <p className="text-4xl font-bold text-amber-400">{waitingCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/60 text-xs">Dilayani</span>
                </div>
                <p className="text-4xl font-bold text-emerald-400">{servingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Today */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              +12%
            </div>
          </div>
          <p className="text-6xl font-bold tracking-tight text-emerald-500">{completedTodayCount}</p>
          <p className="text-muted-foreground mt-2">Selesai Hari Ini</p>
          <div className="mt-6 h-2 rounded-full bg-emerald-500/10 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(successRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-emerald-500/70 mt-2">{successRate}% tingkat keberhasilan</p>
        </div>

        {/* Active Lokets */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Monitor className="w-7 h-7 text-blue-500" />
            </div>
          </div>
          <p className="text-5xl font-bold tracking-tight">
            <span className="text-blue-500">{activeQueuesCount}</span>
            <span className="text-2xl text-muted-foreground">/{queues.length}</span>
          </p>
          <p className="text-muted-foreground mt-2">Loket Aktif</p>
          <div className="flex gap-1 mt-4">
            {queues.slice(0, 6).map((q, i) => (
              <div 
                key={q.id} 
                className={`h-2 flex-1 rounded-full ${q.status === "active" ? "bg-blue-500" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        {/* Average Wait Time */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/40 transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Timer className="w-7 h-7 text-amber-500" />
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">
              <ArrowDownRight className="w-3 h-3" />
              -8%
            </div>
          </div>
          <p className="text-5xl font-bold tracking-tight">
            <span className="text-amber-500">{avgWaitTime}</span>
            <span className="text-2xl text-muted-foreground ml-1">mnt</span>
          </p>
          <p className="text-muted-foreground mt-2">Rata-rata Waktu Tunggu</p>
          <div className="flex items-center gap-2 mt-4 text-xs text-amber-500/70">
            <Gauge className="w-4 h-4" />
            Target: {"<"}15 menit
          </div>
        </div>

        {/* Cancelled */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
          </div>
          <p className="text-5xl font-bold tracking-tight text-red-500">{cancelledTodayCount}</p>
          <p className="text-muted-foreground mt-2">Dibatalkan</p>
          <p className="text-xs text-red-500/70 mt-4">{totalProcessed > 0 ? Math.round((cancelledTodayCount / totalProcessed) * 100) : 0}% dari total</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Chart & Queue Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Chart */}
          <div className="p-6 rounded-3xl border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Aktivitas Hari Ini</h2>
                <p className="text-sm text-muted-foreground">Antrian selesai per jam (12 jam terakhir)</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Selesai</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-40">
              {hourlyData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    <div 
                      className="w-full bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
                      style={{ height: `${Math.max((data.count / maxHourlyCount) * 120, 8)}px` }}
                    >
                      <div 
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary to-blue-400 rounded-lg transition-all"
                        style={{ height: `${Math.max((data.count / maxHourlyCount) * 100, 4)}%` }}
                      />
                    </div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-foreground text-background text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {data.count} antrian
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{String(data.hour).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Queue Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Status Loket</h2>
              <Link href="/dashboard/queues">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
                  Kelola <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {queues.length === 0 ? (
              <div className="p-12 rounded-3xl border-2 border-dashed border-border text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold mb-1">Belum Ada Loket</p>
                <p className="text-muted-foreground text-sm mb-4">Buat loket pertama untuk memulai</p>
                <Link href="/dashboard/lokets">
                  <Button>Buat Loket</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {queues.map((queue) => {
                  const waiting = queueEntries.filter((e) => e.queue_id === queue.id && e.status === "waiting").length
                  const serving = queueEntries.filter((e) => e.queue_id === queue.id && e.status === "serving").length
                  const isActive = queue.status === "active"

                  return (
                    <div
                      key={queue.id}
                      className={`p-6 rounded-3xl border transition-all ${
                        isActive 
                          ? "border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5" 
                          : "border-border bg-muted/30 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-lg truncate">{queue.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{queue.description || "Layanan umum"}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          isActive ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-muted text-muted-foreground"
                        }`}>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Nomor Sekarang</p>
                          <p className="text-6xl font-bold tracking-tighter text-primary leading-none">{queue.current_number}</p>
                        </div>
                        <div className="flex gap-6 text-right">
                          <div>
                            <p className="text-3xl font-bold text-amber-500">{waiting}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tunggu</p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-emerald-500">{serving}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Layani</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right - Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Performance Card */}
          <div className="p-6 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Performa</h3>
              <Target className="w-5 h-5 text-primary" />
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tingkat Keberhasilan</span>
                  <span className="text-lg font-bold text-emerald-500">{successRate}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Efisiensi Waktu</span>
                  <span className="text-lg font-bold text-blue-500">{avgWaitTime <= 15 ? "Baik" : "Perlu Ditingkatkan"}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ width: `${Math.min((15 / Math.max(avgWaitTime, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 rounded-3xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Aktivitas Terbaru</h3>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada aktivitas</p>
              ) : (
                recentActivity.map((entry) => {
                  const queue = queues.find(q => q.id === entry.queue_id)
                  return (
                    <div key={entry.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                        entry.status === "waiting" ? "bg-amber-500/10 text-amber-500" :
                        entry.status === "serving" ? "bg-blue-500/10 text-blue-500" :
                        entry.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {entry.queue_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.customer_name || "Pelanggan"}</p>
                        <p className="text-xs text-muted-foreground truncate">{queue?.name}</p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${
                        entry.status === "waiting" ? "bg-amber-500" :
                        entry.status === "serving" ? "bg-blue-500" :
                        entry.status === "completed" ? "bg-emerald-500" :
                        "bg-red-500"
                      }`} />
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/queues" className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group">
              <Layers className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm">Kelola Antrian</p>
            </Link>
            <Link href="/dashboard/lokets" className="p-4 rounded-2xl border border-border bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group">
              <Monitor className="w-6 h-6 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm">Kelola Loket</p>
            </Link>
            <Link href="/dashboard/reports" className="p-4 rounded-2xl border border-border bg-card hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group">
              <BarChart3 className="w-6 h-6 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm">Laporan</p>
            </Link>
            <Link href="/dashboard/users" className="p-4 rounded-2xl border border-border bg-card hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group">
              <Users className="w-6 h-6 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm">Pengguna</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

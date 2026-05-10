"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import type { QueueEntry } from "@/lib/supabase"
import { 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Zap, 
  Hash, 
  Users, 
  Timer,
  CheckCircle,
  Calendar,
  MapPin,
  Bell,
  ChevronRight,
  Ticket,
  TrendingUp,
  Activity,
  Sparkles,
  Volume2,
  Info,
  ArrowUpRight,
  Play,
  Target,
  Gauge,
  Eye,
} from "lucide-react"
import { useRealtimeQueues } from "@/hooks/use-realtime-queues"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function UserDashboard() {
  const { user } = useAuth()
  const { queues, queueEntries, loading, error } = useRealtimeQueues()
  const { toast } = useToast()
  const [userQueue, setUserQueue] = useState<QueueEntry | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())

  const notifiedAt10 = useRef(false)
  const notifiedAt5 = useRef(false)
  const notifiedAt1 = useRef(false)
  const lastPosition = useRef<number>(-1)

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user?.id && queueEntries.length > 0) {
      const userActive = queueEntries.find(
        (e) => e.user_id === user.id && (e.status === "waiting" || e.status === "serving"),
      )

      if (userActive && userActive.status === "serving" && (!userQueue || userQueue.status === "waiting")) {
        const queueName = queues.find((q) => q.id === userActive.queue_id)?.name || "Antrian"

        toast({
          title: "Giliran Anda Sekarang!",
          description: `Nomor ${userActive.queue_number} - Silakan menuju loket.`,
          duration: 15000,
        })

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Giliran Anda!", {
            body: `Nomor ${userActive.queue_number} di ${queueName}`,
            icon: "/icon-light-32x32.png",
            tag: "queue-call",
            requireInteraction: true,
          })
        }

        try {
          const audio = new Audio("/notification.mp3")
          audio.play().catch(() => {})
        } catch {}
      }

      if (userActive && userActive.status === "waiting") {
        const currentQueueNumber = queues.find((q) => q.id === userActive.queue_id)?.current_number || 0
        const remainingInQueue = Math.max(0, (userActive.queue_number || 0) - (currentQueueNumber || 0))

        if (remainingInQueue !== lastPosition.current) {
          lastPosition.current = remainingInQueue

          if (remainingInQueue === 10 && !notifiedAt10.current) {
            notifiedAt10.current = true
            toast({ title: "10 orang lagi", description: "Bersiaplah.", duration: 6000 })
          } else if (remainingInQueue === 5 && !notifiedAt5.current) {
            notifiedAt5.current = true
            toast({ title: "5 orang lagi", description: "Hampir giliran Anda.", duration: 8000 })
          } else if (remainingInQueue === 1 && !notifiedAt1.current) {
            notifiedAt1.current = true
            toast({ title: "Anda berikutnya!", description: "Bersiap dipanggil.", duration: 10000 })
          }
        }
      }

      if (!userActive || (userActive && userActive.id !== userQueue?.id)) {
        notifiedAt10.current = false
        notifiedAt5.current = false
        notifiedAt1.current = false
        lastPosition.current = -1
      }

      setUserQueue(userActive || null)
      setLastUpdate(new Date())
    } else if (user?.id && queueEntries.length === 0) {
      setUserQueue(null)
      setLastUpdate(new Date())
    }
  }, [queueEntries, user?.id, userQueue, queues, toast])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-500">Gagal memuat data</p>
            <p className="text-sm text-red-500/70 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const queueInfo = userQueue ? queues.find((q) => q.id === userQueue.queue_id) : null
  const currentQueueNumber = queueInfo?.current_number || 0
  const remainingInQueue = userQueue ? Math.max(0, (userQueue.queue_number || 0) - currentQueueNumber) : 0
  const activeQueues = queues.filter((q) => q.status === "active")
  const estimatedWaitMinutes = remainingInQueue * 3
  const progressPercent = userQueue ? Math.min(((currentQueueNumber) / Math.max(userQueue.queue_number, 1)) * 100, 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Halo, {user?.full_name?.split(" ")[0] || "User"}
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-muted-foreground">
            {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            {" / "}
            <span className="font-mono text-foreground">
              {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </p>
        </div>
        <Link href="/dashboard/take-queue">
          <Button className="gap-2 h-11">
            <Ticket className="w-5 h-5" />
            Ambil Nomor
          </Button>
        </Link>
      </div>

      {/* Active Queue Section */}
      {userQueue ? (
        <div className="space-y-6">
          {/* Status Alert - Serving */}
          {userQueue.status === "serving" && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBoLTQweiIvPjxwYXRoIGQ9Ik00MCAyMGgtNDBNMjAgNDB2LTQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Giliran Anda Sekarang!</p>
                  <p className="text-white/80">Silakan segera menuju ke loket</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Alert - Almost Turn */}
          {userQueue.status === "waiting" && remainingInQueue <= 3 && (
            <div className={`p-6 rounded-3xl relative overflow-hidden ${
              remainingInQueue <= 1 
                ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white" 
                : "bg-amber-500/10 border border-amber-500/30"
            }`}>
              {remainingInQueue <= 1 && (
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBoLTQweiIvPjxwYXRoIGQ9Ik00MCAyMGgtNDBNMjAgNDB2LTQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
              )}
              <div className="relative flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  remainingInQueue <= 1 ? "bg-white/20 backdrop-blur" : "bg-amber-500/20"
                }`}>
                  <Bell className={`w-8 h-8 ${remainingInQueue <= 1 ? "text-white" : "text-amber-500"} ${remainingInQueue <= 1 ? "animate-bounce" : ""}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${remainingInQueue <= 1 ? "text-white" : "text-amber-600 dark:text-amber-400"}`}>
                    {remainingInQueue <= 1 ? "Anda Berikutnya!" : `${remainingInQueue} Orang Lagi`}
                  </p>
                  <p className={remainingInQueue <= 1 ? "text-white/80" : "text-amber-600/70 dark:text-amber-400/70"}>
                    {remainingInQueue <= 1 ? "Bersiap untuk dipanggil" : "Tetap berada di area tunggu"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Queue Card - Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Queue Number - Large Hero */}
            <div className="col-span-2 lg:col-span-6 lg:row-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden border border-slate-700/50">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBoLTQweiIvPjxwYXRoIGQ9Ik00MCAyMGgtNDBNMjAgNDB2LTQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L3N2Zz4=')] opacity-50" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                      <Hash className="w-5 h-5" />
                    </div>
                    <span className="text-white/60">Nomor Antrian Anda</span>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                    userQueue.status === "serving" 
                      ? "bg-emerald-500 text-white" 
                      : "bg-white/10 text-white/80 border border-white/20"
                  }`}>
                    {userQueue.status === "serving" ? "DIPANGGIL" : "MENUNGGU"}
                  </span>
                </div>
                
                <p className="text-9xl sm:text-[10rem] font-bold tracking-tighter leading-none mb-8">{userQueue.queue_number}</p>
                
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-white/50" />
                    <span className="text-white/50 text-sm">Layanan</span>
                  </div>
                  <p className="text-xl font-semibold">{queueInfo?.name || "Antrian"}</p>
                </div>
              </div>
            </div>

            {/* Current Serving */}
            <div className="lg:col-span-3 p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-muted-foreground text-sm">Sedang Dilayani</span>
              </div>
              <p className="text-6xl font-bold tracking-tighter text-blue-500">{currentQueueNumber}</p>
            </div>

            {/* People Ahead */}
            <div className={`lg:col-span-3 p-6 rounded-3xl ${
              remainingInQueue <= 1 
                ? "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/30" 
                : remainingInQueue <= 5 
                  ? "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30" 
                  : "bg-card border border-border"
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  remainingInQueue <= 1 
                    ? "bg-red-500/20" 
                    : remainingInQueue <= 5 
                      ? "bg-amber-500/20" 
                      : "bg-muted"
                }`}>
                  <Users className={`w-5 h-5 ${
                    remainingInQueue <= 1 
                      ? "text-red-500" 
                      : remainingInQueue <= 5 
                        ? "text-amber-500" 
                        : "text-muted-foreground"
                  }`} />
                </div>
                <span className="text-muted-foreground text-sm">Di Depan Anda</span>
              </div>
              <p className={`text-6xl font-bold tracking-tighter ${
                remainingInQueue <= 1 
                  ? "text-red-500" 
                  : remainingInQueue <= 5 
                    ? "text-amber-500" 
                    : "text-foreground"
              }`}>{remainingInQueue}</p>
            </div>

            {/* Estimated Wait */}
            <div className="lg:col-span-3 p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-muted-foreground text-sm">Estimasi Tunggu</span>
              </div>
              <p className="text-4xl font-bold tracking-tight">
                <span className="text-amber-500">~{estimatedWaitMinutes}</span>
                <span className="text-xl text-muted-foreground ml-1">mnt</span>
              </p>
            </div>

            {/* Queue Time */}
            <div className="lg:col-span-3 p-6 rounded-3xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground text-sm">Waktu Ambil</span>
              </div>
              <p className="text-2xl font-bold">
                {new Date(userQueue.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(userQueue.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="p-6 rounded-3xl border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Progress Antrian</h3>
                  <p className="text-xs text-muted-foreground">Posisi Anda dalam antrian</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            
            <div className="relative">
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary via-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>Mulai</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium text-foreground">Nomor {userQueue.queue_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-muted/50 via-muted/30 to-transparent border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Tips Menunggu</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    Tetap berada di area tunggu agar tidak ketinggalan panggilan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    Aktifkan notifikasi browser untuk mendapat pemberitahuan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    Siapkan dokumen yang diperlukan selama menunggu
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State - No Active Queue */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Empty State */}
          <div className="lg:col-span-2 p-8 sm:p-12 rounded-3xl border-2 border-dashed border-border bg-gradient-to-br from-muted/50 via-muted/30 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative text-center">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Belum Ada Antrian Aktif</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Anda belum mengambil nomor antrian. Ambil nomor sekarang untuk memulai proses pelayanan.
              </p>
              <Link href="/dashboard/take-queue">
                <Button size="lg" className="gap-2 h-12 px-8">
                  Ambil Nomor Antrian
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{activeQueues.length}</p>
                  <p className="text-sm text-muted-foreground">Layanan Tersedia</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-500">
                    {queueEntries.filter(e => e.status === "waiting").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Orang Menunggu</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-500">
                    {queueEntries.filter(e => e.status === "completed").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Selesai Hari Ini</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Queues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Layanan Tersedia</h2>
          <Link href="/dashboard/take-queue">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {activeQueues.length === 0 ? (
          <div className="p-12 rounded-3xl border border-border bg-card/50 text-center">
            <p className="text-muted-foreground">Tidak ada layanan aktif saat ini</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeQueues.slice(0, 6).map((queue) => {
              const waiting = queueEntries.filter((e) => e.queue_id === queue.id && e.status === "waiting").length
              const isUserQueue = userQueue?.queue_id === queue.id

              return (
                <div
                  key={queue.id}
                  className={`p-6 rounded-3xl border transition-all hover:shadow-xl ${
                    isUserQueue 
                      ? "bg-primary/5 border-primary/30 hover:shadow-primary/10" 
                      : "bg-card border-border hover:border-primary/30 hover:shadow-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg truncate">{queue.name}</h3>
                        {isUserQueue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
                            ANDA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{queue.description || "Layanan umum"}</p>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif
                    </span>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Nomor Sekarang</p>
                      <p className="text-4xl font-bold tracking-tighter text-primary">{queue.current_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Menunggu</p>
                      <p className="text-2xl font-bold text-amber-500">{waiting}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

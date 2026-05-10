"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import type { Queue } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Hash, 
  Users, 
  Ticket,
  Timer,
  Zap,
  Bell,
  MapPin,
  Activity,
} from "lucide-react"
import { createQueueEntry, cancelQueueEntry, getActiveUserQueueEntry } from "@/lib/supabase-service"
import { useRealtimeQueues } from "@/hooks/use-realtime-queues"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function TakeQueuePage() {
  const { user } = useAuth()
  const { queues: allQueues, queueEntries, loading: queuesLoading } = useRealtimeQueues()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null)
  const [dismissedCompletedEntry, setDismissedCompletedEntry] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const activeQueues = allQueues.filter((q) => q.status === "active")

  const activeEntry = queueEntries.find(
    (e) => e.user_id === user?.id && (e.status === "waiting" || e.status === "serving")
  )

  const completedEntry = queueEntries.find(
    (e) => e.user_id === user?.id && e.status === "completed"
  )

  const activeQueue = activeEntry ? allQueues.find((q) => q.id === activeEntry.queue_id) : null
  const completedQueue = completedEntry ? allQueues.find((q) => q.id === completedEntry.queue_id) : null

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!user || queuesLoading) return

    const activeEntryData = queueEntries.find(
      (e) => e.user_id === user.id && (e.status === "waiting" || e.status === "serving")
    )

    if (activeEntryData && success) {
      setSuccess(false)
    }

    if (!activeEntryData && !success) {
      setError(null)
    }
  }, [user, queueEntries, queuesLoading, success])

  const handleTakeQueue = async (queue: Queue) => {
    setSelectedQueue(queue)
    setShowNameDialog(true)
    setCustomerName(user?.full_name || "")
  }

  const handleConfirmQueue = async () => {
    try {
      if (!user || !selectedQueue) {
        setError("Anda harus masuk untuk mengambil nomor antrian")
        return
      }

      if (!customerName.trim()) {
        setError("Nama customer harus diisi")
        return
      }

      setError(null)
      setSuccess(false)

      const existingEntry = await getActiveUserQueueEntry(user.id)

      if (existingEntry) {
        setError("Anda sudah memiliki antrian aktif")
        return
      }

      const queueWaitingEntries = queueEntries.filter(
        (entry) => entry.queue_id === selectedQueue.id && (entry.status === "waiting" || entry.status === "serving"),
      )

      let nextNumber: number

      if (queueWaitingEntries.length === 0) {
        nextNumber = selectedQueue.current_number + 1
      } else {
        const highestNumber = Math.max(...queueWaitingEntries.map((entry) => entry.queue_number))
        nextNumber = highestNumber + 1
      }

      await createQueueEntry({
        queue_id: selectedQueue.id,
        user_id: user.id,
        customer_name: customerName,
        queue_number: nextNumber,
        status: "waiting",
        priority: "normal",
      })

      setSuccess(true)
      setShowNameDialog(false)
      setCustomerName("")
      setSelectedQueue(null)
    } catch (err: any) {
      console.error("Error taking queue:", err)
      setError(err.message || "Gagal mengambil nomor antrian")
    }
  }

  const handleCancelQueue = async () => {
    try {
      if (!user || !activeEntry) return
      setError(null)
      await cancelQueueEntry(activeEntry.id)
      setSuccess(false)
    } catch (err: any) {
      console.error("Error cancelling queue:", err)
      setError(err.message || "Gagal membatalkan antrian")
    }
  }

  const handleBackToQueue = () => {
    setSuccess(false)
    setError(null)
    setDismissedCompletedEntry(true)
  }

  const remainingInQueue = activeEntry && activeQueue 
    ? Math.max(0, (activeEntry.queue_number || 0) - (activeQueue.current_number || 0))
    : 0

  const estimatedWaitMinutes = remainingInQueue * 3

  return (
    <div className="space-y-6">
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Konfirmasi Antrian</DialogTitle>
            <DialogDescription>
              {selectedQueue && (
                <span className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  <Ticket className="w-3 h-3" />
                  {selectedQueue.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nama Anda</label>
              <Input
                placeholder="Masukkan nama lengkap"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmQueue()
                }}
                autoFocus
                className="h-12"
              />
              <p className="text-xs text-muted-foreground mt-2">Nama akan ditampilkan saat Anda dipanggil</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNameDialog(false)
                  setSelectedQueue(null)
                }}
                className="flex-1 h-11 bg-transparent"
              >
                Batal
              </Button>
              <Button onClick={handleConfirmQueue} className="flex-1 h-11 gap-2" disabled={!customerName.trim()}>
                Ambil Nomor
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ambil Antrian</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Pilih layanan dan ambil nomor antrian Anda
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive text-sm">Terjadi Kesalahan</p>
              <p className="text-destructive/70 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Entry Display */}
      {((activeEntry && activeQueue) || (completedEntry && completedQueue && !dismissedCompletedEntry)) ? (
        <div className="space-y-6">
          {completedEntry && !activeEntry ? (
            /* Completed State */
            <div className="p-8 sm:p-12 rounded-2xl border border-border bg-gradient-to-br from-accent/5 to-accent/10 text-center">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">Nomor Antrian Anda</p>
              <p className="text-6xl sm:text-7xl font-bold text-accent mb-4">{completedEntry.queue_number}</p>
              <p className="font-semibold text-xl mb-2">Layanan Selesai</p>
              <p className="text-muted-foreground mb-8">
                Terima kasih telah menggunakan layanan {completedQueue?.name}
              </p>
              <Button variant="outline" onClick={handleBackToQueue} className="gap-2 bg-transparent">
                <ArrowRight className="w-4 h-4" />
                Ambil Antrian Baru
              </Button>
            </div>
          ) : (
            /* Active State */
            <>
              {/* Status Alert */}
              {activeEntry?.status === "serving" && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-accent to-emerald-600 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">Giliran Anda Sekarang!</p>
                      <p className="text-white/80">Silakan segera menuju ke loket</p>
                    </div>
                  </div>
                </div>
              )}

              {activeEntry?.status === "waiting" && remainingInQueue <= 3 && (
                <div className={`p-5 rounded-2xl ${
                  remainingInQueue <= 1 
                    ? "bg-gradient-to-r from-destructive to-red-600 text-white" 
                    : "bg-amber-500/10 border border-amber-500/30"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      remainingInQueue <= 1 ? "bg-white/20" : "bg-amber-500/20"
                    }`}>
                      <Bell className={`w-6 h-6 ${remainingInQueue <= 1 ? "text-white" : "text-amber-500"}`} />
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${remainingInQueue <= 1 ? "text-white" : "text-amber-600 dark:text-amber-400"}`}>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Queue Number - Hero */}
                <div className="col-span-2 row-span-2 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Hash className="w-5 h-5 text-white/70" />
                      <span className="text-white/70 font-medium">Nomor Antrian Anda</span>
                    </div>
                    
                    <p className="text-8xl sm:text-9xl font-bold tracking-tighter leading-none">{activeEntry?.queue_number}</p>
                    
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-xs">Layanan</p>
                          <p className="font-semibold">{activeQueue?.name}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          activeEntry?.status === "serving" ? "bg-white text-primary" : "bg-white/20"
                        }`}>
                          {activeEntry?.status === "serving" ? "DIPANGGIL" : "MENUNGGU"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Serving */}
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Sedang Dilayani</span>
                  </div>
                  <p className="text-5xl font-bold tracking-tighter text-primary">{activeQueue?.current_number}</p>
                </div>

                {/* Remaining */}
                <div className={`p-5 rounded-2xl border ${
                  remainingInQueue <= 1 
                    ? "bg-destructive/10 border-destructive/30" 
                    : remainingInQueue <= 5 
                      ? "bg-amber-500/10 border-amber-500/30" 
                      : "bg-card border-border"
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      remainingInQueue <= 1 
                        ? "bg-destructive/20" 
                        : remainingInQueue <= 5 
                          ? "bg-amber-500/20" 
                          : "bg-muted"
                    }`}>
                      <Users className={`w-4 h-4 ${
                        remainingInQueue <= 1 
                          ? "text-destructive" 
                          : remainingInQueue <= 5 
                            ? "text-amber-500" 
                            : "text-muted-foreground"
                      }`} />
                    </div>
                    <span className="text-xs text-muted-foreground">Di Depan Anda</span>
                  </div>
                  <p className={`text-5xl font-bold tracking-tighter ${
                    remainingInQueue <= 1 
                      ? "text-destructive" 
                      : remainingInQueue <= 5 
                        ? "text-amber-500" 
                        : "text-foreground"
                  }`}>{remainingInQueue}</p>
                </div>

                {/* Estimated Wait */}
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Timer className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-xs text-muted-foreground">Estimasi Tunggu</span>
                  </div>
                  <p className="text-3xl font-bold tracking-tight">
                    ~{estimatedWaitMinutes}
                    <span className="text-lg text-muted-foreground ml-1">mnt</span>
                  </p>
                </div>

                {/* Queue Time */}
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Waktu Ambil</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date(activeEntry?.created_at || "").toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Progress Antrian</h3>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(((activeQueue?.current_number || 0) / Math.max(activeEntry?.queue_number || 1, 1)) * 100)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min(((activeQueue?.current_number || 0) / Math.max(activeEntry?.queue_number || 1, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Cancel Button */}
              <Button variant="destructive" className="w-full h-12" onClick={handleCancelQueue}>
                Batalkan Antrian
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Success */}
          {success && (
            <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <p className="font-medium text-accent text-sm">Berhasil!</p>
                  <p className="text-accent/70 text-sm mt-0.5">Nomor antrian Anda berhasil diambil</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeQueues.length}</p>
                  <p className="text-xs text-muted-foreground">Layanan</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {queueEntries.filter(e => e.status === "waiting").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Menunggu</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {queueEntries.filter(e => e.status === "serving").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Dilayani</p>
                </div>
              </div>
            </div>
          </div>

          {/* Queue List */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Pilih Layanan</h2>
            
            {activeQueues.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeQueues.map((queue) => {
                  const waiting = queueEntries.filter(
                    (e) => e.queue_id === queue.id && (e.status === "waiting" || e.status === "serving")
                  ).length
                  const lastNumber = waiting > 0 
                    ? Math.max(...queueEntries.filter(e => e.queue_id === queue.id && (e.status === "waiting" || e.status === "serving")).map(e => e.queue_number))
                    : queue.current_number

                  return (
                    <div key={queue.id} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="font-semibold text-lg">{queue.name}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{queue.description || "Layanan antrian tersedia"}</p>
                        </div>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent">
                          <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                          Aktif
                        </span>
                      </div>
                      
                      <div className="flex items-end justify-between mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Nomor Terakhir</p>
                          <p className="text-5xl font-bold tracking-tighter text-primary">{lastNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-500">{waiting}</p>
                          <p className="text-xs text-muted-foreground">menunggu</p>
                        </div>
                      </div>

                      <Button className="w-full h-11 gap-2 group-hover:bg-primary/90" onClick={() => handleTakeQueue(queue)}>
                        Ambil Nomor
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 rounded-2xl border-2 border-dashed border-border text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Tidak Ada Layanan Tersedia</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Saat ini tidak ada layanan yang aktif. Silakan hubungi administrator atau coba lagi nanti.
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="p-6 rounded-2xl border border-border bg-gradient-to-br from-muted/50 to-muted/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Informasi
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Notifikasi Otomatis</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Anda akan diberitahu saat giliran hampir tiba</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">Estimasi Waktu</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Rata-rata ~3 menit per orang</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

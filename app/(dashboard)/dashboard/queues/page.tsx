"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { DialogTitle } from "@/components/ui/dialog"
import { DialogHeader } from "@/components/ui/dialog"
import { DialogContent } from "@/components/ui/dialog"
import { Dialog } from "@/components/ui/dialog"
import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import type { Queue, QueueEntry } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlusCircle, Edit, Trash, Play, Pause, Phone, CheckCircle, RefreshCw, Zap, AlertCircle } from "lucide-react"
import { createQueue, updateQueue, deleteQueue, updateQueueEntry, callQueueEntry, completeQueueEntry, getProfileById } from "@/lib/supabase-service"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeQueues } from "@/hooks/use-realtime-queues"
import { useRealtimeLokets } from "@/hooks/use-realtime-lokets"

export default function QueuesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { queues, queueEntries, loading: realtimeLoading, updateEntryOptimistic, updateQueueOptimistic, refetch } = useRealtimeQueues()
  const { lokets } = useRealtimeLokets()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentQueue, setCurrentQueue] = useState<Queue | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", status: "active" as "active" | "paused" | "closed", current_number: 1 })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedQueueForDelete, setSelectedQueueForDelete] = useState<Queue | null>(null)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [selectedQueueForReset, setSelectedQueueForReset] = useState<Queue | null>(null)
  const [selectedLoket, setSelectedLoket] = useState<string>("")
  const [expandedEntryForCall, setExpandedEntryForCall] = useState<string | null>(null)
  const [completeEntryId, setCompleteEntryId] = useState<string | null>(null)
  const [completeEntryName, setCompleteEntryName] = useState<string>("")

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  // Queue Management Functions
  const handleAddQueue = () => {
    setIsEditMode(false)
    setCurrentQueue(null)
    setFormData({ name: "", description: "", status: "active", current_number: 0 })
    setIsDialogOpen(true)
  }

  const handleEditQueue = (queue: Queue) => {
    setIsEditMode(true)
    setCurrentQueue(queue)
    setFormData({ name: queue.name, description: queue.description, status: queue.status, current_number: queue.current_number })
    setIsDialogOpen(true)
  }

  const handleSubmitQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.name.trim()) {
        toast({ title: "Error", description: "Nama antrian tidak boleh kosong", variant: "destructive" })
        return
      }

      if (isEditMode && currentQueue) {
        await updateQueue(currentQueue.id, formData)
        toast({ title: "Berhasil", description: "Antrian berhasil diperbarui" })
      } else {
        await createQueue(formData)
        toast({ title: "Berhasil", description: "Antrian berhasil dibuat" })
      }

      setIsDialogOpen(false)
      // Data updates automatically via realtime subscription
    } catch (error) {
      console.error("Error submitting queue:", error)
      toast({ title: "Error", description: "Gagal menyimpan antrian", variant: "destructive" })
    }
  }

  const confirmDeleteQueue = async () => {
    if (!selectedQueueForDelete) return
    try {
      await deleteQueue(selectedQueueForDelete.id)
      toast({ title: "Berhasil", description: "Antrian berhasil dihapus" })
      setIsDeleteDialogOpen(false)
      // Data updates automatically via realtime subscription
    } catch (error) {
      console.error("Error deleting queue:", error)
      toast({ title: "Error", description: "Gagal menghapus antrian", variant: "destructive" })
    }
  }

  const confirmResetQueue = async () => {
    if (!selectedQueueForReset) return
    try {
      const allActiveEntries = queueEntries.filter((entry) => entry.queue_id === selectedQueueForReset.id && (entry.status === "waiting" || entry.status === "serving"))
      for (const entry of allActiveEntries) {
        await updateQueueEntry(entry.id, { status: "cancelled", completed_at: new Date().toISOString() })
      }
      // Reset to 0 - first customer to join will be number 1
      await updateQueue(selectedQueueForReset.id, { current_number: 0 })
      toast({ title: "✓ Berhasil", description: "Antrian berhasil direset. Nomor berikutnya dimulai dari 1" })
      setIsResetDialogOpen(false)
      setSelectedQueueForReset(null)
      // Data updates automatically via realtime subscription
    } catch (error) {
      console.error("Error resetting queue:", error)
      toast({ title: "Error", description: "Gagal mereset antrian", variant: "destructive" })
    }
  }

  const handleCallNextPerson = async (entryId: string, queueId: string) => {
    try {
      const nextEntry = queueEntries.find((e) => e.id === entryId)
      if (!nextEntry) return

      // Toggle inline loket selection
      if (expandedEntryForCall === entryId) {
        setExpandedEntryForCall(null)
      } else {
        setExpandedEntryForCall(entryId)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({ title: "Error", description: "Gagal membuka loket selection", variant: "destructive" })
    }
  }

  const handleConfirmCall = async (entryId: string) => {
    if (!selectedLoket) {
      toast({ title: "Error", description: "Pilih loket terlebih dahulu", variant: "destructive" })
      return
    }

    try {
      const entry = queueEntries.find((e) => e.id === entryId)
      if (!entry) return

      // Optimistic update - immediately update UI
      updateEntryOptimistic(entryId, "serving")

      // Close the selection UI immediately
      setExpandedEntryForCall(null)
      setSelectedLoket("")

      // Then make the API call
      await callQueueEntry(entryId, user?.id)

      toast({
        title: "Berhasil",
        description: `Nomor ${entry.queue_number} dipanggil ke ${lokets.find((l) => l.id === selectedLoket)?.loket_name}`,
      })
    } catch (error) {
      console.error("Error:", error)
      // Revert on error by refetching
      refetch()
      toast({ title: "Error", description: "Gagal memanggil antrian", variant: "destructive" })
    }
  }

  const handleCompleteServing = async (entryId: string, queueId: string) => {
    try {
      const entry = queueEntries.find((e) => e.id === entryId)
      if (!entry) return

      const profile = await getProfileById(entry.user_id)
      const userName = profile?.full_name || "User"

      setCompleteEntryId(entryId)
      setCompleteEntryName(userName)
    } catch (error) {
      console.error("Error:", error)
      toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" })
    }
  }

  const confirmCompleteServing = async () => {
    if (!completeEntryId) return

    try {
      const entry = queueEntries.find((e) => e.id === completeEntryId)
      const queueId = entry?.queue_id
      if (!entry || !queueId) return

      const currentQueueNumber = entry.queue_number
      const entryName = completeEntryName

      // Optimistic update - immediately update UI
      updateEntryOptimistic(completeEntryId, "completed")
      updateQueueOptimistic(queueId, { current_number: currentQueueNumber })

      // Close dialog immediately
      setCompleteEntryId(null)
      setCompleteEntryName("")

      // Then make the API calls
      await completeQueueEntry(entry.id)
      await updateQueue(queueId, { current_number: currentQueueNumber })
      
      toast({ title: "Berhasil", description: `${entryName} telah selesai dilayani` })
    } catch (error) {
      console.error("Error completing service:", error)
      // Revert on error by refetching
      refetch()
      toast({ title: "Error", description: "Gagal menyelesaikan pelayanan", variant: "destructive" })
      setCompleteEntryId(null)
      setCompleteEntryName("")
    }
  }

  if (realtimeLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data antrian...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Complete Service Confirmation Dialog */}
      <AlertDialog open={!!completeEntryId} onOpenChange={() => setCompleteEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selesaikan Pelayanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyelesaikan pelayanan untuk {completeEntryName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCompleteServing}>Selesai</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Antrian</h1>
        <p className="text-muted-foreground">Kelola dan pantau semua antrian Anda</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleAddQueue} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Buat Antrian Baru
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Data realtime aktif
        </div>
      </div>

      {/* Queue List */}
      <div className="grid gap-6">
        {queues.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tidak Ada Antrian</AlertTitle>
            <AlertDescription>Buat antrian baru untuk memulai</AlertDescription>
          </Alert>
        ) : (
          queues.map((queue) => {
            const queueWaiting = queueEntries.filter((e) => e.queue_id === queue.id && e.status === "waiting").length
            const queueServing = queueEntries.filter((e) => e.queue_id === queue.id && e.status === "serving").length
            const nextPerson = queueEntries.filter((e) => e.queue_id === queue.id && e.status === "waiting").sort((a, b) => a.queue_number - b.queue_number)[0]
            const servingPerson = queueEntries.filter((e) => e.queue_id === queue.id && e.status === "serving").sort((a, b) => a.queue_number - b.queue_number)[0]
            const queueEntries_ = queueEntries.filter((e) => e.queue_id === queue.id && e.status === "waiting").sort((a, b) => a.queue_number - b.queue_number)

            return (
              <Card key={queue.id} className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{queue.name}</CardTitle>
                    <CardDescription>{queue.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={queue.status === "active" ? "status-active" : queue.status === "paused" ? "status-waiting" : "bg-gray-500"}>
                      {queue.status === "active" ? "Aktif" : queue.status === "paused" ? "Dijeda" : "Tutup"}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => handleEditQueue(queue)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedQueueForDelete(queue); setIsDeleteDialogOpen(true); }}><Trash className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Nomor Saat Ini</p>
                      <p className="text-2xl font-bold text-primary">{queue.current_number}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                      <p className="text-sm text-muted-foreground">Menunggu</p>
                      <p className="text-2xl font-bold text-amber-600">{queueWaiting}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                      <p className="text-sm text-muted-foreground">Dilayani</p>
                      <p className="text-2xl font-bold text-blue-600">{queueServing}</p>
                    </div>
                  </div>

                  {/* Currently Serving Indicator */}
                  {servingPerson && (
                    <div key={`serving-${servingPerson.id}-${servingPerson.status}`} className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Sedang Dilayani</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">#{servingPerson.queue_number} - {servingPerson.customer_name}</p>
                          </div>
                        </div>
                        <Button onClick={() => handleCompleteServing(servingPerson.id, queue.id)} className="gap-2 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Selesaikan
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Call/Complete Actions */}
                  {queue.status === "active" && (
                    <div key={`actions-${queue.id}-${servingPerson?.id || 'none'}-${nextPerson?.id || 'none'}`} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        {nextPerson && !servingPerson && (
                          <>
                            <Button 
                              key={`call-btn-${nextPerson.id}`}
                              onClick={() => handleCallNextPerson(nextPerson.id, queue.id)} 
                              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                              <Phone className="h-4 w-4" />
                              Panggil #{nextPerson.queue_number} - {nextPerson.customer_name}
                            </Button>

                            {/* Inline Loket Selection */}
                            {expandedEntryForCall === nextPerson.id && (
                              <div className="w-full space-y-3 mt-3 p-3 bg-muted rounded-lg">
                                <p className="text-sm font-semibold">Pilih Loket:</p>
                                {lokets.filter((l) => l.status === "available").length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-2">Tidak ada loket yang tersedia</p>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                    {lokets.filter((l) => l.status === "available").map((loket) => (
                                      <button
                                        key={loket.id}
                                        onClick={() => setSelectedLoket(loket.id)}
                                        className={`p-2 rounded-lg border-2 transition-all text-sm text-left ${
                                          selectedLoket === loket.id
                                            ? "border-primary bg-primary/10 font-semibold"
                                            : "border-border hover:border-primary"
                                        }`}
                                      >
                                        <div className="font-medium">{loket.loket_name}</div>
                                        <div className="text-xs text-muted-foreground">Available</div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setExpandedEntryForCall(null)
                                      setSelectedLoket("")
                                    }}
                                    className="flex-1"
                                  >
                                    Batal
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmCall(nextPerson.id)}
                                    disabled={!selectedLoket}
                                    className="flex-1"
                                  >
                                    Konfirmasi
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        {!servingPerson && !nextPerson && <p className="text-sm text-muted-foreground py-2">Tidak ada antrian</p>}
                      </div>
                    </div>
                  )}

                  {/* Queue List */}
                  {queueEntries_.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Antrian Menunggu ({queueEntries_.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {queueEntries_.map((entry) => (
                          <Badge key={entry.id} variant="outline" className="px-3 py-2">
                            #{entry.queue_number}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset Button */}
                  <Button onClick={() => { setSelectedQueueForReset(queue); setIsResetDialogOpen(true); }} variant="outline" size="sm" className="w-full text-destructive hover:text-destructive">
                    Reset Antrian
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create/Edit Queue Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Antrian" : "Buat Antrian Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitQueue} className="space-y-4">
            <div>
              <Label>Nama Antrian</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Service 1" />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Deskripsi antrian..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="paused">Dijeda</SelectItem>
                    <SelectItem value="closed">Tutup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nomor Mulai</Label>
                <Input type="number" value={formData.current_number} onChange={(e) => setFormData({ ...formData, current_number: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">{isEditMode ? "Update" : "Buat"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Antrian</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus "{selectedQueueForDelete?.name}"? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteQueue} className="bg-destructive">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Antrian</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin mereset "{selectedQueueForReset?.name}"? Semua antrian yang menunggu akan dibatalkan dan nomor akan direset ke 1.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetQueue} className="bg-orange-600">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { createLoket, deleteLoket } from "@/lib/loket-service"
import { useRealtimeLokets } from "@/hooks/use-realtime-lokets"
import { supabase } from "@/lib/supabase"
import type { Loket } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2, Plus, RefreshCw } from "lucide-react"

export default function LoketManagementPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const { lokets, loading, refetch } = useRealtimeLokets()
  const [loketName, setLoketName] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [deleteLoketId, setDeleteLoketId] = useState<string | null>(null)
  const [servedCounts, setServedCounts] = useState<Record<string, number>>({})

  // Fetch actual served counts from loket_assignments table
  const fetchServedCounts = async () => {
    try {
      const { data: assignments, error } = await supabase
        .from("loket_assignments")
        .select("loket_id")
        .not("completed_at", "is", null)

      if (error) throw error

      // Count completed assignments per loket
      const counts: Record<string, number> = {}
      assignments?.forEach((a) => {
        counts[a.loket_id] = (counts[a.loket_id] || 0) + 1
      })
      setServedCounts(counts)
    } catch (err) {
      console.error("Error fetching served counts:", err)
    }
  }

  useEffect(() => {
    fetchServedCounts()

    // Subscribe to loket_assignments changes
    const assignmentsSubscription = supabase
      .channel("loket-assignments-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "loket_assignments" }, () => {
        fetchServedCounts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(assignmentsSubscription)
    }
  }, [])

  // Get served count from realtime data
  const getServedCountForLoket = (loket: Loket): number => {
    return servedCounts[loket.id] || loket.total_served_today || 0
  }

  const handleCreateLoket = async () => {
    if (!loketName.trim()) {
      toast({ title: "Error", description: "Nama loket harus diisi", variant: "destructive" })
      return
    }

    try {
      await createLoket(loketName)
      toast({ title: "✓ Berhasil", description: "Loket berhasil dibuat" })
      setLoketName("")
      setShowForm(false)
      await refetch() // fetchLokets is replaced with refetch
    } catch (error) {
      console.error("Error creating loket:", error)
      toast({ title: "Error", description: "Gagal membuat loket", variant: "destructive" })
    }
  }

  const handleDeleteLoket = async (loketId: string) => {
    setDeleteLoketId(loketId)
  }

  const confirmDelete = async () => {
    if (!deleteLoketId) return

    try {
      await deleteLoket(deleteLoketId)
      toast({ title: "✓ Berhasil", description: "Loket berhasil dihapus" })
      await refetch() // fetchLokets is replaced with refetch
    } catch (error) {
      console.error("Error deleting loket:", error)
      toast({ title: "Error", description: "Gagal menghapus loket", variant: "destructive" })
    } finally {
      setDeleteLoketId(null)
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!authLoading && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
          <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini. Hanya admin yang dapat mengakses manajemen loket.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Loket</h1>
            <p className="text-muted-foreground mt-1">Kelola semua loket yang tersedia di sistem</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            {showForm ? "Batal" : "Tambah Loket"}
          </Button>
        </div>
      </div>

      {/* Inline Form */}
      {showForm && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Buat Loket Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nama Loket</label>
                <Input
                  placeholder="Contoh: Loket 1"
                  value={loketName}
                  onChange={(e) => setLoketName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleCreateLoket()
                  }}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setLoketName("")
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button onClick={handleCreateLoket} disabled={!loketName.trim()} className="flex-1">
                  Buat Loket
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLoketId} onOpenChange={() => setDeleteLoketId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Loket</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus loket ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lokets List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Loket</CardTitle>
          <CardDescription>Total: {lokets.length} loket</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : lokets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada loket. Tambahkan loket baru untuk memulai.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lokets.map((loket) => (
                <div
                  key={loket.id}
                  className="p-4 border rounded-lg flex items-start justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{loket.loket_name}</h3>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant={loket.status === "available" ? "default" : loket.status === "busy" ? "secondary" : "outline"}>
                        {loket.status === "available" ? "Kosong" : loket.status === "busy" ? "Sibuk" : loket.status}
                      </Badge>
                      <Badge variant="outline">Dilayani: {getServedCountForLoket(loket)}</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteLoket(loket.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

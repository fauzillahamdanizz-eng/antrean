"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import type { QueueEntry } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { getQueueEntries } from "@/lib/supabase-service"
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  Activity
} from "lucide-react"

export default function ReportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("today")

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  // Fetch queue entries
  useEffect(() => {
    const fetchQueueEntries = async () => {
      setLoading(true)

      try {
        let entries = await getQueueEntries()
        const now = new Date()
        let startDate: Date

        switch (timeRange) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0))
            entries = entries.filter((entry) => new Date(entry.created_at) >= startDate)
            break
          case "yesterday":
            startDate = new Date(now)
            startDate.setDate(startDate.getDate() - 1)
            startDate.setHours(0, 0, 0, 0)
            const endDate = new Date(startDate)
            endDate.setHours(23, 59, 59, 999)
            entries = entries.filter(
              (entry) => new Date(entry.created_at) >= startDate && new Date(entry.created_at) <= endDate,
            )
            break
          case "week":
            startDate = new Date(now)
            startDate.setDate(startDate.getDate() - 7)
            entries = entries.filter((entry) => new Date(entry.created_at) >= startDate)
            break
          case "month":
            startDate = new Date(now)
            startDate.setMonth(startDate.getMonth() - 1)
            entries = entries.filter((entry) => new Date(entry.created_at) >= startDate)
            break
        }

        setQueueEntries(entries)
      } catch (error) {
        console.error("Error fetching queue entries:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQueueEntries()
  }, [timeRange])

  // Calculate statistics
  const totalEntries = queueEntries.length
  const waitingEntries = queueEntries.filter((entry) => entry.status === "waiting").length
  const servingEntries = queueEntries.filter((entry) => entry.status === "serving").length
  const completedEntries = queueEntries.filter((entry) => entry.status === "completed").length
  const cancelledEntries = queueEntries.filter((entry) => entry.status === "cancelled").length
  const successRate = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0

  // Calculate average wait time (mock calculation - in real app would use actual timestamps)
  const avgWaitTime = completedEntries > 0 ? Math.round(completedEntries * 2.5) : 0

  // Prepare chart data
  const statusData = [
    { name: "Menunggu", value: waitingEntries, fill: "#f59e0b" },
    { name: "Dilayani", value: servingEntries, fill: "#3b82f6" },
    { name: "Selesai", value: completedEntries, fill: "#22c55e" },
    { name: "Dibatalkan", value: cancelledEntries, fill: "#ef4444" },
  ]

  const pieData = statusData.filter(d => d.value > 0)

  // Prepare hourly data
  const hourlyData = Array(24)
    .fill(0)
    .map((_, i) => ({ 
      hour: `${i.toString().padStart(2, '0')}:00`, 
      count: 0 
    }))

  queueEntries.forEach((entry) => {
    const hour = new Date(entry.created_at).getHours()
    hourlyData[hour].count += 1
  })

  // Find peak hour
  const peakHour = hourlyData.reduce((max, current) => 
    current.count > max.count ? current : max, hourlyData[0]
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Laporan & Analitik</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <BarChart3 className="w-3 h-3" />
              Dashboard
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Lihat statistik dan analitik performa antrian
          </p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Pilih rentang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="yesterday">Kemarin</SelectItem>
              <SelectItem value="week">7 Hari Terakhir</SelectItem>
              <SelectItem value="month">30 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entries - Hero Card */}
        <div className="col-span-2 lg:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-white/70" />
              <span className="text-white/70 text-sm font-medium">Total Entri</span>
            </div>
            <p className="text-5xl font-bold tracking-tighter">{totalEntries}</p>
            <p className="text-white/60 text-sm mt-2">
              {timeRange === "today" ? "Hari ini" : timeRange === "yesterday" ? "Kemarin" : timeRange === "week" ? "7 hari terakhir" : "30 hari terakhir"}
            </p>
          </div>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tighter text-green-500">{completedEntries}</p>
          <p className="text-sm text-muted-foreground mt-1">Selesai</p>
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500 font-medium">{successRate}%</span>
          </div>
        </div>

        {/* Waiting */}
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tighter text-amber-500">{waitingEntries}</p>
          <p className="text-sm text-muted-foreground mt-1">Menunggu</p>
          <div className="mt-2">
            <span className="text-xs text-muted-foreground">{servingEntries} sedang dilayani</span>
          </div>
        </div>

        {/* Cancelled */}
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tighter text-red-500">{cancelledEntries}</p>
          <p className="text-sm text-muted-foreground mt-1">Dibatalkan</p>
          <div className="mt-2">
            <span className="text-xs text-muted-foreground">
              {totalEntries > 0 ? Math.round((cancelledEntries / totalEntries) * 100) : 0}% dari total
            </span>
          </div>
        </div>
      </div>

      {/* Success Rate & Peak Hour Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-semibold">Tingkat Keberhasilan</span>
            </div>
            <span className="text-2xl font-bold text-primary">{successRate}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-blue-600 transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {completedEntries} dari {totalEntries} antrian berhasil dilayani
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">Jam Tersibuk</span>
          </div>
          <p className="text-4xl font-bold tracking-tighter">{peakHour.hour}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {peakHour.count} antrian pada jam tersebut
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution Chart */}
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Distribusi Status
            </CardTitle>
            <CardDescription>Distribusi entri antrian berdasarkan status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {totalEntries > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Tidak ada data untuk periode ini
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution Chart */}
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Distribusi Per Jam
            </CardTitle>
            <CardDescription>Jumlah entri antrian berdasarkan jam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData.filter((_, i) => i >= 6 && i <= 22)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Entri"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Ringkasan Aktivitas
          </CardTitle>
          <CardDescription>Aktivitas antrian terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queueEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    entry.status === "completed" ? "bg-green-500/10" :
                    entry.status === "waiting" ? "bg-amber-500/10" :
                    entry.status === "serving" ? "bg-blue-500/10" :
                    "bg-red-500/10"
                  }`}>
                    <span className={`text-lg font-bold ${
                      entry.status === "completed" ? "text-green-500" :
                      entry.status === "waiting" ? "text-amber-500" :
                      entry.status === "serving" ? "text-blue-500" :
                      "text-red-500"
                    }`}>
                      #{entry.queue_number}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{entry.customer_name || "Customer"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  entry.status === "completed" ? "bg-green-500/10 text-green-500" :
                  entry.status === "waiting" ? "bg-amber-500/10 text-amber-500" :
                  entry.status === "serving" ? "bg-blue-500/10 text-blue-500" :
                  "bg-red-500/10 text-red-500"
                }`}>
                  {entry.status === "completed" ? "Selesai" :
                   entry.status === "waiting" ? "Menunggu" :
                   entry.status === "serving" ? "Dilayani" :
                   "Dibatalkan"}
                </span>
              </div>
            ))}
            {queueEntries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada aktivitas untuk periode ini
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

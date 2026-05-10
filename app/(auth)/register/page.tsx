"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, UserPlus, Mail, Lock, User, ArrowRight, Sparkles, Shield, Zap, Users } from "lucide-react"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, signUp } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const validateForm = () => {
    setError(null)

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Semua kolom harus diisi")
      return false
    }

    if (fullName.trim().length < 2) {
      setError("Nama lengkap minimal 2 karakter")
      return false
    }

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter")
      return false
    }

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, fullName)
      setSuccess("Pendaftaran berhasil! Anda sekarang dapat masuk.")
      setFullName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      console.error("Registration error:", err)

      if (err.message.includes("invalid")) {
        setError("Validasi email gagal. Gunakan alamat email yang berbeda atau periksa format email Anda.")
      } else if (err.message.includes("already")) {
        setError("Akun dengan email ini sudah ada. Silakan masuk.")
      } else {
        setError(err.message || "Gagal mendaftar. Silakan coba lagi.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark min-h-screen flex bg-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBoLTQweiIvPjxwYXRoIGQ9Ik00MCAyMGgtNDBNMjAgNDB2LTQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L3N2Zz4=')] opacity-50" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />

      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <div className="w-5 h-5 rounded-md bg-white/90" />
            </div>
            <span className="text-xl font-bold text-white">ANTREAN</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Buat Akun</h2>
              <p className="text-zinc-400">Daftar untuk mengakses sistem antrian</p>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
                  >
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-400 text-sm">Kesalahan</p>
                        <p className="text-red-400/80 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-400 text-sm">Berhasil</p>
                        <p className="text-emerald-400/80 text-sm mt-1">{success}</p>
                        <Link href="/login" className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium mt-2 hover:underline">
                          Masuk sekarang <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-zinc-300">
                    Nama Lengkap
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500 pointer-events-none" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      minLength={2}
                      className="pl-12 h-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@contoh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                    Kata Sandi
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500 pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-12 h-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                    Konfirmasi Kata Sandi
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500 pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Ulangi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-12 h-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 font-semibold bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white transition-all rounded-xl gap-2 mt-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mendaftar...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Daftar
                    </>
                  )}
                </Button>
              </form>
            </div>

            <p className="text-center text-sm text-zinc-400">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative">
        <div className="flex justify-end">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <div className="w-5 h-5 rounded-md bg-white/90" />
            </div>
            <span className="text-xl font-bold text-white">ANTREAN</span>
          </div>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white leading-tight text-right">
              Bergabung
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Sekarang
              </span>
            </h1>
            <p className="text-zinc-400 text-lg mt-6 max-w-md text-right ml-auto">
              Daftar gratis dan mulai kelola antrian dengan mudah. Akses semua fitur tanpa batas.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5 text-purple-500" />
              </div>
              <p className="font-semibold text-white">Gratis</p>
              <p className="text-sm text-zinc-500">Tanpa biaya</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="font-semibold text-white">Cepat</p>
              <p className="text-sm text-zinc-500">Setup instan</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <p className="font-semibold text-white">Aman</p>
              <p className="text-sm text-zinc-500">Data terlindungi</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <p className="font-semibold text-white">Lengkap</p>
              <p className="text-sm text-zinc-500">Fitur premium</p>
            </motion.div>
          </div>
        </div>

        <p className="text-sm text-zinc-600 text-right">
          Sistem Manajemen Antrian
        </p>
      </div>
    </div>
  )
}

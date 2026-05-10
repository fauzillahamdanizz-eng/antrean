"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  ListOrdered,
  BarChart,
  Home,
  Clock,
  History,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Building2,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = user?.role === "admin"

  const adminNavItems = [
    {
      name: "Dasbor",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manajemen Pengguna",
      href: "/dashboard/users",
      icon: Users,
    },
    {
      name: "Manajemen Loket",
      href: "/dashboard/lokets",
      icon: Building2,
    },
    {
      name: "Manajemen Antrian",
      href: "/dashboard/queues",
      icon: ListOrdered,
    },
    {
      name: "Laporan",
      href: "/dashboard/reports",
      icon: BarChart,
    },
  ]

  const userNavItems = [
    {
      name: "Beranda",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Ambil Antrian",
      href: "/dashboard/take-queue",
      icon: Clock,
    },
    {
      name: "Riwayat",
      href: "/dashboard/history",
      icon: History,
    },
  ]

  const navItems = isAdmin ? adminNavItems : userNavItems

  useEffect(() => {
    // Close mobile menu when path changes
    setIsMobileMenuOpen(false)
  }, [pathname])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top navigation bar - hidden on mobile */}
      <header className="sticky top-0 z-50 hidden md:flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex">
              <Clock className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold">Sistem Manajemen Antrian</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Ganti tema"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.full_name ? getInitials(user.full_name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile menu toggle button - visible only on mobile */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full bg-background shadow-md border-primary/20"
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar for desktop */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 mt-0 md:mt-16 hidden w-64 transform flex-col overflow-y-auto border-r bg-sidebar px-4 py-6 transition duration-300 lg:flex lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <nav className="space-y-6">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Mobile menu - starts from top of screen with padding */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-40 w-[85%] max-w-xs transform bg-sidebar shadow-xl transition duration-300 ease-in-out">
              {/* Logo and app name */}
              <div className="flex items-center justify-between border-b border-sidebar-border p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h1 className="text-base font-bold">Antrean</h1>
                </div>
              </div>

              {/* User profile section */}
              <div className="p-4">
                <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/50 p-2">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.full_name ? getInitials(user.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user?.full_name}</p>
                    <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
                    <p className="mt-0.5 text-xs font-medium text-primary">{isAdmin ? "Administrator" : "Pengguna"}</p>
                  </div>
                </div>
              </div>

              {/* Navigation menu */}
              <div className="px-4">
                <div className="mb-1 px-3 py-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">
                    Menu Navigasi
                  </h2>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        pathname === item.href
                          ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md ${
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "bg-sidebar-accent/50 text-sidebar-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Settings section */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
                <div className="mb-1 px-3 py-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">
                    Pengaturan
                  </h2>
                </div>
                <div className="space-y-2">
                  {/* Dark mode toggle inside mobile sidebar */}
                  {mounted && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                      <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-md bg-sidebar-accent">
                        {theme === "dark" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                      </div>
                      <span className="text-xs">{theme === "dark" ? "Mode Terang" : "Mode Gelap"}</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent"
                    onClick={signOut}
                  >
                    <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-md bg-sidebar-accent">
                      <LogOut className="h-3 w-3" />
                    </div>
                    <span className="text-xs">Keluar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content - adjusted padding for mobile */}
        <main className="flex-1 overflow-y-auto p-4 pt-16 md:pt-6 md:p-6 lg:ml-64">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

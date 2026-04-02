"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase"

const navItems = [
  { href: "/dashboard", label: "Мои резюме" },
  { href: "/interview", label: "Создать резюме" },
  { href: "/adapt", label: "Адаптировать" },
  { href: "/cover-letters", label: "Сопроводительные письма" },
  { href: "/promo", label: "Промо-код" },
]

interface SidebarProps {
  userEmail: string
}

function SidebarContent({ userEmail, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/tokens/balance")
      .then((r) => r.json())
      .then((data) => setBalance(data.balance ?? 0))
      .catch(() => setBalance(null))
  }, [])

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-3 pt-5 pb-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-base font-bold"
          style={{ color: "#f1f5f9" }}
        >
          CV Builder
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="px-3 py-2 rounded-md text-[13px] transition-colors"
              style={
                isActive
                  ? { backgroundColor: "rgba(99,102,241,0.12)", color: "#f1f5f9", fontWeight: 500 }
                  : { color: "#64748b" }
              }
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#94a3b8"
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "#64748b"
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom section */}
      <div className="px-2 pb-4">
        <div className="mx-1 border-t" style={{ borderColor: "#1e293b" }} />

        <div className="mt-2 px-3">
          <Link
            href="/tokens"
            onClick={onNavigate}
            className="block text-xs font-medium mb-0.5 hover:opacity-80"
            style={{ color: "#a78bfa" }}
          >
            ✦ {balance !== null ? `${balance} токенов` : "—"}
          </Link>
          <div className="flex items-center justify-between">
            <span className="text-[11px] truncate" style={{ color: "#64748b" }}>
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="text-[11px] ml-2 shrink-0 hover:opacity-80"
              style={{ color: "#475569" }}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar({ userEmail }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen z-30"
        style={{
          width: 200,
          backgroundColor: "#0f172a",
          borderRight: "1px solid #334155",
        }}
      >
        <SidebarContent userEmail={userEmail} />
      </aside>

      {/* Mobile top bar */}
      <header
        className="lg:hidden sticky top-0 z-40 border-b"
        style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
      >
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="p-1"
              style={{ color: "#94a3b8" }}
              aria-label="Меню"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="text-sm font-bold" style={{ color: "#f1f5f9" }}>
              CV Builder
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 lg:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setOpen(false)}
          />
          <aside
            className="fixed top-0 left-0 h-screen z-50 lg:hidden"
            style={{
              width: 240,
              backgroundColor: "#0f172a",
              borderRight: "1px solid #334155",
            }}
          >
            <div className="flex justify-end p-3">
              <button
                onClick={() => setOpen(false)}
                className="p-1"
                style={{ color: "#64748b" }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent userEmail={userEmail} onNavigate={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}

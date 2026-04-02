"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Резюме" },
  { href: "/interview", label: "Создать" },
  { href: "/adapt", label: "Адаптировать" },
  { href: "/cover-letters", label: "Письма" },
  { href: "/promo", label: "Промо-код" },
]

export function DashboardNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={
                isActive
                  ? { backgroundColor: "rgba(99,102,241,0.15)", color: "#a78bfa" }
                  : { color: "#94a3b8" }
              }
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile burger button */}
      <button
        className="lg:hidden p-1.5 rounded-lg transition-colors"
        style={{ color: "#94a3b8" }}
        onClick={() => setOpen(!open)}
        aria-label="Меню"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="absolute top-14 left-0 right-0 z-50 border-b lg:hidden"
          style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
        >
          <nav className="flex flex-col px-4 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? { backgroundColor: "rgba(99,102,241,0.15)", color: "#a78bfa" }
                      : { color: "#94a3b8" }
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}

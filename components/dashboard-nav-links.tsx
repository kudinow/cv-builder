"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Мои резюме" },
  { href: "/interview", label: "Создать резюме" },
  { href: "/adapt", label: "Адаптировать" },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
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
  )
}

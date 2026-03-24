"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface BalanceResponse {
  balance: number
}

export function TokenBalance() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tokens/balance")
      .then((r) => r.json())
      .then((data: BalanceResponse) => {
        setBalance(data.balance ?? 0)
      })
      .catch(() => setBalance(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
        style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" }}
      >
        {/* Coin icon */}
        <span style={{ color: "#a78bfa" }}>◈</span>
        {loading ? (
          <span
            className="inline-block h-4 w-10 rounded animate-pulse"
            style={{ backgroundColor: "#334155" }}
          />
        ) : balance === null ? (
          <span style={{ color: "#94a3b8" }}>—</span>
        ) : (
          <span>{balance}</span>
        )}
        <span style={{ color: "#94a3b8" }} className="hidden sm:inline">
          токенов
        </span>
      </div>
      <Link
        href="/tokens"
        className="inline-flex items-center justify-center rounded-lg px-2.5 h-7 text-[0.8rem] font-medium text-white"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
      >
        Купить
      </Link>
    </div>
  )
}

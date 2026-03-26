"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { reachGoal } from "@/lib/metrika"

export default function TokensSuccessPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Small delay to allow webhook to process before we fetch balance
    const timer = setTimeout(() => {
      fetch("/api/tokens/balance")
        .then((r) => (r.ok ? r.json() : { balance: null }))
        .then((data) => {
          setBalance(data.balance ?? null)
          reachGoal('purchase_success')
        })
        .catch(() => setBalance(null))
        .finally(() => setLoading(false))
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="mx-auto max-w-lg">
      <div
        className="rounded-2xl p-10 text-center"
        style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
      >
        {/* Success icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-2xl font-bold" style={{ color: "#f1f5f9" }}>
          Токены успешно зачислены!
        </h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Платёж подтверждён. Токены уже на вашем счёте.
        </p>

        {/* Balance display */}
        <div
          className="mt-8 rounded-xl p-5"
          style={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-widest" style={{ color: "#64748b" }}>
            Текущий баланс
          </p>

          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div
                className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
              />
              <span className="text-sm" style={{ color: "#94a3b8" }}>
                Загрузка...
              </span>
            </div>
          ) : balance !== null ? (
            <div className="flex items-center justify-center gap-2">
              <span style={{ color: "#a78bfa", fontSize: "1.4rem" }}>◈</span>
              <span className="text-3xl font-bold" style={{ color: "#f1f5f9" }}>
                {balance.toLocaleString("ru-RU")}
              </span>
              <span className="text-sm" style={{ color: "#94a3b8" }}>
                токенов
              </span>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Баланс обновится в течение нескольких секунд
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", display: "block" }}
          >
            Перейти к резюме
          </Link>
          <Link
            href="/tokens"
            className="w-full rounded-xl py-3 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: "#94a3b8", display: "block" }}
          >
            Купить ещё токены
          </Link>
        </div>
      </div>
    </div>
  )
}

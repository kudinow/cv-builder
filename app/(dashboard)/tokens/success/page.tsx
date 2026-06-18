"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { reachGoal } from "@/lib/metrika"

export default function TokensSuccessPage() {
  const [accessUntil, setAccessUntil] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reachGoal('purchase_success')
    const timer = setTimeout(() => {
      fetch("/api/access")
        .then((r) => (r.ok ? r.json() : { accessUntil: null }))
        .then((data) => {
          setAccessUntil(data.accessUntil ?? null)
        })
        .catch(() => {})
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
          Оплата прошла успешно!
        </h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Платёж подтверждён. Доступ открыт.
        </p>

        {/* Access display */}
        <div
          className="mt-8 rounded-xl p-5"
          style={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
        >
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
          ) : accessUntil && new Date(accessUntil).getTime() > Date.now() ? (
            <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>
              Доступ до {new Date(accessUntil).toLocaleDateString("ru-RU")}
            </p>
          ) : (
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Доступ будет активирован в течение нескольких секунд
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
        </div>
      </div>
    </div>
  )
}

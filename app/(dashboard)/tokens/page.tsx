"use client"

import { useEffect, useState } from "react"
import { PaywallModal } from "@/components/paywall-modal"

export default function AccessPage() {
  const [accessUntil, setAccessUntil] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paywallOpen, setPaywallOpen] = useState(false)

  useEffect(() => {
    fetch("/api/access")
      .then((r) => r.json())
      .then((d) => setAccessUntil(d.accessUntil ?? null))
      .catch(() => setAccessUntil(null))
      .finally(() => setLoading(false))
  }, [])

  const active = accessUntil && new Date(accessUntil).getTime() > Date.now()

  return (
    <div className="mx-auto max-w-2xl py-8 px-4" style={{ color: "#f1f5f9" }}>
      <h1 className="text-2xl font-bold mb-4">Доступ</h1>
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Загрузка…</p>
      ) : active ? (
        <p style={{ color: "#94a3b8" }}>
          Доступ активен до{" "}
          <span style={{ color: "#a78bfa", fontWeight: 600 }}>
            {new Date(accessUntil!).toLocaleDateString("ru-RU")}
          </span>
          . Безлимит скачиваний, адаптаций и сопроводительных.
        </p>
      ) : (
        <>
          <p className="mb-4" style={{ color: "#94a3b8" }}>
            Откройте безлимит на скачивания, адаптации под вакансии и сопроводительные.
          </p>
          <button
            onClick={() => setPaywallOpen(true)}
            className="rounded-xl px-5 py-3 text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
          >
            Доступ на 30 дней — 890 ₽
          </button>
        </>
      )}
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  )
}

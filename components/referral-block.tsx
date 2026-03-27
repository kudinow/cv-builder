"use client"

import { useEffect, useState } from "react"

interface ReferralData {
  code: string
  link: string
  stats: { invited: number; tokensEarned: number }
}

export function ReferralBlock() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch("/api/promo/referral")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  function handleCopy() {
    if (!data) return
    navigator.clipboard.writeText(data.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div
        className="mt-8 rounded-2xl p-6 animate-pulse"
        style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
      >
        <div className="h-6 w-48 rounded" style={{ backgroundColor: "#334155" }} />
        <div className="mt-4 h-10 rounded" style={{ backgroundColor: "#334155" }} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div
      className="mt-8 rounded-2xl p-6"
      style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
    >
      <h3 className="text-lg font-semibold mb-1" style={{ color: "#f1f5f9" }}>
        Приглашайте друзей — получайте токены
      </h3>
      <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>
        Ваш друг получит 80 токенов при регистрации. Вы получите 30 токенов, когда он создаст первое резюме.
      </p>

      {/* Referral link */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          readOnly
          value={data.link}
          className="flex-1 rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            color: "#a78bfa",
          }}
        />
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all"
          style={{
            background: copied
              ? "rgba(34,197,94,0.8)"
              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          }}
        >
          {copied ? "Скопировано!" : "Копировать"}
        </button>
      </div>

      {/* Stats */}
      <div className="mt-5 flex gap-6">
        <div>
          <div className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
            {data.stats.invited}
          </div>
          <div className="text-xs" style={{ color: "#64748b" }}>
            приглашено
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: "#a78bfa" }}>
            +{data.stats.tokensEarned}
          </div>
          <div className="text-xs" style={{ color: "#64748b" }}>
            токенов заработано
          </div>
        </div>
      </div>
    </div>
  )
}

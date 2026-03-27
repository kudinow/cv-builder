"use client"

import { useState } from "react"
import { reachGoal } from "@/lib/metrika"

export default function PromoPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/promo/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        setResult({
          success: true,
          message: `+${data.tokensGranted} токенов начислено!`,
        })
        setCode("")
        reachGoal("promo_activate")
      } else {
        setResult({ success: false, message: data.error })
      }
    } catch {
      setResult({ success: false, message: "Ошибка сети" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <h1
          className="mb-2 text-2xl sm:text-3xl font-bold"
          style={{ color: "#f1f5f9" }}
        >
          Активировать промо-код
        </h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Введите промо-код чтобы получить бонусные токены
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Введите код"
              maxLength={30}
              className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                color: "#f1f5f9",
              }}
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              {loading ? "..." : "Активировать"}
            </button>
          </div>

          {result && (
            <div
              className="mt-4 rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: result.success
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(239,68,68,0.1)",
                border: result.success
                  ? "1px solid rgba(34,197,94,0.3)"
                  : "1px solid rgba(239,68,68,0.3)",
                color: result.success ? "#22c55e" : "#ef4444",
              }}
            >
              {result.message}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

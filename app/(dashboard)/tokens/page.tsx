"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TOKEN_PACKAGES, TOKEN_COSTS } from "@/lib/token-costs"

const PACKAGE_DESCRIPTIONS = [
  "1 создание резюме с нуля, несколько адаптаций",
  "2–3 создания резюме + ~15 адаптаций к вакансиям",
  "Максимум возможностей: 10+ резюме и десятки адаптаций",
] as const

export default function TokensPage() {
  const router = useRouter()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/tokens/balance")
      .then((r) => (r.ok ? r.json() : { balance: null }))
      .then((data) => setBalance(data.balance ?? null))
      .catch(() => setBalance(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleSelect(packageIndex: number) {
    setError(null)
    setPurchasing(packageIndex)

    try {
      const res = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageIndex }),
      })

      const data = await res.json() as { confirmationUrl?: string; error?: string }

      if (!res.ok || !data.confirmationUrl) {
        setError(data.error ?? "Не удалось создать платёж. Попробуйте ещё раз.")
        return
      }

      // Redirect to YooKassa checkout
      window.location.href = data.confirmationUrl
    } catch {
      setError("Ошибка сети. Проверьте соединение и попробуйте снова.")
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1
          className="mb-3 text-3xl font-bold tracking-tight"
          style={{ color: "#f1f5f9" }}
        >
          Пополнить баланс токенов
        </h1>
        <p className="text-base" style={{ color: "#94a3b8" }}>
          Токены списываются за операции с резюме. Чем больше пакет — тем выгоднее.
        </p>

        {/* Current balance */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5"
          style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
        >
          <span style={{ color: "#a78bfa", fontSize: "1.1rem" }}>◈</span>
          {loading ? (
            <span
              className="inline-block h-5 w-16 rounded animate-pulse"
              style={{ backgroundColor: "#334155" }}
            />
          ) : balance !== null ? (
            <span style={{ color: "#f1f5f9" }} className="text-sm font-medium">
              Текущий баланс: <strong>{balance}</strong> токенов
            </span>
          ) : (
            <span style={{ color: "#94a3b8" }} className="text-sm">
              Баланс недоступен
            </span>
          )}
        </div>
      </div>

      {/* Package cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {TOKEN_PACKAGES.map((pkg, index) => {
          const isPopular = index === 1
          const pricePerToken = (pkg.priceKopeks / pkg.tokens / 100).toFixed(2)
          const isLoading = purchasing === index

          return (
            <div
              key={pkg.name}
              className="relative flex flex-col rounded-2xl p-6 card-glow"
              style={{
                backgroundColor: "#1e293b",
                border: isPopular
                  ? "2px solid #6366f1"
                  : "1px solid #334155",
                boxShadow: isPopular
                  ? "0 0 0 1px #6366f1, 0 8px 32px 0 rgba(99, 102, 241, 0.2)"
                  : undefined,
              }}
            >
              {/* Popular badge */}
              {isPopular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "#fff",
                  }}
                >
                  Популярный
                </div>
              )}

              {/* Package name */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                  {pkg.name}
                </p>

                {/* Token count */}
                <div className="mt-2 flex items-end gap-2">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: "#f1f5f9" }}
                  >
                    {pkg.tokens.toLocaleString("ru-RU")}
                  </span>
                  <span className="mb-1 text-sm" style={{ color: "#a78bfa" }}>
                    токенов
                  </span>
                </div>

                {/* Price */}
                <div className="mt-3">
                  <span className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
                    {(pkg.priceKopeks / 100).toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="ml-2 text-sm" style={{ color: "#64748b" }}>
                    ~{pricePerToken} ₽/токен
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="mb-4 border-t" style={{ borderColor: "#334155" }} />

              {/* Description */}
              <p className="mb-6 flex-1 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                {PACKAGE_DESCRIPTIONS[index]}
              </p>

              {/* Stоимость операций reference */}
              <div
                className="mb-5 rounded-xl p-3 text-xs"
                style={{ backgroundColor: "#0f172a", color: "#64748b" }}
              >
                <p className="mb-1 font-medium" style={{ color: "#94a3b8" }}>Что можно сделать:</p>
                <ul className="space-y-1">
                  <li>◈ {Math.floor(pkg.tokens / TOKEN_COSTS.CREATE_RESUME)} создания с нуля ({TOKEN_COSTS.CREATE_RESUME} токенов)</li>
                  <li>◈ {Math.floor(pkg.tokens / TOKEN_COSTS.ADAPT_RESUME)} адаптации ({TOKEN_COSTS.ADAPT_RESUME} токена)</li>
                  <li>◈ {Math.floor(pkg.tokens / TOKEN_COSTS.IMPROVE_RESUME)} улучшений ({TOKEN_COSTS.IMPROVE_RESUME} токенов)</li>
                </ul>
              </div>

              {/* CTA button */}
              <button
                onClick={() => handleSelect(index)}
                disabled={isLoading || purchasing !== null}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={
                  isPopular
                    ? {
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "#fff",
                      }
                    : {
                        backgroundColor: "#334155",
                        color: "#f1f5f9",
                      }
                }
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: "#fff", borderTopColor: "transparent" }}
                    />
                    Создание платежа...
                  </span>
                ) : (
                  "Выбрать"
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Error message */}
      {error && (
        <div
          className="mt-6 rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: "#450a0a", border: "1px solid #7f1d1d", color: "#fca5a5" }}
        >
          {error}
        </div>
      )}

      {/* Footer note */}
      <p className="mt-8 text-center text-xs" style={{ color: "#475569" }}>
        Оплата через ЮКассу. Токены зачисляются сразу после подтверждения платежа.
        Токены не сгорают и не привязаны к сроку.
      </p>
    </div>
  )
}

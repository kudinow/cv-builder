"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface CoverLetterItem {
  id: string
  vacancy_url: string | null
  vacancy_text: string
  status: string
  created_at: string
}

const cardStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
}

export default function CoverLettersPage() {
  const [letters, setLetters] = useState<CoverLetterItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cover-letters")
        if (res.ok) {
          const data = await res.json()
          setLetters(data.coverLetters ?? [])
        }
      } catch {
        // Show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
        />
      </div>
    )
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function getSnippet(item: CoverLetterItem) {
    if (item.vacancy_url) return item.vacancy_url
    return item.vacancy_text.length > 100
      ? item.vacancy_text.slice(0, 100) + "..."
      : item.vacancy_text
  }

  function getStatusBadge(status: string) {
    if (status === "done") return { label: "Готово", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" }
    if (status === "error") return { label: "Ошибка", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" }
    return { label: "Генерация...", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
            Сопроводительные письма
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
            {letters.length > 0
              ? `${letters.length} ${letters.length === 1 ? "письмо" : letters.length < 5 ? "письма" : "писем"}`
              : ""}
          </p>
        </div>
        <Link
          href="/cover-letter"
          className="rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff",
          }}
        >
          + Написать письмо
        </Link>
      </div>

      {letters.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={cardStyle}>
          <div className="text-4xl mb-3">✉️</div>
          <p className="text-lg font-medium mb-2" style={{ color: "#f1f5f9" }}>
            У вас пока нет сопроводительных писем
          </p>
          <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
            Выберите резюме, укажите вакансию — AI напишет письмо за вас
          </p>
          <Link
            href="/cover-letter"
            className="inline-block rounded-xl px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
            }}
          >
            Написать письмо
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {letters.map((item) => {
            const badge = getStatusBadge(item.status)
            return (
              <Link
                key={item.id}
                href={`/cover-letter/${item.id}`}
                className="block p-4 rounded-xl transition-colors hover:border-[#6366f1]"
                style={cardStyle}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                    }}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p className="text-sm line-clamp-2" style={{ color: "#94a3b8" }}>
                  {getSnippet(item)}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

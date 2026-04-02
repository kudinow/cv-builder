"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface CoverLetterItem {
  id: string
  title: string | null
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

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

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function getTitle(item: CoverLetterItem) {
    return item.title || "Сопроводительное письмо"
  }

  async function handleRename(id: string) {
    const trimmed = editValue.trim()
    const item = letters.find((l) => l.id === id)
    if (!trimmed || trimmed === getTitle(item!)) {
      setEditingId(null)
      return
    }
    try {
      const res = await fetch(`/api/cover-letter/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      })
      if (res.ok) {
        setLetters((prev) =>
          prev.map((l) => (l.id === id ? { ...l, title: trimmed } : l))
        )
      }
    } catch {
      // Revert on error
    }
    setEditingId(null)
  }

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
          {letters.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 p-4 rounded-xl"
              style={cardStyle}
            >
              {/* Title — editable */}
              {editingId === item.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleRename(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(item.id)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  className="text-sm font-medium outline-none rounded px-1 -mx-1"
                  style={{
                    color: "#f1f5f9",
                    backgroundColor: "#0f172a",
                    border: "1px solid #6366f1",
                  }}
                />
              ) : (
                <h3
                  className="text-sm font-medium truncate cursor-pointer hover:opacity-80"
                  style={{ color: "#f1f5f9" }}
                  onClick={(e) => {
                    e.preventDefault()
                    setEditValue(getTitle(item))
                    setEditingId(item.id)
                  }}
                  title="Нажмите, чтобы переименовать"
                >
                  {getTitle(item)}
                </h3>
              )}

              {/* Date */}
              <span className="text-xs" style={{ color: "#64748b" }}>
                {formatDate(item.created_at)}
              </span>

              {/* Open link */}
              <Link
                href={`/cover-letter/${item.id}`}
                className="text-xs font-medium hover:opacity-80"
                style={{ color: "#94a3b8" }}
              >
                Открыть
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

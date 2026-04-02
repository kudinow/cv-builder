"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { InsufficientTokensModal } from "@/components/insufficient-tokens-modal"

interface ResumeCardProps {
  id: string
  title: string
  targetPosition?: string | null
  adaptationCount: number
  createdAt: string
  tokenBalance: number
}

export function ResumeCard({
  id,
  title: initialTitle,
  targetPosition,
  adaptationCount,
  createdAt,
  tokenBalance,
}: ResumeCardProps) {
  const router = useRouter()
  const [modalState, setModalState] = useState<{ open: boolean; needed: number }>({
    open: false,
    needed: 0,
  })
  const [title, setTitle] = useState(initialTitle)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(initialTitle)

  const formattedDate = new Date(createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  function handleAdapt() {
    const cost = 50
    if (tokenBalance < cost) {
      setModalState({ open: true, needed: cost })
      return
    }
    router.push(`/adapt?master=${id}`)
  }

  async function handleRename() {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === title) {
      setEditing(false)
      setEditValue(title)
      return
    }
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      })
      if (res.ok) {
        setTitle(trimmed)
      }
    } catch {
      // Revert on error
    }
    setEditing(false)
  }

  function handleImprove() {
    const cost = 80
    if (tokenBalance < cost) {
      setModalState({ open: true, needed: cost })
      return
    }
    router.push(`/interview?mode=improve&master=${id}`)
  }

  return (
    <>
      <div
        className="card-glow flex flex-col gap-4 rounded-2xl p-5"
        style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename()
                  if (e.key === "Escape") { setEditing(false); setEditValue(title) }
                }}
                className="w-full text-base font-semibold leading-tight outline-none rounded px-1 -mx-1"
                style={{ color: "#f1f5f9", backgroundColor: "#0f172a", border: "1px solid #6366f1" }}
              />
            ) : (
              <h3
                className="truncate text-base font-semibold leading-tight cursor-pointer hover:opacity-80"
                style={{ color: "#f1f5f9" }}
                onClick={() => { setEditValue(title); setEditing(true) }}
                title="Нажмите, чтобы переименовать"
              >
                {title}
              </h3>
            )}
            {targetPosition && (
              <p className="mt-0.5 truncate text-sm" style={{ color: "#94a3b8" }}>
                {targetPosition}
              </p>
            )}
          </div>
          {adaptationCount > 0 && (
            <Badge
              className="shrink-0 text-xs font-medium"
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                color: "#a78bfa",
                border: "1px solid rgba(99, 102, 241, 0.3)",
              }}
            >
              {adaptationCount}{" "}
              {adaptationCount === 1
                ? "адаптация"
                : adaptationCount < 5
                  ? "адаптации"
                  : "адаптаций"}
            </Badge>
          )}
        </div>

        {/* Date */}
        <p className="text-xs" style={{ color: "#64748b" }}>
          {formattedDate}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAdapt}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Адаптировать · 50
          </button>
          <button
            onClick={handleImprove}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: "#334155",
              color: "#f1f5f9",
              border: "1px solid #475569",
              cursor: "pointer",
            }}
          >
            Улучшить · 80
          </button>
          <Link
            href={`/resume/${id}`}
            className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] px-2 h-6 text-xs font-medium"
            style={{ color: "#94a3b8" }}
          >
            Открыть
          </Link>
        </div>
      </div>

      <InsufficientTokensModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, needed: 0 })}
        needed={modalState.needed}
        balance={tokenBalance}
      />
    </>
  )
}

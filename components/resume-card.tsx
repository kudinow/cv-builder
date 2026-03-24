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
  title,
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

  const formattedDate = new Date(createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  function handleAdapt() {
    const cost = 40 // has master resume in system
    if (tokenBalance < cost) {
      setModalState({ open: true, needed: cost })
      return
    }
    router.push(`/adapt?master=${id}`)
  }

  function handleImprove() {
    const cost = 60
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
            <h3
              className="truncate text-base font-semibold leading-tight"
              style={{ color: "#f1f5f9" }}
            >
              {title}
            </h3>
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
            Адаптировать · 40
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
            Улучшить · 60
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

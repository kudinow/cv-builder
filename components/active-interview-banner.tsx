"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface ActiveSession {
  id: string
  status: "active" | "paused"
  mode: "create" | "improve"
  phase: number
  message_count: number
}

interface ActiveSessionResponse {
  session: ActiveSession | null
}

export function ActiveInterviewBanner() {
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/interview/sessions/active")
      .then((r) => r.json())
      .then((data: ActiveSessionResponse) => setSession(data.session ?? null))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !session) return null

  const modeLabel = session.mode === "improve" ? "улучшение резюме" : "создание резюме"
  const phaseLabel = `Фаза ${session.phase} из 5`

  return (
    <div
      className="mb-6 flex items-center justify-between rounded-xl px-4 py-3"
      style={{
        backgroundColor: "rgba(99, 102, 241, 0.12)",
        border: "1px solid rgba(99, 102, 241, 0.4)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Pulsing dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
            style={{ backgroundColor: "#6366f1" }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "#6366f1" }}
          />
        </span>
        <div>
          <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
            У вас есть незавершённое интервью
          </p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>
            {modeLabel} · {phaseLabel} · {session.message_count} сообщений
          </p>
        </div>
      </div>
      <Link
        href={`/interview/${session.id}`}
        className="inline-flex items-center justify-center rounded-[min(var(--radius-md),12px)] px-2.5 h-7 text-[0.8rem] font-medium text-white"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
      >
        Продолжить →
      </Link>
    </div>
  )
}

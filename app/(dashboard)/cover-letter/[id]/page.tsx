"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

const cardStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
}

export default function CoverLetterResultPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [coverLetter, setCoverLetter] = useState("")
  const [status, setStatus] = useState<string>("processing")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [sourceData, setSourceData] = useState<{
    resume_id: string | null
    resume_text: string
    vacancy_url: string | null
    vacancy_text: string
  } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/cover-letter/${id}`)
        if (res.ok) {
          const data = await res.json()
          setCoverLetter(data.cover_letter || "")
          setStatus(data.status || "error")
          setSourceData({
            resume_id: data.resume_id || null,
            resume_text: data.resume_text || "",
            vacancy_url: data.vacancy_url || null,
            vacancy_text: data.vacancy_text || "",
          })
        } else {
          setStatus("error")
        }
      } catch {
        setStatus("error")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleRegenerate() {
    if (!sourceData) return
    setRegenerating(true)
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceData.resume_id || undefined,
          resumeText: sourceData.resume_id ? undefined : sourceData.resume_text,
          vacancyUrl: sourceData.vacancy_url || undefined,
          vacancyText: sourceData.vacancy_text,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка генерации")
      router.push(`/cover-letter/${data.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка при генерации")
      setRegenerating(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(coverLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement("textarea")
      textarea.value = coverLetter
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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

  if (status === "error") {
    return (
      <div className="mx-auto max-w-3xl py-8 px-4 text-center">
        <div className="text-4xl mb-3">😔</div>
        <p className="text-lg font-medium mb-2" style={{ color: "#f1f5f9" }}>
          Ошибка при генерации письма
        </p>
        <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
          Попробуйте ещё раз или обратитесь в поддержку
        </p>
        <Link
          href="/cover-letter"
          className="inline-block rounded-xl px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff",
          }}
        >
          Попробовать снова
        </Link>
      </div>
    )
  }

  if (status === "processing") {
    return (
      <div className="mx-auto max-w-3xl py-8 px-4 text-center">
        <div
          className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
        />
        <p className="text-lg font-medium" style={{ color: "#f1f5f9" }}>
          Генерация письма...
        </p>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Обычно это занимает 15-30 секунд
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
          Сопроводительное письмо
        </h1>
        <Link
          href="/cover-letters"
          className="text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "#94a3b8" }}
        >
          Назад к письмам
        </Link>
      </div>

      <div className="p-5 rounded-xl mb-4" style={cardStyle}>
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: "#e2e8f0" }}
        >
          {coverLetter}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: copied
              ? "rgba(34,197,94,0.15)"
              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: copied ? "#22c55e" : "#fff",
            border: copied ? "1px solid rgba(34,197,94,0.3)" : "none",
          }}
        >
          {copied ? "Скопировано!" : "Скопировать"}
        </button>
        <button
          onClick={handleRegenerate}
          disabled={regenerating || !sourceData}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            border: "1px solid #334155",
            color: "#94a3b8",
          }}
        >
          {regenerating ? "Генерация..." : "Сгенерировать заново — 20 токенов"}
        </button>
      </div>
    </div>
  )
}

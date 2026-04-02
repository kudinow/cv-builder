"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { reachGoal } from "@/lib/metrika"

type ResumeSource = "select" | "upload"
type VacancySource = "url" | "text"

interface SavedResume {
  id: string
  title: string | null
  target_position: string | null
  type: string
  created_at: string
}

const cardStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
}

const inputStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
  borderRadius: "8px",
}

export default function CoverLetterPage() {
  const router = useRouter()

  const [resumeSource, setResumeSource] = useState<ResumeSource>("select")
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeDragOver, setResumeDragOver] = useState(false)

  const [vacancySource, setVacancySource] = useState<VacancySource>("url")
  const [vacancyUrl, setVacancyUrl] = useState("")
  const [vacancyText, setVacancyText] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved resumes for dropdown
  useEffect(() => {
    async function loadResumes() {
      try {
        const res = await fetch("/api/resumes?all=true")
        if (res.ok) {
          const data = await res.json()
          const all = (data.resumes ?? []).map((r: Record<string, unknown>) => ({
            id: r.id as string,
            title: (r.title as string) ?? null,
            target_position: (r.target_position as string) ?? null,
            type: r.type as string,
            created_at: r.created_at as string,
          }))
          setSavedResumes(all)
        }
      } catch {
        // Ignore — user can still upload PDF
      }
    }
    loadResumes()
  }, [])

  function getResumeLabel(r: SavedResume) {
    const label = r.title || r.target_position || "Резюме без названия"
    const type = r.type === "master" ? "" : " (адаптация)"
    const date = new Date(r.created_at).toLocaleDateString("ru-RU")
    return `${label}${type} — ${date}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let resumeText: string | undefined
      let resumeId: string | undefined

      if (resumeSource === "select") {
        if (!selectedResumeId) {
          setError("Выберите резюме из списка")
          setLoading(false)
          return
        }
        resumeId = selectedResumeId
      } else {
        if (!resumeFile) {
          setError("Загрузите PDF-файл с резюме")
          setLoading(false)
          return
        }
        // Parse PDF
        const formData = new FormData()
        formData.append("file", resumeFile)
        const parseRes = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        })
        const parseData = await parseRes.json()
        if (!parseRes.ok) {
          throw new Error(parseData.error || "Ошибка парсинга резюме")
        }
        resumeText = parseData.text
      }

      if (vacancySource === "url" && !vacancyUrl) {
        setError("Вставьте ссылку на вакансию")
        setLoading(false)
        return
      }
      if (vacancySource === "text" && !vacancyText) {
        setError("Вставьте текст вакансии")
        setLoading(false)
        return
      }

      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resumeId || undefined,
          resumeText: resumeText || undefined,
          vacancyUrl: vacancySource === "url" ? vacancyUrl : undefined,
          vacancyText: vacancySource === "text" ? vacancyText : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка генерации")

      reachGoal("cover_letter_generated")
      router.push(`/cover-letter/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка")
      setLoading(false)
    }
  }

  const isFormValid =
    (resumeSource === "select" ? !!selectedResumeId : !!resumeFile) &&
    (vacancySource === "url" ? !!vacancyUrl : !!vacancyText)

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <h1 className="mb-2 text-3xl font-bold" style={{ color: "#f1f5f9" }}>
        Сопроводительное письмо
      </h1>
      <p className="mb-8 text-sm" style={{ color: "#94a3b8" }}>
        Выберите резюме и укажите вакансию — AI напишет сопроводительное письмо
      </p>

      {error && (
        <div
          className="mb-6 rounded-xl p-4 text-sm"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-6 rounded-xl p-6 text-center" style={cardStyle}>
          <div className="mb-2">
            <div
              className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
            />
          </div>
          <p className="text-base font-medium" style={{ color: "#f1f5f9" }}>
            AI пишет сопроводительное письмо...
          </p>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Это может занять 15-30 секунд
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resume block */}
        <div className="p-3 sm:p-5 rounded-xl" style={cardStyle}>
          <h3 className="text-base font-semibold mb-1" style={{ color: "#f1f5f9" }}>
            1. Ваше резюме
          </h3>
          <p className="text-sm mb-4" style={{ color: "#64748b" }}>
            Выберите сохранённое резюме или загрузите PDF
          </p>

          {/* Toggle */}
          <div className="flex gap-2 mb-4">
            {(
              [
                ["select", "Выбрать резюме"],
                ["upload", "Загрузить PDF"],
              ] as [ResumeSource, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setResumeSource(value)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={
                  resumeSource === value
                    ? {
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff",
                      }
                    : { border: "1px solid #334155", color: "#94a3b8" }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {resumeSource === "select" ? (
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              <option value="">Выберите резюме...</option>
              {savedResumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {getResumeLabel(r)}
                </option>
              ))}
            </select>
          ) : (
            <label
              className="flex items-center justify-center w-full py-8 rounded-lg cursor-pointer transition-colors"
              style={{
                border: "2px dashed",
                borderColor: resumeDragOver ? "#8b5cf6" : "#334155",
                backgroundColor: resumeDragOver
                  ? "rgba(99,102,241,0.08)"
                  : "#0f172a",
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setResumeDragOver(true)
              }}
              onDragLeave={() => setResumeDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setResumeDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file && file.type === "application/pdf") {
                  setResumeFile(file)
                } else {
                  setError("Пожалуйста, загрузите файл в формате PDF")
                }
              }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📄</div>
                <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
                  {resumeFile
                    ? resumeFile.name
                    : "Перетащите PDF или нажмите для выбора"}
                </p>
                {resumeFile && (
                  <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                    {(resumeFile.size / 1024).toFixed(0)} КБ
                  </p>
                )}
              </div>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                disabled={loading}
              />
            </label>
          )}
        </div>

        {/* Vacancy block */}
        <div className="p-3 sm:p-5 rounded-xl" style={cardStyle}>
          <h3 className="text-base font-semibold mb-1" style={{ color: "#f1f5f9" }}>
            2. Вакансия
          </h3>
          <p className="text-sm mb-4" style={{ color: "#64748b" }}>
            Вставьте ссылку на вакансию или текст описания
          </p>

          {/* Toggle */}
          <div className="flex gap-2 mb-4">
            {(
              [
                ["url", "Ссылка на вакансию"],
                ["text", "Вставить описание"],
              ] as [VacancySource, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setVacancySource(value)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={
                  vacancySource === value
                    ? {
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff",
                      }
                    : { border: "1px solid #334155", color: "#94a3b8" }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {vacancySource === "url" ? (
            <input
              type="url"
              placeholder="https://hh.ru/vacancy/123456"
              value={vacancyUrl}
              onChange={(e) => setVacancyUrl(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#6366f1] placeholder:text-[#475569]"
              style={inputStyle}
            />
          ) : (
            <textarea
              placeholder="Вставьте описание вакансии..."
              rows={8}
              value={vacancyText}
              onChange={(e) => setVacancyText(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 text-sm resize-y outline-none focus:ring-1 focus:ring-[#6366f1] placeholder:text-[#475569]"
              style={inputStyle}
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          }}
          disabled={loading || !isFormValid}
        >
          {loading ? "Генерация..." : "Написать письмо — 20 токенов"}
        </button>
      </form>
    </div>
  )
}

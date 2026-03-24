"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ResumeData {
  full_name: string
  target_position?: string
  about_me?: string
  experience?: Array<{
    company: string
    position: string
    period: string
    achievements: string[]
  }>
  skills?: Array<{ category: string; items: string[] }> | string[]
  education?: Array<{ institution: string; degree: string; year: string }>
  languages?: Array<{ language: string; level: string }>
}

interface ResumeViewClientProps {
  resume: {
    id: string
    title: string
    target_position: string | null
    adapted_text: string
    created_at: string
  }
  resumeData: ResumeData | null
  adaptations: Array<{
    id: string
    title: string
    target_position: string | null
    created_at: string
    status: string
  }>
}

export function ResumeViewClient({
  resume,
  resumeData,
  adaptations,
}: ResumeViewClientProps) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)

  const displayTitle = resume.title || resumeData?.full_name || 'Резюме'
  const createdDate = new Date(resume.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  async function handleDownloadPDF() {
    if (!resumeData) return
    setIsDownloading(true)
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData }),
      })
      if (!res.ok) throw new Error('Ошибка генерации PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resumeData.full_name || 'resume'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при скачивании PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  const cardStyle = {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1rem',
  }

  const headingStyle = { color: '#f1f5f9', fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }
  const mutedStyle = { color: '#94a3b8' }

  // Normalize skills to array of {category, items} if possible
  function renderSkills() {
    if (!resumeData?.skills) return null
    const skills = resumeData.skills

    if (Array.isArray(skills) && skills.length > 0) {
      const firstItem = skills[0]
      // Check if it's {category, items} format
      if (typeof firstItem === 'object' && firstItem !== null && 'category' in firstItem) {
        const grouped = skills as Array<{ category: string; items: string[] }>
        return (
          <div style={cardStyle}>
            <h3 style={headingStyle}>Навыки</h3>
            <div className="space-y-2">
              {grouped.map((g, i) => (
                <div key={i}>
                  <div className="text-xs font-medium mb-1" style={{ color: '#a78bfa' }}>
                    {g.category}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {g.items.map((item, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#94a3b8' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      // Plain string array
      const items = skills as string[]
      return (
        <div style={cardStyle}>
          <h3 style={headingStyle}>Навыки</h3>
          <div className="flex flex-wrap gap-1">
            {items.map((item, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#94a3b8' }}
              >
                {typeof item === 'string' ? item : String(item)}
              </span>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div style={{ color: '#f1f5f9' }}>
      {/* Header section */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>
              {displayTitle}
            </h1>
            {resume.target_position && (
              <p className="text-sm mb-1" style={{ color: '#a78bfa' }}>
                {resume.target_position}
              </p>
            )}
            <p className="text-xs" style={mutedStyle}>
              Создано {createdDate}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {resumeData && (
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="text-sm px-4 py-2 rounded-xl transition-opacity disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                }}
              >
                {isDownloading ? 'Генерируем...' : 'Скачать PDF'}
              </button>
            )}
            <button
              onClick={() => router.push('/adapt?masterId=' + resume.id)}
              className="text-sm px-4 py-2 rounded-xl transition-colors"
              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
            >
              Адаптировать под вакансию
            </button>
          </div>
        </div>
      </div>

      {/* Resume preview */}
      {resumeData ? (
        <div>
          {/* About */}
          {resumeData.about_me && (
            <div style={cardStyle}>
              <h3 style={headingStyle}>О себе</h3>
              <p className="text-sm leading-relaxed" style={mutedStyle}>
                {resumeData.about_me}
              </p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience && resumeData.experience.length > 0 && (
            <div style={cardStyle}>
              <h3 style={headingStyle}>Опыт работы</h3>
              <div className="space-y-4">
                {resumeData.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="font-medium text-sm" style={{ color: '#f1f5f9' }}>
                      {exp.company} — {exp.position}
                    </div>
                    <div className="text-xs mb-2" style={mutedStyle}>
                      {exp.period}
                    </div>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="space-y-1">
                        {exp.achievements.map((a, j) => (
                          <li key={j} className="text-sm flex gap-2" style={mutedStyle}>
                            <span style={{ color: '#6366f1', flexShrink: 0 }}>•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {renderSkills()}

          {/* Education */}
          {resumeData.education && resumeData.education.length > 0 && (
            <div style={cardStyle}>
              <h3 style={headingStyle}>Образование</h3>
              <div className="space-y-2">
                {resumeData.education.map((edu, i) => (
                  <div key={i}>
                    <div className="text-sm font-medium" style={{ color: '#f1f5f9' }}>
                      {edu.institution}
                    </div>
                    <div className="text-xs" style={mutedStyle}>
                      {edu.degree} · {edu.year}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {resumeData.languages && resumeData.languages.length > 0 && (
            <div style={cardStyle}>
              <h3 style={headingStyle}>Языки</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.languages.map((lang, i) => (
                  <div key={i} className="text-sm" style={mutedStyle}>
                    {lang.language}
                    {lang.level && (
                      <span
                        className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#a78bfa' }}
                      >
                        {lang.level}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback: raw text */
        <div style={cardStyle}>
          <h3 style={headingStyle}>Текст резюме</h3>
          <pre
            className="text-sm whitespace-pre-wrap leading-relaxed"
            style={mutedStyle}
          >
            {resume.adapted_text}
          </pre>
        </div>
      )}

      {/* Adaptations list */}
      {adaptations.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#f1f5f9' }}>
            Адаптации ({adaptations.length})
          </h2>
          <div className="space-y-3">
            {adaptations.map((a) => (
              <Link
                key={a.id}
                href={`/result/${a.id}`}
                className="flex items-center justify-between rounded-xl px-4 py-3 card-glow"
                style={{ background: '#1e293b', border: '1px solid #334155', display: 'flex' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f1f5f9' }}>
                    {a.title}
                  </p>
                  <p className="text-xs" style={mutedStyle}>
                    {a.target_position} ·{' '}
                    {new Date(a.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <span style={{ color: '#6366f1' }}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Improve this resume button */}
      <div className="mt-8 text-center">
        <Link
          href="/interview?mode=improve"
          className="inline-block text-sm px-6 py-3 rounded-xl transition-colors"
          style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
        >
          Улучшить это резюме
        </Link>
      </div>
    </div>
  )
}

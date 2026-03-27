"use client"

import { useEffect, useState } from "react"
import { WizardScreen } from "@/components/wizard-screen"
import { ResumeCard } from "@/components/resume-card"
import { ActiveInterviewBanner } from "@/components/active-interview-banner"
import { ReferralBlock } from "@/components/referral-block"

interface MasterResume {
  id: string
  title: string | null
  target_position: string | null
  created_at: string
  adaptation_count: number
}

export default function DashboardPage() {
  const [tokenBalance, setTokenBalance] = useState(0)
  const [resumes, setResumes] = useState<MasterResume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [balanceRes, resumesRes] = await Promise.all([
          fetch("/api/tokens/balance").then(r => r.ok ? r.json() : { balance: 0 }),
          fetch("/api/resumes").then(r => r.ok ? r.json() : { resumes: [] }),
        ])
        setTokenBalance(balanceRes.balance ?? 0)

        // Map resumes with adaptation count
        const mapped = (resumesRes.resumes ?? []).map((r: Record<string, unknown>) => ({
          id: r.id as string,
          title: (r.title as string) ?? "Резюме без названия",
          target_position: (r.target_position as string) ?? null,
          created_at: r.created_at as string,
          adaptation_count: Array.isArray(r.adaptations) && r.adaptations[0]
            ? (r.adaptations[0] as { count: number }).count
            : 0,
        }))
        setResumes(mapped)
      } catch {
        // Silently fail — show empty state
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

  const hasResumes = resumes.length > 0

  return (
    <div>
      <ActiveInterviewBanner />

      {hasResumes ? (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
                Мои резюме
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
                {resumes.length} мастер-резюме
              </p>
            </div>
            <a
              href="/dashboard/new"
              className="rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#fff",
              }}
            >
              + Новое резюме
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                id={resume.id}
                title={resume.title ?? "Резюме без названия"}
                targetPosition={resume.target_position}
                adaptationCount={resume.adaptation_count}
                createdAt={resume.created_at}
                tokenBalance={tokenBalance}
              />
            ))}
          </div>
        </div>
      ) : (
        <WizardScreen hasMasterResumes={false} tokenBalance={tokenBalance} />
      )}

      <ReferralBlock />
    </div>
  )
}

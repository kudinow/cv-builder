import { createServerSupabaseClient } from "@/lib/supabase-server"
import { WizardScreen } from "@/components/wizard-screen"
import { ResumeCard } from "@/components/resume-card"
import { ActiveInterviewBanner } from "@/components/active-interview-banner"

interface MasterResume {
  id: string
  title: string | null
  target_position: string | null
  created_at: string
  adaptation_count: number
}

async function fetchTokenBalance(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("profiles")
    .select("tokens")
    .eq("id", userId)
    .single()
  return data?.tokens ?? 0
}

async function fetchMasterResumes(userId: string): Promise<MasterResume[]> {
  const supabase = await createServerSupabaseClient()

  // Fetch master resumes
  const { data: masters } = await supabase
    .from("resumes")
    .select("id, title, target_position, created_at")
    .eq("user_id", userId)
    .eq("type", "master")
    .is("parent_id", null)
    .order("created_at", { ascending: false })

  if (!masters || masters.length === 0) return []

  // Fetch adaptation counts in one query
  const masterIds = masters.map((r) => r.id)
  const { data: adaptations } = await supabase
    .from("resumes")
    .select("parent_id")
    .eq("type", "adaptation")
    .in("parent_id", masterIds)

  const countMap: Record<string, number> = {}
  for (const a of adaptations ?? []) {
    if (a.parent_id) countMap[a.parent_id] = (countMap[a.parent_id] ?? 0) + 1
  }

  return masters.map((r) => ({
    id: r.id,
    title: r.title ?? "Резюме без названия",
    target_position: r.target_position ?? null,
    created_at: r.created_at,
    adaptation_count: countMap[r.id] ?? 0,
  }))
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [tokenBalance, masterResumes] = await Promise.all([
    fetchTokenBalance(user!.id),
    fetchMasterResumes(user!.id),
  ])

  const hasResumes = masterResumes.length > 0

  return (
    <div>
      {/* Active interview banner — client, fetches own data */}
      <ActiveInterviewBanner />

      {hasResumes ? (
        /* ---- Returning user: resume grid ---- */
        <div>
          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "#f1f5f9" }}
              >
                Мои резюме
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
                {masterResumes.length}{" "}
                {masterResumes.length === 1
                  ? "мастер-резюме"
                  : masterResumes.length < 5
                    ? "мастер-резюме"
                    : "мастер-резюме"}
              </p>
            </div>

            {/* "+ Новое" button */}
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

          {/* Resume grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {masterResumes.map((resume) => (
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
        /* ---- New user: wizard ---- */
        <WizardScreen
          hasMasterResumes={false}
          tokenBalance={tokenBalance}
        />
      )}
    </div>
  )
}

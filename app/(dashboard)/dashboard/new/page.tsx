import { createServerSupabaseClient } from "@/lib/supabase-server"
import { WizardScreen } from "@/components/wizard-screen"

async function fetchTokenBalance(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("profiles")
    .select("tokens")
    .eq("id", userId)
    .single()
  return data?.tokens ?? 0
}

async function hasMasterResumes(userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { count } = await supabase
    .from("resumes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "master")
    .is("parent_id", null)
  return (count ?? 0) > 0
}

export default async function NewResumePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [tokenBalance, hasResumes] = await Promise.all([
    fetchTokenBalance(user!.id),
    hasMasterResumes(user!.id),
  ])

  return (
    <div>
      {/* Back link */}
      <a
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-1 text-sm transition-colors"
        style={{ color: "#94a3b8" }}
      >
        ← Мои резюме
      </a>
      <WizardScreen hasMasterResumes={hasResumes} tokenBalance={tokenBalance} />
    </div>
  )
}

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { WizardScreen } from "@/components/wizard-screen"

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
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return <div style={{ color: "#f1f5f9" }}>Загрузка...</div>
  }

  const hasResumes = await hasMasterResumes(userId)

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
      <WizardScreen hasMasterResumes={hasResumes} />
    </div>
  )
}

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { DashboardSidebar } from "@/components/dashboard-nav-links"

export async function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const email = session?.user?.email ?? ""

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f172a" }}>
      <DashboardSidebar userEmail={email} />

      {/* Content area — offset by sidebar on desktop */}
      <div className="lg:ml-[200px]">
        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

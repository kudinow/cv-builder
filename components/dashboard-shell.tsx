import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { TokenBalance } from "@/components/token-balance"
import { UserMenu } from "@/components/user-menu"

export async function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="theme-premium min-h-screen" style={{ backgroundColor: "#0f172a" }}>
      {/* Navbar */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span
              className="text-lg font-bold gradient-brand-text"
            >
              ResumeAI
            </span>
          </Link>

          {/* Right side: token balance + user menu */}
          <div className="flex items-center gap-3">
            <TokenBalance />
            <UserMenu userEmail={user?.email ?? ""} />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}

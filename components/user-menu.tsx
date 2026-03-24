"use client"

import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export function UserMenu({ userEmail }: { userEmail: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm sm:block" style={{ color: "#94a3b8" }}>
        {userEmail}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-sm"
        style={{ color: "#94a3b8" }}
      >
        Выйти
      </Button>
    </div>
  )
}

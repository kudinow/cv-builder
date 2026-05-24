import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth check is handled by middleware — no need to call getUser() here
  return <DashboardShell>{children}</DashboardShell>
}

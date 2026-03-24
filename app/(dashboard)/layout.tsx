import { DashboardShell } from "@/components/dashboard-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth check is handled by middleware — no need to call getUser() here
  return <DashboardShell>{children}</DashboardShell>
}

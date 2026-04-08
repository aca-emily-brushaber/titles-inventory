import { DashboardShell } from "@/components/dashboard-shell"
import { QueueToolbarFilterProvider } from "@/lib/queue-toolbar-filters"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueueToolbarFilterProvider>
      <DashboardShell>{children}</DashboardShell>
    </QueueToolbarFilterProvider>
  )
}

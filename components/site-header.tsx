"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  useQueueToolbarFilters,
  type QueueStatusFilter,
  type RiskLevelFilter,
} from "@/lib/queue-toolbar-filters"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconX } from "@tabler/icons-react"

const STATUS_OPTIONS: { value: QueueStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "in-review", label: "In review" },
  { value: "requires-investigation", label: "Hold" },
  { value: "completed", label: "Completed" },
]

const RISK_OPTIONS: { value: RiskLevelFilter; label: string }[] = [
  { value: "all",    label: "All Risk Levels" },
  { value: "high",   label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low" },
]


function getRouteTitle(pathname: string): string {
  if (pathname === "/queue") return "Title queue"
  if (pathname === "/admin/settings") return "Settings"
  if (pathname === "/admin/users") return "Manage users"
  if (pathname.startsWith("/title/")) return "Title detail"
  if (pathname === "/reports") return "Reports"
  return "Title queue"
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = getRouteTitle(pathname)
  const {
    status, riskLevel,
    setStatus, setRiskLevel,
    reset, hasFilters,
  } = useQueueToolbarFilters()

  const showQueueFilters = pathname === "/queue"

  return (
    <header
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/60 backdrop-blur-md"
      role="banner"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-sm font-medium whitespace-nowrap">{title}</h1>

        <div className="ml-auto flex items-end gap-1.5 flex-wrap justify-end">

          {showQueueFilters && (
            <>
              {/* Status */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide px-0.5">Status</span>
                <Select value={status} onValueChange={(v) => setStatus(v as QueueStatusFilter)}>
                  <SelectTrigger
                    className={`h-7 w-auto min-w-[130px] text-xs ${status !== "all" ? "border-primary/50 bg-primary/5" : "border-dashed"}`}
                    aria-label="Filter by title status"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Level */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide px-0.5">Risk</span>
                <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevelFilter)}>
                  <SelectTrigger
                    className={`h-7 w-auto min-w-[120px] text-xs ${riskLevel !== "all" ? "border-primary/50 bg-primary/5" : "border-dashed"}`}
                    aria-label="Filter by risk level"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RISK_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {hasFilters && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 mb-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Clear all filters"
            >
              <IconX className="size-3" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

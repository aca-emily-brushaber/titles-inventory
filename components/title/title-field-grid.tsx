"use client"

import type { TitleRow } from "@/lib/titles/types"
import { ASSIGNMENT_GROUP_LABELS } from "@/lib/titles/assignment-group-copy"
import { SectionHelp } from "@/components/section-help"

interface TitleFieldGridProps {
  title: TitleRow
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—"
  const d = s.slice(0, 10)
  return d || "—"
}

export function TitleFieldGrid({ title }: TitleFieldGridProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Auction", value: title.auction_name },
    { label: "VIN", value: title.vin },
    { label: "Account", value: title.account_number },
    { label: "Account status", value: title.account_status },
    { label: "Assignment status", value: title.assignment_status },
    { label: "Assignment group", value: ASSIGNMENT_GROUP_LABELS[title.assignment_group] },
    { label: "Client age (days)", value: title.client_age != null ? String(title.client_age) : "—" },
    { label: "Title received", value: fmtDate(title.title_received_date) },
    { label: "Title location", value: title.title_location ?? "—" },
    { label: "Title location date", value: fmtDate(title.title_location_date) },
    { label: "Title state", value: title.title_state || "—" },
    { label: "Recovery status", value: title.recovery_status },
    { label: "Repossessed", value: fmtDate(title.repossessed_date) },
    { label: "Due", value: fmtDate(title.due_date) },
  ]

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">Title details</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fields from RepoTitle TitleLocation report (regenerate seed after CSV changes).
          </p>
        </div>
        <SectionHelp label="About title details">
          <p>
            Use this grid to verify auction, assignment status, title location, and recovery codes before
            taking action.
          </p>
        </SectionHelp>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className="rounded-md border border-border bg-muted/20 px-3 py-2"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {r.label}
            </p>
            <p className="text-sm font-medium text-foreground mt-0.5 break-all">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

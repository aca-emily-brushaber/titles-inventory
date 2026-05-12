"use client"

import { cn } from "@/lib/utils"
import type { TitleRow } from "@/lib/titles/types"
import { ASSIGNMENT_GROUP_LABELS } from "@/lib/titles/assignment-group-copy"
import { deriveRepoQueue } from "@/lib/titles/repo-queues"
import { REPO_QUEUE_LABELS } from "@/lib/titles/repo-queue-copy"
import { ageDaysFromDate } from "@/lib/titles/age-days"
import { formatTransferWhen } from "@/lib/titles/title-timeline"
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
  const ageDays = ageDaysFromDate(title.repossessed_date)
  const fields: { label: string; value: string; mono?: boolean }[] = [
    { label: "Auction", value: title.auction_name },
    { label: "VIN", value: title.vin, mono: true },
    { label: "Account", value: title.account_number, mono: true },
    { label: "Account status", value: title.account_status },
    { label: "Assignment status", value: title.assignment_status },
    { label: "Assignment group", value: ASSIGNMENT_GROUP_LABELS[title.assignment_group] },
    { label: "Repo queue", value: REPO_QUEUE_LABELS[deriveRepoQueue(title)] },
    { label: "Client age (days)", value: title.client_age != null ? String(title.client_age) : "—" },
    { label: "Title received", value: fmtDate(title.title_received_date) },
    { label: "Title location", value: title.title_location ?? "—", mono: true },
    { label: "Title location date", value: fmtDate(title.title_location_date) },
    { label: "Title state", value: title.title_state || "—" },
    { label: "Recovery status", value: title.recovery_status, mono: true },
    { label: "Repossessed", value: fmtDate(title.repossessed_date) },
    { label: "Age (days)", value: ageDays != null ? String(ageDays) : "—" },
    { label: "Shipping label", value: title.shipping_label?.trim() || "—", mono: true },
    { label: "Shipping location", value: title.shipping_location?.trim() || "—" },
    {
      label: "Shipped recorded",
      value: title.shipped_at ? formatTransferWhen(title.shipped_at) : "—",
    },
  ]

  const pairs: { left: (typeof fields)[0]; right?: (typeof fields)[0] }[] = []
  for (let i = 0; i < fields.length; i += 2) {
    pairs.push({ left: fields[i], right: fields[i + 1] })
  }

  function valClass(mono?: boolean) {
    return cn("text-foreground min-w-0", mono ? "font-mono text-[11px]" : "text-xs")
  }

  return (
    <div className="glass-card rounded-lg overflow-hidden border border-border/80">
      <div className="px-3 py-2 border-b border-border flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground leading-tight">Title details</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
            RepoTitle TitleLocation report fields.
          </p>
        </div>
        <SectionHelp label="About title details">
          <p className="text-xs">
            Verify auction, assignment, title location, and recovery codes before taking action.
          </p>
        </SectionHelp>
      </div>

      {/* Mobile: single column, label + value on one line */}
      <ul className="sm:hidden divide-y divide-border/60 px-3 py-0.5">
        {fields.map((f) => (
          <li key={f.label} className="flex gap-2 py-1.5 text-[10px] leading-snug">
            <span className="uppercase tracking-wide text-muted-foreground shrink-0 w-[40%] max-w-[10rem]">
              {f.label}
            </span>
            <span className={cn(valClass(f.mono), "flex-1 min-w-0 break-words text-left")}>{f.value}</span>
          </li>
        ))}
      </ul>

      {/* sm+: two logical columns per row */}
      <div className="hidden sm:block px-2 py-0 sm:px-3 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <tbody>
            {pairs.map((pair, i) => (
              <tr key={pair.left.label + i} className="border-b border-border/60 last:border-b-0">
                <th
                  scope="row"
                  className="py-1.5 pr-2 align-top font-normal text-[10px] uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                >
                  {pair.left.label}
                </th>
                <td className={cn("py-1.5 pr-4 lg:pr-8 align-top break-all", valClass(pair.left.mono))}>
                  {pair.left.value}
                </td>
                {pair.right ? (
                  <>
                    <th
                      scope="row"
                      className="py-1.5 pr-2 align-top font-normal text-[10px] uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                    >
                      {pair.right.label}
                    </th>
                    <td className={cn("py-1.5 align-top break-all", valClass(pair.right.mono))}>
                      {pair.right.value}
                    </td>
                  </>
                ) : (
                  <td colSpan={2} className="py-1.5" />
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

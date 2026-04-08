"use client"

import { IconArrowsShuffle, IconHistory } from "@tabler/icons-react"

import type { TitleTransferRow } from "@/lib/titles/types"
import type { AssignmentGroup } from "@/lib/titles/assignment-groups"
import { ASSIGNMENT_GROUP_LABELS } from "@/lib/titles/assignment-group-copy"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

interface TitleHistoryPanelProps {
  titleOpenedAt: string
  transfers: TitleTransferRow[]
  currentGroup: AssignmentGroup
}

export function TitleHistoryPanel({
  titleOpenedAt,
  transfers,
  currentGroup,
}: TitleHistoryPanelProps) {
  const sorted = [...transfers].sort((a, b) => a.created_at.localeCompare(b.created_at))

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <IconHistory className="size-4 text-primary" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">History & transfers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assignment group movement and milestones for this title file.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center w-6 shrink-0">
            <span className="size-3 rounded-full border-2 bg-primary border-primary shrink-0 mt-1" />
            <div className="w-px flex-1 bg-border mt-1" />
          </div>
          <div className="flex-1 pb-2">
            <p className="text-xs font-semibold text-foreground">Title file opened</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(titleOpenedAt)}</p>
            <Badge variant="outline" className="mt-1.5 text-[10px]">
              Current group: {ASSIGNMENT_GROUP_LABELS[currentGroup]}
            </Badge>
          </div>
        </div>

        {sorted.map((t, i) => {
          const isLast = i === sorted.length - 1
          return (
            <div key={t.id} className="flex gap-3">
              <div className="flex flex-col items-center w-6 shrink-0">
                <span
                  className={cn(
                    "size-3 rounded-full border-2 shrink-0 mt-1",
                    "bg-muted border-border"
                  )}
                />
                {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className={cn("flex-1", !isLast && "pb-2")}>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <IconArrowsShuffle className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    {formatDate(t.created_at)}
                  </span>
                </div>
                <p className="text-xs text-foreground">
                  <span className="font-medium">{t.transferred_by}</span> moved from{" "}
                  <Badge variant="outline" className="text-[10px] mx-0.5">
                    {ASSIGNMENT_GROUP_LABELS[t.from_group as AssignmentGroup]}
                  </Badge>
                  {" → "}
                  <Badge variant="outline" className="text-[10px] mx-0.5">
                    {ASSIGNMENT_GROUP_LABELS[t.to_group as AssignmentGroup]}
                  </Badge>
                </p>
                {t.reason && (
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{t.reason}</p>
                )}
              </div>
            </div>
          )
        })}

        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No transfers recorded yet. Transfers will appear here when you move this file between
            assignment groups.
          </p>
        )}
      </div>
    </div>
  )
}

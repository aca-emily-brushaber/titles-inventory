"use client"

import {
  IconArrowsShuffle,
  IconCalendarEvent,
  IconCircleCheck,
  IconDatabase,
  IconHistory,
  IconLock,
  IconMailCheck,
  IconMapPin,
  IconTruck,
} from "@tabler/icons-react"

import type { TitleRow, TitleTransferRow } from "@/lib/titles/types"
import type { AssignmentGroup } from "@/lib/titles/assignment-groups"
import { ASSIGNMENT_GROUP_LABELS } from "@/lib/titles/assignment-group-copy"
import {
  buildTitleTimeline,
  formatReportDay,
  formatTransferWhen,
  type TimelineEvent,
} from "@/lib/titles/title-timeline"
import { Badge } from "@/components/ui/badge"
import { SectionHelp } from "@/components/section-help"
import { cn } from "@/lib/utils"

interface TitleHistoryPanelProps {
  title: TitleRow
  transfers: TitleTransferRow[]
}

function TimelineNode({
  variant,
  isLast,
}: {
  variant: "milestone" | "transfer" | "system"
  isLast: boolean
}) {
  return (
    <div className="flex flex-col items-center w-6 shrink-0">
      <span
        className={cn(
          "size-3 rounded-full border-2 shrink-0 mt-1",
          variant === "milestone" && "bg-primary border-primary",
          variant === "transfer" && "bg-muted border-border",
          variant === "system" && "bg-muted border-primary/40"
        )}
      />
      {!isLast && <div className="w-px flex-1 bg-border mt-1 min-h-[12px]" />}
    </div>
  )
}

function renderEventBody(ev: TimelineEvent) {
  switch (ev.kind) {
    case "repossessed":
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <IconCalendarEvent className="size-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground">Repossessed</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{formatReportDay(ev.date)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Vehicle repossessed (report date).</p>
        </>
      )
    case "title_location":
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <IconMapPin className="size-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground">Title at location</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{formatReportDay(ev.date)}</p>
          {ev.locationCode ? (
            <p className="text-[11px] text-foreground mt-1 font-mono">{ev.locationCode}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-1">Title recorded at location.</p>
          )}
        </>
      )
    case "title_received":
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <IconMailCheck className="size-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground">Title received</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{formatReportDay(ev.date)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Title document received (report date).</p>
        </>
      )
    case "record_loaded":
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <IconDatabase className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold text-foreground">Queue record created</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{formatTransferWhen(ev.at)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Title file loaded into this queue from the RepoTitle snapshot.
          </p>
        </>
      )
    case "transfer":
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <IconArrowsShuffle className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold text-foreground">{formatTransferWhen(ev.transfer.created_at)}</span>
          </div>
          <p className="text-xs text-foreground">
            <span className="font-medium">{ev.transfer.transferred_by}</span> moved from{" "}
            <Badge variant="outline" className="text-[10px] mx-0.5">
              {ASSIGNMENT_GROUP_LABELS[ev.transfer.from_group as AssignmentGroup]}
            </Badge>
            {" → "}
            <Badge variant="outline" className="text-[10px] mx-0.5">
              {ASSIGNMENT_GROUP_LABELS[ev.transfer.to_group as AssignmentGroup]}
            </Badge>
          </p>
          {ev.transfer.reason ? (
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{ev.transfer.reason}</p>
          ) : null}
        </>
      )
    case "title_shipped":
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <IconTruck className="size-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground">Title shipped</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{formatTransferWhen(ev.at)}</p>
          <div className="text-[11px] text-foreground mt-1 space-y-0.5">
            {ev.shipping_label ? (
              <p>
                <span className="text-muted-foreground">Label / tracking: </span>
                <span className="font-mono">{ev.shipping_label}</span>
              </p>
            ) : null}
            {ev.shipping_location ? (
              <p>
                <span className="text-muted-foreground">Location: </span>
                {ev.shipping_location}
              </p>
            ) : null}
            {!ev.shipping_label && !ev.shipping_location ? (
              <p className="text-muted-foreground">Physical title marked shipped.</p>
            ) : null}
          </div>
        </>
      )
    case "locked":
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <IconLock className="size-3.5 text-destructive shrink-0" />
            <span className="text-xs font-semibold text-foreground">File locked</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{formatTransferWhen(ev.at)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Locked by {ev.lockedBy}.</p>
        </>
      )
    case "completed":
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <IconCircleCheck className="size-3.5 text-status-green shrink-0" />
            <span className="text-xs font-semibold text-foreground">Completed</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{formatTransferWhen(ev.at)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Account / file marked completed.</p>
        </>
      )
  }
}

function eventVariant(ev: TimelineEvent): "milestone" | "transfer" | "system" {
  if (ev.kind === "transfer") return "transfer"
  if (ev.kind === "record_loaded" || ev.kind === "locked" || ev.kind === "completed") return "system"
  if (ev.kind === "title_shipped") return "milestone"
  return "milestone"
}

export function TitleHistoryPanel({ title, transfers }: TitleHistoryPanelProps) {
  const events = buildTitleTimeline(title, transfers)

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-start gap-2">
        <IconHistory className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-foreground">History & transfers</h2>
              <Badge variant="outline" className="text-[10px] font-normal">
                Current: {ASSIGNMENT_GROUP_LABELS[title.assignment_group]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              RepoTitle milestones, queue record creation, every assignment-group move (transfer), title shipped
              (tracking / location), locks, and completion — newest events at the bottom.
            </p>
          </div>
          <SectionHelp label="What else can feed this timeline?">
            <p className="text-xs leading-relaxed">
              <strong>On the title row:</strong> assignment status and recovery status (text only), analyst{" "}
              <code className="text-[10px]">assigned_to</code>, Daily Pull bucket, VIN and auction. Assignment moves
              appear here when recorded as transfers (including via{" "}
              <code className="text-[10px]">updateAssignmentGroup</code> in the mock provider).{" "}
              <strong>Elsewhere on this page:</strong> comments with timestamps (see below), document activity in
              Title verification, and future integrations (e.g. EOSCAR, OnBase) can append dated events when
              wired.
            </p>
          </SectionHelp>
        </div>
      </div>

      <div className="p-4 space-y-0">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No timeline events available for this file.</p>
        ) : (
          events.map((ev, i) => {
            const isLast = i === events.length - 1
            return (
              <div key={ev.id} className="flex gap-3">
                <TimelineNode variant={eventVariant(ev)} isLast={isLast} />
                <div className={cn("flex-1 min-w-0", !isLast && "pb-4")}>{renderEventBody(ev)}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconLock,
  IconCalendar,
  IconIdBadge2,
  IconClock,
  IconCircleCheck,
  IconMapPin,
} from "@tabler/icons-react"

import type { TitleRow } from "@/lib/titles/types"
import type { TitleTransferRow } from "@/lib/titles/types"
import type { TitleCommentRow } from "@/lib/titles/types"
import type { Database } from "@/lib/database.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TitleTextractPanel } from "@/components/title/title-textract-panel"
import { TitleWorkflowRail } from "@/components/title/title-workflow-rail"
import { TitleHistoryPanel } from "@/components/title/title-history-panel"
import { TitleFieldGrid } from "@/components/title/title-field-grid"
import { TitleShippingEditor } from "@/components/title/title-shipping-editor"
import { TitleComments } from "@/components/title/title-comments"
import { TitleActions } from "@/components/title/title-actions"
import { cn } from "@/lib/utils"
import { ageDaysFromDate } from "@/lib/titles/age-days"
import { getTitleById, getTitleTransfers } from "@/lib/services/title.service"

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"]

const STATUS_BADGE_CLASSES: Record<string, string> = {
  Pending: "bg-primary/10 text-primary border border-primary/20",
  "In Progress":
    "bg-status-amber/10 text-status-amber border border-status-amber/20",
  Completed:
    "bg-status-green/10 text-status-green border border-status-green/20",
  Hold: "bg-status-red/10 text-status-red border border-status-red/20",
}

function MetaChip({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn("font-semibold text-foreground", valueClass)}>{value}</span>
    </div>
  )
}

interface TitleDetailClientProps {
  title: TitleRow
  transfers: TitleTransferRow[]
  comments: TitleCommentRow[]
  documents: DocumentRow[]
}

export function TitleDetailClient({
  title,
  transfers,
  comments,
  documents,
}: TitleDetailClientProps) {
  const isCompleted = title.status === "Completed"
  const ageDays = ageDaysFromDate(title.repossessed_date)

  const [shippingLabel, setShippingLabel] = useState<string | null>(title.shipping_label)
  const [shippingLocation, setShippingLocation] = useState<string | null>(title.shipping_location)
  const [shippedAt, setShippedAt] = useState<string | null>(title.shipped_at)
  const [liveTransfers, setLiveTransfers] = useState<TitleTransferRow[]>(transfers)

  const titleLive: TitleRow = {
    ...title,
    shipping_label: shippingLabel,
    shipping_location: shippingLocation,
    shipped_at: shippedAt,
  }

  useEffect(() => {
    setShippingLabel(title.shipping_label)
    setShippingLocation(title.shipping_location)
    setShippedAt(title.shipped_at)
  }, [title.id, title.shipping_label, title.shipping_location, title.shipped_at])

  useEffect(() => {
    setLiveTransfers(transfers)
  }, [title.id, transfers])

  const refreshTitleAndTransfers = useCallback(async () => {
    const [fresh, tr] = await Promise.all([getTitleById(title.id), getTitleTransfers(title.id)])
    if (fresh) {
      setShippingLabel(fresh.shipping_label)
      setShippingLocation(fresh.shipping_location)
      setShippedAt(fresh.shipped_at)
    }
    setLiveTransfers(tr)
  }, [title.id])

  useEffect(() => {
    const sidebarInset = document.querySelector("[data-slot='sidebar-inset']") as HTMLElement | null
    if (!sidebarInset) return
    const prev = sidebarInset.style.overflowY
    sidebarInset.style.overflowY = "hidden"
    return () => {
      sidebarInset.style.overflowY = prev
    }
  }, [])

  const completedBanner = isCompleted ? (
    <div className="rounded-lg border border-status-green/30 bg-status-green/5 px-4 py-3 flex items-start gap-3">
      <IconCircleCheck className="size-5 text-status-green mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-foreground">Title file completed</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          This file was completed on{" "}
          {new Date(title.updated_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          . Data is read-only for audit purposes.
        </p>
      </div>
    </div>
  ) : null

  const headerContent = (
    <header className="bg-background/60 backdrop-blur-md border-b border-border px-4 lg:px-8 pt-4 pb-3 shrink-0">
      <div className="flex items-start gap-3 max-w-[1600px] mx-auto">
        <Button variant="ghost" size="icon" className="size-8 mt-0.5 shrink-0" asChild>
          <Link href={`/queue?queue=${titleLive.assignment_group}`} aria-label="Back to queue">
            <IconArrowLeft className="size-4" />
          </Link>
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h1 className="text-base font-bold text-foreground tracking-tight break-words min-w-0">
              <span className="font-mono tabular-nums">{title.account_number}</span>
              <span className="text-muted-foreground font-bold">: </span>
              <span className="font-bold">{title.assignment_status}</span>
            </h1>
            <Badge
              className={cn(
                "text-[11px] font-semibold px-2.5 py-0.5 border shrink-0",
                STATUS_BADGE_CLASSES[title.status] ?? ""
              )}
            >
              {title.status}
            </Badge>
            {title.locked_by && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-status-red">
                <IconLock className="size-3.5" />
                Locked by {title.locked_by}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2.5 font-medium truncate" title={title.auction_name}>
            {title.auction_name}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <MetaChip icon={IconIdBadge2} label="VIN" value={title.vin} />
            <Separator orientation="vertical" className="h-3.5 hidden sm:block" />
            <MetaChip icon={IconMapPin} label="Title location" value={title.title_location ?? "—"} />
            <Separator orientation="vertical" className="h-3.5 hidden sm:block" />
            <MetaChip
              icon={IconCalendar}
              label="Repossessed"
              value={
                title.repossessed_date
                  ? new Date(title.repossessed_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
              valueClass={title.repossessed_date ? "text-status-red" : undefined}
            />
            <Separator orientation="vertical" className="h-3.5 hidden sm:block" />
            <MetaChip
              icon={IconClock}
              label="Age (days)"
              value={ageDays != null ? String(ageDays) : "—"}
            />
            <Separator orientation="vertical" className="h-3.5 hidden sm:block" />
            <MetaChip icon={IconIdBadge2} label="State" value={title.title_state || "—"} />
          </div>
        </div>
      </div>
    </header>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {headerContent}

      <div className="lg:hidden px-4 py-2 border-b border-border shrink-0">
        <TitleWorkflowRail variant="mobile" />
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="hidden lg:flex shrink-0 w-[296px] border-r border-border py-4 pl-4 pr-2 overflow-hidden">
          <TitleWorkflowRail variant="desktop" />
        </div>

        <div id="title-scroll-panel" className="flex-1 min-w-0 overflow-y-auto">
          <div className="flex flex-col gap-6 px-4 lg:px-8 py-6 max-w-[1200px]">
            {completedBanner}

            <div id="title-timeline">
              <TitleHistoryPanel title={titleLive} transfers={liveTransfers} />
            </div>

            <div id="title-fields">
              <TitleFieldGrid title={titleLive} />
            </div>

            {!isCompleted && (
              <div id="title-shipping">
                <TitleShippingEditor
                  key={title.id}
                  titleId={title.id}
                  initialLabel={shippingLabel}
                  initialLocation={shippingLocation}
                  onSaved={refreshTitleAndTransfers}
                />
              </div>
            )}

            <div id="title-documents">
              <TitleTextractPanel title={titleLive} documents={documents} />
            </div>

            <div id="title-actions">
              {isCompleted ? (
                <div className="glass-card rounded-lg overflow-hidden px-4 py-3 text-xs text-muted-foreground">
                  Actions are not available on completed files.
                </div>
              ) : (
                <TitleActions title={titleLive} />
              )}
            </div>

            <div id="title-comments">
              <TitleComments
                comments={comments}
                titleId={title.id}
                readOnly={isCompleted}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

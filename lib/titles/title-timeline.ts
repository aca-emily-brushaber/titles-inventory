/**
 * Unified title file timeline: RepoTitle milestone dates + queue transfers + system events.
 *
 * Available sources on {@link TitleRow}:
 * - `repossessed_date`, `title_location_date`, `title_received_date` (report)
 * - `created_at` (record loaded), `updated_at` (use when status is Completed)
 * - `locked_at` + `locked_by` (optional lock event)
 * - `assignment_status` / `recovery_status` — text context only (no separate dates)
 * - `shipped_at` with `shipping_label` / `shipping_location` — physical title shipped (UI)
 *
 * {@link TitleTransferRow} adds assignment-group moves with `created_at`.
 * Comments (`TitleCommentRow.timestamp`) can be layered in the UI separately if needed.
 */

import type { TitleRow, TitleTransferRow } from "./types"

export type TimelineEvent =
  | {
      kind: "repossessed"
      id: string
      sortTs: number
      tie: number
      date: string
    }
  | {
      kind: "title_location"
      id: string
      sortTs: number
      tie: number
      date: string
      locationCode: string | null
    }
  | {
      kind: "title_received"
      id: string
      sortTs: number
      tie: number
      date: string
    }
  | {
      kind: "record_loaded"
      id: string
      sortTs: number
      tie: number
      at: string
    }
  | {
      kind: "transfer"
      id: string
      sortTs: number
      tie: number
      transfer: TitleTransferRow
    }
  | {
      kind: "title_shipped"
      id: string
      sortTs: number
      tie: number
      at: string
      shipping_label: string | null
      shipping_location: string | null
    }
  | {
      kind: "locked"
      id: string
      sortTs: number
      tie: number
      at: string
      lockedBy: string
    }
  | {
      kind: "completed"
      id: string
      sortTs: number
      tie: number
      at: string
    }

const TIE = {
  repossessed: 10,
  title_location: 20,
  title_received: 30,
  record_loaded: 40,
  transfer: 50,
  title_shipped: 55,
  locked: 60,
  completed: 70,
} as const

/** YYYY-MM-DD or ISO string → sortable UTC timestamp (noon for date-only). */
export function sortTsFromReportDate(value: string | null | undefined): number | null {
  if (!value) return null
  const day = value.slice(0, 10)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  return Date.UTC(y, mo - 1, d, 12, 0, 0)
}

function sortTsFromIso(iso: string): number {
  const t = new Date(iso).getTime()
  return Number.isFinite(t) ? t : 0
}

/**
 * Builds a single chronological list of milestone + transfer + system events.
 */
export function buildTitleTimeline(title: TitleRow, transfers: TitleTransferRow[]): TimelineEvent[] {
  const out: TimelineEvent[] = []

  const repoTs = sortTsFromReportDate(title.repossessed_date)
  if (title.repossessed_date && repoTs != null) {
    out.push({
      kind: "repossessed",
      id: "m-repo",
      sortTs: repoTs,
      tie: TIE.repossessed,
      date: title.repossessed_date.slice(0, 10),
    })
  }

  const locTs = sortTsFromReportDate(title.title_location_date)
  if (title.title_location_date && locTs != null) {
    out.push({
      kind: "title_location",
      id: "m-loc",
      sortTs: locTs,
      tie: TIE.title_location,
      date: title.title_location_date.slice(0, 10),
      locationCode: title.title_location,
    })
  }

  const recTs = sortTsFromReportDate(title.title_received_date)
  if (title.title_received_date && recTs != null) {
    out.push({
      kind: "title_received",
      id: "m-received",
      sortTs: recTs,
      tie: TIE.title_received,
      date: title.title_received_date.slice(0, 10),
    })
  }

  out.push({
    kind: "record_loaded",
    id: "sys-record",
    sortTs: sortTsFromIso(title.created_at),
    tie: TIE.record_loaded,
    at: title.created_at,
  })

  for (const tr of [...transfers].sort((a, b) => {
    const c = a.created_at.localeCompare(b.created_at)
    return c !== 0 ? c : a.id.localeCompare(b.id)
  })) {
    out.push({
      kind: "transfer",
      id: `tr-${tr.id}`,
      sortTs: sortTsFromIso(tr.created_at),
      tie: TIE.transfer,
      transfer: tr,
    })
  }

  if (title.shipped_at) {
    out.push({
      kind: "title_shipped",
      id: "sys-shipped",
      sortTs: sortTsFromIso(title.shipped_at),
      tie: TIE.title_shipped,
      at: title.shipped_at,
      shipping_label: title.shipping_label,
      shipping_location: title.shipping_location,
    })
  }

  if (title.locked_at && title.locked_by) {
    out.push({
      kind: "locked",
      id: "sys-locked",
      sortTs: sortTsFromIso(title.locked_at),
      tie: TIE.locked,
      at: title.locked_at,
      lockedBy: title.locked_by,
    })
  }

  if (title.status === "Completed") {
    out.push({
      kind: "completed",
      id: "sys-completed",
      sortTs: sortTsFromIso(title.updated_at),
      tie: TIE.completed,
      at: title.updated_at,
    })
  }

  out.sort((a, b) => {
    if (a.sortTs !== b.sortTs) return a.sortTs - b.sortTs
    if (a.tie !== b.tie) return a.tie - b.tie
    return a.id.localeCompare(b.id)
  })

  return out
}

export function formatReportDay(dateYmd: string): string {
  const d = new Date(dateYmd + "T12:00:00.000Z")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function formatTransferWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

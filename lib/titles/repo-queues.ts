/**
 * Repossessions "repo queues" — action vs hold buckets derived from existing {@link TitleRow}
 * fields only (no persisted queue id). See `documentation/EXCEL_COLUMN_MAPPING.md` for the table.
 *
 * Precedence (first match wins):
 * 1. Hold — file-level status on hold
 * 2. NotReceived — no title received date yet (and not completed)
 * 3. Manheim — auction name indicates Manheim (before flip buckets so auction is authoritative)
 * 4. PAR — Daily Pull bucket repo_flip_par
 * 5. FL — Daily Pull bucket repo_flip_fl
 * 6. MO — title_state is MO (Missouri)
 * 7. Other — Greer DMV, affidavit-only, reinstated buckets, null daily_pull, etc.
 */

import type { TitleRow } from "./types"

export const REPO_ACTION_QUEUE_IDS = ["FL", "MO", "PAR", "Manheim"] as const
export const REPO_HOLD_QUEUE_IDS = ["Hold", "NotReceived"] as const
export const REPO_QUEUE_IDS = [
  ...REPO_ACTION_QUEUE_IDS,
  ...REPO_HOLD_QUEUE_IDS,
  "Other",
] as const

export type RepoActionQueueId = (typeof REPO_ACTION_QUEUE_IDS)[number]
export type RepoHoldQueueId = (typeof REPO_HOLD_QUEUE_IDS)[number]
export type RepoQueueId = (typeof REPO_QUEUE_IDS)[number]

export type RepoQueueCategory = "action" | "hold"

export function repoQueueCategory(id: RepoQueueId): RepoQueueCategory {
  if (id === "Hold" || id === "NotReceived") return "hold"
  return "action"
}

function auctionMatchesManheim(auctionName: string): boolean {
  return auctionName.toLowerCase().includes("manheim")
}

/**
 * Which repossessions queue tab this title belongs to (derived).
 */
export function deriveRepoQueue(title: TitleRow): RepoQueueId {
  if (title.status === "Hold") return "Hold"

  if (title.status !== "Completed" && title.title_received_date == null) {
    return "NotReceived"
  }

  if (auctionMatchesManheim(title.auction_name)) return "Manheim"

  if (title.daily_pull_bucket === "repo_flip_par") return "PAR"
  if (title.daily_pull_bucket === "repo_flip_fl") return "FL"

  const st = title.title_state?.trim().toUpperCase()
  if (st === "MO") return "MO"

  return "Other"
}

/**
 * Human-readable hold context from RepoTitle strings until a dedicated hold-reason column exists.
 */
export function deriveHoldReasonDisplay(title: TitleRow): string {
  const r = title.recovery_status?.trim()
  const a = title.assignment_status?.trim()
  if (r && a && r !== a) return `${r} · ${a}`
  return r || a || "—"
}

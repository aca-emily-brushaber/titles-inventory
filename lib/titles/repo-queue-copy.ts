import type { RepoQueueId } from "./repo-queues"

export const REPO_QUEUE_LABELS: Record<RepoQueueId, string> = {
  FL: "FL",
  MO: "MO",
  PAR: "PAR",
  Manheim: "Manheim",
  Hold: "Hold",
  NotReceived: "Not received",
  Other: "Other",
}

/** Short tips for queue tabs (mapping summary points to EXCEL_COLUMN_MAPPING). */
export const REPO_QUEUE_TIPS: Record<RepoQueueId, string> = {
  FL: "Daily Pull bucket: Repo Flip — FL (repo_flip_fl).",
  MO: "Title state MO (Missouri).",
  PAR: "Daily Pull bucket: Repo Flip — PAR (repo_flip_par).",
  Manheim: "Auction name contains “Manheim” (checked before flip buckets).",
  Hold: "File status Hold. Reason column uses recovery / assignment status text until a dedicated field exists.",
  NotReceived: "No title received date yet and not completed (excludes Hold).",
  Other: "Does not match action or hold rules above (e.g. Greer DMV, affidavit-only, reinstated sheets, no Daily Pull match).",
}

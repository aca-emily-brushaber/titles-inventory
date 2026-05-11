/**
 * Title inventory domain types (RepoTitle TitleLocation report + UI fields).
 */

import type { AssignmentGroup } from "./assignment-groups"
import type { DailyPullFilterId } from "./daily-pull-filters"

export type TitleStatus = "Pending" | "In Progress" | "Hold" | "Completed"

export interface TitleRow {
  id: string
  vin: string
  account_number: string
  auction_name: string
  account_status: string
  assignment_status: string
  assignment_group: AssignmentGroup
  client_age: number | null
  title_received_date: string | null
  title_location: string | null
  title_location_date: string | null
  title_state: string
  recovery_status: string
  repossessed_date: string | null
  assigned_to: string | null
  locked_by: string | null
  locked_at: string | null
  created_at: string
  updated_at: string
  status: TitleStatus
  /** Titles Daily Pull Report bucket (`data/Titles Daily Pull Report.xlsx`); null if account not on any sheet */
  daily_pull_bucket: DailyPullFilterId | null
  /** Carrier label / tracking number when the physical title was shipped out; UI-managed until backend mapping exists */
  shipping_label: string | null
  /** Where the title was shipped from / to (e.g. hub, branch, or carrier facility) */
  shipping_location: string | null
  /** First moment shipping details were recorded (label or location); cleared when both are cleared */
  shipped_at: string | null
}

export interface TitleTransferRow {
  id: string
  title_id: string
  from_group: AssignmentGroup
  to_group: AssignmentGroup
  transferred_by: string
  reason: string
  created_at: string
}

export interface TitleCommentRow {
  id: string
  title_id: string
  author: string
  text: string
  timestamp: string
}

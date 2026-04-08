/**
 * Title inventory domain types (RepoTitle TitleLocation report + UI fields).
 */

import type { AssignmentGroup } from "./assignment-groups"

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
  due_date: string
  created_at: string
  updated_at: string
  status: TitleStatus
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

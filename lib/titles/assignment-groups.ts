/**
 * Buckets RepoTitle `assignment_status` values for tabs and transfers.
 * Run `scripts/scan-assignment-status.mjs` after CSV changes to verify coverage.
 */

export const ASSIGNMENT_GROUPS = [
  "ClearedForSale",
  "OnBlock",
  "AwaitingClearance",
  "InTransit",
  "Pickup",
] as const

export type AssignmentGroup = (typeof ASSIGNMENT_GROUPS)[number]

/** One canonical assignment_status string per group (used after bulk transfer). */
export const DEFAULT_ASSIGNMENT_STATUS: Record<AssignmentGroup, string> = {
  ClearedForSale: "Cleared for Sale",
  OnBlock: "On Block",
  AwaitingClearance: "Awaiting Clearance /Inspected",
  InTransit: "In Transit / Released For Pickup",
  Pickup: "Assigned for Pickup",
}

export function getAssignmentGroup(assignmentStatus: string): AssignmentGroup {
  const s = assignmentStatus.trim()
  if (s === "Cleared for Sale") return "ClearedForSale"
  if (s === "On Block") return "OnBlock"
  if (s.startsWith("Awaiting Clearance")) return "AwaitingClearance"
  if (s.startsWith("In Transit")) return "InTransit"
  if (s === "Assigned for Pickup" || s === "Pickup Accepted") return "Pickup"
  return "AwaitingClearance"
}

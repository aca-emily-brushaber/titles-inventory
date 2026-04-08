import type { AssignmentGroup } from "./assignment-groups"

export const ASSIGNMENT_GROUP_LABELS: Record<AssignmentGroup, string> = {
  ClearedForSale: "Cleared for sale",
  OnBlock: "On block",
  AwaitingClearance: "Awaiting clearance",
  InTransit: "In transit",
  Pickup: "Pickup",
}

export const ASSIGNMENT_GROUP_TIPS: Record<AssignmentGroup, string> = {
  ClearedForSale: "Title cleared and ready for sale workflow",
  OnBlock: "Vehicle on auction block",
  AwaitingClearance: "Awaiting clearance (inspected, repaired, or secured)",
  InTransit: "Title in transit or released for pickup",
  Pickup: "Assigned for pickup or pickup accepted",
}

/**
 * Outbound queue buckets (separate from Repossessions assignment groups).
 * Data wiring comes later; UI tabs are stable identifiers.
 */

export const OUTBOUND_QUEUE_IDS = [
  "All",
  "OutOfStateTransfer",
  "NameChange",
  "Buyback",
  "Settlement",
] as const

export type OutboundQueueId = (typeof OUTBOUND_QUEUE_IDS)[number]

export const OUTBOUND_QUEUE_LABELS: Record<OutboundQueueId, string> = {
  All: "All",
  OutOfStateTransfer: "Out of State Transfer",
  NameChange: "Name Change",
  Buyback: "Buyback",
  Settlement: "Settlement",
}

export const OUTBOUND_QUEUE_TIPS: Record<OutboundQueueId, string> = {
  All: "All outbound accounts (placeholder)",
  OutOfStateTransfer: "Out of state title transfer queue",
  NameChange: "Name change queue",
  Buyback: "Buyback queue",
  Settlement: "Settlement queue",
}

/** URL slug → id (for ?outbound=) */
const SLUG_TO_ID: Record<string, OutboundQueueId> = {
  all: "All",
  oos: "OutOfStateTransfer",
  name: "NameChange",
  buyback: "Buyback",
  settlement: "Settlement",
}

const ID_TO_SLUG: Record<OutboundQueueId, string> = {
  All: "all",
  OutOfStateTransfer: "oos",
  NameChange: "name",
  Buyback: "buyback",
  Settlement: "settlement",
}

export function outboundQueueIdFromSlug(slug: string | null): OutboundQueueId {
  if (!slug) return "All"
  return SLUG_TO_ID[slug] ?? "All"
}

export function slugFromOutboundQueueId(id: OutboundQueueId): string {
  return ID_TO_SLUG[id]
}

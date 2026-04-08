"use client"

interface RealtimeSubscriptionOptions {
  table: string
  schema?: string
  event?: "INSERT" | "UPDATE" | "DELETE" | "*"
  filter?: string
  onInsert?: (payload: Record<string, unknown>) => void
  onUpdate?: (payload: Record<string, unknown>) => void
  onDelete?: (payload: Record<string, unknown>) => void
  enabled?: boolean
}

export function useRealtimeSubscription(_options: RealtimeSubscriptionOptions) {
  return { current: null }
}

"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"

export type QueueStatusFilter =
  | "all"
  | "new"
  | "in-review"
  | "requires-investigation"
  | "completed"

export type RiskLevelFilter = "all" | "high" | "medium" | "low"

export type TimePeriodFilter = "today" | "week" | "month" | "all"

interface QueueToolbarFilterContextValue {
  status: QueueStatusFilter
  setStatus: (v: QueueStatusFilter) => void
  riskLevel: RiskLevelFilter
  setRiskLevel: (v: RiskLevelFilter) => void
  period: TimePeriodFilter
  setPeriod: (v: TimePeriodFilter) => void
  reset: () => void
  hasFilters: boolean
}

const QueueToolbarFilterContext = createContext<QueueToolbarFilterContextValue | null>(null)

export function QueueToolbarFilterProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<QueueStatusFilter>("all")
  const [riskLevel, setRiskLevel] = useState<RiskLevelFilter>("all")
  const [period, setPeriod] = useState<TimePeriodFilter>("all")

  const hasFilters = useMemo(
    () => status !== "all" || riskLevel !== "all" || period !== "all",
    [status, riskLevel, period]
  )

  const reset = useCallback(() => {
    setStatus("all")
    setRiskLevel("all")
    setPeriod("all")
  }, [])

  return (
    <QueueToolbarFilterContext.Provider
      value={{ status, setStatus, riskLevel, setRiskLevel, period, setPeriod, reset, hasFilters }}
    >
      {children}
    </QueueToolbarFilterContext.Provider>
  )
}

export function useQueueToolbarFilters() {
  const ctx = useContext(QueueToolbarFilterContext)
  if (!ctx) throw new Error("useQueueToolbarFilters must be used within QueueToolbarFilterProvider")
  return ctx
}

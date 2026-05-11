/**
 * Calendar days from a date (YYYY-MM-DD from report fields) to today, using UTC date boundaries.
 */
export function ageDaysFromDate(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null
  const t = isoDate.slice(0, 10)
  const parts = t.split("-").map(Number)
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null
  const [y, m, d] = parts
  const start = Date.UTC(y, m - 1, d)
  const now = new Date()
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.floor((end - start) / 86400000)
}

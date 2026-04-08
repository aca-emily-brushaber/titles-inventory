"use client"

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

interface PaginationBarProps {
  page: number
  pageSize: number
  total: number
  onPage: (p: number) => void
  pageSizeOptions?: number[]
  onPageSize?: (n: number) => void
}

export function PaginationBar({
  page,
  pageSize,
  total,
  onPage,
  pageSizeOptions = [10, 25, 50],
  onPageSize,
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const pages = buildPageList(page, totalPages)

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-2 text-xs text-muted-foreground">
      <span className="tabular-nums shrink-0">
        {total === 0 ? "0 results" : `${from}–${to} of ${total}`}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <IconChevronLeft className="size-3.5" aria-hidden="true" />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`inline-flex size-7 items-center justify-center rounded-md tabular-nums transition-colors ${
                p === page
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-secondary"
              }`}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <IconChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      {onPageSize && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(e) => { onPageSize(Number(e.target.value)); onPage(1) }}
            className="h-6 rounded border border-border bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "…")[] = []
  pages.push(1)
  if (current > 3) pages.push("…")
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push("…")
  pages.push(total)
  return pages
}

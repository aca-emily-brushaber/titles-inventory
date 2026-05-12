"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { IconArrowUp, IconArrowDown, IconArrowsUpDown, IconChevronLeft, IconChevronRight, IconSearch, IconX } from "@tabler/icons-react"
import { toast } from "sonner"

import { getDocumentBatch, listDocumentBatches } from "@/lib/services/document-batch.service"
import type { DocumentBatchRow } from "@/lib/titles/batch-types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type BatchListRow = DocumentBatchRow & { item_count: number }

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <IconArrowUp className="size-3.5" />
  if (isSorted === "desc") return <IconArrowDown className="size-3.5" />
  return <IconArrowsUpDown className="size-3.5 text-muted-foreground/50" />
}

export default function DocumentBatchesPage() {
  const router = useRouter()
  const [rows, setRows] = useState<BatchListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const batches = await listDocumentBatches()
      const withCounts = await Promise.all(
        batches.map(async (b) => {
          const detail = await getDocumentBatch(b.id)
          return { ...b, item_count: detail?.items.length ?? 0 }
        })
      )
      setRows(withCounts)
    } catch {
      toast.error("Failed to load document batches")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return rows
    const q = searchQuery.trim().toLowerCase()
    return rows.filter(
      (b) =>
        b.external_batch_id.toLowerCase().includes(q) ||
        (b.name ?? "").toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
    )
  }, [rows, searchQuery])

  const columns = useMemo<ColumnDef<BatchListRow>[]>(
    () => [
      {
        accessorKey: "external_batch_id",
        header: "Batch ID",
        cell: ({ row }) => (
          <Link
            href={`/batches/${row.original.id}`}
            className="font-semibold text-primary hover:underline"
          >
            {row.original.external_batch_id}
          </Link>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="max-w-[220px] truncate text-sm text-muted-foreground" title={row.original.name ?? ""}>
            {row.original.name ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "item_count",
        header: "Titles",
        cell: ({ row }) => <span className="tabular-nums">{row.original.item_count}</span>,
        size: 80,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  return (
    <div className="py-6 px-4 lg:px-6 flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Document batches</h1>
        <p className="text-muted-foreground text-sm">
          Physical scan batches linked to title files. Open a batch to preview scan order, then work the queue in
          order with your documents.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by batch ID or name…"
            className="pl-9 pr-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {h.isPlaceholder ? null : h.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <SortIcon isSorted={h.column.getIsSorted()} />
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No batches match your search.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/batches/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import { IconArrowLeft, IconListNumbers } from "@tabler/icons-react"
import { toast } from "sonner"

import { getDocumentBatch, getDocumentBatchWorkItemsOrdered } from "@/lib/services/document-batch.service"
import type { DocumentBatchWorkItem } from "@/lib/titles/batch-types"
import { deriveRepoQueue } from "@/lib/titles/repo-queues"
import { REPO_QUEUE_LABELS } from "@/lib/titles/repo-queue-copy"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DocumentBatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = typeof params.batchId === "string" ? params.batchId : ""

  const [externalId, setExternalId] = useState("")
  const [batchName, setBatchName] = useState<string | null>(null)
  const [workItems, setWorkItems] = useState<DocumentBatchWorkItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!batchId) return
    setLoading(true)
    try {
      const [detail, ordered] = await Promise.all([
        getDocumentBatch(batchId),
        getDocumentBatchWorkItemsOrdered(batchId),
      ])
      if (!detail) {
        toast.error("Batch not found")
        router.push("/batches")
        return
      }
      setExternalId(detail.batch.external_batch_id)
      setBatchName(detail.batch.name ?? null)
      setWorkItems(ordered)
    } catch {
      toast.error("Failed to load batch")
    } finally {
      setLoading(false)
    }
  }, [batchId, router])

  useEffect(() => {
    load()
  }, [load])

  const workQueueHref = `/queue?system=batch&batch=${encodeURIComponent(batchId)}`

  const columns = useMemo<ColumnDef<DocumentBatchWorkItem>[]>(
    () => [
      {
        id: "sequence",
        accessorKey: "sequence",
        header: "#",
        cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.sequence}</span>,
        size: 48,
      },
      {
        id: "account",
        header: "Account",
        cell: ({ row }) =>
          row.original.title ? (
            <Link href={`/title/${row.original.title.id}`} className="font-semibold text-primary hover:underline">
              {row.original.title.account_number}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "vin",
        header: "VIN",
        cell: ({ row }) =>
          row.original.title ? (
            <span className="font-mono text-[11px]">{row.original.title.vin}</span>
          ) : (
            <span className="font-mono text-[11px] text-muted-foreground">{row.original.title_id}</span>
          ),
      },
      {
        id: "repo_queue",
        header: "Repo queue",
        cell: ({ row }) =>
          row.original.title ? (
            <Badge variant="secondary" className="text-xs">
              {REPO_QUEUE_LABELS[deriveRepoQueue(row.original.title)]}
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Not in inventory
            </Badge>
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.title ? (
            <span className="text-sm">{row.original.title.status}</span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: workItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="py-6 px-4 lg:px-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-1 text-muted-foreground" asChild>
            <Link href="/batches">
              <IconArrowLeft className="size-4" />
              All batches
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">{externalId || "Batch"}</h1>
          {batchName && <p className="text-muted-foreground text-sm">{batchName}</p>}
          <p className="text-muted-foreground text-sm">
            {workItems.length} slot{workItems.length === 1 ? "" : "s"} in scan order
            {workItems.some((w) => !w.title) && (
              <span className="text-destructive"> — includes missing title file(s)</span>
            )}
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href={workQueueHref}>
            <IconListNumbers className="size-4" />
            Work this batch
          </Link>
        </Button>
      </div>

      <div className="rounded-md border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
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
            ) : workItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No items in this batch.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={`${row.original.sequence}-${row.original.title_id}`}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

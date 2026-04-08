"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
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
import {
  IconLock,
  IconLockOpen,
  IconArrowUp,
  IconArrowDown,
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { getTitles, unlockTitle } from "@/lib/services/title.service"
import { getCurrentUser } from "@/lib/services/user.service"
import type { TitleRow } from "@/lib/titles/types"
import { ASSIGNMENT_GROUP_LABELS } from "@/lib/titles/assignment-group-copy"
import type { AuthUser } from "@/lib/data-provider"

import { Badge } from "@/components/ui/badge"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <IconArrowUp className="size-3.5" />
  if (isSorted === "desc") return <IconArrowDown className="size-3.5" />
  return <IconArrowsUpDown className="size-3.5 text-muted-foreground/50" />
}

export default function LockedTitlesPage() {
  const router = useRouter()
  const [titleRows, setTitleRows] = useState<TitleRow[]>([])
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sorting, setSorting] = useState<SortingState>([
    { id: "locked_at", desc: true },
  ])
  const [unlocking, setUnlocking] = useState<string | null>(null)

  const canUnlock = user?.role === "Lead" || user?.role === "Manager"

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [allTitles, currentUser] = await Promise.all([getTitles(), getCurrentUser()])
      setTitleRows(allTitles.filter((t) => t.locked_by !== null))
      setUser(currentUser)
    } catch {
      toast.error("Failed to load locked titles")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUnlock = useCallback(async (titleId: string) => {
    setUnlocking(titleId)
    try {
      await unlockTitle(titleId)
      setTitleRows((prev) => prev.filter((t) => t.id !== titleId))
      toast.success("Title unlocked")
    } catch {
      toast.error("Failed to unlock title")
    } finally {
      setUnlocking(null)
    }
  }, [])

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return titleRows
    const q = searchQuery.trim().toLowerCase()
    return titleRows.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.vin.toLowerCase().includes(q) ||
        (t.locked_by ?? "").toLowerCase().includes(q) ||
        t.account_number.toLowerCase().includes(q) ||
        t.auction_name.toLowerCase().includes(q)
    )
  }, [titleRows, searchQuery])

  const columns = useMemo<ColumnDef<TitleRow>[]>(
    () => [
      {
        accessorKey: "account_number",
        header: "Account",
        cell: ({ row }) => (
          <button
            className="font-semibold text-primary hover:underline"
            onClick={() => router.push(`/title/${row.original.id}`)}
          >
            {row.original.account_number}
          </button>
        ),
        size: 120,
      },
      {
        accessorKey: "vin",
        header: "VIN",
        cell: ({ row }) => <span className="font-mono text-[11px]">{row.original.vin}</span>,
      },
      {
        accessorKey: "auction_name",
        header: "Auction",
        cell: ({ row }) => (
          <span className="max-w-[140px] truncate block text-xs" title={row.original.auction_name}>
            {row.original.auction_name}
          </span>
        ),
      },
      {
        accessorKey: "assignment_group",
        header: "Group",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-medium">
            {ASSIGNMENT_GROUP_LABELS[row.original.assignment_group]}
          </Badge>
        ),
        size: 160,
      },
      {
        accessorKey: "locked_by",
        header: "Locked By",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <IconLock className="size-3.5 text-status-red shrink-0" />
            <span className="text-sm font-medium">{row.original.locked_by}</span>
          </div>
        ),
      },
      {
        accessorKey: "locked_at",
        header: "Locked At",
        cell: ({ row }) => {
          const raw = row.original.locked_at
          if (!raw) return <span className="text-muted-foreground">--</span>
          return (
            <span className="text-sm text-muted-foreground">
              {new Date(raw).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (!canUnlock) return null
          const isUnlocking = unlocking === row.original.id
          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-xs"
                  disabled={isUnlocking}
                >
                  <IconLockOpen className="size-3.5" />
                  {isUnlocking ? "Unlocking..." : "Unlock"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unlock title file?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will unlock account{" "}
                    <strong>{row.original.account_number}</strong> currently locked by{" "}
                    <strong>{row.original.locked_by}</strong>. The analyst will lose their lock and another user can
                    claim it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleUnlock(row.original.id)}>
                    Unlock
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        },
        size: 100,
        enableSorting: false,
      },
    ],
    [canUnlock, unlocking, handleUnlock, router]
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
    getRowId: (row) => row.id,
    initialState: {
      pagination: { pageSize: 15 },
    },
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()

  return (
    <div className="py-6 px-4 lg:px-6 flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <IconLock className="size-5" />
          Locked titles
        </h1>
        <p className="text-muted-foreground text-sm">
          {titleRows.length} title file{titleRows.length !== 1 ? "s" : ""} currently locked
          {!canUnlock && " (read-only — Lead or Manager role required to unlock)"}
        </p>
      </div>

      <div className="relative max-w-sm">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by account, VIN, auction, or locked by..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-8 h-9 text-sm"
          aria-label="Search locked titles"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <IconX className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="rounded-md border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : header.column.getCanSort()
                            ? "none"
                            : undefined
                    }
                  >
                    <span className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <SortIcon isSorted={header.column.getIsSorted()} />
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Loading locked titles...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {searchQuery
                    ? "No locked titles match your search."
                    : "No title files are currently locked."}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pageIndex + 1} of {pageCount}
            {" \u00B7 "}
            {filteredData.length} locked title{filteredData.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

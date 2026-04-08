"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import {
  IconLock,
  IconLockOpen,
  IconUserPlus,
  IconArrowUp,
  IconArrowDown,
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconArrowsShuffle,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { getProvider } from "@/lib/data-provider"
import { assignTitles, transferTitleAssignmentGroup, getTitles } from "@/lib/services/title.service"
import { getAnalysts, getCurrentUser } from "@/lib/services/user.service"
import { useQueueToolbarFilters } from "@/lib/queue-toolbar-filters"
import type { Database } from "@/lib/database.types"
import type { TitleRow } from "@/lib/titles/types"
import {
  ASSIGNMENT_GROUPS,
  DEFAULT_ASSIGNMENT_STATUS,
  type AssignmentGroup,
} from "@/lib/titles/assignment-groups"
import {
  ASSIGNMENT_GROUP_LABELS,
  ASSIGNMENT_GROUP_TIPS,
} from "@/lib/titles/assignment-group-copy"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type UserRow = Database["public"]["Tables"]["users"]["Row"]

type QueueFilter = "All" | AssignmentGroup | "Completed"

function parseQueueParam(q: string | null): QueueFilter {
  if (!q || q === "All") return "All"
  if (q === "Completed") return "Completed"
  if ((ASSIGNMENT_GROUPS as readonly string[]).includes(q)) return q as AssignmentGroup
  return "All"
}

const QUEUE_TABS: { value: QueueFilter; label: string; tip: string }[] = [
  { value: "All", label: "All", tip: "All active title records from RepoTitle report" },
  ...ASSIGNMENT_GROUPS.map((g) => ({
    value: g as QueueFilter,
    label: ASSIGNMENT_GROUP_LABELS[g],
    tip: ASSIGNMENT_GROUP_TIPS[g],
  })),
  { value: "Completed", label: "Completed", tip: "Non-open account status (if present)" },
]

const STATUS_TABS = [
  { label: "All", value: "All", tip: "All statuses in this view" },
  { label: "New", value: "Pending", tip: "Pending" },
  { label: "In review", value: "In Progress", tip: "In progress" },
  { label: "Hold", value: "Hold", tip: "On hold" },
] as const

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <IconArrowUp className="size-3.5" />
  if (isSorted === "desc") return <IconArrowDown className="size-3.5" />
  return <IconArrowsUpDown className="size-3.5 text-muted-foreground/50" />
}

export default function QueuePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status: headerStatus } = useQueueToolbarFilters()

  const [titles, setTitles] = useState<TitleRow[]>([])
  const [analysts, setAnalysts] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeQueue, setActiveQueue] = useState<QueueFilter>(() =>
    parseQueueParam(searchParams.get("queue"))
  )
  const [activeTab, setActiveTab] = useState("All")
  const [myTitlesOnly, setMyTitlesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)

  const [sorting, setSorting] = useState<SortingState>([{ id: "due_date", desc: false }])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState("")
  const [assigning, setAssigning] = useState(false)

  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [transferTarget, setTransferTarget] = useState<AssignmentGroup | "">("")
  const allGroupOptions: AssignmentGroup[] = [...ASSIGNMENT_GROUPS]
  const [transferReason, setTransferReason] = useState("")
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [titleData, analystData, currentUser] = await Promise.all([
          getTitles(),
          getAnalysts(),
          getCurrentUser(),
        ])
        setTitles(titleData)
        setAnalysts(analystData)
        if (currentUser) setCurrentUserName(currentUser.name)
      } catch (err) {
        console.error("Failed to load queue data:", err)
        toast.error("Failed to load title queue")
      } finally {
        setLoading(false)
      }
    }

    load()

    const unsubscribe = getProvider().realtime.subscribeToTitles({
      onInsert: (t) => setTitles((prev) => [t, ...prev]),
      onUpdate: (t) => setTitles((prev) => prev.map((x) => (x.id === t.id ? t : x))),
      onDelete: (id) => setTitles((prev) => prev.filter((x) => x.id !== id)),
    })

    return unsubscribe
  }, [])

  const queueCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0, Completed: 0 }
    for (const g of ASSIGNMENT_GROUPS) counts[g] = 0
    for (const t of titles) {
      if (t.status === "Completed") {
        counts.Completed++
      } else {
        counts.All++
        counts[t.assignment_group] = (counts[t.assignment_group] ?? 0) + 1
      }
    }
    return counts as Record<QueueFilter, number>
  }, [titles])

  const headerStatusToDb = useMemo(() => {
    const map: Record<string, string | null> = {
      all: null,
      new: "Pending",
      "in-review": "In Progress",
      "requires-investigation": "Hold",
      completed: "Completed",
    }
    return map[headerStatus] ?? null
  }, [headerStatus])

  const filteredData = useMemo(() => {
    let result =
      activeQueue === "Completed"
        ? titles.filter((t) => t.status === "Completed")
        : titles.filter((t) => t.status !== "Completed")

    if (activeQueue !== "All" && activeQueue !== "Completed") {
      result = result.filter((t) => t.assignment_group === activeQueue)
    }

    if (activeTab !== "All") {
      result = result.filter((t) => t.status === activeTab)
    }

    if (headerStatusToDb) {
      result = result.filter((t) => t.status === headerStatusToDb)
    }

    if (myTitlesOnly && currentUserName) {
      result = result.filter((t) => t.assigned_to === currentUserName)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.account_number.toLowerCase().includes(q) ||
          t.auction_name.toLowerCase().includes(q) ||
          t.vin.toLowerCase().includes(q) ||
          t.assignment_status.toLowerCase().includes(q) ||
          (t.title_location && t.title_location.toLowerCase().includes(q))
      )
    }

    return result
  }, [titles, activeQueue, activeTab, headerStatusToDb, myTitlesOnly, currentUserName, searchQuery])

  const statusCounts = useMemo(() => {
    if (activeQueue === "Completed") {
      const completed = titles.filter((t) => t.status === "Completed")
      return { All: completed.length }
    }
    const queueFiltered =
      activeQueue === "All" ? titles : titles.filter((t) => t.assignment_group === activeQueue)
    const active = queueFiltered.filter((t) => t.status !== "Completed")
    const counts: Record<string, number> = { All: active.length }
    for (const tab of STATUS_TABS) {
      if (tab.value !== "All") {
        counts[tab.value] = queueFiltered.filter((t) => t.status === tab.value).length
      }
    }
    return counts
  }, [titles, activeQueue])

  const columns = useMemo<ColumnDef<TitleRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "account_number",
        header: "Account",
        cell: ({ row }) => (
          <span className="font-semibold text-primary">{row.original.account_number}</span>
        ),
        size: 90,
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
        accessorKey: "vin",
        header: "VIN",
        cell: ({ row }) => <span className="font-mono text-[11px]">{row.original.vin}</span>,
      },
      {
        accessorKey: "assignment_status",
        header: "Assignment",
        cell: ({ row }) => (
          <span
            className="max-w-[160px] truncate text-xs"
            title={row.original.assignment_status}
          >
            {row.original.assignment_status}
          </span>
        ),
      },
      {
        accessorKey: "title_location",
        header: "Title loc.",
        cell: ({ row }) => (
          <span className="font-mono text-[11px]">{row.original.title_location ?? "—"}</span>
        ),
        size: 96,
      },
      {
        accessorKey: "title_state",
        header: "ST",
        cell: ({ row }) => row.original.title_state || "—",
        size: 44,
      },
      {
        accessorKey: "client_age",
        header: "Age",
        cell: ({ row }) =>
          row.original.client_age != null ? (
            String(row.original.client_age)
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        size: 56,
      },
      {
        accessorKey: "recovery_status",
        header: "Recovery",
        cell: ({ row }) => (
          <span className="font-mono text-[10px]">{row.original.recovery_status}</span>
        ),
      },
      {
        accessorKey: "due_date",
        header: "Due",
        cell: ({ row }) => {
          const raw = row.original.due_date
          if (!raw) return <span className="text-muted-foreground">--</span>
          return new Date(raw).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        },
      },
      {
        accessorKey: "assigned_to",
        header: "Assigned",
        cell: ({ row }) => {
          const t = row.original
          return (
            <span className="flex items-center justify-between gap-2">
              <span
                className={
                  t.assigned_to ? "text-sm font-medium" : "text-sm italic text-muted-foreground"
                }
              >
                {t.assigned_to ?? "Unassigned"}
              </span>
              {t.locked_by ? (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <IconLock className="size-3.5 shrink-0 text-destructive cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Locked by {t.locked_by}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <IconLockOpen className="size-3.5 shrink-0 text-muted-foreground" />
              )}
            </span>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
    initialState: {
      pagination: { pageSize: 15 },
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleRowClick = useCallback(
    (titleId: string) => {
      router.push(`/title/${titleId}`)
    },
    [router]
  )

  const handleAssign = useCallback(async () => {
    if (!assignTarget || selectedCount === 0) return
    setAssigning(true)
    try {
      const ids = selectedRows.map((r) => r.original.id)
      await assignTitles(ids, assignTarget)

      setTitles((prev) =>
        prev.map((t) => (ids.includes(t.id) ? { ...t, assigned_to: assignTarget } : t))
      )

      setRowSelection({})
      setAssignDialogOpen(false)
      setAssignTarget("")
      toast.success(`Assigned ${ids.length} file${ids.length > 1 ? "s" : ""} to ${assignTarget}`)
    } catch {
      toast.error("Failed to assign")
    } finally {
      setAssigning(false)
    }
  }, [assignTarget, selectedCount, selectedRows])

  const handleTransfer = useCallback(async () => {
    if (!transferTarget || !transferReason.trim() || selectedCount === 0 || !currentUserName) return
    setTransferring(true)
    try {
      const rows = selectedRows.map((r) => r.original)
      const toGroup = transferTarget as AssignmentGroup
      const toStatus = DEFAULT_ASSIGNMENT_STATUS[toGroup]
      for (const row of rows) {
        const fromGroup = row.assignment_group
        await transferTitleAssignmentGroup(
          row.id,
          fromGroup,
          toGroup,
          currentUserName,
          transferReason.trim()
        )
      }
      const ids = rows.map((r) => r.id)

      setTitles((prev) =>
        prev.map((t) =>
          ids.includes(t.id)
            ? {
                ...t,
                assignment_group: toGroup,
                assignment_status: toStatus,
                updated_at: new Date().toISOString(),
              }
            : t
        )
      )

      setRowSelection({})
      setTransferDialogOpen(false)
      setTransferTarget("")
      setTransferReason("")
      toast.success(
        `Transferred ${ids.length} file${ids.length > 1 ? "s" : ""} to ${ASSIGNMENT_GROUP_LABELS[toGroup]}`
      )
    } catch {
      toast.error("Failed to transfer")
    } finally {
      setTransferring(false)
    }
  }, [transferTarget, transferReason, selectedCount, selectedRows, currentUserName])

  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()

  return (
    <div className="py-6 px-4 lg:px-6 flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Title queue</h1>
        <p className="text-muted-foreground text-sm">
          RepoTitle TitleLocation report — filter by assignment group, search by VIN, account, or auction
        </p>
      </div>

      <div className="flex gap-1 border-b border-border pb-0 flex-wrap" role="tablist" aria-label="Assignment group">
        {QUEUE_TABS.map((tab) => (
          <TooltipProvider key={String(tab.value)} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  role="tab"
                  aria-selected={activeQueue === tab.value}
                  aria-label={`${tab.label}, ${queueCounts[tab.value] ?? 0} files`}
                  onClick={() => {
                    setActiveQueue(tab.value)
                    setActiveTab("All")
                    setRowSelection({})
                  }}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-t-md ${
                    activeQueue === tab.value
                      ? "text-primary bg-background border border-border border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {tab.value !== "Completed" && (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-px text-[11px] font-semibold ${
                        activeQueue === tab.value
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    >
                      {queueCounts[tab.value] ?? 0}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tab.tip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {activeQueue !== "Completed" && (
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Status filters">
          {STATUS_TABS.map((tab) => (
            <TooltipProvider key={tab.value} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    role="tab"
                    aria-selected={activeTab === tab.value}
                    aria-label={`${tab.label}, ${statusCounts[tab.value] ?? 0} files`}
                    onClick={() => setActiveTab(tab.value)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === tab.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-1.5 py-px text-[11px] font-semibold ${
                        activeTab === tab.value
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    >
                      {statusCounts[tab.value] ?? 0}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tab.tip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      <div className="relative max-w-md">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search VIN, account, auction, assignment, title location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-8 h-9 text-sm"
          aria-label="Search title queue"
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

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedCount === 0}
            onClick={() => {
              setAssignTarget("")
              setAssignDialogOpen(true)
            }}
          >
            <IconUserPlus className="size-4" />
            Assign
            {selectedCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                {selectedCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={selectedCount === 0}
            onClick={() => {
              setTransferTarget("")
              setTransferReason("")
              setTransferDialogOpen(true)
            }}
          >
            <IconArrowsShuffle className="size-4" />
            Transfer group
            {selectedCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                {selectedCount}
              </Badge>
            )}
          </Button>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
          <span className="text-muted-foreground">My titles</span>
          <button
            role="switch"
            aria-checked={myTitlesOnly}
            onClick={() => setMyTitlesOnly((v) => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
              myTitlesOnly ? "border-primary bg-primary" : "border-input bg-input"
            }`}
          >
            <span
              className={`block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                myTitlesOnly ? "translate-x-[18px]" : "translate-x-[3px]"
              }`}
            />
          </button>
        </label>
      </div>

      {currentUserName && (
        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
          <span>
            You have{" "}
            <strong className="text-foreground">
              {titles.filter((t) => t.assigned_to === currentUserName && t.status !== "Completed").length}
            </strong>{" "}
            file
            {titles.filter((t) => t.assigned_to === currentUserName && t.status !== "Completed").length !== 1
              ? "s"
              : ""}{" "}
            assigned to you
          </span>
          {(() => {
            const pastDue = titles.filter(
              (t) =>
                t.assigned_to === currentUserName &&
                t.status !== "Completed" &&
                t.due_date &&
                new Date(t.due_date) < new Date()
            ).length
            return pastDue > 0 ? (
              <span className="text-status-red font-semibold">· {pastDue} past due</span>
            ) : null
          })()}
        </div>
      )}

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
                  Loading title queue...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  <span role="status" aria-live="polite">
                    No title files match your criteria.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="cursor-pointer focus-within:ring-2 focus-within:ring-ring/50"
                  onClick={() => handleRowClick(row.original.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRowClick(row.original.id)
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open title account ${row.original.account_number} VIN ${row.original.vin}`}
                >
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
            {" · "}
            {filteredData.length} file{filteredData.length !== 1 ? "s" : ""}
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

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign titles</DialogTitle>
            <DialogDescription>
              Assigning <strong>{selectedCount}</strong> file{selectedCount > 1 ? "s" : ""} to an analyst.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <Select value={assignTarget} onValueChange={setAssignTarget}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an analyst" />
              </SelectTrigger>
              <SelectContent>
                {analysts.map((a) => (
                  <SelectItem key={a.id} value={a.name}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCount > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border p-2">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Selected files
                </p>
                {selectedRows.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 border-b py-1.5 text-sm last:border-b-0"
                  >
                    <span className="min-w-[70px] font-semibold text-primary">
                      #{r.original.id.slice(0, 8)}
                    </span>
                    <span className="flex-1 truncate text-xs">{r.original.vin}</span>
                    {r.original.assigned_to && (
                      <span className="text-xs italic text-muted-foreground">
                        Currently: {r.original.assigned_to}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!assignTarget || assigning} onClick={handleAssign}>
              {assigning ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer assignment group</DialogTitle>
            <DialogDescription>
              Move <strong>{selectedCount}</strong> file{selectedCount > 1 ? "s" : ""} to another assignment
              group. Assignment status will update to the default for that group.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="space-y-2">
              <Label>Destination group</Label>
              <Select
                value={transferTarget}
                onValueChange={(v) => setTransferTarget(v as AssignmentGroup)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {allGroupOptions.map((g) => (
                    <SelectItem key={g} value={g}>
                      {ASSIGNMENT_GROUP_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason for transfer</Label>
              <Textarea
                placeholder="Briefly explain why these files are being moved..."
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!transferTarget || !transferReason.trim() || transferring}
              onClick={handleTransfer}
            >
              {transferring ? "Transferring..." : "Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

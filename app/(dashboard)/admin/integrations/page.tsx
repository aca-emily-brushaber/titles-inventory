"use client"

import { useEffect, useState, useCallback } from "react"
import {
  IconPlug,
  IconRefresh,
  IconCheck,
  IconX,
  IconCloudDownload,
  IconArrowRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import {
  getSyncLog,
  triggerEoscarSync,
} from "@/lib/services/integration.service"
import type { Database } from "@/lib/database.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

type SyncLogRow = Database["public"]["Tables"]["integration_sync_log"]["Row"]

const STATUS_COLORS: Record<string, string> = {
  success: "bg-status-green text-white",
  failed: "bg-status-red text-white",
  skipped_duplicate: "bg-status-amber text-white",
}

function RelativeTime({ date }: { date: string }) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  let label: string
  if (diffMin < 1) label = "just now"
  else if (diffMin < 60) label = `${diffMin}m ago`
  else if (diffHr < 24) label = `${diffHr}h ago`
  else label = `${diffDay}d ago`

  return (
    <span title={d.toLocaleString()}>
      {label}
    </span>
  )
}

export default function IntegrationsPage() {
  const [logs, setLogs] = useState<SyncLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const loadLogs = useCallback(async () => {
    try {
      const data = await getSyncLog(undefined, 100)
      setLogs(data)
    } catch {
      toast.error("Failed to load sync logs")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleSyncNow = async () => {
    setSyncing(true)
    try {
      const result = await triggerEoscarSync()
      toast.success(
        `Sync complete: ${result.created} created, ${result.skipped} skipped, ${result.failed} failed`
      )
      loadLogs()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed")
    } finally {
      setSyncing(false)
    }
  }

  const lastEoscarSync = logs.find(
    (l) => l.integration === "eoscar" && l.status === "success"
  )
  const lastOnBaseSync = logs.find(
    (l) => l.integration === "onbase" && l.status === "success"
  )

  const eoscarLogs = logs.filter((l) => l.integration === "eoscar")
  const onBaseLogs = logs.filter((l) => l.integration === "onbase")

  return (
    <div className="py-6 px-4 lg:px-6 flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <IconPlug className="size-5 text-primary" />
          Integrations
        </h1>
        <p className="text-muted-foreground text-sm">
          External system connections and sync status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IconArrowRight className="size-4 text-blue-500" />
              e-Oscar
            </CardTitle>
            <CardDescription>ACDV ingestion via webhook and scheduled polling (optional integration)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last successful sync</span>
              <span className="text-sm font-medium">
                {lastEoscarSync ? (
                  <RelativeTime date={lastEoscarSync.created_at} />
                ) : (
                  <span className="text-muted-foreground italic">Never</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total events</span>
              <span className="text-sm font-medium">{eoscarLogs.length}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSyncNow}
              disabled={syncing}
            >
              <IconRefresh className={`size-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IconCloudDownload className="size-4 text-emerald-500" />
              OnBase
            </CardTitle>
            <CardDescription>Document retrieval from OnBase document management system</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last successful fetch</span>
              <span className="text-sm font-medium">
                {lastOnBaseSync ? (
                  <RelativeTime date={lastOnBaseSync.created_at} />
                ) : (
                  <span className="text-muted-foreground italic">Never</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total events</span>
              <span className="text-sm font-medium">{onBaseLogs.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Documents are fetched on-demand from title detail pages.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sync Log</CardTitle>
          <CardDescription>Recent integration events across all systems</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Integration</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Loading sync logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No sync events recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        <RelativeTime date={log.created_at} />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.integration === "eoscar"
                              ? "border-blue-500/50 text-blue-600 dark:text-blue-400"
                              : "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {log.integration === "eoscar" ? "e-Oscar" : "OnBase"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.event_type.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[log.status] ?? ""}>
                          {log.status === "success" && <IconCheck className="size-3 mr-0.5" />}
                          {log.status === "failed" && <IconX className="size-3 mr-0.5" />}
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                        {log.error_message
                          ? log.error_message
                          : JSON.stringify(log.payload).slice(0, 120)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

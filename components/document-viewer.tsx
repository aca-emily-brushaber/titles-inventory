"use client"

import { useState } from "react"
import {
  IconFile,
  IconMinus,
  IconPlus,
  IconMaximize,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
} from "@tabler/icons-react"

import type { Database } from "@/lib/database.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { SectionHelp } from "@/components/section-help"
import { cn } from "@/lib/utils"

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"]

interface DocumentViewerProps {
  documents: DocumentRow[]
}

const DOC_TYPE_COLORS: Record<string, string> = {
  ACDV: "bg-primary/10 text-primary border-primary/20",
  Internal: "bg-status-amber/10 text-status-amber border-status-amber/20",
  Funding: "bg-status-green/10 text-status-green border-status-green/20",
}

export function DocumentViewer({ documents }: DocumentViewerProps) {
  const [activeDocIndex, setActiveDocIndex] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [zoom, setZoom] = useState(100)

  const currentDoc = documents[activeDocIndex] ?? null
  const pages =
    currentDoc?.pages ??
    (currentDoc?.image_path ? [currentDoc.image_path] : [])
  const totalPages = pages.length
  const currentPageSrc = pages[pageIndex] ?? null

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 200))
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 50))
  const resetZoom = () => setZoom(100)

  function selectDocument(index: number) {
    setActiveDocIndex(index)
    setPageIndex(0)
    resetZoom()
  }

  function goToPreviousPage() {
    setPageIndex((p) => Math.max(p - 1, 0))
  }

  function goToNextPage() {
    setPageIndex((p) => Math.min(p + 1, totalPages - 1))
  }

  const extractedData = (currentDoc?.extracted_data ?? []) as Array<{
    code?: string
    label?: string
    value?: string
    verified?: boolean
  }>

  const docType = currentDoc?.document_type ?? ""

  return (
    <div
      className="glass-card rounded-lg flex flex-col overflow-hidden"
      style={{ minHeight: 520 }}
    >
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <IconFile className="size-4 text-primary" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Document Viewer
            <SectionHelp label="Help for Document Viewer">
              <p className="font-semibold text-foreground mb-1">What is this?</p>
              <p>
                Review source documents retrieved from OnBase or other systems, such as title paperwork,
                internal servicing records, and funding documents.
              </p>
              <p className="mt-2">
                Use the <strong>Extracted Data</strong> sidebar to cross-check values against the field
                summary on this page.
              </p>
            </SectionHelp>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Read-only — extracted data in sidebar
          </p>
        </div>
        {currentDoc?.onbase_document_id && (
          <Badge variant="outline" className="text-xs font-semibold">
            OnBase: {currentDoc.onbase_document_id}
          </Badge>
        )}
      </div>

      {documents.length > 0 ? (
        <>
          <div className="flex items-center gap-1 px-3 pt-2 pb-0 border-b border-border bg-muted/20">
            {documents.map((doc, i) => (
              <button
                key={doc.id}
                onClick={() => selectDocument(i)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-md border-b-2 transition-colors",
                  activeDocIndex === i
                    ? "border-primary text-primary bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {doc.label}
                {(doc.pages?.length ?? 0) > 1 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold border",
                      DOC_TYPE_COLORS[doc.document_type] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {doc.pages?.length ?? 1}p
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/10">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  onClick={zoomOut}
                  aria-label="Zoom out"
                >
                  <IconMinus className="size-4" />
                </Button>
                <span className="text-xs font-mono text-foreground w-10 text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  onClick={zoomIn}
                  aria-label="Zoom in"
                >
                  <IconPlus className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  onClick={resetZoom}
                  aria-label="Fit to window"
                >
                  <IconMaximize className="size-4" />
                </Button>
                <div className="flex-1" />
                <span className="text-[11px] text-muted-foreground font-medium">
                  Page {totalPages > 0 ? pageIndex + 1 : 0} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  disabled={pageIndex <= 0}
                  onClick={goToPreviousPage}
                  aria-label="Previous page"
                >
                  <IconChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  disabled={pageIndex >= totalPages - 1}
                  onClick={goToNextPage}
                  aria-label="Next page"
                >
                  <IconChevronRight className="size-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4 bg-muted/20">
                {currentPageSrc ? (
                  <div
                    className="bg-white dark:bg-zinc-900 border border-border rounded shadow-sm w-full max-w-md mx-auto transition-all origin-top"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top center",
                      minHeight: 320,
                    }}
                  >
                    <div
                      className={cn(
                        "px-4 py-2 text-[10px] font-semibold uppercase tracking-widest flex items-center justify-between border-b",
                        docType === "ACDV" &&
                          "bg-primary/10 text-primary border-primary/20",
                        docType === "Internal" &&
                          "bg-status-amber/10 text-status-amber border-status-amber/20",
                        docType === "Funding" &&
                          "bg-status-green/10 text-status-green border-status-green/20",
                        !["ACDV", "Internal", "Funding"].includes(docType) &&
                          "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <span>{docType} Document</span>
                      <span className="font-mono font-normal opacity-60">
                        p{pageIndex + 1}
                      </span>
                    </div>
                    <div className="p-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentPageSrc}
                        alt={`${currentDoc?.label ?? "Document"} - Page ${pageIndex + 1}`}
                        className="max-w-full rounded"
                      />
                    </div>
                    <div className="px-5 pb-4 text-[9px] text-muted-foreground/40 font-mono uppercase tracking-widest text-right">
                      CONFIDENTIAL — INTERNAL USE ONLY
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
                    No page image available
                  </div>
                )}
              </ScrollArea>

              <div className="px-4 py-2 border-t border-border bg-muted/10 flex items-center gap-4 text-[11px]">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                  Business Checks
                </span>
                <span className="flex items-center gap-1 text-status-green font-semibold">
                  <IconCircleCheck className="size-3.5" />
                  Errors 0
                </span>
                <span className="flex items-center gap-1 text-status-green font-semibold">
                  <IconCircleCheck className="size-3.5" />
                  Warnings 0
                </span>
              </div>
            </div>

            <div className="w-[200px] border-l border-border flex flex-col bg-muted/10 shrink-0">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Extracted Data
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  Read-only — compare with field table
                </p>
              </div>
              <div className="flex-1 overflow-auto p-2 flex flex-col gap-1.5">
                {extractedData.map((field, i) => (
                  <label
                    key={`${field.code}-${i}`}
                    className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-accent/40 cursor-default"
                  >
                    <Checkbox
                      checked={field.verified ?? false}
                      disabled
                      className="mt-0.5 shrink-0 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground leading-tight">
                        {field.label}
                      </p>
                      <p className="text-[11px] font-mono text-foreground leading-snug mt-0.5 break-all">
                        {field.value}
                      </p>
                    </div>
                  </label>
                ))}
                {extractedData.length === 0 && (
                  <p className="px-2 py-4 text-xs text-muted-foreground">
                    No extracted data available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-muted-foreground">
          <IconFile className="size-8" />
          <p className="text-sm">No documents available.</p>
          <p className="text-xs">
            Documents will appear here once retrieved from OnBase.
          </p>
        </div>
      )}
    </div>
  )
}

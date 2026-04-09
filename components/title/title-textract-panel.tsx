"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import {
  IconMinus,
  IconPlus,
  IconMaximize,
  IconChevronLeft,
  IconChevronRight,
  IconRotateClockwise,
  IconAlertTriangle,
  IconChevronDown,
} from "@tabler/icons-react"

import type { Database } from "@/lib/database.types"
import type { TitleRow } from "@/lib/titles/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SectionHelp } from "@/components/section-help"
import { cn } from "@/lib/utils"
import {
  getTextractMockForTitle,
  MOCK_CT_TITLE_EXTRACTION,
  summarizeTextract,
  type TextractCategory,
  type TextractField,
  type TextractExtractionMock,
} from "@/lib/titles/textract-mock-data"

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"]

interface TitleTextractPanelProps {
  title: TitleRow
  documents: DocumentRow[]
}

function confidenceClass(band: TextractField["band"]) {
  switch (band) {
    case "high":
      return "text-emerald-600 dark:text-emerald-400"
    case "medium":
      return "text-amber-600 dark:text-amber-400"
    case "review":
      return "text-amber-600 dark:text-amber-400"
    default:
      return "text-rose-600 dark:text-rose-400"
  }
}

function FieldRow({ field }: { field: TextractField }) {
  const needsWarning = field.band === "review" || field.band === "low" || field.band === "medium"
  return (
    <div
      className={cn(
        "rounded-md px-2.5 py-2 border border-transparent",
        field.band === "review" && "bg-amber-500/10 border-amber-500/25"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {field.label}
          </p>
          <p className="text-sm font-medium text-foreground mt-0.5 break-words">
            {field.value || "—"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {field.source && (
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 font-semibold">
              {field.source === "system" ? "System" : "Textract"}
            </Badge>
          )}
          {field.confidence != null && (
            <span className={cn("text-[11px] font-mono font-semibold", confidenceClass(field.band))}>
              {field.confidence.toFixed(0)}%
            </span>
          )}
          {needsWarning && field.band === "review" && (
            <IconAlertTriangle className="size-3.5 text-amber-500" aria-hidden />
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryBlock({
  cat,
  defaultOpen,
}: {
  cat: TextractCategory
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const reviewCount = cat.fields.filter((f) => f.band === "review").length

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <IconChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
        <span className="text-[11px] font-bold tracking-wide text-foreground">
          {cat.label}
        </span>
        <span className="text-[10px] text-muted-foreground">
          ({cat.fields.length} field{cat.fields.length !== 1 ? "s" : ""}
          {reviewCount > 0 ? `, ${reviewCount} review` : ""})
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          {cat.fields.map((f) => (
            <FieldRow key={f.id} field={f} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TitleTextractPanel({ title, documents }: TitleTextractPanelProps) {
  const [activeDocIndex, setActiveDocIndex] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const viewerRef = useRef<HTMLDivElement>(null)

  const currentDoc = documents[activeDocIndex] ?? null

  const extractionData: TextractExtractionMock | null = useMemo(() => {
    const byState = getTextractMockForTitle(title.title_state)
    const base = byState ?? (currentDoc?.document_type === "Title" ? MOCK_CT_TITLE_EXTRACTION : null)
    if (!base) return null
    const vin = title.vin?.trim()
    if (!vin) return base
    return {
      ...base,
      categories: base.categories.map((c) => ({
        ...c,
        fields: c.fields.map((f) => (f.id === "vin" ? { ...f, value: vin } : f)),
      })),
    }
  }, [title.title_state, title.vin, currentDoc?.document_type])
  const pages =
    currentDoc?.pages ?? (currentDoc?.image_path ? [currentDoc.image_path] : [])
  const totalPages = pages.length
  const currentPageSrc = pages[pageIndex] ?? null

  /** Demo certificate image when Textract mock is shown */
  const displaySrc = useMemo(() => {
    if (extractionData) return "/sample-docs/ct-certificate-title-sample.png"
    return currentPageSrc
  }, [extractionData, currentPageSrc])

  const stats = extractionData ? summarizeTextract(extractionData.categories) : null

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 200))
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 50))
  const resetZoom = () => setZoom(100)
  const rotate = () => setRotation((r) => (r + 90) % 360)

  const goToPreviousPage = () => setPageIndex((p) => Math.max(p - 1, 0))
  const goToNextPage = () => setPageIndex((p) => Math.min(p + 1, totalPages - 1))

  const selectDocument = (index: number) => {
    setActiveDocIndex(index)
    setPageIndex(0)
    resetZoom()
    setRotation(0)
  }

  const toggleFullscreen = useCallback(() => {
    const el = viewerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      void el.requestFullscreen?.()
    } else {
      void document.exitFullscreen?.()
    }
  }, [])

  const fieldCount = stats?.total ?? 0

  return (
    <div
      className="glass-card rounded-lg flex flex-col overflow-hidden border border-border/80"
      style={{ minHeight: 560 }}
    >
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5" id="title-documents">
            Title verification (Textract)
            <SectionHelp label="Help for title verification">
              <p className="font-semibold text-foreground mb-1">OCR extraction</p>
              <p>
                Textract reads the scanned certificate of title. Green highlights on the image show where text
                was detected. Use the <strong>Extracted fields</strong> panel to validate confidence scores
                before generating letters and forms in Actions.
              </p>
            </SectionHelp>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare the document image to structured fields — data feeds Step 4 Actions.
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
                type="button"
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
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold border bg-muted">
                    {doc.pages?.length ?? 1}p
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-1 overflow-hidden flex-col lg:flex-row min-h-[480px]">
            {/* Document canvas */}
            <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-border">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/10 flex-wrap">
                <Button variant="outline" size="icon" className="size-9" onClick={zoomOut} aria-label="Zoom out">
                  <IconMinus className="size-4" />
                </Button>
                <span className="text-xs font-mono text-foreground w-10 text-center">{zoom}%</span>
                <Button variant="outline" size="icon" className="size-9" onClick={zoomIn} aria-label="Zoom in">
                  <IconPlus className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-9" onClick={resetZoom} aria-label="Reset zoom">
                  <IconMaximize className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-9" onClick={rotate} aria-label="Rotate">
                  <IconRotateClockwise className="size-4" />
                </Button>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-9"
                  onClick={toggleFullscreen}
                  type="button"
                >
                  Full screen
                </Button>
                <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                  Page {totalPages > 0 ? pageIndex + 1 : 0} / {totalPages}
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

              <ScrollArea className="flex-1 p-4 bg-zinc-100/80 dark:bg-zinc-950/50">
                <div ref={viewerRef} className="relative w-full max-w-2xl mx-auto">
                  {displaySrc ? (
                    <div
                      className="relative bg-white dark:bg-zinc-900 border border-border rounded shadow-md overflow-hidden transition-transform"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: "center center",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displaySrc}
                        alt={`${currentDoc?.label ?? "Title"} — page ${pageIndex + 1}`}
                        className="w-full h-auto block select-none"
                        draggable={false}
                      />
                      {extractionData?.overlays.map((box) => (
                        <div
                          key={box.id}
                          className="absolute border-2 border-emerald-500/90 bg-emerald-500/10 pointer-events-none rounded-sm"
                          style={{
                            left: `${box.left * 100}%`,
                            top: `${box.top * 100}%`,
                            width: `${box.width * 100}%`,
                            height: `${box.height * 100}%`,
                          }}
                          title={box.label}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
                      No page image available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Extracted fields */}
            <aside className="w-full lg:w-[380px] shrink-0 flex flex-col bg-background border-t lg:border-t-0 lg:border-l border-border max-h-[70vh] lg:max-h-none">
              <div className="px-3 py-3 border-b border-border space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground">Extracted fields</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Acct: {title.account_number}
                  </span>
                </div>
                {stats && (
                  <>
                    <p className="text-[11px] text-muted-foreground">
                      {fieldCount} field{fieldCount !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                      >
                        {stats.needsReview} needs review
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                      >
                        {stats.high} high
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                      >
                        {stats.med} med
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                      >
                        {stats.low} low
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              <ScrollArea className="flex-1">
                {extractionData ? (
                  extractionData.categories.map((cat, i) => (
                    <CategoryBlock key={cat.id} cat={cat} defaultOpen={i === 0} />
                  ))
                ) : (
                  <p className="p-4 text-xs text-muted-foreground">
                    No Textract preview for this title state yet. Add a mock in{" "}
                    <code className="text-[10px]">lib/titles/textract-mock-data.ts</code> or connect the
                    extraction API.
                  </p>
                )}
              </ScrollArea>
            </aside>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-muted-foreground">
          <p className="text-sm">No title document available.</p>
          <p className="text-xs text-center max-w-sm">
            Upload or retrieve a certificate image to run Textract and populate extracted fields.
          </p>
        </div>
      )}
    </div>
  )
}

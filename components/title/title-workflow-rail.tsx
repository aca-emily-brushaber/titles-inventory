"use client"

import { useEffect, useState, useCallback } from "react"
import {
  IconHistory,
  IconFile,
  IconLayoutGrid,
  IconMessageCircle,
  IconClipboardList,
  IconCircleCheck,
  IconSquareCheck,
  IconSquare,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    id: "timeline",
    label: "History",
    anchor: "title-timeline",
    icon: IconHistory,
    hint: "Queue transfers and milestones for this title file.",
  },
  {
    id: "fields",
    label: "Title details",
    anchor: "title-fields",
    icon: IconLayoutGrid,
    hint: "VIN, account, lienholder, and jurisdiction fields.",
  },
  {
    id: "docs",
    label: "Title verification",
    anchor: "title-documents",
    icon: IconFile,
    hint: "Textract OCR — compare the scanned title to extracted fields before Actions.",
  },
  {
    id: "actions",
    label: "Actions",
    anchor: "title-actions",
    icon: IconClipboardList,
    hint: "Letters, release requests, and custody moves.",
  },
  {
    id: "comments",
    label: "Comments",
    anchor: "title-comments",
    icon: IconMessageCircle,
    hint: "Analyst notes and handoff context.",
  },
] as const

export type TitleWorkflowStepId = (typeof STEPS)[number]["id"]

const CHECKABLE_STEPS = STEPS.filter((s) => s.id !== "actions")

export { STEPS as TITLE_WORKFLOW_STEPS }
export { CHECKABLE_STEPS as TITLE_CHECKABLE_STEPS }

interface TitleWorkflowRailProps {
  variant?: "desktop" | "mobile"
  checked?: Set<string>
  onCheckedChange?: (checked: Set<string>) => void
}

export function TitleWorkflowRail({
  variant = "desktop",
  checked: externalChecked,
  onCheckedChange,
}: TitleWorkflowRailProps) {
  const [activeId, setActiveId] = useState<string>(STEPS[0].id)
  const [internalChecked, setInternalChecked] = useState<Set<string>>(new Set())
  const checked = externalChecked ?? internalChecked

  const handleScrollTo = useCallback((stepId: string, anchor: string) => {
    setActiveId(stepId)
    const el = document.getElementById(anchor)
    const scrollPanel = document.getElementById("title-scroll-panel")
    if (el && scrollPanel) {
      const panelTop = scrollPanel.getBoundingClientRect().top
      const elTop = el.getBoundingClientRect().top
      scrollPanel.scrollTo({
        top: scrollPanel.scrollTop + (elTop - panelTop),
        behavior: "smooth",
      })
    } else if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  const toggleCheck = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const next = new Set(checked)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (onCheckedChange) {
        onCheckedChange(next)
      } else {
        setInternalChecked(next)
      }
    },
    [checked, onCheckedChange]
  )

  useEffect(() => {
    const scrollPanel = document.getElementById("title-scroll-panel")
    if (!scrollPanel) return

    function updateActive() {
      if (!scrollPanel) return

      const atBottom =
        scrollPanel.scrollTop + scrollPanel.clientHeight >=
        scrollPanel.scrollHeight - 100

      if (atBottom) {
        setActiveId(STEPS[STEPS.length - 1].id)
        return
      }

      const triggerY = scrollPanel.getBoundingClientRect().top + scrollPanel.clientHeight * 0.25
      let best: (typeof STEPS)[number] | null = null

      for (let i = STEPS.length - 1; i >= 0; i--) {
        const anchor = document.getElementById(STEPS[i].anchor)
        if (!anchor) continue
        if (anchor.getBoundingClientRect().top <= triggerY) {
          best = STEPS[i]
          break
        }
      }

      if (best) setActiveId(best.id)
    }

    updateActive()
    scrollPanel.addEventListener("scroll", updateActive, { passive: true })
    window.addEventListener("resize", updateActive, { passive: true })

    return () => {
      scrollPanel.removeEventListener("scroll", updateActive)
      window.removeEventListener("resize", updateActive)
    }
  }, [])

  const completedCount = CHECKABLE_STEPS.filter((s) => checked.has(s.id)).length
  const totalCount = CHECKABLE_STEPS.length

  if (variant === "mobile") {
    return (
      <nav
        aria-label="Title workflow"
        className="flex items-center gap-0 px-2 py-2 rounded-lg border border-border bg-muted/30 overflow-x-auto sticky top-[120px] z-20"
      >
        {STEPS.map((step, i) => {
          const isActive = activeId === step.id
          const isChecked = checked.has(step.id)
          const Icon = step.icon

          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => handleScrollTo(step.id, step.anchor)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap",
                  isActive && "bg-primary/10 text-primary border border-primary/20",
                  isChecked && !isActive && "text-status-green",
                  !isActive && !isChecked && "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {isChecked && !isActive ? (
                  <IconCircleCheck className="size-3 text-status-green" />
                ) : (
                  <Icon className={cn("size-3", isActive ? "text-primary" : "text-muted-foreground")} />
                )}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.label.split(" ").pop()}</span>
                {step.id !== "actions" && (
                  <span
                    role="checkbox"
                    aria-checked={isChecked}
                    aria-label={isChecked ? `Unmark ${step.label}` : `Mark ${step.label} complete`}
                    tabIndex={0}
                    onClick={(e) => toggleCheck(step.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleCheck(step.id, e as unknown as React.MouseEvent)
                      }
                    }}
                    className="ml-0.5 shrink-0 cursor-pointer"
                  >
                    {isChecked ? (
                      <IconSquareCheck className="size-3.5 text-status-green" />
                    ) : (
                      <IconSquare className="size-3.5 text-muted-foreground/40" />
                    )}
                  </span>
                )}
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-px mx-0.5 shrink-0",
                    isChecked ? "bg-status-green/40" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </nav>
    )
  }

  return (
    <nav
      aria-label="Title workflow"
      className="flex flex-col gap-0.5 w-[264px] shrink-0"
    >
      <div className="flex items-center justify-between px-3 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workflow
        </p>
        <span className="text-[10px] text-muted-foreground">
          {completedCount}/{totalCount} complete
        </span>
      </div>

      {STEPS.map((step, i) => {
        const isActive = activeId === step.id
        const isChecked = checked.has(step.id)
        const Icon = step.icon

        return (
          <div key={step.id} className="flex gap-0">
            <div className="flex flex-col items-center w-8 shrink-0">
              <div
                className={cn(
                  "w-px flex-1",
                  i === 0 ? "bg-transparent" : isChecked ? "bg-status-green/40" : "bg-border"
                )}
              />
              <div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                  isActive && !isChecked && "border-primary bg-primary/10",
                  isChecked && "border-status-green bg-status-green/10",
                  !isActive && !isChecked && "border-border bg-muted/30"
                )}
              >
                {isChecked ? (
                  <IconCircleCheck className="size-3.5 text-status-green" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "w-px flex-1",
                  i === STEPS.length - 1 ? "bg-transparent" : isChecked ? "bg-status-green/40" : "bg-border"
                )}
              />
            </div>

            <button
              type="button"
              onClick={() => handleScrollTo(step.id, step.anchor)}
              className={cn(
                "flex-1 text-left rounded-lg px-3 py-2.5 transition-colors group cursor-pointer",
                isActive && "bg-primary/5 border border-primary/15",
                !isActive && "hover:bg-accent/40"
              )}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    isActive ? "text-primary" : isChecked ? "text-status-green" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    isActive ? "text-primary" : isChecked ? "text-status-green" : "text-foreground"
                  )}
                >
                  {step.label}
                </span>
                {step.id !== "actions" && (
                  <span
                    role="checkbox"
                    aria-checked={isChecked}
                    aria-label={isChecked ? `Unmark ${step.label}` : `Mark ${step.label} complete`}
                    tabIndex={0}
                    onClick={(e) => toggleCheck(step.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleCheck(step.id, e as unknown as React.MouseEvent)
                      }
                    }}
                    className="ml-auto shrink-0 p-0.5 rounded hover:bg-accent/60 transition-colors cursor-pointer"
                  >
                    {isChecked ? (
                      <IconSquareCheck className="size-4 text-status-green" />
                    ) : (
                      <IconSquare className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
                    )}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-[11px] leading-relaxed transition-colors",
                  isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                )}
              >
                {step.hint}
              </p>
            </button>
          </div>
        )
      })}
    </nav>
  )
}

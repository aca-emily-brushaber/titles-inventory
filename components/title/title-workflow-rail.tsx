"use client"

import { useEffect, useState, useCallback } from "react"
import {
  IconHistory,
  IconFile,
  IconLayoutGrid,
  IconMessageCircle,
  IconClipboardList,
  IconTruck,
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
    hint: "VIN, account, assignment, and jurisdiction fields.",
  },
  {
    id: "shipping",
    label: "Shipping",
    anchor: "title-shipping",
    icon: IconTruck,
    hint: "Tracking, location, and shipped timestamp for the physical title.",
  },
  {
    id: "docs",
    label: "Title verification",
    anchor: "title-documents",
    icon: IconFile,
    hint: "Compare the scanned title to extracted fields before Actions.",
  },
  {
    id: "actions",
    label: "Actions",
    anchor: "title-actions",
    icon: IconClipboardList,
    hint: "Letters, release requests, and state-specific forms.",
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

export { STEPS as TITLE_WORKFLOW_STEPS }

interface TitleWorkflowRailProps {
  variant?: "desktop" | "mobile"
}

export function TitleWorkflowRail({ variant = "desktop" }: TitleWorkflowRailProps) {
  const [activeId, setActiveId] = useState<string>(STEPS[0].id)

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

  useEffect(() => {
    const scrollPanel = document.getElementById("title-scroll-panel")
    if (!scrollPanel) return

    function updateActive() {
      if (!scrollPanel) return

      const atBottom =
        scrollPanel.scrollTop + scrollPanel.clientHeight >= scrollPanel.scrollHeight - 100

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

  if (variant === "mobile") {
    return (
      <nav
        aria-label="Suggested review order"
        className="flex items-center gap-0 px-2 py-2 rounded-lg border border-border bg-muted/30 overflow-x-auto sticky top-[120px] z-20"
      >
        {STEPS.map((step, i) => {
          const isActive = activeId === step.id
          const Icon = step.icon

          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => handleScrollTo(step.id, step.anchor)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap",
                  isActive && "bg-primary/10 text-primary border border-primary/20",
                  !isActive && "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <span className="text-[10px] font-bold text-muted-foreground tabular-nums w-4 text-center shrink-0">
                  {i + 1}
                </span>
                <Icon className={cn("size-3 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.label.split(" ").pop()}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-3 h-px mx-0.5 shrink-0 bg-border" />}
            </div>
          )
        })}
      </nav>
    )
  }

  return (
    <nav aria-label="Suggested review order" className="flex flex-col gap-0.5 w-[264px] shrink-0">
      <div className="px-3 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Review guide</p>
        <p className="text-[10px] text-muted-foreground/90 leading-snug mt-1">
          Jump between title review sections.
        </p>
      </div>

      {STEPS.map((step, i) => {
        const isActive = activeId === step.id
        const Icon = step.icon

        return (
          <div key={step.id} className="flex gap-0">
            <div className="flex flex-col items-center w-8 shrink-0">
              <div className={cn("w-px flex-1 min-h-[6px]", i === 0 ? "bg-transparent" : "bg-border")} />
              <div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold transition-colors",
                  isActive && "border-primary bg-primary/10 text-primary",
                  !isActive && "border-border bg-muted/30 text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              <div
                className={cn(
                  "w-px flex-1 min-h-[6px]",
                  i === STEPS.length - 1 ? "bg-transparent" : "bg-border"
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
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              <p
                className={cn(
                  "text-[11px] leading-relaxed transition-colors pl-[22px]",
                  isActive ? "text-muted-foreground" : "text-muted-foreground/70"
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

"use client"

import { IconMailForward, IconFileCertificate, IconPackage } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { SectionHelp } from "@/components/section-help"

interface TitleActionsProps {
  titleId: string
  workflowCheckedCount: number
}

export function TitleActions({ titleId, workflowCheckedCount }: TitleActionsProps) {
  const stub = (label: string) => {
    toast.info(`${label} is not wired in this prototype (title ${titleId.slice(0, 8)}).`)
  }

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">Title actions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Workflow checklist: {workflowCheckedCount} section(s) marked complete.
          </p>
        </div>
        <SectionHelp label="About title actions">
          <p>
            Stubs for letter generation, lien release requests, and custody moves. Connect to your LOS or
            workflow engine when available.
          </p>
        </SectionHelp>
      </div>
      <div className="p-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => stub("Generate letter")}
        >
          <IconMailForward className="size-4" />
          Generate letter
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => stub("Request release")}
        >
          <IconFileCertificate className="size-4" />
          Request release
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => stub("Move custody")}
        >
          <IconPackage className="size-4" />
          Move custody
        </Button>
      </div>
    </div>
  )
}

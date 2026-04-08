"use client"

import { IconInfoCircle } from "@tabler/icons-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SectionHelpProps {
  children: React.ReactNode
  label?: string
}

export function SectionHelp({ children, label }: SectionHelpProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full size-8 min-w-[44px] min-h-[44px] -m-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          aria-label={label ?? "Help"}
        >
          <IconInfoCircle className="size-3.5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-80 text-xs leading-relaxed text-muted-foreground"
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

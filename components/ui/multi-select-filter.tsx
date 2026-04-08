"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconChevronDown, IconX } from "@tabler/icons-react"

interface MultiSelectFilterProps {
  label: string
  options: string[]
  selected: Set<string>
  onChange: (next: Set<string>) => void
  /** Optional: render a custom label for each option value */
  renderOption?: (value: string) => React.ReactNode
  className?: string
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  renderOption,
  className,
}: MultiSelectFilterProps) {
  const hasSelection = selected.size > 0

  function toggle(value: string) {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange(next)
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(new Set())
  }

  const triggerLabel = hasSelection
    ? selected.size === 1
      ? Array.from(selected)[0]
      : `${label}: ${selected.size}`
    : label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 text-xs gap-1 px-2.5 ${hasSelection ? "border-primary/50 bg-primary/5 text-foreground" : "text-muted-foreground"} ${className ?? ""}`}
        >
          <span className="max-w-[120px] truncate">{triggerLabel}</span>
          {hasSelection ? (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Clear ${label} filter`}
              className="ml-0.5 rounded-sm hover:bg-muted p-0.5 cursor-pointer"
              onClick={clear}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(new Set()) } }}
            >
              <IconX className="size-2.5" />
            </span>
          ) : (
            <IconChevronDown className="size-3 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto min-w-[160px]">
        {hasSelection && (
          <>
            <button
              className="w-full text-left px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => onChange(new Set())}
            >
              Clear selection
            </button>
            <DropdownMenuSeparator />
          </>
        )}
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt}
            checked={selected.has(opt)}
            onCheckedChange={() => toggle(opt)}
            className="text-xs"
          >
            {renderOption ? renderOption(opt) : opt}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

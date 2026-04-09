"use client"

import { useState, useCallback } from "react"
import { IconFileText, IconPrinter } from "@tabler/icons-react"
import { toast } from "sonner"

import type { TitleRow } from "@/lib/titles/types"
import { getFormsForState, type StateFormDefinition } from "@/lib/titles/state-forms-registry"
import { Button } from "@/components/ui/button"
import { SectionHelp } from "@/components/section-help"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TitleActionsProps {
  title: TitleRow
  workflowCheckedCount: number
}

function buildPrintHtml(form: StateFormDefinition, title: TitleRow): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${esc(form.formName)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; max-width: 720px; margin: 0 auto; color: #111; }
    h1 { font-size: 18px; margin-bottom: 8px; }
    .meta { font-size: 13px; color: #444; margin-bottom: 20px; }
    .box { border: 1px solid #ccc; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }
    .label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #666; margin-bottom: 4px; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>${esc(form.formName)}</h1>
  <div class="meta">
    Account: ${esc(title.account_number)} · VIN: ${esc(title.vin)} · State: ${esc(title.title_state || "—")}
    · ${esc(form.stateName)} (${esc(form.state)})
  </div>
  <p class="meta"><strong>${esc(form.team)}</strong> · ${esc(form.process)}</p>
  <div class="box">
    <div class="label">Notarized (column K)</div>
    <div>${esc(form.notarized)}</div>
  </div>
  <div class="box">
    <div class="label">Title required (column L)</div>
    <div>${esc(form.titleRequired)}</div>
  </div>
  <div class="box">
    <div class="label">Security agreement required (column M)</div>
    <div>${esc(form.securityAgreementRequired)}</div>
  </div>
  ${form.notes ? `<div class="box"><div class="label">Notes (column N)</div><div>${esc(form.notes)}</div></div>` : ""}
  <p style="font-size:12px;color:#666;margin-top:24px;">
    Placeholder printout — replace with merged PDF from your forms engine. Textract fields from Step 3 can auto-fill final PDFs.
  </p>
</body>
</html>`
}

export function TitleActions({ title, workflowCheckedCount }: TitleActionsProps) {
  const forms = getFormsForState(title.title_state)
  const [activeForm, setActiveForm] = useState<StateFormDefinition | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openGenerated = useCallback((form: StateFormDefinition) => {
    setActiveForm(form)
    setDialogOpen(true)
  }, [])

  const printForm = useCallback(
    (form: StateFormDefinition) => {
      const w = window.open("", "_blank", "width=800,height=900")
      if (!w) {
        toast.error("Allow pop-ups to print.")
        return
      }
      w.document.write(buildPrintHtml(form, title))
      w.document.close()
      w.focus()
      setTimeout(() => {
        w.print()
      }, 250)
    },
    [title]
  )

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">Actions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Workflow checklist: {workflowCheckedCount} section(s) marked complete. Forms below match title state (
            {title.title_state || "—"}) from the master workbook.
          </p>
        </div>
        <SectionHelp label="About actions">
          <p>
            DMV forms are filtered by state (workbook column C). When you generate, review Notarized, Title required,
            and Security agreement (columns K–M) and notes (column N).
          </p>
        </SectionHelp>
      </div>

      <div className="p-4 space-y-3">
        {forms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No forms are listed for state <strong className="text-foreground">{title.title_state || "—"}</strong>
            . Re-run <code className="text-xs">npm run import:forms</code> after updating{" "}
            <code className="text-xs">data/Titles Forms and Letters.xlsx</code>.
          </p>
        ) : (
          <ul className="space-y-2">
            {forms.map((form) => (
              <li
                key={form.id}
                className="flex flex-wrap items-center gap-2 justify-between rounded-lg border border-border px-3 py-2.5 bg-muted/20"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconFileText className="size-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium block truncate">{form.formName}</span>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {form.process}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openGenerated(form)}>
                    Generate
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => printForm(form)}
                  >
                    <IconPrinter className="size-3.5" />
                    Print
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Form package ready</DialogTitle>
            <DialogDescription>
              {activeForm?.formName} — review workbook columns K–M before sending to DMV or the customer.
            </DialogDescription>
          </DialogHeader>
          {activeForm && (
            <ScrollArea className="max-h-[min(360px,50vh)] pr-2">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                    Notarized (K)
                  </p>
                  <p className="text-foreground">{activeForm.notarized}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                    Title required (L)
                  </p>
                  <p className="text-foreground">{activeForm.titleRequired}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                    Security agreement required (M)
                  </p>
                  <p className="text-foreground">{activeForm.securityAgreementRequired}</p>
                </div>
                {activeForm.notes ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                      Notes (N)
                    </p>
                    <p className="text-foreground">{activeForm.notes}</p>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            {activeForm && (
              <Button type="button" className="gap-2" onClick={() => printForm(activeForm)}>
                <IconPrinter className="size-4" />
                Print
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

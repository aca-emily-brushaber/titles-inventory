"use client"

import { useCallback } from "react"
import { IconFileText, IconPrinter } from "@tabler/icons-react"
import { toast } from "sonner"

import type { TitleRow } from "@/lib/titles/types"
import { getFormsForState, type StateFormDefinition } from "@/lib/titles/state-forms-registry"
import { Button } from "@/components/ui/button"
import { SectionHelp } from "@/components/section-help"

interface TitleActionsProps {
  title: TitleRow
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
    <div class="label">Notarized</div>
    <div>${esc(form.notarized)}</div>
  </div>
  <div class="box">
    <div class="label">Title required</div>
    <div>${esc(form.titleRequired)}</div>
  </div>
  <div class="box">
    <div class="label">Security agreement required</div>
    <div>${esc(form.securityAgreementRequired)}</div>
  </div>
  ${form.notes ? `<div class="box"><div class="label">Notes</div><div>${esc(form.notes)}</div></div>` : ""}
  <p style="font-size:12px;color:#666;margin-top:24px;">
    Placeholder printout — replace with merged PDF from your forms engine. Textract fields from Step 3 can auto-fill final PDFs.
  </p>
</body>
</html>`
}

/**
 * State-level document requirements (same for all forms in this state in the workbook).
 * Uses the first form row for the state as the source for K/L/M.
 */
function DocumentRequirementsTable({ forms }: { forms: StateFormDefinition[] }) {
  if (forms.length === 0) return null
  const s = forms[0]

  return (
    <div className="rounded-lg border border-border/80 bg-background/40 overflow-hidden">
      <p className="text-xs font-semibold text-foreground text-center py-2 px-2 border-b border-border/60 bg-muted/25">
        Document Requirements
      </p>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-center text-xs">
          <colgroup>
            <col className="w-1/3" />
            <col className="w-1/3" />
            <col className="w-1/3" />
          </colgroup>
          <thead>
            <tr className="border-b border-border/60 bg-muted/15">
              <th className="w-1/3 py-2.5 px-3 font-semibold text-[10px] uppercase tracking-wide text-muted-foreground">
                Notarized
              </th>
              <th className="w-1/3 py-2.5 px-3 font-semibold text-[10px] uppercase tracking-wide text-muted-foreground">
                Title required
              </th>
              <th className="w-1/3 py-2.5 px-3 font-semibold text-[10px] uppercase tracking-wide text-muted-foreground">
                Security agreement
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="w-1/3 py-2.5 px-3 align-middle">{s.notarized}</td>
              <td className="w-1/3 py-2.5 px-3 align-middle">{s.titleRequired}</td>
              <td className="w-1/3 py-2.5 px-3 align-middle">{s.securityAgreementRequired}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TitleActions({ title }: TitleActionsProps) {
  const forms = getFormsForState(title.title_state)

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
          <p className="text-xs text-muted-foreground mt-0.5">State-specific forms and letters</p>
        </div>
        <SectionHelp label="About actions">
          <p>
            DMV forms are filtered by title state. Each form has a Print action; document requirements apply to the
            state and are shown once below the form list.
          </p>
        </SectionHelp>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        {forms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No forms are listed for state <strong className="text-foreground">{title.title_state || "—"}</strong>
            . Re-run <code className="text-xs">npm run import:forms</code> after updating{" "}
            <code className="text-xs">data/Titles Forms and Letters.xlsx</code>.
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {forms.map((form) => (
                <li
                  key={form.id}
                  className="rounded-lg border border-border bg-muted/15 px-3 py-2.5 sm:px-3.5 sm:py-3"
                >
                  <div className="flex flex-wrap items-start gap-2 justify-between gap-y-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <IconFileText className="size-4 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-foreground block">{form.formName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {form.team} · {form.process}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="gap-1.5 shrink-0"
                      onClick={() => printForm(form)}
                    >
                      <IconPrinter className="size-3.5" />
                      Print
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <DocumentRequirementsTable forms={forms} />
          </>
        )}
      </div>
    </div>
  )
}

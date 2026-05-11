"use client"

import { useCallback, useState, useEffect } from "react"
import { IconTruck } from "@tabler/icons-react"
import { toast } from "sonner"

import { updateTitleShipping } from "@/lib/services/title.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionHelp } from "@/components/section-help"

interface TitleShippingEditorProps {
  titleId: string
  initialLabel: string | null
  initialLocation: string | null
  onSaved?: () => void | Promise<void>
}

export function TitleShippingEditor({
  titleId,
  initialLabel,
  initialLocation,
  onSaved,
}: TitleShippingEditorProps) {
  const [labelDraft, setLabelDraft] = useState(initialLabel?.trim() ?? "")
  const [locationDraft, setLocationDraft] = useState(initialLocation?.trim() ?? "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLabelDraft(initialLabel?.trim() ?? "")
  }, [initialLabel])

  useEffect(() => {
    setLocationDraft(initialLocation?.trim() ?? "")
  }, [initialLocation])

  const handleSave = useCallback(async () => {
    const labelTrim = labelDraft.trim()
    const locTrim = locationDraft.trim()
    const shipping_label = labelTrim === "" ? null : labelTrim
    const shipping_location = locTrim === "" ? null : locTrim
    setSaving(true)
    try {
      await updateTitleShipping(titleId, { shipping_label, shipping_location })
      setLabelDraft(shipping_label ?? "")
      setLocationDraft(shipping_location ?? "")
      await onSaved?.()
      toast.info(
        shipping_label || shipping_location ? "Shipping details saved" : "Shipping details cleared"
      )
    } catch {
      toast.error("Could not save shipping details")
    } finally {
      setSaving(false)
    }
  }, [labelDraft, locationDraft, onSaved, titleId])

  return (
    <div className="glass-card rounded-lg overflow-hidden border border-border/80">
      <div className="px-3 py-2 border-b border-border flex items-start gap-2">
        <IconTruck className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground leading-tight">Shipping</h2>
            <SectionHelp label="When to use this">
              <p className="text-xs">
                Record tracking or label ID and where the title was sent from when the physical title ships. Saving
                adds a <strong>Title shipped</strong> milestone to History (first save sets the timestamp; clearing both
                fields removes it).
              </p>
            </SectionHelp>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
            Save with both fields empty to clear shipping and remove the timeline entry.
          </p>
        </div>
      </div>
      <div className="px-3 py-3 flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="shipping-label" className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Tracking / label #
            </Label>
            <Input
              id="shipping-label"
              className="font-mono text-xs h-9 bg-background"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="shipping-location" className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Shipping location
            </Label>
            <Input
              id="shipping-location"
              className="text-xs h-9 bg-background"
              value={locationDraft}
              onChange={(e) => setLocationDraft(e.target.value)}
              placeholder="e.g. FedEx — Chicago hub"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" size="sm" className="h-9" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}

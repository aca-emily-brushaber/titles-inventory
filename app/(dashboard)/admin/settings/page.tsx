"use client"

import { useState, useEffect, useCallback } from "react"
import {
  IconClock,
  IconBell,
  IconUserPlus,
  IconInfoCircle,
  IconDeviceFloppy,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { getSettings, saveSettings } from "@/lib/services/settings.service"
import { getCurrentUser } from "@/lib/services/user.service"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [slaDays, setSlaDays] = useState(30)
  const [notifyNewTitle, setNotifyNewTitle] = useState(true)
  const [notifyEscalation, setNotifyEscalation] = useState(true)
  const [notifySlaBreach, setNotifySlaBreach] = useState(true)
  const [autoAssign, setAutoAssign] = useState(false)
  const [maxPerAnalyst, setMaxPerAnalyst] = useState(15)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const s = await getSettings()
      setSlaDays(s.sla_days)
      setAutoAssign(s.auto_assign_enabled)
      setMaxPerAnalyst(s.max_titles_per_analyst)
      setNotifyNewTitle(s.notify_on_new_title)
      setNotifyEscalation(s.notify_on_escalation)
      setNotifySlaBreach(s.notify_on_sla_breach)
    } catch {
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  async function handleSave() {
    setSaving(true)
    try {
      const user = await getCurrentUser()
      await saveSettings(
        {
          sla_days: slaDays,
          auto_assign_enabled: autoAssign,
          max_titles_per_analyst: maxPerAnalyst,
          notify_on_new_title: notifyNewTitle,
          notify_on_escalation: notifyEscalation,
          notify_on_sla_breach: notifySlaBreach,
        },
        user?.id
      )
      toast.success("Settings saved", {
        description: "Application settings have been updated.",
      })
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 px-4 py-6 lg:px-6">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure application preferences and thresholds
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconClock className="size-5 text-primary" />
              <CardTitle>SLA Configuration</CardTitle>
            </div>
            <CardDescription>Set title processing time targets</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sla-days">Title SLA (days)</Label>
              <Input
                id="sla-days"
                type="number"
                min={1}
                max={90}
                value={slaDays}
                onChange={(e) => setSlaDays(Number(e.target.value))}
                className="max-w-[200px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconBell className="size-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive alerts and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-new">Notify on new title files</Label>
              <Switch
                id="notify-new"
                checked={notifyNewTitle}
                onCheckedChange={setNotifyNewTitle}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-escalation">Notify on escalation</Label>
              <Switch
                id="notify-escalation"
                checked={notifyEscalation}
                onCheckedChange={setNotifyEscalation}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-sla">Notify on SLA breach</Label>
              <Switch
                id="notify-sla"
                checked={notifySlaBreach}
                onCheckedChange={setNotifySlaBreach}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconUserPlus className="size-5 text-primary" />
              <CardTitle>Auto-Assignment</CardTitle>
            </div>
            <CardDescription>Automatically distribute incoming title files to analysts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-assign">Enable auto-assignment</Label>
              <Switch
                id="auto-assign"
                checked={autoAssign}
                onCheckedChange={setAutoAssign}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="max-per-analyst">Max title files per analyst</Label>
              <Input
                id="max-per-analyst"
                type="number"
                min={1}
                max={50}
                value={maxPerAnalyst}
                onChange={(e) => setMaxPerAnalyst(Number(e.target.value))}
                className="max-w-[200px]"
                disabled={!autoAssign}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconInfoCircle className="size-5 text-primary" />
              <CardTitle>System Info</CardTitle>
            </div>
            <CardDescription>
              Application version and connection details
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">App Version</span>
              <span className="font-medium">0.1.0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-medium">Next.js 16</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Data Provider</span>
              <span className="flex items-center gap-1.5 font-medium text-status-green">
                <span className="inline-block size-2 rounded-full bg-status-green" />
                Mock (UI-Only)
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-medium">
                {process.env.NODE_ENV === "production"
                  ? "Production"
                  : "Development"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Button onClick={handleSave} disabled={saving}>
          <IconDeviceFloppy className="size-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

import { getProvider } from '@/lib/data-provider'

export interface AppSettings {
  sla_days: number
  auto_assign_enabled: boolean
  max_titles_per_analyst: number
  notify_on_new_title: boolean
  notify_on_escalation: boolean
  notify_on_sla_breach: boolean
}

export async function getSettings(): Promise<AppSettings> {
  return getProvider().settings.get()
}

export async function saveSettings(
  settings: Partial<AppSettings>,
  userId?: string
): Promise<void> {
  return getProvider().settings.save(settings, userId)
}

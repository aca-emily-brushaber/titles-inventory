import type { NotificationRow, SyncLogRow, UserRow } from '../data-provider'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export const mockUsers: UserRow[] = [
  { id: 'u-001', name: 'Jane Cooper', email: 'jane.cooper@acacceptance.com', role: 'Manager', avatar_initials: 'JC', created_at: '2025-01-15T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
  { id: 'u-002', name: 'Robert Smith', email: 'robert.smith@acacceptance.com', role: 'Lead', avatar_initials: 'RS', created_at: '2025-02-01T00:00:00Z', updated_at: '2025-02-01T00:00:00Z' },
  { id: 'u-003', name: 'Maria Garcia', email: 'maria.garcia@acacceptance.com', role: 'Manager', avatar_initials: 'MG', created_at: '2025-03-10T00:00:00Z', updated_at: '2025-03-10T00:00:00Z' },
  { id: 'u-004', name: 'David Kim', email: 'david.kim@acacceptance.com', role: 'Analyst', avatar_initials: 'DK', created_at: '2025-04-05T00:00:00Z', updated_at: '2025-04-05T00:00:00Z' },
  { id: 'u-005', name: 'Sarah Johnson', email: 'sarah.johnson@acacceptance.com', role: 'Analyst', avatar_initials: 'SJ', created_at: '2025-05-20T00:00:00Z', updated_at: '2025-05-20T00:00:00Z' },
  { id: 'u-006', name: 'Michael Brown', email: 'michael.brown@acacceptance.com', role: 'Analyst', avatar_initials: 'MB', created_at: '2025-06-01T00:00:00Z', updated_at: '2025-06-01T00:00:00Z' },
]

export const mockNotifications: NotificationRow[] = [
  { id: 1, user_id: 'u-003', message: 'New title file assigned to you', icon: 'pi pi-inbox', read: false, created_at: daysAgo(1) + 'T08:00:00Z' },
  { id: 2, user_id: 'u-003', message: 'SLA warning: title due soon', icon: 'pi pi-clock', read: false, created_at: daysAgo(2) + 'T09:00:00Z' },
  { id: 3, user_id: 'u-003', message: 'Title file completed', icon: 'pi pi-check-circle', read: true, created_at: daysAgo(25) + 'T15:00:00Z' },
]

export const mockSyncLogs: SyncLogRow[] = [
  { id: 1, integration: 'onbase', event_type: 'document_fetched', payload: { account_number: '90124625401', documents_found: 1 }, status: 'success', error_message: null, created_at: daysAgo(5) + 'T10:00:00Z' },
  { id: 2, integration: 'onbase', event_type: 'poll_completed', payload: { since: daysAgo(4), total_fetched: 2 }, status: 'success', error_message: null, created_at: daysAgo(3) + 'T12:00:00Z' },
]

/** In-memory activity rows before mapping to dashboard feed items */
export const mockActivityFeed: Array<{
  id: number
  analyst_id: string | null
  analyst_name: string
  action: string
  record_id: string | null
  created_at: string
}> = [
  { id: 1, analyst_id: 'u-003', analyst_name: 'Maria Garcia', action: 'Opened title file for review', record_id: null, created_at: daysAgo(1) + 'T14:30:00Z' },
  { id: 2, analyst_id: 'u-004', analyst_name: 'David Kim', action: 'Updated assignment group', record_id: null, created_at: daysAgo(2) + 'T16:45:00Z' },
  { id: 3, analyst_id: null, analyst_name: 'System', action: 'Imported title batch from report', record_id: null, created_at: daysAgo(3) + 'T15:25:00Z' },
]

export function getWeekStart(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  const utcDay = d.getUTCDay()
  const diff = d.getUTCDate() - utcDay + (utcDay === 0 ? -6 : 1)
  d.setUTCDate(diff)
  return d.toISOString().slice(0, 10)
}

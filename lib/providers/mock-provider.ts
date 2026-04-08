import type { DataProvider, AuthUser, AssignmentGroup } from '../data-provider'
import { DEFAULT_ASSIGNMENT_STATUS } from '../titles/assignment-groups'
import type { AppSettings } from '../services/settings.service'
import type { DashboardKPI, RiskDistribution, VolumeDataPoint, ActivityFeedItem } from '../services/dashboard.service'
import type { TeamMember } from '../services/user.service'
import { mockUsers, mockNotifications, mockSyncLogs, mockActivityFeed, getWeekStart } from './mock-data'
import {
  mockTitles,
  mockTitleTransfers,
  mockTitleComments,
  mockTitleDocuments,
} from './title-mock-data'
import type { TitleRow } from '../titles/types'

let users = [...mockUsers]
let notifications = [...mockNotifications]
let activityFeed = [...mockActivityFeed]

let titles = [...mockTitles]
let titleTransfers = [...mockTitleTransfers]
let titleComments = [...mockTitleComments]
let titleDocuments = [...mockTitleDocuments]

const defaultSettings: AppSettings = {
  sla_days: 30,
  auto_assign_enabled: false,
  max_titles_per_analyst: 15,
  notify_on_new_title: true,
  notify_on_escalation: true,
  notify_on_sla_breach: true,
}

let settings = { ...defaultSettings }

const MOCK_CURRENT_USER: AuthUser = {
  id: 'u-003',
  name: 'Maria Garcia',
  email: 'maria.garcia@acacceptance.com',
  role: 'Manager',
  avatar_initials: 'MG',
}

function titleDateKey(t: TitleRow): string {
  return t.created_at.slice(0, 10)
}

export const mockProvider: DataProvider = {
  titles: {
    async getAll() {
      return titles
    },
    async getById(id: string) {
      return titles.find((t) => t.id === id) ?? null
    },
    async assign(titleId: string, analystName: string | null) {
      titles = titles.map((t) =>
        t.id === titleId ? { ...t, assigned_to: analystName, updated_at: new Date().toISOString() } : t
      )
    },
    async assignBulk(titleIds: string[], analystName: string | null) {
      titles = titles.map((t) =>
        titleIds.includes(t.id) ? { ...t, assigned_to: analystName, updated_at: new Date().toISOString() } : t
      )
    },
    async lock(titleId: string) {
      titles = titles.map((t) =>
        t.id === titleId
          ? { ...t, locked_by: MOCK_CURRENT_USER.name, locked_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          : t
      )
    },
    async unlock(titleId: string) {
      titles = titles.map((t) =>
        t.id === titleId ? { ...t, locked_by: null, locked_at: null, updated_at: new Date().toISOString() } : t
      )
    },
    async getByAssignmentGroup(group: AssignmentGroup) {
      return titles.filter((t) => t.assignment_group === group)
    },
    async updateAssignmentGroup(titleId: string, group: AssignmentGroup) {
      const status = DEFAULT_ASSIGNMENT_STATUS[group]
      titles = titles.map((t) =>
        t.id === titleId
          ? { ...t, assignment_group: group, assignment_status: status, updated_at: new Date().toISOString() }
          : t
      )
    },
    async getComments(titleId: string) {
      return titleComments
        .filter((c) => c.title_id === titleId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    },
    async addComment(titleId: string, text: string, author: string) {
      titleComments.push({
        id: `tc-${Date.now()}`,
        title_id: titleId,
        author,
        text,
        timestamp: new Date().toISOString(),
      })
    },
    async getDocuments(titleId: string) {
      return titleDocuments.filter((d) => d.dispute_id === titleId)
    },
    async getTransfers(titleId: string) {
      return titleTransfers
        .filter((tr) => tr.title_id === titleId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    },
    async createTransfer(transfer) {
      const toStatus = DEFAULT_ASSIGNMENT_STATUS[transfer.toGroup]
      titleTransfers.push({
        id: `tt-${Date.now()}`,
        title_id: transfer.titleId,
        from_group: transfer.fromGroup,
        to_group: transfer.toGroup,
        transferred_by: transfer.transferredBy,
        reason: transfer.reason,
        created_at: new Date().toISOString(),
      })
      titles = titles.map((t) =>
        t.id === transfer.titleId
          ? {
              ...t,
              assignment_group: transfer.toGroup,
              assignment_status: toStatus,
              updated_at: new Date().toISOString(),
            }
          : t
      )
    },
  },

  auth: {
    async getCurrentUser() {
      return MOCK_CURRENT_USER
    },
    async signIn(_email: string, _password: string) {
      return { user: MOCK_CURRENT_USER, error: null }
    },
    async signOut() {
      // no-op in mock
    },
  },

  dashboard: {
    async getKPIs(): Promise<DashboardKPI[]> {
      const open = titles.filter((t) => t.status !== 'Completed').length
      const completed = titles.filter((t) => t.status === 'Completed').length
      const assigned = titles.filter((t) => t.assigned_to).length
      const hold = titles.filter((t) => t.status === 'Hold').length
      return [
        { label: 'Title files (open)', value: open, icon: 'pi pi-inbox', trend: `${assigned} assigned`, trendDirection: 'up' },
        { label: 'Completed', value: completed, icon: 'pi pi-check-circle', trend: 'In mock data', trendDirection: 'up' },
        { label: 'Avg. client age (days)', value: Math.round(titles.reduce((s, t) => s + (t.client_age ?? 0), 0) / Math.max(titles.length, 1)), icon: 'pi pi-clock', trend: `${hold} on hold`, trendDirection: 'down' },
        { label: 'In progress', value: titles.filter((t) => t.status === 'In Progress').length, icon: 'pi pi-hourglass', trend: 'Across all groups', trendDirection: 'down' },
      ]
    },

    async getRiskDistribution(): Promise<RiskDistribution> {
      return {
        high: titles.filter((t) => t.status === 'Hold').length,
        medium: titles.filter((t) => t.status === 'In Progress').length,
        low: titles.filter((t) => t.status === 'Pending' || t.status === 'Completed').length,
      }
    },

    async getVolumeData(): Promise<VolumeDataPoint[]> {
      const weekMap = new Map<string, { received: number; completed: number }>()
      for (const t of titles) {
        const weekKey = getWeekStart(titleDateKey(t))
        if (!weekMap.has(weekKey)) weekMap.set(weekKey, { received: 0, completed: 0 })
        weekMap.get(weekKey)!.received++
        if (t.status === 'Completed') {
          const cWeek = getWeekStart(t.updated_at.slice(0, 10))
          if (!weekMap.has(cWeek)) weekMap.set(cWeek, { received: 0, completed: 0 })
          weekMap.get(cWeek)!.completed++
        }
      }
      return Array.from(weekMap.entries())
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-6)
    },

    async getActivityFeed(): Promise<ActivityFeedItem[]> {
      return activityFeed
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 20)
        .map((row) => ({
          id: 'a' + row.id,
          analyst: row.analyst_name,
          action: row.action,
          recordId: row.record_id ?? '',
          timestamp: new Date(row.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }))
    },

    async logActivity(_analystId: string, analystName: string, action: string, recordId?: string) {
      activityFeed.push({
        id: Date.now(),
        analyst_id: _analystId,
        analyst_name: analystName,
        action,
        record_id: recordId ?? null,
        created_at: new Date().toISOString(),
      })
    },
  },

  users: {
    async getAll() {
      return users
    },
    async getAnalysts() {
      return users.filter((u) => u.role === 'Analyst')
    },
    async getTeamMembers(_period?: string): Promise<TeamMember[]> {
      return users.map((u) => {
        const assigned = titles.filter((t) => t.assigned_to === u.name)
        const resolved = assigned.filter((t) => t.status === 'Completed')
        return {
          id: u.id,
          name: u.name,
          role: u.role,
          titlesAssigned: assigned.length,
          titlesCompleted: resolved.length,
          titlesInProgress: assigned.length - resolved.length,
          avgTimePerTitle: assigned.length > 0 ? `${Math.round((resolved.length / assigned.length) * 100)}%` : '0%',
        }
      })
    },
    async create(user) {
      const id = `u-${Date.now()}`
      const initials = user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2)
      users.push({
        id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_initials: initials,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    },
    async update(userId, user) {
      const initials = user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2)
      users = users.map((u) =>
        u.id === userId
          ? { ...u, name: user.name, email: user.email, role: user.role, avatar_initials: initials, updated_at: new Date().toISOString() }
          : u
      )
    },
    async delete(userId) {
      const target = users.find((u) => u.id === userId)
      if (!target) return { error: 'User not found' }
      const activeCount = titles.filter((t) => t.assigned_to === target.name && t.status !== 'Completed').length
      if (activeCount > 0) {
        return { error: `${target.name} has ${activeCount} active title file(s). Reassign them first.` }
      }
      users = users.filter((u) => u.id !== userId)
      return { error: null }
    },
    async emailExists(email, excludeUserId?) {
      return users.some((u) => u.email === email && u.id !== excludeUserId)
    },
  },

  notifications: {
    async getByUserId(userId: string) {
      return notifications
        .filter((n) => n.user_id === userId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    },
    async markAsRead(notificationId: number) {
      notifications = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    },
    async markAllAsRead(userId: string) {
      notifications = notifications.map((n) => (n.user_id === userId ? { ...n, read: true } : n))
    },
  },

  settings: {
    async get() {
      return settings
    },
    async save(partial) {
      settings = { ...settings, ...partial }
    },
  },

  integrations: {
    async getSyncLog(integration?, limit = 50) {
      let result = [...mockSyncLogs]
      if (integration) result = result.filter((l) => l.integration === integration)
      return result.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit)
    },
    async triggerEoscarSync() {
      return { total_fetched: 0, created: 0, skipped: 0, failed: 0 }
    },
    async fetchOnBaseDocuments(_accountNumber, _titleId?) {
      return { imported: [], skipped: 0, message: 'Mock: No new documents found in OnBase' }
    },
  },

  realtime: {
    subscribeToTitles(_callbacks) {
      return () => {}
    },
  },
}

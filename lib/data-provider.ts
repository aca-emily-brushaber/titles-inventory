import type { Database } from './database.types'
import type { DashboardKPI, RiskDistribution, VolumeDataPoint, ActivityFeedItem } from './services/dashboard.service'
import type { TeamMember } from './services/user.service'
import type { AppSettings } from './services/settings.service'
import type { OnBaseImportResult } from './services/integration.service'
import type { TitleRow, TitleTransferRow, TitleCommentRow } from './titles/types'
import type { AssignmentGroup } from './titles/assignment-groups'

export type { TitleRow, TitleTransferRow, TitleCommentRow }
export type { AssignmentGroup }

export type UserRow = Database['public']['Tables']['users']['Row']
export type DocumentRow = Database['public']['Tables']['documents']['Row']
export type NotificationRow = Database['public']['Tables']['notifications']['Row']
export type SyncLogRow = Database['public']['Tables']['integration_sync_log']['Row']

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRow['role']
  avatar_initials: string
}

export interface DataProvider {
  auth: {
    getCurrentUser(): Promise<AuthUser | null>
    signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }>
    signOut(): Promise<void>
  }

  titles: {
    getAll(): Promise<TitleRow[]>
    getById(id: string): Promise<TitleRow | null>
    assign(titleId: string, analystName: string | null): Promise<void>
    assignBulk(titleIds: string[], analystName: string | null): Promise<void>
    lock(titleId: string): Promise<void>
    unlock(titleId: string): Promise<void>
    getByAssignmentGroup(group: AssignmentGroup): Promise<TitleRow[]>
    updateAssignmentGroup(titleId: string, group: AssignmentGroup): Promise<void>
    getComments(titleId: string): Promise<TitleCommentRow[]>
    addComment(titleId: string, text: string, author: string): Promise<void>
    getDocuments(titleId: string): Promise<DocumentRow[]>
    getTransfers(titleId: string): Promise<TitleTransferRow[]>
    createTransfer(transfer: {
      titleId: string
      fromGroup: AssignmentGroup
      toGroup: AssignmentGroup
      transferredBy: string
      reason: string
    }): Promise<void>
  }

  dashboard: {
    getKPIs(): Promise<DashboardKPI[]>
    getRiskDistribution(): Promise<RiskDistribution>
    getVolumeData(): Promise<VolumeDataPoint[]>
    getActivityFeed(): Promise<ActivityFeedItem[]>
    logActivity(analystId: string, analystName: string, action: string, recordId?: string): Promise<void>
  }

  users: {
    getAll(): Promise<UserRow[]>
    getAnalysts(): Promise<UserRow[]>
    getTeamMembers(period?: string): Promise<TeamMember[]>
    create(user: { name: string; email: string; role: UserRow['role'] }): Promise<void>
    update(userId: string, user: { name: string; email: string; role: UserRow['role'] }): Promise<void>
    delete(userId: string): Promise<{ error: string | null }>
    emailExists(email: string, excludeUserId?: string): Promise<boolean>
  }

  notifications: {
    getByUserId(userId: string): Promise<NotificationRow[]>
    markAsRead(notificationId: number): Promise<void>
    markAllAsRead(userId: string): Promise<void>
  }

  settings: {
    get(): Promise<AppSettings>
    save(settings: Partial<AppSettings>, userId?: string): Promise<void>
  }

  integrations: {
    getSyncLog(integration?: string, limit?: number): Promise<SyncLogRow[]>
    triggerEoscarSync(): Promise<{ total_fetched: number; created: number; skipped: number; failed: number }>
    fetchOnBaseDocuments(accountNumber: string, titleId?: string): Promise<OnBaseImportResult>
  }

  realtime: {
    subscribeToTitles(callbacks: {
      onInsert?: (title: TitleRow) => void
      onUpdate?: (title: TitleRow) => void
      onDelete?: (id: string) => void
    }): () => void
  }
}

let _provider: DataProvider | null = null

export function setProvider(provider: DataProvider): void {
  _provider = provider
}

export function getProvider(): DataProvider {
  if (!_provider) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./providers/init')
  }
  return _provider!
}

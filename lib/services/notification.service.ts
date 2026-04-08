import { getProvider } from '@/lib/data-provider'
import type { Database } from '@/lib/database.types'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

export async function getNotifications(userId: string): Promise<NotificationRow[]> {
  return getProvider().notifications.getByUserId(userId)
}

export async function markAsRead(notificationId: number): Promise<void> {
  return getProvider().notifications.markAsRead(notificationId)
}

export async function markAllAsRead(userId: string): Promise<void> {
  return getProvider().notifications.markAllAsRead(userId)
}

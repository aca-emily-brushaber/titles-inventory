import { getProvider } from '@/lib/data-provider'
import type { Database } from '@/lib/database.types'

type SyncLogRow = Database['public']['Tables']['integration_sync_log']['Row']

export interface OnBaseImportResult {
  imported: Array<{ id: string; label: string; onbase_document_id: string }>
  skipped: number
  message?: string
}

export async function fetchOnBaseDocuments(
  accountNumber: string,
  titleId?: string
): Promise<OnBaseImportResult> {
  return getProvider().integrations.fetchOnBaseDocuments(accountNumber, titleId)
}

export async function triggerEoscarSync(): Promise<{
  total_fetched: number
  created: number
  skipped: number
  failed: number
}> {
  return getProvider().integrations.triggerEoscarSync()
}

export async function getSyncLog(
  integration?: string,
  limit: number = 50
): Promise<SyncLogRow[]> {
  return getProvider().integrations.getSyncLog(integration, limit)
}

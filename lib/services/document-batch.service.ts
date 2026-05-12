import { getProvider } from "@/lib/data-provider"
import type {
  DocumentBatchItemRow,
  DocumentBatchRow,
  DocumentBatchWorkItem,
} from "@/lib/titles/batch-types"

export async function listDocumentBatches(): Promise<DocumentBatchRow[]> {
  return getProvider().documentBatches.listBatches()
}

export async function getDocumentBatch(
  batchId: string
): Promise<{ batch: DocumentBatchRow; items: DocumentBatchItemRow[] } | null> {
  return getProvider().documentBatches.getBatch(batchId)
}

export async function getDocumentBatchWorkItemsOrdered(
  batchId: string
): Promise<DocumentBatchWorkItem[]> {
  return getProvider().documentBatches.getBatchWorkItemsOrdered(batchId)
}

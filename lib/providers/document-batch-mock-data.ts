/**
 * Document batch seed from `lib/generated/document-batches-seed.json`.
 */
import type { DocumentBatchItemRow, DocumentBatchRow } from "../titles/batch-types"

import batchSeed from "../generated/document-batches-seed.json"

export const mockDocumentBatches: DocumentBatchRow[] = batchSeed.batches as DocumentBatchRow[]
export const mockDocumentBatchItems: DocumentBatchItemRow[] = batchSeed.items as DocumentBatchItemRow[]

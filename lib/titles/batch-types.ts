/**
 * Physical document scan batches: ordered title membership for associate work queues.
 */

import type { TitleRow } from "./types"

export interface DocumentBatchRow {
  id: string
  /** Label from scanner / batch sheet (unique in production; mock may repeat for samples) */
  external_batch_id: string
  created_at: string
  name?: string | null
  scanned_at?: string | null
}

export interface DocumentBatchItemRow {
  batch_id: string
  title_id: string
  /** 1-based scan order within the batch */
  sequence: number
}

/** One slot in the batch work queue; `title` null when id not in inventory */
export interface DocumentBatchWorkItem {
  sequence: number
  title_id: string
  title: TitleRow | null
}

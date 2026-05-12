# Backend Integration Guide

This document describes how to connect the Titles Inventory UI to a real backend by implementing the `DataProvider` interface.

## Architecture Overview

The UI is decoupled from any specific backend. All data access flows through `DataProvider` in `lib/data-provider.ts`. The application ships with a mock provider (`lib/providers/mock-provider.ts`) that supplies in-memory title seed data and document batch seed data.

The **titles** namespace (`titles.getAll`, `titles.getById`, comments, documents, transfers, `getByAssignmentGroup`, `updateAssignmentGroup`, `createTransfer` with `fromGroup`/`toGroup` as `AssignmentGroup`) backs the title queue and `/title/[id]` detail pages. Implement these methods when connecting to a real titles service or database. See `documentation/EXCEL_COLUMN_MAPPING.md` for the RepoTitle CSV column map, assignment group rules, and **repossessions repo queue** derivation (`lib/titles/repo-queues.ts`).

The **documentBatches** namespace backs `/batches`, `/batches/[batchId]`, and batch work mode on `/queue?system=batch&batch=…`. Types live in `lib/titles/batch-types.ts`. Mock batch definitions and ordered membership are in `lib/generated/document-batches-seed.json` (`lib/providers/document-batch-mock-data.ts`).

```
UI Components / Pages
        |
        v
  Service Layer (lib/services/*.service.ts)
        |
        v
  DataProvider Interface (lib/data-provider.ts)
        |
        v
  Provider Implementation
    - MockProvider (default, in-memory)
    - YourProvider (implement to connect your backend)
```

## Implementing a Custom Provider

### Step 1: Create Your Provider

Create a new file (for example, `lib/providers/your-provider.ts`) that implements the `DataProvider` interface:

```typescript
import type { DataProvider } from '../data-provider'

export const yourProvider: DataProvider = {
  auth: { /* ... */ },
  titles: {
    async getAll() {
      // Fetch from your API or database
    },
    // ... implement all titles methods
  },
  documentBatches: {
    async listBatches() {
      /* return DocumentBatchRow[], e.g. newest first */
    },
    async getBatch(batchId: string) {
      /* return { batch, items } or null; items sorted by sequence ascending */
    },
    async getBatchWorkItemsOrdered(batchId: string) {
      /* join batch items to titles by title_id; return DocumentBatchWorkItem[] in sequence order;
         use title: null when id missing from inventory */
    },
  },
  dashboard: { /* ... */ },
  users: { /* ... */ },
  notifications: { /* ... */ },
  settings: { /* ... */ },
  integrations: { /* ... */ },
  realtime: { /* ... */ },
}
```

### Step 2: Register Your Provider

Update `lib/providers/init.ts` to use your provider instead of the mock:

```typescript
import { setProvider } from '../data-provider'
import { yourProvider } from './your-provider'

let initialized = false

export function initializeProvider(): void {
  if (initialized) return
  setProvider(yourProvider)
  initialized = true
}

initializeProvider()
```

### Step 3: Update Request Proxy (if using real auth)

The request proxy in `proxy.ts` currently passes all matching requests through without an auth gate. Replace it with your authentication logic (JWT validation, session checks, etc.) when the backend integration requires protected routes.

## DataProvider Interface Reference

### `auth`

| Method | Signature | Description |
|--------|-----------|-------------|
| `getCurrentUser` | `() => Promise<AuthUser \| null>` | Returns the currently authenticated user |
| `signIn` | `(email, password) => Promise<{ user, error }>` | Authenticates a user |
| `signOut` | `() => Promise<void>` | Signs out the current user |

### `titles`

`TitleRow` includes `daily_pull_bucket` (`lib/titles/daily-pull-filters.ts`), populated from your reporting pipeline or the same rules as the Titles Daily Pull workbook. The Repossessions queue **does not** filter the list by Daily Pull chips in the UI; instead, open titles are bucketed by `deriveRepoQueue` in `lib/titles/repo-queues.ts` (uses `status`, `title_received_date`, `auction_name`, `daily_pull_bucket`, `title_state`). **Backends should either** replicate that derivation in SQL or API filters **or** expose a precomputed column aligned with `deriveRepoQueue` so list counts and `?queue=` deep links stay consistent with the UI.

`TitleRow.shipping_label`, `shipping_location`, and `shipped_at` are not sourced from the RepoTitle CSV; persist them from your shipping workflow and implement `updateShipping` on the provider.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAll` | `() => Promise<TitleRow[]>` | Returns all title rows |
| `getById` | `(id) => Promise<TitleRow \| null>` | Returns one title |
| `assign` / `assignBulk` | Assigns analyst to title(s) |
| `lock` / `unlock` | Title file lock for editing |
| `getByAssignmentGroup` | `(group) => Promise<TitleRow[]>` | Filter by assignment group |
| `updateAssignmentGroup` | Updates group and implied status; the mock provider also appends a `TitleTransferRow` (System) so the move appears in History & transfers — real backends should record an equivalent audit row. |
| `updateShipping` | `(titleId, { shipping_label, shipping_location }) => Promise<void>` | Trims strings; empty → `null`. Sets `shipped_at` to the current time the first time either field is non-empty; clears `shipped_at` when both are empty. Drives the **Title shipped** timeline event. |
| `getComments` / `addComment` | Title-scoped comments |
| `getDocuments` | `DocumentRow[]` for the title (some shared row types use a generic foreign-key field name in `database.types.ts`) |
| `getTransfers` / `createTransfer` | Assignment group transfer history |

### `documentBatches`

Physical document scan batches: each batch has an internal `id`, an `external_batch_id` (scanner or sheet label), metadata, and ordered `DocumentBatchItemRow` rows (`batch_id`, `title_id`, `sequence` starting at 1). The UI builds a work queue by resolving `title_id` to the current `TitleRow` from the titles store. Production systems should persist batches, enforce uniqueness of `external_batch_id` per tenant (or chosen scope), and return stable ordering by `sequence`. When a title is deleted or never existed, `getBatchWorkItemsOrdered` should still return a slot with `title: null` so scan order is preserved.

| Method | Signature | Description |
|--------|-----------|-------------|
| `listBatches` | `() => Promise<DocumentBatchRow[]>` | List batches for the batches hub (search is client-side in mock). |
| `getBatch` | `(batchId) => Promise<{ batch, items } \| null>` | Batch header plus items sorted by `sequence`. |
| `getBatchWorkItemsOrdered` | `(batchId) => Promise<DocumentBatchWorkItem[]>` | One entry per item in scan order; each includes `title` joined from live title data or `null` if missing. |

### `dashboard`

| Method | Signature | Description |
|--------|-----------|-------------|
| `getKPIs` | `() => Promise<DashboardKPI[]>` | KPI cards |
| `getRiskDistribution` | `() => Promise<RiskDistribution>` | High/medium/low style counts |
| `getVolumeData` | `() => Promise<VolumeDataPoint[]>` | Weekly volume |
| `getActivityFeed` | `() => Promise<ActivityFeedItem[]>` | Recent activity (`recordId` optional link target) |
| `logActivity` | `(analystId, name, action, recordId?) => Promise<void>` | Append activity |

### `users`

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAll`, `getAnalysts`, `getTeamMembers` | User and team stats (`titlesAssigned`, etc.) |
| `create`, `update`, `delete`, `emailExists` | User administration |

### `notifications`

| Method | Signature | Description |
|--------|-----------|-------------|
| `getByUserId`, `markAsRead`, `markAllAsRead` | Per-user notifications |

### `settings`

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` / `save` | `AppSettings` including `max_titles_per_analyst`, `notify_on_new_title`, etc. |

### `integrations`

| Method | Signature | Description |
|--------|-----------|-------------|
| `getSyncLog` | Sync log entries |
| `triggerEoscarSync` | e-Oscar stub |
| `fetchOnBaseDocuments` | `(accountNumber, titleId?) => Promise<OnBaseImportResult>` |

### `realtime`

| Method | Signature | Description |
|--------|-----------|-------------|
| `subscribeToTitles` | `(callbacks) => () => void` | Subscribe to title insert/update/delete |

## Type Definitions

Core types are exported from `lib/data-provider.ts` (`TitleRow`, `DocumentRow`, `UserRow`, etc.). `lib/database.types.ts` holds shared table-oriented types used across namespaces (for example document and user rows).

## API Routes

Stubs exist at:

- `app/api/sync/eoscar/route.ts`
- `app/api/webhooks/eoscar/route.ts`
- `app/api/documents/onbase/route.ts`

These return mock responses by default. Implement real logic as needed, or route through the DataProvider.

## Mock Data

The mock provider uses `lib/generated/titles-seed.json` (from `npm run generate:titles`), `lib/providers/title-mock-data.ts` for sample comments/documents/transfers, and `lib/providers/mock-data.ts` for users, notifications, sync logs, and activity feed seeds.

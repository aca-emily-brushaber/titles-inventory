# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Shipping** (`TitleRow.shipping_label`, `shipping_location`, `shipped_at`): carrier tracking, ship-from/to location, and first-recorded ship time; title details table and combined editor on `/title/[id]` until Completed (`components/title/title-shipping-editor.tsx`, `lib/data-provider.ts` `updateShipping`, mock in `lib/providers/mock-provider.ts`). Seed sets `null` for all RepoTitle rows (`scripts/generate-titles-seed.mjs`).
- ESLint flat config for Next.js 16 so `npm run lint` runs against the current ESLint 9 toolchain.
- **History & transfers** timeline on title detail (`components/title/title-history-panel.tsx`, `lib/titles/title-timeline.ts`): merges RepoTitle dates (repossessed, title location, title received), queue record `created_at`, assignment transfers, optional lock (`locked_at`), and completion when `status` is Completed. Help popover lists other fields that can feed future events (comments, documents, integrations).
- **Daily Pull report** sub-filters on `/queue` (Repossessions, non-Completed assignment views): chips mirror `data/Titles Daily Pull Report.xlsx` sheet groups (Repo Affidavit from three affidavit sheets; Repo Flip - Greer DMV from INITIAL + FINAL; plus PAR, FL, reinstated sheets, manual repo tile requests). `TitleRow.daily_pull_bucket` (`DailyPullFilterId | null`) and `lib/titles/daily-pull-filters.ts`. `npm run generate:titles` maps account numbers from the workbook to buckets (first sheet wins on conflicts); RepoTitle-only accounts get `null` and show only under **All**.
- Title detail **Step 3 — Title verification**: Textract-style split view (`components/title/title-textract-panel.tsx`) with document toolbar (zoom, rotate, full screen), green overlay boxes, and **Extracted fields** sidebar with confidence bands; demo image `public/sample-docs/ct-certificate-title-sample.png` and mocks in `lib/titles/textract-mock-data.ts`.
- **Actions** step: state-filtered forms loaded from `lib/generated/state-forms.json` (run `npm run import:forms` after updating `data/Titles Forms and Letters.xlsx`). Dialog and printout use workbook columns K–M (Notarized, Title required, Security agreement) and N (notes). See `documentation/STATE_FORMS_IMPORT.md`.
- Outbound queue area on `/queue`: sidebar entries **Repossessions** and **Outbound**; Outbound sub-tabs (All, Out of State Transfer, Name Change, Buyback, Settlement) with empty state until outbound data is wired (`lib/titles/outbound-queues.ts`, `?system=outbound&outbound=…`).
- Title queue at `/queue` with assignment-group tabs, filters, bulk assign/transfer, and navigation to title detail.
- Title detail at `/title/[id]` with workflow rail, field grid, title verification (Textract UI), comments, and title actions (mock-backed).
- RepoTitle CSV pipeline: `data/RepoTitle_TitleLocation_Report.csv`, `npm run generate:titles` (`scripts/generate-titles-seed.mjs` → `lib/generated/titles-seed.json`), documented in `documentation/EXCEL_COLUMN_MAPPING.md`.
- `DataProvider` titles namespace and mock implementation for title rows, comments, documents, transfers, and realtime stub (`lib/data-provider.ts`, `lib/providers/mock-provider.ts`, `lib/providers/title-mock-data.ts`).
- `lib/services/title.service.ts` and title-focused UI under `components/title/` and `app/(dashboard)/title/[id]/`.
- Backend integration notes in `documentation/BACKEND_INTEGRATION_GUIDE.md`.

### Changed

- **Shipping & history**: `TitleRow` adds `shipping_location` and `shipped_at`; `updateShipping` replaces `updateShippingLabel` and drives a **Title shipped** timeline entry (`lib/titles/title-timeline.ts`, `components/title/title-history-panel.tsx`, `components/title/title-shipping-editor.tsx`). Mock `updateAssignmentGroup` now appends a `TitleTransferRow` so every assignment-group change can appear in History & transfers; transfer rows are sorted stably in the timeline builder.
- **Actions** (`components/title/title-actions.tsx`): section description **State-specific forms and letters**; form cards list name, process, and Print only; **Document Requirements** is one table after all forms (single state row: Notarized, Title required, Security agreement; no Notes); values from first form row for that state in the workbook import.
- **Title details** block (`components/title/title-field-grid.tsx`): replaced per-field cards with a dense table (two field pairs per row on `sm+`) and a compact list on small screens; reduced padding and subtitle copy.
- Migrated the pass-through request interceptor from deprecated `middleware.ts` to Next.js 16 `proxy.ts` and set the Turbopack root to the project directory for clean builds in a multi-lockfile workspace.
- Title detail header shows **`{account_number}: {assignment_status}`** (for example `90123865548: Awaiting Clearance / Inspected`) plus the file-level status badge (`title-detail-client.tsx`).
- Removed `TitleRow.due_date`. Queue and title detail show **Repossessed** from `repossessed_date` (RepoTitle `repossessed_date` column). **Age** is calendar days from `repossessed_date` to today via `lib/titles/age-days.ts`. Seed generation no longer derives a due date (`scripts/generate-titles-seed.mjs`).
- Title workflow rail is a **review guide** (numbered suggested order and jump links only) that mirrors the title page sections, including **Shipping**; mandatory checklist and completion counts were removed (`components/title/title-workflow-rail.tsx`, `title-detail-client.tsx`, `title-actions.tsx`).
- **Repossessions** and **Outbound** live in the left sidebar under a **Queues** group (`components/nav-queue-systems.tsx`); the in-page top tabs for switching queue systems were removed. Header and `/queue` page heading show **Repossessions** or **Outbound** accordingly. Outbound remains an empty shell until data is wired.
- Admin locks page targets locked title files (`/title/[id]`).
- Settings and team metrics use title-oriented keys (for example `max_titles_per_analyst`, `notify_on_new_title`, `titlesAssigned`).

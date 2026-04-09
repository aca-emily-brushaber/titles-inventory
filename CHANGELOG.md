# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

- **Repossessions** and **Outbound** live in the left sidebar under a **Queues** group (`components/nav-queue-systems.tsx`); the in-page top tabs for switching queue systems were removed. Header and `/queue` page heading show **Repossessions** or **Outbound** accordingly. Outbound remains an empty shell until data is wired.
- Admin locks page targets locked title files (`/title/[id]`).
- Settings and team metrics use title-oriented keys (for example `max_titles_per_analyst`, `notify_on_new_title`, `titlesAssigned`).

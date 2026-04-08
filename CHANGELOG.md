# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Title queue at `/queue` with assignment-group tabs, filters, bulk assign/transfer, and navigation to title detail.
- Title detail at `/title/[id]` with workflow rail, field grid, document viewer, comments, and title actions (mock-backed).
- RepoTitle CSV pipeline: `data/RepoTitle_TitleLocation_Report.csv`, `npm run generate:titles` (`scripts/generate-titles-seed.mjs` → `lib/generated/titles-seed.json`), documented in `documentation/EXCEL_COLUMN_MAPPING.md`.
- `DataProvider` titles namespace and mock implementation for title rows, comments, documents, transfers, and realtime stub (`lib/data-provider.ts`, `lib/providers/mock-provider.ts`, `lib/providers/title-mock-data.ts`).
- `lib/services/title.service.ts` and title-focused UI under `components/title/` and `app/(dashboard)/title/[id]/`.
- Backend integration notes in `documentation/BACKEND_INTEGRATION_GUIDE.md`.

### Changed

- Admin locks page targets locked title files (`/title/[id]`).
- Settings and team metrics use title-oriented keys (for example `max_titles_per_analyst`, `notify_on_new_title`, `titlesAssigned`).

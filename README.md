# Titles inventory (ACA)

Titles management UI for reviewing title files, queues, documents, and comments (Next.js 16, React 19). Data is provided by the in-memory mock `DataProvider` by default; connect a real backend by implementing `DataProvider` (see `documentation/BACKEND_INTEGRATION_GUIDE.md`).

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, shadcn/ui, Radix UI primitives, Tailwind CSS 4
- **Icons:** Tabler Icons
- **Charts:** Recharts
- **Tables:** TanStack React Table
- **Forms:** React Hook Form + Zod
- **Data:** `DataProvider` abstraction with mock implementation (`lib/providers/mock-provider.ts`)
- **Theming:** 13 themes with light/dark mode, CSS variable system
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install and Run

```bash
npm install
npm run dev
```

### Title inventory data (RepoTitle CSV)

- Source CSV: `data/RepoTitle_TitleLocation_Report.csv`
- Generated seed consumed by the mock provider: `lib/generated/titles-seed.json`
- After replacing the CSV, run:

```bash
npm run generate:titles
```

Then rebuild or restart the dev server. Column and group mapping is documented in `documentation/EXCEL_COLUMN_MAPPING.md`.

Open [http://localhost:3000](http://localhost:3000). The app loads the dashboard and redirects `/` to `/queue` (no login gate in this prototype).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
  (dashboard)/
    page.tsx            # Redirects to /queue
    queue/              # Title queue (tabs, bulk assign/transfer)
    title/[id]/         # Title detail (workflow rail, history, fields, documents, comments, actions)
    reports/            # Redirects to queue (placeholder)
    admin/                # Settings, users, integrations, locks
  login/                # Legacy login (optional)
lib/
  titles/               # Assignment groups, types, labels (`assignment-group-copy.ts`)
  generated/            # `titles-seed.json` from `npm run generate:titles`
  providers/            # `title-mock-data.ts` imports generated seed
  services/title.service.ts
  data-provider.ts      # DataProvider interface (includes titles namespace)
data/
  RepoTitle_TitleLocation_Report.csv   # committed extract; regenerate seed after updates
scripts/
  generate-titles-seed.mjs             # CSV → JSON
middleware.ts           # Pass-through (no auth gate)
```

## Database Schema

The TypeScript types in `lib/database.types.ts` describe a legacy Supabase schema used for shared row shapes (for example `documents`). The running prototype uses the mock `DataProvider` with generated title seed data; production wiring can map `titles` in `DataProvider` to your backend tables.

| Table | Purpose |
|-------|---------|
| `users` | Analysts, leads, managers with role-based access |
| `documents` | Document metadata and extracted data (mock joins use `dispute_id` as a generic record key for title files) |
| `activity_feed` | System-wide activity log |
| `notifications` | Per-user notification queue |

## Deployment

The app deploys to Vercel via GitHub integration. Pushes to `main` trigger production deployments.

**Production URL:** https://id-theft-platform-ui-6mzr.vercel.app

Required Vercel environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

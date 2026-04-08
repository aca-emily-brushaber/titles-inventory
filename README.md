# Titles Inventory (ACA)

Titles management UI for reviewing title files, queues, documents, and comments. Built with Next.js 16 and React 19. Data is supplied by the in-memory mock `DataProvider` by default; connect a real backend by implementing `DataProvider` (see `documentation/BACKEND_INTEGRATION_GUIDE.md`).

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, shadcn/ui, Radix UI primitives, Tailwind CSS 4
- **Icons:** Tabler Icons
- **Charts:** Recharts
- **Tables:** TanStack React Table
- **Forms:** React Hook Form + Zod
- **Data:** `DataProvider` abstraction with mock implementation (`lib/providers/mock-provider.ts`)
- **Theming:** Multiple themes with light/dark mode via CSS variables

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+

### Install and run

```bash
npm install
npm run dev
```

### Title inventory data (RepoTitle CSV)

- Source CSV: `data/RepoTitle_TitleLocation_Report.csv`
- Generated seed used by the mock provider: `lib/generated/titles-seed.json`
- After replacing the CSV:

```bash
npm run generate:titles
```

Then rebuild or restart the dev server. Column and group mapping is documented in `documentation/EXCEL_COLUMN_MAPPING.md`.

Open [http://localhost:3000](http://localhost:3000). The app redirects `/` to `/queue` (no login gate in this prototype).

### Build

```bash
npm run build
npm start
```

## Project structure

```
app/
  (dashboard)/
    page.tsx            # Redirects to /queue
    queue/              # Title queue (tabs, bulk assign/transfer)
    title/[id]/         # Title detail (workflow rail, history, fields, documents, comments)
    reports/            # Redirects to queue (placeholder)
    admin/              # Settings, users, integrations, locks
  login/                # Optional login shell
lib/
  titles/               # Assignment groups, types, labels
  generated/            # titles-seed.json from npm run generate:titles
  providers/            # Mock provider and title seed wiring
  services/title.service.ts
  data-provider.ts      # DataProvider interface (titles namespace)
data/
  RepoTitle_TitleLocation_Report.csv
scripts/
  generate-titles-seed.mjs
middleware.ts           # Pass-through (no auth gate)
```

## Data model (types)

Shared row shapes for users, documents, notifications, activity, and settings live in `lib/database.types.ts` and align with what `DataProvider` exposes. Title rows and assignment groups are defined in `lib/data-provider.ts` and `lib/titles/`. The mock uses generated title seed data plus sample comments, documents, and transfers.

## Deployment

Deploy like any Next.js app: build with `npm run build`, run with `npm start`, or host on your organization’s Node-compatible platform. Set environment variables required by your auth and API integration when you replace the mock provider.

# Legacy re-architecture design (archived)

**Date:** 2026-02-24  
**Status:** Superseded

## Note

This file previously described a design to consolidate internal Angular apps into one Next.js 16 application: shared theme system, App Router layout, sidebar shell, and a case-based queue and detail experience.

That design assumed features and navigation that have been **removed or replaced** in favor of **Titles Inventory** (assignment-group queues, RepoTitle-driven `TitleRow` data, `/title/[id]` detail).

## Architectural ideas that remain valid

- Next.js App Router with a dashboard shell (`SidebarProvider`, header, main content region).
- Central theming (CSS variables, light/dark).
- Services calling a pluggable `DataProvider` implementation.
- Optional Supabase or other backends behind the provider boundary.

For the live contract, see `lib/data-provider.ts` and `documentation/BACKEND_INTEGRATION_GUIDE.md`.

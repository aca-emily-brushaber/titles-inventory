# Legacy re-architecture implementation plan (archived)

**Date:** 2026-02-24  
**Status:** Superseded

## Note

This file previously contained a long, step-by-step plan to migrate an internal Angular servicing UI into this Next.js repository by forking a shared ACA shell project and porting screens (dashboard, queue, case detail, reports, admin, login).

That content referenced historical source trees and product names that are no longer used in this repository.

## Current state

The application is **Titles Inventory**: title queues and detail at `/queue` and `/title/[id]`, with a `DataProvider` focused on the `titles` namespace and generated RepoTitle seed data. The old multi-screen case workflow, case-workflow-specific components, and Angular migration steps are **not** present in the current tree.

For integration and backend wiring, see `documentation/BACKEND_INTEGRATION_GUIDE.md`.

## What to keep from the original intent

- Use a single `DataProvider` abstraction for all server access.
- Keep shadcn/ui primitives under `components/ui/`.
- Prefer server-aware routes for sync and webhooks when connecting real backends.

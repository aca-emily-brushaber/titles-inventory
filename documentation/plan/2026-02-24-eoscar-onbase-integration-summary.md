# e-Oscar and OnBase integration — implementation summary (archived)

**Date:** 2026-02-24

## Overview

Integrated e-Oscar (ACDV inbound payloads) and OnBase (document retrieval) through API routes, Supabase schema additions, service modules, and admin UI. This summary is retained for **schema and route** history; several file paths and UI entry points have since changed in the Titles Inventory codebase.

## Database changes (Supabase migrations)

### Legacy case-record table additions (older migrations; table names unchanged in generated types)

- `source` (text, default `'manual'`) — origin tracking: `'eoscar'`, `'manual'`
- `eoscar_case_id` (text, unique, nullable) — deduplication key
- `eoscar_received_at` (timestamptz, nullable) — webhook receipt time
- `eoscar_raw_payload` (jsonb, nullable) — full original payload for audit

### `documents` table additions

- `source` (text, default `'upload'`) — `'onbase'`, `'upload'`
- `onbase_document_id` (text, unique, nullable)
- `onbase_retrieved_at` (timestamptz, nullable)

### `integration_sync_log` table

- Tracks webhook, polling, and document fetch events
- RLS: SELECT for Manager/Lead; INSERT via service role only

### Indexes

Partial and filter indexes on external IDs, `source`, and `integration_sync_log` timestamps as appropriate for your deployment.

## API routes

- `POST /api/webhooks/eoscar` — ACDV webhook receiver (HMAC verification, mapping, deduplication, sync log)
- `GET /api/sync/eoscar` — Polling fallback (protect with `CRON_SECRET` if used)
- `GET /api/documents/onbase` — OnBase search/import by account (and optional record id)

## Environment variables (typical)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase client |
| `EOSCAR_API_URL`, `EOSCAR_API_KEY`, `EOSCAR_WEBHOOK_SECRET` | e-Oscar API and webhook verification |
| `ONBASE_API_URL`, `ONBASE_API_KEY` | OnBase integration |
| `CRON_SECRET` | Cron route protection |

## Current codebase note

The `lib/eoscar/` helpers and legacy detail-page wiring described in the original summary are **not** present in the current tree. Integrations still delegate through `DataProvider.integrations` in `lib/providers/mock-provider.ts`; implement real behavior in your provider when connecting production APIs.

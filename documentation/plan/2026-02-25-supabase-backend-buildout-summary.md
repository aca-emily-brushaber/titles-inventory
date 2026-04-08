# Supabase backend buildout — implementation summary (archived)

**Date:** 2026-02-25  
**Project:** Internal ACA servicing UI (legacy schema)  
**Supabase project (historical):** `wkbexdqreiqdqsgdqjdc`

## Overview

Hardening pass on Supabase: RLS, RPCs, triggers, settings persistence, service layer, realtime, and error boundaries. Older generated types in `lib/database.types.ts` still include legacy case-table names from the original schema; the running Titles Inventory prototype uses mock `DataProvider` and generated title seed data.

## Workstream 1: RLS policy hardening

- Helper functions for role resolution from `auth.users` / `public.users`
- Role-based policies replacing permissive defaults across core tables

## Workstream 2: Database functions and triggers

- Assignment, lock/unlock, resolve, KPI, and team-stats RPCs (targeted legacy case tables)
- Triggers for history and activity feed on row updates

## Workstream 3: Settings

- `app_settings` table with defaults (SLA days, notifications, caps)
- Modern setting keys in the UI may use `max_titles_per_analyst` / `notify_on_new_title` — align migrations if you bridge to Supabase

## Workstream 4: Service layer

- Services moved toward RPCs and UUIDs instead of ad hoc client updates

## Workstream 5: Realtime and errors

- Realtime subscriptions on hot tables (legacy queue list)
- App Router `error.tsx` boundaries

## Migrations

A numbered list of migration names was applied in the original project; reproduce from your Supabase migration history if you need parity.

## Current codebase

Titles Inventory does **not** ship Supabase RPC wiring in the default mock path. Implement `DataProvider` against your database when you connect production.

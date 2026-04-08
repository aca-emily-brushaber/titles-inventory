# Audit trail, cross-reference, and read-only completed records — summary (archived)

**Date:** 2026-03-04  
**Status:** Implemented (historical)

## Summary

Added append-only audit events, optional cross-record linking, related-record discovery, and read-only mode for completed items in a **legacy case-detail** experience. The workflow implementation, audit service, and related provider APIs have been **removed** from the current Titles Inventory tree.

## Historical capabilities

1. **Audit trail** — `audit_events` table and timeline UI (removed in current codebase).
2. **Cross-reference** — Related records by account / identity fields; slide-over preview (removed).
3. **Explicit links** — Link table between records (legacy schema) and link dialog (removed).
4. **Read-only completed** — Banner and disabled actions for terminal states (pattern may be reapplied to titles if needed).

## Files

Original modules under `lib/services/` case workflow services, removed workflow components, and removed legacy detail routes — **none** of these remain. Title detail today is `app/(dashboard)/title/[id]/` with `components/title/*`.

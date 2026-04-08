# Queue expansion: leadership review and cross-queue history — summary (archived)

**Date:** 2026-03-04  
**Status:** Implemented (historical)

## Summary

Added a fourth queue (leadership approval), refactored fraud-investigation UI, and added cross-queue stage history in a **legacy multi-queue case workflow**. **Removed** from the current codebase along with the rest of the case-detail feature set.

## Historical flow

A staged path through baseline review, fraud investigation, leadership approval, and response composition — **not** applicable to Titles Inventory, which uses **assignment groups** and bulk transfer to group destinations instead.

## Files

Referenced triage rules, workflow panels, and legacy detail routes — all **removed**. See `lib/titles/assignment-groups.ts` and `app/(dashboard)/queue/page.tsx` for current behavior.

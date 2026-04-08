# Multi-queue workflow scaling — implementation summary (archived)

**Date:** 2026-03-02  
**Status:** Implemented (historical)

## Overview

Expanded a legacy single-queue UI into multiple queues (baseline-style review, response composition, fraud investigation) with triage metadata, transfer history, and response drafts. **This workflow and its UI routes have been removed** from the current repository in favor of **assignment groups** and RepoTitle-derived `TitleRow` data (`lib/titles/assignment-groups.ts`, `/queue`).

## What was built (historical)

- Queue union types and triage helpers (`lib/triage/rules.ts` — **removed**)
- Transfer dialog and queue-specific workflow panels (removed workflow package) — **removed**
- Schema extensions for queue, transfers, and response drafts on legacy tables

## Current direction

Use **AssignmentGroup** tabs and `titles.createTransfer` / `transferTitleAssignmentGroup` instead of per-queue case routing.

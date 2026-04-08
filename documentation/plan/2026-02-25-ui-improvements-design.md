# UI improvements design (archived)

**Date:** 2026-02-25  
**Status:** Approved (historical)

## Overview

Five targeted UI improvements for an internal ACA servicing shell: branding, spacing, interactivity, and layout. Some targets (e.g. legacy dashboard tables, legacy detail layout) referred to screens that are **no longer in the repository** after the move to Titles Inventory.

## Changes (historical)

### 1. Login page

- Larger ACA logo, clearer hierarchy, uppercase labels, primary CTA styling.
- **Files:** `app/login/page.tsx` (current branding: "Titles Inventory" in code).

### 2. Sidebar logo

- Larger emblem when expanded.
- **Files:** `components/app-sidebar.tsx`

### 3. Dashboard space utilization

- Adjusted grid and table density for dashboard + activity feed (components removed in later refactors).

### 4. Queue lock tooltips

- Show who holds a lock on hover.
- **Files:** `app/(dashboard)/queue/page.tsx`

### 5. Legacy detail layout

- Two-column layout for field comparison, documents, and actions applied to an older detail route that has been **removed**. Current detail is **`/title/[id]`** with title-specific panels.

## Approach

Prototype visually intensive pages first, then apply targeted edits elsewhere.

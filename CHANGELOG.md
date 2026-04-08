# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Removed
- Credit dispute domain UI and routes: `/dispute/[id]`, `components/dispute/`, dispute workflows, `lib/services/dispute.service.ts`, `lib/services/document.service.ts`, `lib/triage/rules.ts`, `lib/eoscar/`, dashboard dispute widgets, and `lib/dispute-filters.tsx` (replaced by `lib/queue-toolbar-filters.tsx`).
- Unused `lib/services/audit.service.ts` (previously tied to removed `auditEvents` provider APIs).
- `DataProvider` namespaces and mock logic for disputes, field comparisons, dispute history/comments/documents/letters, queue transfers, fraud findings, audit events, dispute links, dispute responses, and ACDV fields; `realtime.subscribeToDisputes` removed in favor of titles-only realtime stub.

### Changed
- Shell copy and metadata: app title/description, login branding, `package.json` name `titles-inventory`, admin integrations copy, README database section, and `documentation/BACKEND_INTEGRATION_GUIDE.md` aligned to titles-only `DataProvider`.
- `documentation/plan/` historical summaries rewritten or shortened to remove credit-dispute branding and legacy app paths; large re-architecture plans replaced with archived stubs; `2026-03-04-audit-trail-cross-dispute-summary.md` renamed to `2026-03-04-audit-trail-archived-summary.md`.
- Moved shared UI helpers to `components/section-help.tsx` and `components/document-viewer.tsx`; queue header filters renamed to `QueueToolbarFilterProvider` / `useQueueToolbarFilters`.
- Settings keys: `max_titles_per_analyst`, `notify_on_new_title`; team stats: `titlesAssigned`, `titlesCompleted`, etc.; activity feed items use `recordId`; OnBase helper uses optional `titleId`.
- Admin locks page retargeted to locked title files (`/title/[id]`).

### Added
- RepoTitle TitleLocation ingest: `data/RepoTitle_TitleLocation_Report.csv`, `npm run generate:titles` (`scripts/generate-titles-seed.mjs` → `lib/generated/titles-seed.json`), `TitleRow` fields aligned to report columns, `AssignmentGroup` tabs replacing synthetic title queues (`lib/titles/assignment-groups.ts`, `app/(dashboard)/queue/page.tsx`)
- Titles management UI: title queue at `/queue`, detail at `/title/[id]` with workflow rail, history and transfers, title field grid, document viewer, comments, and stub title actions (`lib/titles/types.ts`, `lib/services/title.service.ts`, `lib/providers/title-mock-data.ts`, `components/title/*`, `app/(dashboard)/title/[id]/`)
- `DataProvider.titles` namespace and mock implementation: CRUD-style access for title rows, comments, documents, and queue transfers; `realtime.subscribeToTitles` stub (`lib/data-provider.ts`, `lib/providers/mock-provider.ts`)
- Documentation: Excel column mapping placeholder for future workbook ingestion (`documentation/EXCEL_COLUMN_MAPPING.md`)
- Unified audit trail: append-only `audit_events` table and chronological `AuditTimeline` component
  - Data model: `audit_events` table with event type, actor, summary, structured details in `lib/database.types.ts`
  - Audit service: `logAuditEvent` and `getAuditTimeline` in `lib/services/audit.service.ts`
  - Instrumented state-change functions: `transferDisputeQueue`, `updateDisputeStatus`, `addComment`, `createFraudReviewFinding`, `submitDisputeResponse`, `createDisputeLink`
  - Audit Timeline component: unified chronological view with event type badges, actor avatars, and expandable details in `components/dispute/audit-timeline.tsx`
  - Replaces the previous `DisputeHistory` component in the Baseline workflow
- Cross-dispute reference: related dispute lookup by account number, SSN, and customer name
  - Service: `getRelatedDisputes` in `lib/services/dispute.service.ts` finds disputes sharing the same customer
  - Related Disputes section: `components/dispute/related-disputes.tsx` with linked and auto-discovered groups
  - Dispute slide-over drawer: `components/dispute/dispute-drawer.tsx` for read-only viewing of referenced disputes with tabbed content (Audit Trail, Field Comparison, Documents, Comments)
- Explicit dispute linking: `dispute_links` table for formal duplicate/related relationships
  - Data model: `dispute_links` table with source, target, link type, reason in `lib/database.types.ts`
  - Link Dispute dialog: `components/dispute/link-dispute-dialog.tsx` with search, type selection, and reason
  - Bidirectional display: linked disputes shown in both source and target dispute views
  - Audit events logged on both disputes when a link is created
- Read-only mode for completed disputes
  - Completed banner displayed at top of dispute detail page with resolution and date
  - Action buttons, forms, and comment input hidden on completed disputes
  - Related disputes section hides "Link Dispute" button on completed disputes
- Mock data: new duplicate-customer dispute (disp-0012, John M. Anderson) and 17 sample audit events

### Changed
- Title queue uses assignment group tabs and `transferTitleAssignmentGroup`; `DataProvider.titles` uses `getByAssignmentGroup`, `updateAssignmentGroup`, and transfer `fromGroup`/`toGroup` (`lib/data-provider.ts`, `lib/providers/mock-provider.ts`, `lib/services/title.service.ts`)
- Documentation: `documentation/EXCEL_COLUMN_MAPPING.md` updated for RepoTitle CSV and assignment groups
- Middleware: removed login redirect; all matched routes pass through (`middleware.ts`)
- Queue page retargeted from disputes to titles (columns, queue tabs, navigation to `/title/[id]`) (`app/(dashboard)/queue/page.tsx`)
- Sidebar branding: "Titles"; site header route titles and queue filters aligned with title workflow (`components/app-sidebar.tsx`, `components/site-header.tsx`)
- Workflow Rail: renamed "Dispute Timeline" step to "Audit Trail" with updated hint text

- Leadership Review queue: new queue for leadership approval of completed fraud investigations
  - Data model: `LeadershipReview` added to all queue union types in `lib/database.types.ts`; new `fraud_review_findings` table for structured leadership decision audit trail
  - Queue labels and descriptions: `LeadershipReview` added to `DisputeQueue`, `QUEUE_LABELS`, `QUEUE_DESCRIPTIONS` in `lib/triage/rules.ts`
  - DataProvider extensions: `fraudReviewFindings` namespace with `getByDisputeId` and `create` methods in `lib/data-provider.ts`
  - Mock provider: full CRUD implementation for `fraud_review_findings` in `lib/providers/mock-provider.ts`
  - Service layer: `getFraudReviewFindings`, `createFraudReviewFinding` in `lib/services/dispute.service.ts`
  - Leadership Review workflow component: findings form, approve/reject decision actions, role-based access (Analyst read-only, Lead/Manager full access), prior decision history display in `components/dispute/workflows/leadership-review.tsx`
  - Queue page: Leadership Review tab with counts and bulk transfer support in `app/(dashboard)/queue/page.tsx`
  - Queue transfer component: `LeadershipReview` added to available queue destinations in `components/dispute/queue-transfer.tsx`
- Cross-queue history view: collapsible accordion sections showing prior queue activity when a dispute moves between queues
  - Queue stage history utility: `getQueueStageHistory()` function that aggregates `queue_transfers`, comments, and leadership findings by timestamp ranges in `lib/services/dispute.service.ts`
  - Queue history component: `QueueHistory` with expandable `StageAccordion` sections for each prior queue stage, showing transfer context, analyst comments, and leadership decisions in `components/dispute/queue-history.tsx`
  - Dispute detail integration: queue history displayed above current queue workflow for all non-Baseline queues in `app/(dashboard)/dispute/[id]/dispute-detail-client.tsx`
  - Server-side data fetching: fraud findings and queue stage history fetched in `app/(dashboard)/dispute/[id]/page.tsx`
- Mock data: new dispute (disp-0011) that has traveled Baseline to FullFraud to LeadershipReview with full transfer history, analyst comments, field comparisons, and documents

### Changed
- Full Fraud Investigation workflow refactored to document-only activity
  - Replaced placeholder 5-step checklist and "coming soon" banner with Document Viewer and Analyst Comments components
  - "Complete Investigation" action now routes disputes to Leadership Review (previously routed directly to Dispute Response via generic QueueTransfer)
  - Component now accepts `documents` and `comments` props for contextual display in `components/dispute/workflows/full-fraud-review.tsx`
- Queue flow updated: FullFraud no longer routes directly to Dispute Response; it must go through Leadership Review first

- e-Oscar ACDV Response Form: full dispute response interface for the Dispute Response queue
  - ACDV field definitions: `lib/eoscar/acdv-fields.ts` with all auto-lending fields organized by section (Consumer, Account, Associated), subsections, input types, dropdown options, verification indicators, and help text
  - Data model: `acdv_response_fields` table in `lib/database.types.ts` for per-field request/response storage
  - DataProvider extensions: `acdvFields` namespace with `getByDisputeId`, `upsert`, `initializeFromReport` methods in `lib/data-provider.ts` and `lib/providers/mock-provider.ts`
  - Mock data: auto-generated ACDV field rows for Dispute queue disputes in `lib/providers/mock-data.ts`
  - Service layer: `getAcdvFields`, `initializeAcdvFields`, `saveAcdvFields` in `lib/services/dispute.service.ts`
  - ACDV Stepper: 4-step navigation (Consumer Information, Account Information, Associated Information, Review and Submit) with visited/completed state tracking
  - ACDV Field Row: reusable two-column component (request/response) with missing-value badges, differs highlighting (amber border), verification indicator dropdown, and contextual help tooltips
  - Consumer Info Panel: collapsible subsections for Consumer Information and Address fields
  - Account Info Panel: collapsible subsections for Account Status, Account Amounts, and Account Dates, plus Payment History Grid
  - Payment History Grid: Year x Month editable grid with original (read-only) and response rows, color-coded payment rating cells, Reset/Erase actions, and legend
  - Associated Info Panel: collapsible First/Second Associated Consumer sections with "No data on file" indicators
  - Review Screen: Response Code selector, Data Furnisher Contact Number, validation summary, tabbed read-only field review (Consumer/Account/Associated), change indicators, and Submit/Save and Exit/Back to Queue actions with confirmation dialog
  - ACDV Response Form orchestrator: step navigation, auto-fill from report data, field change tracking, save draft, and submit to e-Oscar
  - First-time onboarding banner for ACDV response workflow with 3-step guide
  - Server-side ACDV field initialization: `page.tsx` fetches and auto-populates fields for Dispute queue disputes
- Multi-Queue Dispute Scaling: full support for Baseline Review, Dispute Response, and Full Fraud Investigation queues
  - Queue-aware data model: `queue` and `triage_reason` fields on disputes, new `queue_transfers` and `dispute_responses` tables, `Routed` status, `dispute_queue` and `response_status` enums in `lib/database.types.ts`
  - DataProvider extensions: `getByQueue`, `updateQueue` on disputes namespace; new `queueTransfers` and `disputeResponses` namespaces in `lib/data-provider.ts`
  - Triage Rules Engine: `lib/triage/rules.ts` with `triageDispute()` and `getTriageReason()` functions, ACDV response codes, queue labels and descriptions
  - Mock data: all 10 disputes assigned to queues, 2 transfer records, 3 response drafts in `lib/providers/mock-data.ts`
  - Dispute service layer: `getDisputesByQueue`, `transferDisputeQueue`, `getQueueTransfers`, `getDisputeResponse`, `saveDisputeResponse`, `submitDisputeResponse` in `lib/services/dispute.service.ts`
  - Queue page redesign: Baseline/Dispute/FullFraud tab bar with per-queue counts, Transfer Queue bulk action with reason dialog in `app/(dashboard)/queue/page.tsx`
  - Queue Transfer component: reusable AlertDialog for single-dispute transfers with destination queue selection and reason field in `components/dispute/queue-transfer.tsx`
  - Dispute Response workflow: findings summary, ACDV response code selector, narrative editor, save draft/submit to e-Oscar actions, transfer history in `components/dispute/workflows/dispute-response.tsx`
  - Full Fraud Investigation workflow: escalation banner, 5-step investigation stepper placeholder, route-to-dispute transfer action in `components/dispute/workflows/full-fraud-review.tsx`
  - Sidebar navigation: Queues section with Baseline Review, Dispute Response, and Full Fraud sub-items in `components/app-sidebar.tsx`
  - Queue-aware dispute detail page: title, subtitle, badge, and workflow content vary by queue; back button returns to the correct queue tab
  - Baseline Review Actions: "Complete & Route to Dispute Response" and "Send to Fraud Operations Queue" actions with confirmation dialogs and activity logging
- Sticky header and stepper bar on dispute detail page: header compacts to title + status when scrolled, workflow stepper remains visible at all times for persistent navigation context. Uses IntersectionObserver sentinel for smooth transition without scroll listeners
- Dispute Detail UI Usability Overhaul for zero-training onboarding
  - Review Workflow Stepper: horizontal 5-step progress bar (Compare Fields, Review AI, Examine Docs, Make Decision, Send Letters) with IntersectionObserver scroll tracking and clickable anchor navigation
  - First-Time Onboarding Banner: dismissable welcome message (localStorage-persisted) with 3-step guided instructions for new analysts
  - Contextual Help Popovers: info icon next to every section header (Field Comparison, AI Analysis, Document Viewer, Review Actions, Letters) with plain-English explanations
  - Decision Guidance: inline decision helper text above Review Actions buttons explaining when to use each option (Unsubstantiated, Further Investigation, Substantiated)
  - Pre-Submission Checklist: collapsible soft-check list in Review Actions (reviewed mismatches, read AI, examined documents, cross-referenced data)
  - Confirmation Summary: AlertDialog confirmations now display mismatch counts, document count, and AI recommendation before final submission
  - Expandable Mismatch Rows: click any minor/major row in Field Comparison to reveal a plain-English explanation of the discrepancy
  - Focus on Mismatches Toggle: filter button in Field Comparison header to show only minor/major rows
  - Enhanced mismatch styling: mismatched cell values now use bold + underline for stronger visual differentiation
  - AI Analysis "What this means for you" box: plain-English guidance below the recommendation banner based on Green/Yellow/Red assessment
  - Queue Page status tab tooltips explaining each status category
  - Queue Page Source column tooltip explaining e-Oscar vs Manual sources
  - Queue Page personal summary line showing assigned dispute count and past-due count
- New components: `components/dispute/review-stepper.tsx`, `components/dispute/section-help.tsx`, `components/ui/popover.tsx`

### Changed
- Redesigned Dispute Detail page with v0-generated UI improvements
  - All dispute panels now use glass-card styling with frosted backdrop blur effect
  - Field Comparison: custom HTML table with monospace font, mismatched cells highlighted in red/amber, footer summary counts (Exact/Minor/Major)
  - AI Analysis: color-coded recommendation banner, inline confidence bar with threshold note, unified field classifications list with severity-tinted rows
  - Document Viewer: document canvas with type-colored header bar, confidential watermark, zoom toolbar, extracted data sidebar with checkbox indicators
  - Review Actions: hover-to-fill button style (green/red tinted outlines that fill on hover), status confirmation banner after submission, "Send to Fraud Operations" tertiary action
  - Letter Trigger: separated into standalone glass-card panel with enriched triggered letter entries showing sender info
  - Dispute History: 2-column layout (timeline left, comments right) with avatar initials, Ctrl+Enter send shortcut, changed field tags with dot indicators
  - Header: enriched with icon-labeled MetaChip metadata (Account, Customer, Risk, Due, Opened), "Locked by {name}" display, dispute type subtitle, max-width 1600px container
  - Document Viewer row 2 uses asymmetric grid (1fr + 340px) for better document viewing space
- Added `glass-card` CSS utility class for frosted glass panel effect (light and dark mode)
- Added `Textarea` shadcn/ui component (`components/ui/textarea.tsx`)

### Fixed
- Fixed "Cannot read properties of undefined (reading 'map')" crash on dispute detail page
  - Mock `ai_recommendation` data now matches `AIRecommendation` interface shape (`majorClassifications`, `minorClassifications`, `acceptableDifferences`, `confidenceScore`, `overallColor`)
  - Empty AI recommendation objects (`{}`) replaced with `null` for proper null-guard handling
  - Made `ai_recommendation` nullable in database types (`Record<string, unknown> | null`)
  - Added defensive null-coalescing (`?? []`) on all `.map()` calls in `AiAnalysis` component
  - Strengthened null guard from `if (!rec)` to `if (!rec?.recommendation)` to catch empty objects

### Changed
- Redesigned Document Viewer component for read-only OnBase document browsing
  - Removed file upload functionality (Upload button, file picker, drag-and-drop)
  - Removed "Import from OnBase" button (documents are now fetched by backend integration)
  - Added multi-page navigation with previous/next controls and page counter (e.g., "2 / 3")
  - Document tabs now display page count badges for multi-page documents
  - Empty state updated to indicate documents will appear once retrieved from OnBase
  - OnBase document ID displayed in header badge when available
- Added `pages` field (string array) to documents database type for multi-page document support
- Updated mock data with multi-page OnBase-sourced documents across multiple disputes
- Removed `upload` method from DataProvider documents interface and document service
- Removed `accountNumber` prop from DocumentViewer (no longer needed without OnBase import button)

### Previously Changed
- Decoupled UI from Supabase backend via DataProvider interface pattern
  - Created `lib/data-provider.ts` with full `DataProvider` interface defining all data access contracts (auth, disputes, users, documents, settings, integrations, realtime)
  - Created `lib/providers/mock-provider.ts` implementing DataProvider with in-memory mock data for standalone UI operation
  - Created `lib/providers/mock-data.ts` with 10 realistic dispute records, 6 users, field comparisons, history, comments, documents, letter types, sync logs, and activity feed
  - Created `lib/providers/init.ts` for automatic provider initialization
  - Created `lib/providers/provider-init.tsx` client component wrapper for React tree initialization
- Refactored all 7 service files (`dashboard`, `dispute`, `document`, `user`, `notification`, `settings`, `integration`) to delegate to DataProvider instead of accepting SupabaseClient
- Refactored all server pages (`/`, `/reports`, `/dispute/[id]`) to call services directly without creating Supabase clients
- Refactored all client pages (`/queue`, `/admin/settings`, `/admin/users`, `/admin/integrations`, `/login`) to use DataProvider
- Refactored 6 components (`app-sidebar`, `nav-user`, `document-viewer`, `letter-trigger`, `review-actions`, `dispute-history`) to use DataProvider instead of Supabase browser client
- Middleware replaced with cookie-based mock auth (`mock-auth-session` cookie)
- Login page sets auth cookie on sign-in; nav-user clears it on sign-out
- Admin Settings System Info card updated from "Supabase Status: Connected" to "Data Provider: Mock (UI-Only)"
- API routes (`/api/sync/eoscar`, `/api/webhooks/eoscar`, `/api/documents/onbase`) stubbed with mock responses

### Removed
- Removed `@supabase/ssr` and `@supabase/supabase-js` package dependencies
- Deleted `lib/supabase-browser.ts`, `lib/supabase-server.ts`, `lib/supabase-admin.ts` client files
- Deleted `lib/eoscar/` module (client, types, verify-signature, map-dispute)
- Deleted `lib/onbase/` module (client, types)
- Deleted `lib/utils/retry.ts` (retry logic now belongs in provider implementations)
- Removed Vercel Cron configuration for e-Oscar polling from `vercel.json`
- Removed all direct Supabase auth calls (`supabase.auth.getUser()`, `signInWithPassword`, `signOut`)
- Removed all Supabase realtime subscriptions (queue page now uses DataProvider.realtime stub)

### Added
- e-Oscar and OnBase Integration across 6 workstreams
- WS1: Database Schema Updates
  - Added `source`, `eoscar_case_id`, `eoscar_received_at`, `eoscar_raw_payload` columns to `disputes` table
  - Added `source`, `onbase_document_id`, `onbase_retrieved_at` columns to `documents` table
  - Created `integration_sync_log` table with RLS (Lead/Manager read, service-role insert)
  - Added indexes on external ID columns and source columns
- WS2: e-Oscar Webhook Endpoint (`/api/webhooks/eoscar`)
  - HMAC-SHA256 signature verification for webhook security
  - Automatic field mapping from e-Oscar ACDV payload to disputes and field_comparisons tables
  - Deduplication via `eoscar_case_id` unique constraint (returns 409 for duplicates)
  - Risk level auto-calculation based on disputed field types and count
  - Full sync logging to `integration_sync_log`
- WS3: e-Oscar Polling Fallback (`/api/sync/eoscar`)
  - Scheduled polling route as webhook fallback
  - Vercel Cron configured for 30-minute intervals
  - Deduplication against existing disputes
  - Tracks last successful sync timestamp to avoid re-fetching
- WS4: OnBase Document Retrieval (`/api/documents/onbase`)
  - Fetches documents from OnBase by account number
  - Downloads and uploads document files to Supabase Storage
  - Deduplication via `onbase_document_id` unique constraint
  - Comprehensive sync logging and activity feed entries
- WS5: Service Layer and UI Updates
  - Created `integration.service.ts` with `fetchOnBaseDocuments`, `triggerEoscarSync`, and `getSyncLog`
  - Added "Import from OnBase" button to document viewer component
  - Added source badges (OnBase/Uploaded) to document tabs
  - Added "Source" column to queue page showing e-Oscar vs Manual origin
  - Created admin Integrations page with connection status, sync log table, and manual sync trigger
  - Added "Integrations" link to sidebar navigation
- WS6: Security and Environment Configuration
  - Created typed server-side Supabase admin client (`lib/supabase-admin.ts`) using service role key
  - Added environment variable placeholders for all integration credentials
  - Middleware already excludes `/api` routes from auth (no changes needed)
  - Created e-Oscar types, signature verification, field mapping, and API client modules
  - Created OnBase types and API client module
- Updated `database.types.ts` with all new columns, tables, and types

- Supabase Backend Buildout: comprehensive backend hardening across 5 workstreams
- WS1: RLS Policy Hardening -- replaced all wide-open `true` policies with role-based access control
  - Created `get_user_role()` and `get_user_email()` helper functions (SECURITY DEFINER)
  - `users` table: SELECT for authenticated, INSERT/UPDATE/DELETE restricted to Manager role
  - `disputes` table: SELECT for authenticated, UPDATE restricted to assigned analyst, lead, or manager
  - `notifications` table: SELECT/UPDATE restricted to own user only
  - All other tables: appropriate authenticated read/write policies
- WS2: Database Functions and Triggers
  - `assign_dispute(p_dispute_id, p_analyst_name)` -- atomic assign + activity log + history entry
  - `lock_dispute(p_dispute_id)` -- sets lock with conflict detection
  - `unlock_dispute(p_dispute_id)` -- unlocks with role-based override
  - `resolve_dispute(p_dispute_id, p_resolution, p_status)` -- atomic resolve + activity log + history
  - `calculate_avg_resolution_time()` -- real calculation from completed dispute timestamps
  - `get_dashboard_kpis()` -- single RPC returning all KPI values
  - `get_team_stats(p_period)` -- real computed stats replacing Math.random() fallbacks
  - `auto_unlock_expired_disputes()` -- unlocks disputes locked for more than 30 minutes
  - `on_dispute_status_change` trigger -- auto-inserts dispute_history on status/assignment/resolution changes
  - `on_dispute_assignment_change` trigger -- auto-logs to activity_feed on assignment changes
- WS3: Settings Table and Persistence
  - Created `app_settings` table with RLS (Manager-only write, authenticated read)
  - Seeded 6 default settings: sla_days, auto_assign_enabled, max_disputes_per_analyst, notification preferences
  - Created `settings.service.ts` with `getSettings()` and `saveSettings()` functions
- WS4: Service Layer Fixes
  - `dashboard.service.ts`: replaced hardcoded '13 min' with `get_dashboard_kpis()` RPC
  - `user.service.ts`: replaced Math.random() fallbacks with `get_team_stats()` RPC
  - `dispute.service.ts`: all mutations (assign, lock, unlock, resolve) now use server-side RPCs
  - `dispute.service.ts`: comment IDs now use `crypto.randomUUID()` instead of `'c' + Date.now()`
  - `document.service.ts`: document IDs now use `crypto.randomUUID()` instead of `'doc-' + Date.now()`
  - `admin/users/page.tsx`: added email uniqueness check before insert, assigned disputes check before delete, UUID for user IDs
  - `letter-trigger.tsx`: now loads triggered letters from DB on mount and refreshes after each trigger
- WS5: Realtime and Error Handling
  - Queue page subscribes to `disputes` table changes (INSERT, UPDATE, DELETE) via Supabase Realtime
  - Enabled `REPLICA IDENTITY FULL` and added disputes/notifications to `supabase_realtime` publication
  - Created reusable `useRealtimeSubscription` hook (`lib/hooks/use-realtime.ts`)
  - Created `ErrorBoundary` component (`components/error-boundary.tsx`)
  - Added Next.js App Router error boundaries: `app/(dashboard)/error.tsx` and `app/(dashboard)/dispute/[id]/error.tsx`
  - Created `withRetry` utility (`lib/utils/retry.ts`) with exponential backoff and jitter
  - Wrapped all critical mutations (assign, lock, unlock, resolve) in retry logic
- Updated `database.types.ts` with `app_settings` table types and all RPC function types

### Changed
- Login page redesigned to match ServicingIT prototype: larger 64px logo above card, ACA branding with "Operations Dashboard" subtitle, bold "Sign in" heading, uppercase labels, ACA-red (#C2002F) button with arrow icon, "ACA Acceptance - Internal Use Only" footer
- Admin Settings page now reads from and writes to `app_settings` Supabase table instead of using `setTimeout` mock
- Sidebar logo increased from 28px to 36px in expanded state for better readability
- Dashboard Recent Disputes / Activity Feed grid changed from 50/50 to 60/40 split; removed redundant Type and Date columns from Recent Disputes table; Activity Feed height now fills available space instead of fixed 340px
- Queue lock icons now show "Locked by {name}" tooltip on hover via shadcn Tooltip component
- Dispute detail layout reorganized: Field Comparison and AI Analysis side by side (row 1), Document Viewer and Review Actions / Letter Trigger side by side (row 2), Dispute History full width (row 3)

### Added
- Re-architecture design document for migrating CreditDisputePlatform from Angular 21 to Next.js 16
- Design approved for full framework rewrite: Angular + PrimeNG to Next.js + React 19 + shadcn/ui + Tailwind CSS 4
- Approach: Fork ServicingIT project structure and graft CreditDisputePlatform domain features
- Unified application consolidating both credit-dispute-app and ID-Theft-PlatformUI into a single Next.js app
- Adopted ServicingIT's 13-theme system (ACA default) via theme-factory pattern
- Design document saved to `documentation/plan/2026-02-24-re-architect-nextjs-design.md`
- Implementation plan with 19 tasks across 6 phases saved to `documentation/plan/2026-02-24-re-architect-nextjs-implementation.md`
- Phase 1 foundation: package.json, tsconfig.json, next.config.ts, postcss.config.mjs, .env.local, globals.css, 28 shadcn/ui components, lib/ utilities, hooks/use-mobile.ts
- Phase 2 layout shell: root layout with ThemeProvider, Inter/Geist Mono fonts, theme init script, and Sonner toaster
- Auth middleware redirecting unauthenticated users to /login and authenticated users away from /login
- Dashboard shell with sidebar, site header, dot grid background, and primary glow effect
- Navigation components: nav-main.tsx, nav-user.tsx, app-sidebar.tsx with CreditDispute branding
- Theme switcher component with color mode toggle and multi-theme grid
- Dispute filter context (lib/dispute-filters.tsx) with status, risk level, and time period filters
- Site header with route-aware dispute filters (status/risk on /queue, period on / and /reports)
- Dashboard route group layout wrapping children in DisputeFilterProvider and DashboardShell
- Full dashboard page at app/(dashboard)/page.tsx (server component with parallel data fetching)
- Dashboard sub-components in components/dashboard/:
  - kpi-cards.tsx: 4-card KPI summary grid (Disputes in Queue, Completed, Avg Resolution Time, Pending Review) with Tabler icons and trend indicators
  - dispute-volume-chart.tsx: Recharts BarChart showing received vs completed disputes by week, using shadcn ChartContainer
  - risk-distribution-chart.tsx: Recharts donut PieChart showing High/Medium/Low risk distribution with status colors
  - recent-disputes-table.tsx: Last 10 disputes table with risk badges, status badges, and linked IDs using shadcn Table
  - activity-feed.tsx: Scrollable activity feed with analyst name, action, dispute link, and timestamp
  - index.ts: barrel export for all dashboard components
- Database types definition at lib/database.types.ts (ported from Angular source)
- Supabase service layer ported as plain async functions in lib/services/:
  - dispute.service.ts: getDisputes, getDisputeById, updateDisputeStatus, assignDispute, assignDisputes, lockDispute, unlockDispute, getFieldComparisons, getDisputeHistory, getComments, addComment, getLetterTypes, triggerLetter, getTriggeredLetters
  - dashboard.service.ts: getKPIs, getRiskDistribution, getDisputeVolumeData, getActivityFeed, logActivity
  - document.service.ts: getDocuments, uploadDocument
  - user.service.ts: getCurrentUser, getUsers, getAnalysts, getTeamMembers
  - notification.service.ts: getNotifications, markAsRead, markAllAsRead

- Dispute Detail page at app/(dashboard)/dispute/[id]/page.tsx (server component with parallel data fetching via Promise.all)
- Dispute Detail client wrapper at app/(dashboard)/dispute/[id]/dispute-detail-client.tsx with two-column responsive layout (2/3 + 1/3 on desktop, stacked on mobile)
- Dispute detail header with back navigation, dispute ID, consumer name, status badge, risk level badge, account number, application number, and due date
- Six dispute sub-components ported from Angular source under components/dispute/:
  - field-comparison.tsx: Side-by-side table comparing ACDV, Internal, and Funding document values with color-coded match indicators (exact/minor/major) and legend
  - ai-analysis.tsx: AI/Agent analysis card with color-coded recommendation box, confidence Progress bar, reasoning, major/minor classifications, and acceptable differences
  - document-viewer.tsx: Tabbed document viewer with zoom controls, PDF/image preview, extracted data side panel with read-only field list, and upload functionality via document service
  - dispute-history.tsx: Vertical timeline of prior disputes with outcome badges, changed field tags, reviewer info, notes, and integrated comment section with add-comment form
  - review-actions.tsx: Context-sensitive action buttons (Submit as Unsubstantiated, Requires Investigation, ID Theft Substantiated) with AlertDialog confirmations, toast notifications, and activity logging
  - letter-trigger.tsx: Letter generation interface with type selector dropdown, send button, triggered letters log, and activity logging
- AlertDialog UI component at components/ui/alert-dialog.tsx (radix-ui based, matching existing shadcn component patterns)

- Reports page at app/(dashboard)/reports/page.tsx (server + client component split):
  - Server component fetches completed disputes and volume data
  - 4 summary stat cards: Total Resolved, Unsubstantiated, ID Theft Substantiated, Resolution Rate
  - Dispute Volume Trend bar chart (Recharts) showing received vs completed by week
  - Disputes by Outcome doughnut chart (Recharts) with resolution type breakdown
  - Resolved Disputes table (TanStack React Table) with sortable columns: ID, Consumer Name, Outcome, Resolved By, Created, Resolved Date
  - Period filter via useDisputeFilters() (Today, This Week, This Month, All Time)
  - Pagination support with 10 rows per page
- Admin Settings page at app/(dashboard)/admin/settings/page.tsx:
  - SLA Configuration card with dispute SLA days and warning threshold inputs
  - Notifications card with toggle switches for email, in-app, and high-risk alerts
  - Auto-Assignment card with enable toggle and max disputes per analyst input
  - System Info card displaying app version, framework, Supabase connection status, and environment
  - Save button with toast confirmation via sonner
- User Management page at app/(dashboard)/admin/users/page.tsx:
  - Users table (TanStack React Table) with columns: Name (with avatar initials), Email, Role, Actions
  - Add User button opening a Dialog with React Hook Form + Zod v4 validated form (Name, Email, Role)
  - Edit user via row action (same dialog pre-filled)
  - Delete user with AlertDialog confirmation
  - CRUD operations via Supabase browser client
  - Toast notifications for all mutations
- shadcn/ui AlertDialog component at components/ui/alert-dialog.tsx
- shadcn/ui Switch component at components/ui/switch.tsx

- Phase 6 polish: error boundaries and loading states
  - `app/not-found.tsx`: Custom 404 page with centered message and Return to Dashboard button
  - `app/error.tsx`: Client-side error boundary displaying error message with Try Again reset button
  - `app/(dashboard)/loading.tsx`: Dashboard loading skeleton with 4 KPI card skeletons and 2 chart skeletons
  - `app/(dashboard)/queue/loading.tsx`: Queue loading skeleton with toolbar and 8 table row skeletons
  - `app/(dashboard)/dispute/[id]/loading.tsx`: Dispute detail loading skeleton with header, 2-column content, and sidebar skeletons
  - `app/(dashboard)/reports/loading.tsx`: Reports loading skeleton with 4 stat card skeletons and chart/table skeletons

### Changed
- Excluded credit-dispute-app directory from tsconfig.json to prevent Angular sub-project type errors during Next.js build

### Deployment
- Initialized git repo at CreditDisputePlatform root with Next.js-specific .gitignore
- Pushed to GitHub repo `aca-emily-brushaber/ID-Theft-PlatformUI` (replacing Angular codebase)
- Added `.npmrc` to use public npm registry (resolves JFrog auth errors on Vercel)
- Regenerated `package-lock.json` from public npm registry (removed all JFrog resolved URLs)
- Added `vercel.json` to configure Next.js framework detection for Vercel builds
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables on Vercel project
- Deployed to Vercel production: `id-theft-platform-ui-6mzr.vercel.app` (deployment READY)
- Verified Supabase connection: 10 tables, 15 disputes, 6 users in `id-theft-platform` project
- Login page renders and auth middleware redirects correctly on live deployment

### Technical Notes
- Build passes cleanly: `npm run build` compiles with zero TypeScript errors
- All 8 routes verified: /, /login, /queue, /dispute/[id], /reports, /admin/settings, /admin/users, /_not-found
- Dynamic routes (/, /dispute/[id], /reports) use server-side data fetching
- Static routes (/login, /queue, /admin/settings, /admin/users) prerender at build time
- No ServicingIT-specific code remaining (developer, jira, sync-jira references removed)
- All UI colors use CSS variables for automatic light/dark/theme support

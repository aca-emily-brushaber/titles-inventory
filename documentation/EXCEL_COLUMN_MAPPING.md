# RepoTitle TitleLocation CSV mapping

## Source file

- Committed CSV: [`data/RepoTitle_TitleLocation_Report.csv`](../data/RepoTitle_TitleLocation_Report.csv)
- Regenerate typed seed after changes: `npm run generate:titles` (writes [`lib/generated/titles-seed.json`](../lib/generated/titles-seed.json))

## Report columns to `TitleRow`

| CSV column | TypeScript field | Notes |
|------------|------------------|--------|
| (generated) | `id` | `t-` + SHA-256 hex (32 chars) of normalized account + VIN |
| `auction_name` | `auction_name` | Auction / yard name |
| `vin` | `vin` | |
| `account_number` | `account_number` | Excel `=""90124625401""` normalized to digits |
| `account_status` | `account_status` | e.g. OPEN |
| `assignment_status` | `assignment_status` | Full string from report |
| (derived) | `assignment_group` | See assignment groups below |
| `client_age` | `client_age` | Days (number) or null |
| `title_received_date` | `title_received_date` | YYYY-MM-DD or null |
| `title_location` | `title_location` | Code or empty |
| `title_location_date` | `title_location_date` | YYYY-MM-DD or null |
| `title_state` | `title_state` | Two-letter or empty |
| `recovery_status` | `recovery_status` | Code |
| `repossessed_date` | `repossessed_date` | YYYY-MM-DD or null; queue and title header use this for **Repossessed** and **Age** |
| (derived) | `created_at` | From `repossessed_date` or `title_location_date` or default |
| (derived) | `updated_at` | Set at import |
| (derived) | `status` | `TitleStatus` from `account_status` (OPEN → In Progress) |
| — | `assigned_to`, `locked_by`, `locked_at` | Mock UI only; null in seed |
| (derived) | `daily_pull_bucket` | See Daily Pull report below |
| — | `shipping_label`, `shipping_location`, `shipped_at` | Not in RepoTitle CSV; application fields (`null` in seed). `shipped_at` is set when shipping is first recorded (see `updateShipping`). |

**Age in the UI** (`lib/titles/age-days.ts`): calendar days from `repossessed_date` to today (UTC date boundaries). If `repossessed_date` is null, Age shows as em dash.

## Title detail timeline (`lib/titles/title-timeline.ts`)

The **History & transfers** section merges, in chronological order:

| Source | Events |
|--------|--------|
| RepoTitle dates | Repossessed (`repossessed_date`), Title at location (`title_location_date` + location code), Title received (`title_received_date`) |
| Shipping | `shipped_at` with label/location (application field; see `updateShipping` / title detail UI) |
| System | Queue record created (`created_at`), file locked (`locked_at` + `locked_by` when present), Completed (`updated_at` when `status` is Completed) |
| Transfers | `TitleTransferRow` entries (`createTransfer` / mock seed) with full timestamp |

Not shown on the same timeline (but available on the page or for future wiring): comment timestamps (`TitleCommentRow`), document/verification activity, `assignment_status` / `recovery_status` (text without extra dates), Daily Pull bucket, EOSCAR/OnBase when integrated.

## Daily Pull report (`TitleRow.daily_pull_bucket`)

The queue’s second row of filters follows sheet groups from [`data/Titles Daily Pull Report.xlsx`](../data/Titles%20Daily%20Pull%20Report.xlsx). Canonical ids and merged sheets are defined in [`lib/titles/daily-pull-filters.ts`](../lib/titles/daily-pull-filters.ts) (for example REPO AFFIDAVIT STATES 1–3 → `repo_affidavit`; REPO FLIPPED GREER DMV INITIAL and FINAL → `repo_flip_greer_dmv`).

`npm run generate:titles` cross-references **Account Number** (normalized digits) on each workbook sheet with the RepoTitle CSV: each account is assigned the bucket for the sheet it appears on (workbook sheet order wins if an account appears on multiple sheets). Accounts present in RepoTitle but **not** on any Daily Pull sheet get `daily_pull_bucket: null` and only appear when the queue filter **All** is selected (not on a named Daily Pull tab). Parsing uses the OOXML inside the xlsx (`scripts/generate-titles-seed.mjs`); the **Manual Repo Tile Requests** sheet uses the same **Account Number** header in a different column (detection is by header cell, not fixed column).

A production backend should populate this field from the same report or warehouse using the same account-to-bucket rules.

## Assignment groups (`lib/titles/assignment-groups.ts`)

Raw `assignment_status` values are grouped for tabs and transfers:

| Group id | Typical assignment_status values |
|----------|----------------------------------|
| `ClearedForSale` | Cleared for Sale |
| `OnBlock` | On Block |
| `AwaitingClearance` | Awaiting Clearance / Inspected, / Repaired, / Secured |
| `InTransit` | In Transit / Picked Up, In Transit / Released For Pickup |
| `Pickup` | Assigned for Pickup, Pickup Accepted |

`getAssignmentGroup()` maps any unknown string to `AwaitingClearance` (adjust if new statuses appear).

Bulk transfer sets `assignment_status` to `DEFAULT_ASSIGNMENT_STATUS[group]` for the destination group.

## Status values

`TitleStatus`: `Pending`, `In Progress`, `Hold`, `Completed` — derived in the generator from `account_status` and UI needs.

## Import process

1. Replace `data/RepoTitle_TitleLocation_Report.csv` with an updated export when needed.
2. Run `npm run generate:titles`.
3. Commit `lib/generated/titles-seed.json` (or regenerate in CI before build).

No runtime CSV parsing in the browser.

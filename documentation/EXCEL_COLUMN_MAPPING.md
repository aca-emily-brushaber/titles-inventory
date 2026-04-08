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
| `repossessed_date` | `repossessed_date` | YYYY-MM-DD or null |
| (derived) | `due_date` | Prefer `title_location_date`, else `repossessed_date`, else heuristic from `client_age` |
| (derived) | `created_at` | From `repossessed_date` or `title_location_date` or default |
| (derived) | `updated_at` | Set at import |
| (derived) | `status` | `TitleStatus` from `account_status` (OPEN → In Progress) |
| — | `assigned_to`, `locked_by`, `locked_at` | Mock UI only; null in seed |

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

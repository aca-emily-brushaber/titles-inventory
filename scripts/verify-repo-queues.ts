/**
 * Repo queue derivation smoke tests (no test framework; run: npm run test).
 * Uses `npx tsx` so no vitest dependency is required.
 */
import assert from "node:assert/strict"
import type { TitleRow } from "../lib/titles/types"
import { deriveHoldReasonDisplay, deriveRepoQueue } from "../lib/titles/repo-queues"

function base(over: Partial<TitleRow>): TitleRow {
  return {
    id: "t-test",
    vin: "1HGBH41JXMN109186",
    account_number: "90000000001",
    auction_name: "Sample Auction",
    account_status: "OPEN",
    assignment_status: "Awaiting Clearance /Inspected",
    assignment_group: "AwaitingClearance",
    client_age: null,
    title_received_date: "2024-01-15",
    title_location: null,
    title_location_date: null,
    title_state: "TX",
    recovery_status: "01",
    repossessed_date: "2024-01-01",
    assigned_to: null,
    locked_by: null,
    locked_at: null,
    created_at: "2024-01-01T12:00:00.000Z",
    updated_at: "2024-01-01T12:00:00.000Z",
    status: "In Progress",
    daily_pull_bucket: null,
    shipping_label: null,
    shipping_location: null,
    shipped_at: null,
    ...over,
  }
}

assert.equal(deriveRepoQueue(base({ status: "Hold", title_received_date: null })), "Hold")
assert.equal(deriveRepoQueue(base({ status: "Pending", title_received_date: null })), "NotReceived")
assert.equal(deriveRepoQueue(base({ status: "Completed", title_received_date: null })), "Other")
assert.equal(
  deriveRepoQueue(
    base({
      auction_name: "Manheim Dallas",
      daily_pull_bucket: "repo_flip_par",
      title_received_date: "2024-02-01",
    })
  ),
  "Manheim"
)
assert.equal(
  deriveRepoQueue(base({ daily_pull_bucket: "repo_flip_par", title_received_date: "2024-02-01" })),
  "PAR"
)
assert.equal(
  deriveRepoQueue(base({ daily_pull_bucket: "repo_flip_fl", title_received_date: "2024-02-01" })),
  "FL"
)
assert.equal(
  deriveRepoQueue(
    base({ title_state: "MO", title_received_date: "2024-02-01", daily_pull_bucket: null })
  ),
  "MO"
)
assert.equal(
  deriveRepoQueue(base({ daily_pull_bucket: "repo_flip_greer_dmv", title_received_date: "2024-02-01" })),
  "Other"
)

const holdReason = deriveHoldReasonDisplay(
  base({ recovery_status: "pending mileage", assignment_status: "Hold review" })
)
assert.ok(holdReason.includes("pending mileage"))

console.log("repo queue derivation: all checks passed")

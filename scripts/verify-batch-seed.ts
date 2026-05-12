/**
 * Validates document batch seed title_id references against titles-seed.json.
 * Run: npm run test (chained) or npx tsx scripts/verify-batch-seed.ts
 */
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const titlesPath = path.join(root, "lib", "generated", "titles-seed.json")
const batchesPath = path.join(root, "lib", "generated", "document-batches-seed.json")

const titlesData = JSON.parse(fs.readFileSync(titlesPath, "utf8")) as { titles: { id: string }[] }
const batchData = JSON.parse(fs.readFileSync(batchesPath, "utf8")) as {
  batches: { id: string }[]
  items: { batch_id: string; title_id: string; sequence: number }[]
}

const titleIds = new Set(titlesData.titles.map((t) => t.id))
const batchIds = new Set(batchData.batches.map((b) => b.id))

for (const item of batchData.items) {
  assert.ok(batchIds.has(item.batch_id), `item references unknown batch_id ${item.batch_id}`)
  assert.ok(Number.isFinite(item.sequence) && item.sequence >= 1, `invalid sequence ${item.sequence}`)
}

const knownMissingDemo = "t-title-not-in-seed-0000000000000000"
for (const item of batchData.items) {
  if (item.title_id === knownMissingDemo) continue
  assert.ok(titleIds.has(item.title_id), `batch item title_id not in titles seed: ${item.title_id}`)
}

console.log("document batch seed: all checks passed")

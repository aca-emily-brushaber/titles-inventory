/**
 * Reads data/RepoTitle_TitleLocation_Report.csv and writes lib/generated/titles-seed.json
 * Run: npm run generate:titles
 */
import fs from "fs"
import crypto from "crypto"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const csvPath = path.join(root, "data", "RepoTitle_TitleLocation_Report.csv")
const outPath = path.join(root, "lib", "generated", "titles-seed.json")

const ASSIGNMENT_GROUPS = [
  "ClearedForSale",
  "OnBlock",
  "AwaitingClearance",
  "InTransit",
  "Pickup",
]

function getAssignmentGroup(assignmentStatus) {
  const s = assignmentStatus.trim()
  if (s === "Cleared for Sale") return "ClearedForSale"
  if (s === "On Block") return "OnBlock"
  if (s.startsWith("Awaiting Clearance")) return "AwaitingClearance"
  if (s.startsWith("In Transit")) return "InTransit"
  if (s === "Assigned for Pickup" || s === "Pickup Accepted") return "Pickup"
  return "AwaitingClearance"
}

const DEFAULT_STATUS = {
  ClearedForSale: "Cleared for Sale",
  OnBlock: "On Block",
  AwaitingClearance: "Awaiting Clearance /Inspected",
  InTransit: "In Transit / Released For Pickup",
  Pickup: "Assigned for Pickup",
}

function parseLine(line) {
  const out = []
  let cur = ""
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      q = !q
      continue
    }
    if (!q && c === ",") {
      out.push(cur)
      cur = ""
      continue
    }
    cur += c
  }
  out.push(cur)
  return out
}

function normalizeAccount(raw) {
  if (!raw) return ""
  let s = raw.trim()
  if (s.startsWith('="') && s.endsWith('"')) s = s.slice(2, -1)
  else if (s.startsWith("=")) s = s.replace(/^=/, "").replace(/^"/, "").replace(/"$/, "")
  return s.replace(/\D/g, "") || s
}

function parseDateField(s) {
  const t = (s || "").trim()
  if (!t) return null
  return t.length >= 10 ? t.slice(0, 10) : t
}

function deriveDueDate(titleLocationDate, repossessedDate, clientAge) {
  if (titleLocationDate) return titleLocationDate
  if (repossessedDate) return repossessedDate
  if (clientAge != null && !Number.isNaN(clientAge)) {
    const d = new Date()
    d.setDate(d.getDate() - Math.min(clientAge, 3650))
    return d.toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

function titleStatusFromAccount(accountStatus) {
  const u = (accountStatus || "").toUpperCase()
  if (u === "CLOSED" || u === "COMPLETED") return "Completed"
  if (u === "OPEN") return "In Progress"
  return "In Progress"
}

const t = fs.readFileSync(csvPath, "utf8")
const lines = t.split(/\r?\n/).filter(Boolean)
const hdr = parseLine(lines[0])
const col = (name) => hdr.indexOf(name)

const iAuction = col("auction_name")
const iVin = col("vin")
const iAcct = col("account_number")
const iAcctStat = col("account_status")
const iAssign = col("assignment_status")
const iAge = col("client_age")
const iTitleRec = col("title_received_date")
const iLoc = col("title_location")
const iLocDate = col("title_location_date")
const iState = col("title_state")
const iRecov = col("recovery_status")
const iRepo = col("repossessed_date")

const titles = []
const now = new Date().toISOString()

for (let i = 1; i < lines.length; i++) {
  const row = parseLine(lines[i])
  const vin = (row[iVin] || "").trim()
  const accountRaw = row[iAcct] || ""
  const account_number = normalizeAccount(accountRaw)
  const assignment_status = (row[iAssign] || "").trim()
  const assignment_group = getAssignmentGroup(assignment_status)

  const clientAgeRaw = (row[iAge] || "").trim()
  const client_age = clientAgeRaw === "" ? null : Number.parseInt(clientAgeRaw, 10)

  const title_location_date = parseDateField(row[iLocDate])
  const title_received_date = parseDateField(row[iTitleRec])
  const repossessed_date = parseDateField(row[iRepo])

  const id = crypto
    .createHash("sha256")
    .update(`${account_number}|${vin}`)
    .digest("hex")
    .slice(0, 32)

  const created_at = repossessed_date
    ? `${repossessed_date}T12:00:00.000Z`
    : title_location_date
      ? `${title_location_date}T12:00:00.000Z`
      : "2020-01-01T12:00:00.000Z"

  titles.push({
    id: `t-${id}`,
    vin,
    account_number: account_number || `unknown-${i}`,
    auction_name: (row[iAuction] || "").trim(),
    account_status: (row[iAcctStat] || "").trim(),
    assignment_status,
    assignment_group,
    client_age: Number.isFinite(client_age) ? client_age : null,
    title_received_date,
    title_location: (row[iLoc] || "").trim() || null,
    title_location_date,
    title_state: (row[iState] || "").trim(),
    recovery_status: (row[iRecov] || "").trim(),
    repossessed_date,
    assigned_to: null,
    locked_by: null,
    locked_at: null,
    due_date: deriveDueDate(title_location_date, repossessed_date, client_age),
    created_at,
    updated_at: now,
    status: titleStatusFromAccount(row[iAcctStat]),
  })
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify({ titles, generatedAt: now }, null, 0), "utf8")
console.log(`Wrote ${titles.length} titles to ${path.relative(root, outPath)}`)

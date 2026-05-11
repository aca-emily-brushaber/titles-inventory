/**
 * Reads data/RepoTitle_TitleLocation_Report.csv and writes lib/generated/titles-seed.json
 * Cross-references account numbers with `data/Titles Daily Pull Report.xlsx` (OOXML via tar)
 * to set `daily_pull_bucket`. Run: npm run generate:titles
 */
import fs from "fs"
import crypto from "crypto"
import { execFileSync } from "child_process"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const csvPath = path.join(root, "data", "RepoTitle_TitleLocation_Report.csv")
const dailyPullXlsxPath = path.join(root, "data", "Titles Daily Pull Report.xlsx")
const outPath = path.join(root, "lib", "generated", "titles-seed.json")

const ASSIGNMENT_GROUPS = [
  "ClearedForSale",
  "OnBlock",
  "AwaitingClearance",
  "InTransit",
  "Pickup",
]

/**
 * Sheet `name` in workbook order → `daily_pull_bucket` id.
 * Keep in sync with `lib/titles/daily-pull-filters.ts` (`DAILY_PULL_SHEET_TO_BUCKET`).
 */
const SHEET_NAME_TO_BUCKET = {
  "REPO AFFIDAVIT STATES 1": "repo_affidavit",
  "REPO AFFIDAVIT STATES 2": "repo_affidavit",
  "REPO AFFIDAVIT STATES 3": "repo_affidavit",
  "REPO FLIPPED PAR STATES": "repo_flip_par",
  "REPO FLIPPED FL": "repo_flip_fl",
  "REPO FLIPPED GREER DMV INITIAL": "repo_flip_greer_dmv",
  "REPO FLIPPED GREER DMV FINAL": "repo_flip_greer_dmv",
  "Reinstated DealerTrack": "reinstated_dealertrack",
  "Reinstated Invalid Location": "reinstated_invalid_location",
  "Reinstated Wells Fargo": "reinstated_wells_fargo",
  "Manual Repo Tile Requests": "manual_repo_tile_requests",
}

function cellRefToColRow(ref) {
  const m = ref.match(/^([A-Z]+)(\d+)$/)
  if (!m) return null
  return { col: m[1], row: Number.parseInt(m[2], 10) }
}

function readSharedStrings(tmpDir) {
  const p = path.join(tmpDir, "xl", "sharedStrings.xml")
  if (!fs.existsSync(p)) return []
  const xml = fs.readFileSync(p, "utf8")
  const strings = []
  const re = /<si>([\s\S]*?)<\/si>/g
  let m
  while ((m = re.exec(xml)) !== null) {
    const inner = m[1]
    const t = inner.match(/<t[^>]*>([^<]*)<\/t>/)
    strings.push(t ? t[1] : "")
  }
  return strings
}

function extractCellValue(fullCellXml, sharedStrings) {
  const open = fullCellXml.match(/^<c([^>]*)>/)
  const tShared = open && open[1].includes('t="s"')
  const inner = fullCellXml.replace(/^<c[^>]*>/, "").replace(/<\/c>\s*$/, "")
  if (inner.includes("<is>")) {
    const tm = inner.match(/<t[^>]*>([^<]*)<\/t>/)
    return tm ? tm[1].trim() : ""
  }
  const vm = inner.match(/<v>([^<]*)<\/v>/)
  if (!vm) return ""
  const val = vm[1].trim()
  if (tShared && sharedStrings.length) {
    return String(sharedStrings[Number.parseInt(val, 10)] ?? "").trim()
  }
  return val
}

function findAccountNumberHeader(xml, sharedStrings) {
  const cellRe = /<c[^>]*r="([A-Z]+\d+)"[^>]*>[\s\S]*?<\/c>/g
  let m
  while ((m = cellRe.exec(xml)) !== null) {
    const ref = m[1]
    const cr = cellRefToColRow(ref)
    if (!cr) continue
    const text = extractCellValue(m[0], sharedStrings)
    if (text === "Account Number") return { col: cr.col, headerRow: cr.row }
  }
  return null
}

function parseAccountsFromSheetXml(xml, sharedStrings) {
  const header = findAccountNumberHeader(xml, sharedStrings)
  if (!header) return []
  const accounts = []
  const rowRe = /<row[^>]*\sr="(\d+)"[^>]*>([\s\S]*?)<\/row>/g
  let m
  while ((m = rowRe.exec(xml)) !== null) {
    const rowNum = Number.parseInt(m[1], 10)
    if (rowNum <= header.headerRow) continue
    const rowXml = m[0]
    const ref = `${header.col}${rowNum}`
    const cellMatch = rowXml.match(new RegExp(`<c[^>]*r="${ref}"[^>]*>[\\s\\S]*?<\\/c>`))
    if (!cellMatch) continue
    const raw = extractCellValue(cellMatch[0], sharedStrings)
    const acct = normalizeAccount(raw)
    if (acct) accounts.push(acct)
  }
  return accounts
}

function readWorkbookSheetNames(tmpDir) {
  const wb = fs.readFileSync(path.join(tmpDir, "xl", "workbook.xml"), "utf8")
  return [...wb.matchAll(/<sheet[^>]*name="([^"]+)"/g)].map((x) => x[1])
}

/**
 * @returns {Record<string, string>} normalized account digits → bucket id (first sheet wins)
 */
function buildAccountToBucketMap() {
  const map = Object.create(null)
  if (!fs.existsSync(dailyPullXlsxPath)) {
    console.warn(
      `Daily Pull workbook missing at ${path.relative(root, dailyPullXlsxPath)} — daily_pull_bucket will be null for all titles.`
    )
    return map
  }
  const tmpDir = path.join(root, ".tmp-daily-pull-gen")
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    fs.mkdirSync(tmpDir, { recursive: true })
    execFileSync("tar", ["-xf", dailyPullXlsxPath, "-C", tmpDir], { stdio: "inherit" })
  } catch (e) {
    console.warn("Could not extract Daily Pull xlsx (tar):", e.message)
    return map
  }

  const sharedStrings = readSharedStrings(tmpDir)
  let sheetNames
  try {
    sheetNames = readWorkbookSheetNames(tmpDir)
  } catch (e) {
    console.warn("Could not read workbook.xml:", e.message)
    fs.rmSync(tmpDir, { recursive: true, force: true })
    return map
  }

  let conflicts = 0
  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i]
    const bucket = SHEET_NAME_TO_BUCKET[sheetName]
    if (!bucket) continue
    const sheetPath = path.join(tmpDir, "xl", "worksheets", `sheet${i + 1}.xml`)
    if (!fs.existsSync(sheetPath)) continue
    const xml = fs.readFileSync(sheetPath, "utf8")
    const accounts = parseAccountsFromSheetXml(xml, sharedStrings)
    for (const acct of accounts) {
      if (map[acct] !== undefined && map[acct] !== bucket) {
        conflicts++
        continue
      }
      if (map[acct] === undefined) map[acct] = bucket
    }
  }

  fs.rmSync(tmpDir, { recursive: true, force: true })
  const n = Object.keys(map).length
  console.log(
    `Daily Pull: ${n} account(s) mapped to buckets from workbook${conflicts ? ` (${conflicts} conflict(s) skipped, first sheet wins)` : ""}.`
  )
  return map
}

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

const accountToBucket = buildAccountToBucketMap()

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
    created_at,
    updated_at: now,
    status: titleStatusFromAccount(row[iAcctStat]),
    daily_pull_bucket: accountToBucket[account_number] ?? null,
    shipping_label: null,
    shipping_location: null,
    shipped_at: null,
  })
}

let matchedPull = 0
for (const row of titles) {
  if (row.daily_pull_bucket != null) matchedPull++
}
console.log(
  `RepoTitle rows with a Daily Pull bucket: ${matchedPull} / ${titles.length} (others only appear under "All").`
)

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify({ titles, generatedAt: now }, null, 0), "utf8")
console.log(`Wrote ${titles.length} titles to ${path.relative(root, outPath)}`)

/**
 * Reads `data/Titles Forms and Letters.xlsx` (OOXML zip), parses Forms + Letters sheets,
 * writes `lib/generated/state-forms.json` for the app.
 *
 * Run: node scripts/import-titles-forms-xlsx.mjs
 *
 * Requires: `tar` available (Windows 10+ / Git bash) to extract the xlsx.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const XLSX_PATH = join(ROOT, "data", "Titles Forms and Letters.xlsx")
const OUT_JSON = join(ROOT, "lib", "generated", "state-forms.json")
const TMP = join(ROOT, ".tmp-import-forms")

/** Map full / common names from workbook column C → two-letter code */
const STATE_NAME_TO_CODE = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Conneticut: "CT",
  Connecticut: "CT",
  Delaware: "DE",
  "District of Columbia": "DC",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennyslvania: "PA",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  All: "ALL",
}

function parseSharedStrings(xml) {
  const strings = []
  const re = /<si>([\s\S]*?)<\/si>/g
  let m
  while ((m = re.exec(xml))) {
    const inner = m[1]
    const textParts = inner.match(/<t[^>]*>([^<]*)<\/t>/g) || []
    let s = ""
    for (const p of textParts) {
      const tm = p.match(/<t[^>]*>([^<]*)<\/t>/)
      if (tm) s += tm[1]
    }
    if (!textParts.length) {
      const single = inner.match(/<t[^>]*>([^<]*)<\/t>/)
      s = single ? single[1] : ""
    }
    strings.push(s)
  }
  return strings
}

function colLetters(ref) {
  const m = ref.match(/^([A-Z]+)(\d+)$/)
  if (!m) return { col: "", row: 0 }
  const letters = m[1]
  const row = parseInt(m[2], 10)
  let n = 0
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - 64)
  }
  return { col: letters, colIndex: n - 1, row }
}

/** Build map "A2" -> raw cell value (string index or number string) */
function parseSheetData(xml) {
  const cellMap = new Map()
  const rowRe = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g
  let rm
  while ((rm = rowRe.exec(xml))) {
    const rowNum = rm[1]
    const rowContent = rm[2]
    const cRe = /<c[^>]*r="([A-Z]+\d+)"([^>]*)>(?:<v>([^<]*)<\/v>)?/g
    let cm
    while ((cm = cRe.exec(rowContent))) {
      const addr = cm[1]
      const attrs = cm[2]
      const v = cm[3] ?? ""
      const isString = attrs.includes('t="s"')
      cellMap.set(addr, { v, isString })
    }
  }
  return cellMap
}

function cellStr(cellMap, col, row, shared) {
  const addr = `${col}${row}`
  const c = cellMap.get(addr)
  if (!c) return ""
  if (c.isString) {
    const idx = parseInt(c.v, 10)
    return shared[idx] ?? ""
  }
  return c.v
}

function extractZip() {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true })
  mkdirSync(TMP, { recursive: true })
  execSync(`tar -xf "${XLSX_PATH.replace(/\\/g, "/")}" -C "${TMP.replace(/\\/g, "/")}"`, {
    stdio: "inherit",
    shell: true,
  })
}

function main() {
  if (!existsSync(XLSX_PATH)) {
    console.error("Missing file:", XLSX_PATH)
    process.exit(1)
  }

  extractZip()

  const sharedPath = join(TMP, "xl", "sharedStrings.xml")
  const sheet1 = join(TMP, "xl", "worksheets", "sheet1.xml")
  const sheet2 = join(TMP, "xl", "worksheets", "sheet2.xml")

  const shared = parseSharedStrings(readFileSync(sharedPath, "utf8"))
  const formsXml = readFileSync(sheet1, "utf8")
  const lettersXml = readFileSync(sheet2, "utf8")

  const formsCells = parseSheetData(formsXml)
  const lettersCells = parseSheetData(lettersXml)

  const formEntries = []
  let id = 0

  /** Forms sheet: row 2–53, columns C state, D/F/H/J form names, K/L/M/N */
  for (let r = 2; r <= 53; r++) {
    const stateName = cellStr(formsCells, "C", r, shared).trim()
    if (!stateName) continue

    const stateCode = STATE_NAME_TO_CODE[stateName] || stateName.slice(0, 2).toUpperCase()
    const team = cellStr(formsCells, "A", r, shared).trim()
    const process = cellStr(formsCells, "B", r, shared).trim()
    const notarized = cellStr(formsCells, "K", r, shared).trim()
    const titleRequired = cellStr(formsCells, "L", r, shared).trim()
    const securityRequired = cellStr(formsCells, "M", r, shared).trim()
    const notes = cellStr(formsCells, "N", r, shared).trim()

    for (const col of ["D", "F", "H", "J"]) {
      const formName = cellStr(formsCells, col, r, shared).trim()
      if (!formName) continue
      id += 1
      formEntries.push({
        id: `form-${stateCode}-${id}`,
        state: stateCode,
        stateName,
        team,
        process,
        formName,
        notarized,
        titleRequired,
        securityAgreementRequired: securityRequired,
        notes,
        sourceSheet: "Forms",
        sourceRow: r,
      })
    }
  }

  /** Letters sheet A1:E12 */
  const letterEntries = []
  let lid = 0
  for (let r = 2; r <= 12; r++) {
    const process = cellStr(lettersCells, "B", r, shared).trim()
    const letterName = cellStr(lettersCells, "C", r, shared).trim()
    const recipient = cellStr(lettersCells, "D", r, shared).trim()
    const notesAlice = cellStr(lettersCells, "E", r, shared).trim()
    if (!letterName && !process) continue
    lid += 1
    letterEntries.push({
      id: `letter-${lid}`,
      team: cellStr(lettersCells, "A", r, shared).trim(),
      process,
      letterName,
      recipient,
      notesAlice,
      sourceSheet: "Letters",
      sourceRow: r,
    })
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    sourceFile: "data/Titles Forms and Letters.xlsx",
    description:
      "Imported from workbook: Forms (state-scoped DMV/forms) and Letters (specialty letters). Column C = state; K/L/M = Notarized / Title required / Security agreement required; N = notes.",
    formsByState: {},
    forms: formEntries,
    letters: letterEntries,
  }

  for (const f of formEntries) {
    if (!payload.formsByState[f.state]) payload.formsByState[f.state] = []
    payload.formsByState[f.state].push(f.id)
  }

  mkdirSync(dirname(OUT_JSON), { recursive: true })
  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), "utf8")
  console.log("Wrote", OUT_JSON)
  console.log("Forms:", formEntries.length, "Letters:", letterEntries.length)
}

main()

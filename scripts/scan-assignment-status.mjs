import fs from "fs"

const p = new URL("../data/RepoTitle_TitleLocation_Report.csv", import.meta.url)
const t = fs.readFileSync(p, "utf8")
const lines = t.split(/\r?\n/).filter(Boolean)
const hdr = parseLine(lines[0])
const idx = hdr.indexOf("assignment_status")
const set = new Set()
for (let i = 1; i < lines.length; i++) {
  const row = parseLine(lines[i])
  if (row[idx]) set.add(row[idx])
}
console.log([...set].sort().join("\n"))
console.log("COUNT", set.size)

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

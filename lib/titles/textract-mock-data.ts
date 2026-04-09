/**
 * Mock Textract-style extraction for title verification (Step 3).
 * In production, replace with API response keyed by document / job id.
 */

export type TextractConfidenceBand = "high" | "medium" | "low" | "review"

export interface TextractField {
  id: string
  label: string
  value: string
  /** 0–100 */
  confidence: number | null
  band: TextractConfidenceBand
  /** "System" when sourced from system of record vs OCR */
  source?: "textract" | "system"
}

export interface TextractCategory {
  id: string
  label: string
  fields: TextractField[]
}

export interface TextractExtractionMock {
  categories: TextractCategory[]
  /** Bounding boxes as fraction of image width/height (0–1) for overlay */
  overlays: Array<{
    id: string
    label: string
    left: number
    top: number
    width: number
    height: number
  }>
}

/** Summary stats derived from fields */
export function summarizeTextract(categories: TextractCategory[]) {
  const fields = categories.flatMap((c) => c.fields)
  let needsReview = 0
  let high = 0
  let med = 0
  let low = 0
  for (const f of fields) {
    if (f.band === "review") needsReview++
    else if (f.band === "high") high++
    else if (f.band === "medium") med++
    else low++
  }
  return { total: fields.length, needsReview, high, med, low }
}

/** Connecticut certificate-style mock aligned with product demo */
export const MOCK_CT_TITLE_EXTRACTION: TextractExtractionMock = {
  overlays: [
    { id: "o-vin", label: "VIN", left: 0.06, top: 0.38, width: 0.42, height: 0.06 },
    { id: "o-year", label: "Year", left: 0.08, top: 0.48, width: 0.08, height: 0.04 },
    { id: "o-make", label: "Make", left: 0.2, top: 0.48, width: 0.12, height: 0.04 },
    { id: "o-lien", label: "Lienholder", left: 0.06, top: 0.62, width: 0.55, height: 0.14 },
  ],
  categories: [
    {
      id: "vehicle",
      label: "VEHICLE INFORMATION",
      fields: [
        {
          id: "vin",
          label: "VIN",
          value: "2GNALCEK0H6313986",
          confidence: 99.2,
          band: "high",
          source: "system",
        },
        {
          id: "year",
          label: "Year",
          value: "2017",
          confidence: 54.000004,
          band: "review",
          source: "textract",
        },
        {
          id: "make",
          label: "Make",
          value: "Chevr",
          confidence: 98,
          band: "high",
          source: "textract",
        },
        {
          id: "body",
          label: "Body Style",
          value: "4W",
          confidence: 99,
          band: "high",
          source: "textract",
        },
        {
          id: "model",
          label: "Model",
          value: "Equinox",
          confidence: 100,
          band: "high",
          source: "textract",
        },
      ],
    },
    {
      id: "lien",
      label: "LIENHOLDER INFORMATION",
      fields: [
        {
          id: "lien_name",
          label: "Name of Lienholder",
          value: "AMERICAN CREDIT ACCEPTANCE",
          confidence: 98,
          band: "high",
          source: "textract",
        },
        {
          id: "lien_street",
          label: "Street",
          value: "PO BOX 4419",
          confidence: null,
          band: "high",
          source: "system",
        },
        {
          id: "lien_city",
          label: "City",
          value: "WILMINGTON",
          confidence: null,
          band: "high",
          source: "system",
        },
        {
          id: "lien_state",
          label: "State",
          value: "OH",
          confidence: null,
          band: "high",
          source: "system",
        },
        {
          id: "lien_zip",
          label: "Zip",
          value: "45177",
          confidence: null,
          band: "high",
          source: "system",
        },
        {
          id: "repo_date",
          label: "Date of Repossession",
          value: "Not found",
          confidence: null,
          band: "medium",
          source: "system",
        },
        {
          id: "lien_phone",
          label: "Phone Number",
          value: "",
          confidence: null,
          band: "low",
          source: "textract",
        },
      ],
    },
  ],
}

export function getTextractMockForTitle(titleState: string): TextractExtractionMock | null {
  const s = titleState.trim().toUpperCase().slice(0, 2)
  if (s === "CT") return MOCK_CT_TITLE_EXTRACTION
  return null
}

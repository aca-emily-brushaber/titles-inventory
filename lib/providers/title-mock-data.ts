/**
 * Title seed from `lib/generated/titles-seed.json` (run `npm run generate:titles`).
 */
import type { DocumentRow } from "../data-provider"
import type { TitleRow, TitleTransferRow, TitleCommentRow } from "../titles/types"
import type { AssignmentGroup } from "../titles/assignment-groups"

import titlesSeed from "../generated/titles-seed.json"

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const mockTitles: TitleRow[] = titlesSeed.titles as TitleRow[]

const first = mockTitles[0]
const second = mockTitles[1]
const third = mockTitles[2]

/** Sample transfers tied to first rows when present */
export const mockTitleTransfers: TitleTransferRow[] =
  first && second
    ? [
        {
          id: "tt-001",
          title_id: first.id,
          from_group: "AwaitingClearance" as AssignmentGroup,
          to_group: first.assignment_group,
          transferred_by: "Maria Garcia",
          reason: "Imported RepoTitle snapshot — sample transfer",
          created_at: isoDaysAgo(4),
        },
        {
          id: "tt-002",
          title_id: second.id,
          from_group: "InTransit" as AssignmentGroup,
          to_group: second.assignment_group,
          transferred_by: "David Kim",
          reason: "Sample queue movement",
          created_at: isoDaysAgo(6),
        },
      ]
    : []

export const mockTitleComments: TitleCommentRow[] = first
  ? [
      {
        id: "tc-001",
        title_id: first.id,
        author: "Sarah Johnson",
        text: "Reviewed title location and recovery status.",
        timestamp: isoDaysAgo(1),
      },
      {
        id: "tc-002",
        title_id: first.id,
        author: "System",
        text: "Record loaded from RepoTitle TitleLocation report.",
        timestamp: isoDaysAgo(5),
      },
    ]
  : []

/** Documents reuse DocumentRow; `dispute_id` column stores the title id for mock joins */
export const mockTitleDocuments: DocumentRow[] =
  first && third
    ? [
        {
          id: "tdoc-001",
          dispute_id: first.id,
          document_type: "Title",
          label: "Certificate of Title (front)",
          image_path: "/sample-docs/acdv-report-p1.png",
          pages: ["/sample-docs/acdv-report-p1.png", "/sample-docs/acdv-report-p2.png"],
          extracted_data: [
            { code: "VIN", label: "VIN", value: first.vin, verified: true },
            { code: "ACCT", label: "Account", value: first.account_number, verified: true },
          ],
          source: "onbase",
          onbase_document_id: "OB-T-10001",
          onbase_retrieved_at: isoDaysAgo(5),
        },
        {
          id: "tdoc-002",
          dispute_id: first.id,
          document_type: "Internal",
          label: "Title location report",
          image_path: "/sample-docs/funding-app-p1.png",
          pages: ["/sample-docs/funding-app-p1.png"],
          extracted_data: [],
          source: "manual",
          onbase_document_id: null,
          onbase_retrieved_at: null,
        },
        {
          id: "tdoc-003",
          dispute_id: third.id,
          document_type: "DMV",
          label: "DMV correspondence (sample)",
          image_path: "/sample-docs/acdv-martinez-p1.png",
          pages: ["/sample-docs/acdv-martinez-p1.png"],
          extracted_data: [{ code: "NOTE", label: "Note", value: "Sample", verified: false }],
          source: "onbase",
          onbase_document_id: "OB-T-10003",
          onbase_retrieved_at: isoDaysAgo(2),
        },
      ]
    : []

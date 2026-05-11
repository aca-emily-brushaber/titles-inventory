/**
 * Titles Daily Pull Report — sheet names from `data/Titles Daily Pull Report.xlsx`
 * merged into queue sub-filters (Repossessions second tab row).
 *
 * Merged groups:
 * - REPO AFFIDAVIT STATES 1 / 2 / 3 → Repo Affidavit
 * - REPO FLIPPED GREER DMV INITIAL / REPO FLIPPED GREER DMV FINAL → Repo Flip - Greer DMV
 */

export const DAILY_PULL_FILTER_IDS = [
  "repo_affidavit",
  "repo_flip_par",
  "repo_flip_fl",
  "repo_flip_greer_dmv",
  "reinstated_dealertrack",
  "reinstated_invalid_location",
  "reinstated_wells_fargo",
  "manual_repo_tile_requests",
] as const

export type DailyPullFilterId = (typeof DAILY_PULL_FILTER_IDS)[number]

/** Excel sheet names → canonical `daily_pull_bucket` on {@link TitleRow} */
export const DAILY_PULL_SHEET_TO_BUCKET: Record<string, DailyPullFilterId> = {
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

export const DAILY_PULL_TABS: readonly {
  label: string
  value: "All" | DailyPullFilterId
  tip: string
}[] = [
  { label: "All", value: "All", tip: "All Daily Pull buckets in this assignment view" },
  {
    label: "Repo Affidavit",
    value: "repo_affidavit",
    tip: "Sheets: REPO AFFIDAVIT STATES 1, 2, 3",
  },
  {
    label: "Repo Flip - PAR",
    value: "repo_flip_par",
    tip: "Sheet: REPO FLIPPED PAR STATES",
  },
  {
    label: "Repo Flip - FL",
    value: "repo_flip_fl",
    tip: "Sheet: REPO FLIPPED FL",
  },
  {
    label: "Repo Flip - Greer DMV",
    value: "repo_flip_greer_dmv",
    tip: "Sheets: REPO FLIPPED GREER DMV INITIAL, REPO FLIPPED GREER DMV FINAL",
  },
  {
    label: "Reinstated DealerTrack",
    value: "reinstated_dealertrack",
    tip: "Sheet: Reinstated DealerTrack",
  },
  {
    label: "Reinstated Invalid Location",
    value: "reinstated_invalid_location",
    tip: "Sheet: Reinstated Invalid Location",
  },
  {
    label: "Reinstated Wells Fargo",
    value: "reinstated_wells_fargo",
    tip: "Sheet: Reinstated Wells Fargo",
  },
  {
    label: "Manual repo tile requests",
    value: "manual_repo_tile_requests",
    tip: "Sheet: Manual Repo Tile Requests",
  },
]

export function isDailyPullFilterId(v: string): v is DailyPullFilterId {
  return (DAILY_PULL_FILTER_IDS as readonly string[]).includes(v)
}

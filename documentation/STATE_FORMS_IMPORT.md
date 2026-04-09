# State forms and letters (workbook import)

## Source file

Place the latest download from SharePoint at:

`data/Titles Forms and Letters.xlsx`

## Regenerate app data

From the project root:

```bash
npm run import:forms
```

This runs `scripts/import-titles-forms-xlsx.mjs`, extracts the xlsx with `tar`, and writes:

`lib/generated/state-forms.json`

Commit that JSON when you want the UI to track a new workbook version.

## Workbook layout (as imported)

| Sheet | Purpose |
|-------|---------|
| **Forms** | DMV / state forms by jurisdiction |
| **Letters** | Specialty letters (also exported in JSON for future flows) |

**Forms** columns used in the app:

| Column | Field |
|--------|--------|
| C | State (full name, mapped to two-letter code) |
| D, F, H, J | Form names (each non-empty cell becomes one actionable form row) |
| K | Notarized |
| L | Title required |
| M | Security agreement required |
| N | Notes |

**Letters** columns: Team, Process, Letter, Recipient, Notes/Questions for Alice.

## Sharing outside the repo

- Distribute the same **xlsx** file, or
- Share a **PDF export** of each sheet from Excel, or
- Commit `lib/generated/state-forms.json` and point reviewers to the `forms` and `letters` arrays.

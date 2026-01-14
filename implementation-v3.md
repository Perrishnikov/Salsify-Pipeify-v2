# Pipeify v3 Implementation Plan (Step by Step)

This plan treats `overview.md` as source of truth and uses the v2 codebase as the starting point. It focuses on refactoring toward US/CA split pages, new paste behaviors, simplified parsing, and a Live Preview stub while keeping code function-focused, DRY, and KISS.

## Step 1: Establish v3 structure and entry points (Done)
1. Create `app/US/index.html` and `app/CA/index.html` as separate pages, based on the v2 layout but trimmed to the v3 tab set (Create/Edit Set only).
2. Move shared markup (header, tab shell, table container, error section, live preview section) into small template fragments or duplicate minimally while refactoring later.
3. Update titles and headers to follow `Salsify: Pipeify v3 <countryCode>` for each page.
4. Leave `app/index.html` in place for now, but add a clear note at top that v3 uses `/US/index.html` and `/CA/index.html` only.

## Step 2: Create shared v3 script entry points (Done)
1. Switch v3 pages to ES modules with a single `page.js` entrypoint.
2. Read `data-country-code` from the page body to boot country-specific flows.
1. Add `app/scripts/v3/` folder to isolate v3 logic from v2.
2. Create two thin entry scripts:
   1. `app/scripts/v3/us.js` (bootstraps US page)
   2. `app/scripts/v3/ca.js` (bootstraps CA page)
3. Add a shared bootstrap module `app/scripts/v3/init.js` for wiring event listeners and page sections common to both pages.

## Step 3: Define the core data model (v3 baseline) (Done)
1. Introduce an in-memory state object for v3 (no persistence).
1. Create `app/scripts/v3/models.js` with simple, plain objects for:
   1. Table types per country (US tables: Ingredients, Nutrients, Other; CA tables: Ingredients, Other).
   2. Column definitions per table (fixed Product ID + editable columns per overview).
   3. Row structure (minimal shape: `id`, `tableType`, `cells`, `productId`).
2. Keep the model minimal: no validation logic, no status tracking, no localStorage.

## Step 4: Refactor table rendering to reusable functions (Done)
1. Create `app/scripts/v3/table-render.js`:
   1. `renderTable(tableConfig, rows, options)` returns a table element.
   2. `renderRow(row, columns)` returns a row element.
   3. `renderCell(cell, columnDef)` returns a cell element.
2. Use a small helper for DOM creation to avoid duplicating element building logic.
3. Ensure all tables use the same rendering pipeline, parameterized by table config (US/CA).

## Step 5: Add the Create/Edit Set tab shell (US/CA) (Done)
1. In each page, add the required sections in order:
   1. Drag-and-drop + file chooser
   2. Table section (all tables for that country)
   3. Error section (stub container)
   4. Live preview section (stub container)
2. Replace any v2-specific tab markup with a single Create/Edit Set tab.

## Step 6: Implement the import + paste action stubs (Done)
1. Create `app/scripts/v3/actions.js` with stub functions:
   1. `importSpreadsheet(file, countryCode)`
   2. `pasteRowCA(text)`
   3. `pasteTableUS(text)`
2. For now, parse only enough to populate stub rows (no validation). Return placeholder rows for each table.
3. Ensure the actions update the rendered tables and leave a clear TODO note in each stub.

## Step 7: Wire UI actions to the new stubs (Done)
1. Drag & drop and file chooser call `importSpreadsheet`.
2. CA-only: row-level paste target calls `pasteRowCA`.
3. US-only: table-level paste target calls `pasteTableUS`.
4. Add a "Download Set" button with radio options (New Product ID / Keep current ID) and wire to stubs:
   1. `pipeifyUS` or `pipeifyCA`
   2. `changeProductId` (CA only)

## Step 8: Replace v2 parsing/exports with v3 pipeline (Done)
1. Keep v2 parsing logic intact for now, but isolate it behind a minimal adapter in `app/scripts/v3/legacy-adapter.js` if needed.
2. Add placeholders for:
   1. Import mapping (spreadsheet → table rows)
   2. Export mapping (table rows → output rows)
3. Ensure all mapping functions are no-ops until specs are finalized.

## Step 9: Remove v2-only UI/logic from v3 pages (Done)
1. Remove/skip:
   1. Duplicate tab flow
   2. 1-liner editing flow
   3. Auto-order buttons
   4. Popovers
   5. Confirmation modal
2. Keep v2 code present in its files to avoid breaking legacy, but do not load it in v3 pages.

## Step 10: Live Preview stub (US/CA) (Done)
1. Add a minimal `updateLivePreview(countryCode, data)` function in `app/scripts/v3/live-preview.js`.
2. The function can render placeholder text for US/CA until actual formatting is defined.
3. Wire updates to run on table change events (edit, paste, import).

## Step 11: DRY/KISS refactor pass (Done)
1. Remove duplicate DOM wiring across US/CA by centralizing in `init.js`.
2. Consolidate repeated DOM selectors into constants.
3. Keep functions small and single-purpose.

## Step 12: Cleanup and transition boundary
1. Ensure v3 pages only load v3 scripts and shared utilities.
2. Confirm no `localStorage` usage in v3 scripts.
3. Leave v2 in place until v3 is stable, then optionally archive.

## Step 13: Testing checklist (manual for now)
1. US page loads with correct title/header.
2. CA page loads with correct title/header.
3. Import spreadsheet stub updates tables without errors.
4. US paste-table stub updates table data.
5. CA paste-row stub updates table data.
6. Live preview stub updates when table changes.

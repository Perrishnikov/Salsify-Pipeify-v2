# v3 Import Mapping

## Scope

- CSV and XLSX imports for the v3 Create/Edit Set flow.
- Mapping is aligned to `imports.md` and designed to share delimited parsing with clipboard paste work.

## Validation

- File must be `.csv` or `.xlsx`.
- `Product ID` must be present.
- The only header allowed to repeat is `LABEL_DATASET_INGREDIENTS_A - en-US`.
- `salsify:data_inheritance_hierarchy_level_id` must exist for variant filtering.

## Row Selection

- Keep header row plus the first row with a 14 digit Product ID and `variant/varient` in the inheritance column.

## Mapping

- Ingredients:
  - CA source: `LABEL_DATASET_INGREDIENTS_A - en-US` (merged with `~` delimiters).
  - US source: `PLM1_RAW_MAT_QTY_DRAFT`.
  - Cell mapping uses `|` delimiter and `~` row delimiter; indices map to Order, Description, Qty, UOM, Symbols, Definitions.
  - Adds one extra empty row.
- Nutrients (US only):
  - Source: `PLM1_LDS_NUTRIENT` with `|`/`~` delimiters.
  - Description uses index 2, falling back to index 1.
- Other Ingredients:
  - CA source: `LABEL_DATASET_OTHER_INGREDS_A`.
  - US source: `PLM1_INGREDIENT_DRAFT_TEXT`.
  - Always a single row.

## Shared Parsing

- Delimited parsing lives in `app/scripts/v3/parsing.js`.
- Row builders for ingredients/nutrients/other live in `app/scripts/v3/rows.js` so paste logic can reuse them.

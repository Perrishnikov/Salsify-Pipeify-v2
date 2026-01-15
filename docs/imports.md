## Import Spreadsheet
Lets work on [action:importSpreadsheet] for CA and US. Depending on the countryCode, the mappings and props will be different


Validation:
- file must be csv or xlsx
- Must have "Product ID" as one of the column heads in row A
- the only column that there can be more than 1 identical header is LABEL_DATASET_INGREDIENTS_A - en-US - en-US, otherwise, we require 0-1 of the same name. Issue error if not.

Filter:
- filter out everything but the header row (1) and the first row where we have a 14 digit Product ID value AND salsify:data_inheritance_hierarchy_level_id = varient. If nothing is returned, this needs to be fed back to the user via our error channel or something appropriate

Extract:
- Now that we have only two rows, lets get the columns we care about.
- CA: 
  Product ID
  LABEL_DATASET_INGREDIENTS_A - en-US - en-US
  LABEL_DATASET_OTHER_INGREDS_A
- US:
  Product ID
  PLM1_LDS_NUTRIENT
  PLM1_RAW_MAT_QTY_DRAFT
  PLM1_INGREDIENT_DRAFT_TEXT


Merge LABEL_DATASET_INGREDIENTS_A - en-US - en-US Columns:
- Normalize to match format of US. US row values should already be "pipeified"
1. Take each matching cell's value, placing ~ at the end of each, merging them into a single long string; ~ delimited. There will be a trailing ~ in the last cell.

US example to match
0 | Antioxidant Activity Blend: Inositol, Taurine, Alpha Lipoic Acid, Quercetin, Betaine HCl, Citrus Bioflavonoid Complex (from orange, grapefruit, lemon, lime, tangerine), Rutin (from Sophora japonica [flower bud] Extract), L-Carnitine | 395 | mg | ** | **Daily Value (DV) not established. | ~ 0 | Plant-Powered Herbal Blend: Cinnamon (Cinnamomum spp.) (bark), Fenugreek (seed) | 200 | mg | ** | **Daily Value (DV) not established. | ~ 0 | Lutein (from Aztec Marigold [flower] Extract) | 200 | mcg | ** | **Daily Value (DV) not established. | ~


## Mapping to tables

### Ingredients Table
- CA uses LABEL_DATASET_INGREDIENTS_A - en-US - en-US 
- US uses PLM1_RAW_MAT_QTY_DRAFT
- we now expect that US and CA are normalized to the same delimination:
    cell data is "|" delimited and row delimited with "~"
  
1. Product ID -> Product ID
2. [0index] -> Order
3. [1index] -> Description
4. [2index] -> Qty
5. [3index] -> UOM
6. [4index] -> Symbol
7. [5index] -> Definitions

* add the extra empty row for now.
* trim cell values at insert
* ignore blank cells

CA example
(6 pipes) 1|Fish Oil (anchovies and/or sardines) |2.98|g|||
(8 pipes) 2|EPA + DHA |2000|mg|||||

US example
0 | Antioxidant Activity Blend: Inositol, Taurine, Alpha Lipoic Acid, Quercetin, Betaine HCl, Citrus Bioflavonoid Complex (from orange, grapefruit, lemon, lime, tangerine), Rutin (from Sophora japonica [flower bud] Extract), L-Carnitine | 395 | mg | ** | **Daily Value (DV) not established. | ~ 
(6 pipes) 0 | Plant-Powered Herbal Blend: Cinnamon (Cinnamomum spp.) (bark), Fenugreek (seed) | 200 | mg | ** | **Daily Value (DV) not established. | ~ 
(6 pipes) 0 | Lutein (from Aztec Marigold [flower] Extract) | 200 | mcg | ** | **Daily Value (DV) not established. | ~

### CA and US Other Ingredients
1. Product ID -> Product ID
2. LABEL_DATASET_OTHER_INGREDS_A -> Description
  or
2. PLM1_INGREDIENT_DRAFT_TEXT -> Description

* only ever a single row. No bonus row for funsies.

### Nutrients - US only
- PLM1_LDS_NUTRIENT cell data is "|" delimited and row delimited with "~"
1. Product ID -> Product ID
2. [0index] -> Order
3. [coalesce(2index then 1index]) -> Description
4. [3index] -> Qty
5. [5index] -> UOM
6. [6index] -> Symbol
7. [7index] -> Definitions

Example
(9 pipes) 0.0.0 | Calories | | 5 | CAL | | | | | ~ 
1.0.0 | Total Carbohydrate | | 1 | G | <1 | % | † | †Percent Daily Values (DV) are based on a 2,000 calorie diet. | ~ 2.0.0 | Vitamin A (RAE) | Vitamin A (as 50% beta-carotene [1500 mcg], 50% retinyl acetate [1500 mcg]) | 3,000 | mcg | 333 | % | | | ~ 

## Pasting Tables and Rows
### Validation (Row & Table)
- CA Ingredient row: 6-8 pipes with an optional trailing ~
- US Ingredient table: at least one ~ and 6-8 pipes per row
- US Nutrients table: 9 pipes per row
- Other Ingredients (US/CA): 0 pipes

If the paste target does not match the expected pipe count, renderStatus {type:error} that it looks like <whatever>, not <paste target>. Do not update table. Quote the clipboard.

If it does not look like any known shape, renderStatus {type:error} to the effect that we cannot figure it out. Do not update table. Quote the clipboard.

If the paste passes initial validation (from paste rules above or import - UPDATE import logic if needed), but the pipe count does not match the expected number for the table, we add what we can:

### Placement Rules
- Too many pipes for a row: truncate the extraneous pipe data before any ~. This applies per row (pipes), not to trailing ~.
- Too few pipes for a row: slot what we can; silently add empty pipes at the end with no value before any ~.

### Import spreadsheet
If FILE validation passes, replace all table data. Skip row validation; just use Placement Rules.

### Paste Row
If validation passes, replace the clicked row data.

### Paste Table
If validation passes, replace all table rows.

## Update Tables
- Use the same delimiters and import parsing logic to build tables.
- Clean values on insert: trim cells, preserve line breaks, retain blank rows.
- Product ID is never pasted. Field is not editable. It only changes when UPDATE PRODUCT ID is pressed: TODO.

## Pasting Notes
- Add an empty row (with Product ID) for trailing ~.
- Truncate and escape quoted clipboard to avoid wrapping the parent container.
- Normalize clipboard text before validation and parsing.
- DRY with import logic.

### Clipboard normalization (ordered)
Normalize line endings: text = text.replace(/\r\n?/g, '\n')
Strip BOM: text = text.replace(/^\uFEFF/, '')
Trim outer whitespace: text = text.trim()
Normalize NBSP to space: text = text.replace(/\u00A0/g, ' ')
Preserve internal \n in cells; split rows on ~ and cells on |, then trim per-cell on insert (as already specified).

### Clipboard classification (after normalization)
Split rows on ~ (retain trailing empty row). Count pipes per row and check whether any ~ exists.
If any ~ exists: table paste candidate; use pipe count per row to decide US Ingredients (9 pipes) vs US Nutrients (8 pipes).
If no ~ exists: row paste candidate; use pipe count to decide CA Ingredient row (9 pipes) vs Other Ingredients (0 pipes).
If none match, emit the “can’t figure it out” error.

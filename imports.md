## Import Spreadsheet
Lets work on [action:importSpreadsheet] for CA and US. Depending on the countryCode, the mappings and props will be different


Validation:
- file must be csv or xlsx
- Must have "Product ID" as one of the column heads in row A
- the only column that there can be more than 1 identical header is LABEL_DATASET_NUTRIENT_A - en-US, otherwise, we require 0-1 of the same name. Issue error if not.

Filter:
- filter out everything but the header row (1) and the first row where we have a 14 digit Product ID value AND salsify:data_inheritance_hierarchy_level_id = varient. If nothing is returned, this needs to be fed back to the user via our error channel or something appropriate

Extract:
- Now that we have only two rows, lets get the columns we care about.
- CA: 
  Product ID
  LABEL_DATASET_NUTRIENT_A - en-US
  LABEL_DATASET_OTHER_INGREDS_A
- US:
  Product ID
  PLM1_LDS_NUTRIENT
  PLM1_RAW_MAT_QTY_DRAFT
  PLM1_INGREDIENT_DRAFT_TEXT


Merge LABEL_DATASET_NUTRIENT_A - en-US Columns:
- Normalize to match format of US. US row values should already be "pipeified"
1. Take each matching cell's value, placing ~ at the end of each, merging them into a single long string; ~ delimited. There will be a trailing ~ in the last cell.

US example to match
0 | Antioxidant Activity Blend: Inositol, Taurine, Alpha Lipoic Acid, Quercetin, Betaine HCl, Citrus Bioflavonoid Complex (from orange, grapefruit, lemon, lime, tangerine), Rutin (from Sophora japonica [flower bud] Extract), L-Carnitine | 395 | mg | ** | **Daily Value (DV) not established. | ~ 0 | Plant-Powered Herbal Blend: Cinnamon (Cinnamomum spp.) (bark), Fenugreek (seed) | 200 | mg | ** | **Daily Value (DV) not established. | ~ 0 | Lutein (from Aztec Marigold [flower] Extract) | 200 | mcg | ** | **Daily Value (DV) not established. | ~


## Mapping to tables

### Ingredients Table
- CA uses LABEL_DATASET_NUTRIENT_A - en-US 
- US uses PLM1_RAW_MAT_QTY_DRAFT
- we now expect that US and CA are normalized to the same delimination:
    cell data is "|" delimited and row delimited with "~"
  
1. Product ID -> Product ID
2. [0index] -> Order
3. [1index] -> Description
4. [2index] -> Qty
5. [3index] -> UOM
6. [6index] -> Symbol
7. [7index] -> Definitions

* add the extra empty row for now.
* trim cell values at insert
* ignore blank cells

CA example
1|Fish Oil (anchovies and/or sardines) |2.98|g|||

US example
0 | Antioxidant Activity Blend: Inositol, Taurine, Alpha Lipoic Acid, Quercetin, Betaine HCl, Citrus Bioflavonoid Complex (from orange, grapefruit, lemon, lime, tangerine), Rutin (from Sophora japonica [flower bud] Extract), L-Carnitine | 395 | mg | ** | **Daily Value (DV) not established. | ~ 0 | Plant-Powered Herbal Blend: Cinnamon (Cinnamomum spp.) (bark), Fenugreek (seed) | 200 | mg | ** | **Daily Value (DV) not established. | ~ 0 | Lutein (from Aztec Marigold [flower] Extract) | 200 | mcg | ** | **Daily Value (DV) not established. | ~

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
0.0.0 | Calories | | 5 | CAL | | | | | ~ 
1.0.0 | Total Carbohydrate | | 1 | G | <1 | % | † | †Percent Daily Values (DV) are based on a 2,000 calorie diet. | ~ 2.0.0 | Vitamin A (RAE) | Vitamin A (as 50% beta-carotene [1500 mcg], 50% retinyl acetate [1500 mcg]) | 3,000 | mcg | 333 | % | | | ~ 
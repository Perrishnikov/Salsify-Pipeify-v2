# v3 Pipeify

TODO:
[] Move to azure static app instead of github

## Pages

- app pages:
  /US/index.html
  /CA/index.html
  Page title and header should display based on type "Salsify: Pipeify v3 <countryCode>"

## Pages

### US tabs (/US/index.html)

- [Create/Edit Set]
- no duplicate; create/edit and change values
- no 1 liner; data is one long string

### CA tabs (/CA/index.html)
- [Create/Edit Set]
- no [Duplicate Set]; use "Change Product ID" button
- no 1 liner; create/edit and copy/paste row into proper table

Copy and paste row is a CA only action.
Copy and paste table is a US action only.

## Page Tabs

The page tabs that are displayed depend on countryCode

### Tab [Create/Update/Validate Set]

- input: target for Salsify export (d&d or file chooser)
- Only include Product ID all three tables column(s) if importing file. importFile = true
- Table shells for respective countryCode with empty row
- button: "Download Set" -> show radio "New Product ID" or "Keep current ID" ...
- - -> [action:changeProductId]
- - -> [action:pipeifyUS] or [action:pipeifyCA]
- button: "Clear Set" -> [action:clearAllTableData]
- button: "Help" -> [TODO]
- Build and display proper tables based on countryCode

### Tab Layout (top to bottom)

- D&D Section [action:importSpreadsheet]
- Table Section
- Page Error Section
- Live Preview Section

## Tables

### US Table Types

PLM1_RAW_MAT_QTY_DRAFT "Ingredients" [US-INGREDIENT]
PLM1_LDS_NUTRIENT "Nutrients" [US-NUTRIENT]
PLM1_INGREDIENT_DRAFT_TEXT "Other Ingredients" [OTHER]

### US Table Elements & Functionality

In table header, button/target to [PASTE-TABLE], button for [PIPEIFY-TABLE]
In each row, no [*-ROW]

### CA Table Types

Ingredients - Long [CA-INGREDIENT]
LABEL_DATASET_OTHER_INGREDS_A [OTHER]

### CA Table Elemetents & Functionality

In table header, no [*-TABLE]
In each row, button/target to [PASTE-ROW], button for [PIPEIFY-ROW]

### Table Layout

Table Header

- Table name
- button: Auto Order [action:autoOrderTableRows]
- US-only button/target: -> [action:pasteTableUS]
- US-only button: -> [action:pipeifyTableUS]

Table Rows

- Appropraite for table

Table Error Section

- Hidden section to display potential issues

## Table Rows

### Row Functionality

[OTHER]
no exclusive functionality

[US-INGREDIENT], [CA-INGREDIENT], [US-NUTRIENT]

left hamburger: "Add Row Above" -> [action:addRow(above)]
left hamburger: "Add Row Below" -> [action:addRow(below)]

[US-INGREDIENT], [CA-INGREDIENT], [US-NUTRIENT], [OTHER]

left hamburger: "Delete Row" [action:deleteRow]
CA only - button/target: "Paste" [action:pasteRowCA],
CA only - button: "Pipeify" -> [action:pipeifyRowCA]

note: All non-fixed cells are editable/
action: cell blur -> [action:updateLivePreview]
action: drag and drop to reorder row within same table type [action:moveRow]

## Table Columns

- mapping to column data will be later

### Fixed Columns

1. Left Hamburger (not editable)
2. Product ID (not editable)

note: visually separate fixed columns from the editable cells with a heavier column border

### Dependant Columns

[US-INGREDIENT], [CA-INGREDIENT]

3. <Order> ->
4. <Description>
5. <Qty>
6. <UOM>
7. <Symbol> \*\*
8. <Definitions> \*\*Daily Value (DV) not established.

[US-NUTRIENT] PLM1

3. <Order> ->
4. <Description>
5. <Qty>
6. <UOM>
7. <DV>
8. <Pct> exclude. Implied %
9. <Symbol> †
10. <Definitions> †Percent Daily Values (DV) are based on a 2,000 calorie diet.

[OTHER]
single string field

3. <DESCRIPTION>

- validation - US Footnotes must be present if symbol is detected in the row.

## Data Mapping

From
[action:importSpreadsheet]
[action:pasteRowCA]
[action:pasteTableUS]

<Order>
<Description> Can have line breaks inside. Will retain. 
<Qty>
<UOM>
<DV>
<Pct>
<Symbol>

To
[action:pipeifyTableUS]:
[action:pipeifyRowCA]:
[action:pipeifyUS]:
[action:pipeifyCA]:

## Actions

[action:importSpreadsheet]:
[action:pasteRowCA]:
[action:pasteTableUS]:

[action:pipeifyTableUS]:
[action:pipeifyRowCA]:
[action:pipeifyUS]:
[action:pipeifyCA]:

[action:addRow()]:
[action:deleteRow]: if there is more than one row, delete this row. If this is the only row, clear any data and show empty "root" row.
[action:moveRow]:

[action:updateLivePreview]: update Live Preview with table data.

## Live Preview

Depends on US or CA

- CA
  _Each Capsule Contains Medicinal Ingredients_:
  Cayenne pepper (Capsicum annuum, fruit) 450 mg
  _Non-medicinal Ingredients_:
  Hypromellose, silica.

Case 1: US User wants to paste clipboard [US-INGREDIENT] or [US-NUTRIENT] to edit it.

- All three table shells should be present to allow pasting directly into it.
- US tables have VALIDATE, COPY, PASTE actions available
- [PASTE-TABLE] -> Need to validate pasted; issue error or display in proper table
- [PIPEIFY-TABLE] -> PLM1 Pipeify
- TODO: [VALIDATE-TABLE] -> Optional action to check that values in active table are as-expected.
- Product ID column not visible.

Case 2: US and CA User has a Salsify export spreadsheet to import.

- Drag & Drop or file chooser to get file.
- Validate file
- Assign data to proper table(s)

- We have Product ID, show it.

Case 3: CA User wants to paste a line from [CA-INGREDIENT] or [CA-NUTRIENT]

- All three table shells should be present to allow pasting directly into it.
- CA table rows have VALIDATE, COPY, PASTE actions available
- [PASTE-ROW] -> Need to validate pasted; issue error or display in proper row
- [PIPEIFY-ROW] -> PLM1 Pipeify
- TODO: [VALIDATE-ROW] -> Optional action to check that values in active row are as-expected.

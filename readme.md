https://perrishnikov.github.io/Salsify-Pipeify-v2/app/
https://perrishnikov.github.io/Pipeify/
https://www.npmjs.com/package/xlsx

TODO:

Export data for Salsify:
~~preprocess_export_file()~~
~~Product ID~~
~~LABEL_DATASET_NUTRIENT_A~~
~~LABEL_DATASET_INGREDIENTS_A~~
~~LABEL_DATASET_OTHER_INGREDS_A~~
[x] Verify export can be imported back into Salsify

Cleaning:
[x] Add title and ico
[x] check TODOS
[x] check //! and // !
[x] Disable button. Enable only if there is a file and file has no errors.
    Allow only with 4th
[x] Instructions and whats going on for future users
~~Takes a Salsify export, parses it, and ...~~
~~Export must have [PARTCODE or Product ID, Nutrients, Ingredients, Other] (TODO: create Toast ), export automatically contains Product ID, which is required for re-import~~
~~Removes parent record (other column remain), parses by option, leaves other columns as-is...~~
~~Accepts all columns, but only checks for errors on...~~
Once verified, can either be exported for a client or the corrected version can be reimported back into Salsify.
[x] Only allow Salsify Download with option 4. Validation required. 
[x] Button for type of row to add (Nut, Ing) -> find: "// ! Validate here"
[x] ENHANCE: Mouseover error and warning conditions. 
[x] Need to clear all columns besides Product ID for Salsify reimport
[x] Table shrink and grow
[x] Create New needs to style and work
[x] Name Single ingredient by Product ID
[x] Error specific to Parent import
[x] bootstrap modal
[x] bootstrap popover - NO
[x] add row col per ingred type
[x] need to delete Other row for new ingreds
[x] broken - popover needs to close after click
[] allow duplicate (change product id) of complicated ingredient set like Alive Multi. CA - US is getting PLM soon
[x] move this into a scope. ...new WeakSet();
[x] verify clear is clearing scope
[x] move filename into dnd box
[x] ?disable download if the cursor is focused to prevent unsaved/validated text
[x] filename on duplicate failure 

[] Check PLM1 Pipeify to see how this will affect it.
    Export the PLM1 fields as above, rename columns
    Use the JS feature to parse the pipes.
    Use Pipeify to validate PLM1 as it will do NIO.
[] Yes - should allow for export to PLM1 and original
[] popover help for headers (allowed or disallowed values)
[] ? Create helper symbols to copy and paste

---
[] Drag n drop rows
[] Feature - Auto order button
[] Enhance: Sort columns by Order on both exports
[] Delete optional columns

[x] Push to Github. See if it works there
[] Changing Option, reverts edited table data. Save to localstorage before change?
[x] Style each partcode together?
[x] Style each ingredient type together?
[] Headers checkboxes to hide columns
[] Option to fix things like remove HTML from cell

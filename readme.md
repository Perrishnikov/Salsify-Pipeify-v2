https://perrishnikov.github.io/Salsify-Pipeify-v2/app/

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

[] Button for type of row to add (Nut, Ing) -> find: "// ! Validate here"

[x] Instructions and whats going on for future users
~~Takes a Salsify export, parses it, and ...~~
~~Export must have [PARTCODE or Product ID, Nutrients, Ingredients, Other] (TODO: create Toast ), export automatically contains Product ID, which is required for re-import~~
~~Removes parent record (other column remain), parses by option, leaves other columns as-is...~~
~~Accepts all columns, but only checks for errors on...~~
Once verified, can either be exported for a client or the corrected version can be reimported back into Salsify.

[] Allow/ account for UPC with PARTCODE
[] ENHANCE: Mouseover error and warning conditions. 
Export for customers
(Apply hidden columns)
(By Parsing Option)
[] How to account for errors and warnings?
[] Should remove Product ID
[] do something with (parsingOption) in process_wysiwyg_export()

... Add a row
... Delete a row
[] Reimport a Pipeify export

Push to Github. See if it works there
[] Changing Option, reverts edited table data. Save to localstorage before change?
[] Style each partcode together?
[] Style each ingredient type together?
[] Headers checkboxes to hide columns
[] Option to fix things like remove HTML from cell
[] Drag n drop rows later
[] Show number of errors and warnings?
[] TODO: row validations?
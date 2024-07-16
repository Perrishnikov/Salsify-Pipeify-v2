https://perrishnikov.github.io/Salsify-Pipeify-v2/app/

TODO:

Export data for Salsify:
~~preprocess_export_file()~~
~~Product ID~~
~~LABEL_DATASET_NUTRIENT_A~~
~~LABEL_DATASET_INGREDIENTS_A~~
~~LABEL_DATASET_OTHER_INGREDS_A~~
[x] Verify export can be imported back into Salsify

-- PUSH 

Cleaning:
[] Add title and ico
[] check TODOS
[] check //! and // !
[] How to account for errors and warnings?
[] Disable button. Enable only if there is a file and file has no errors.
    Allow only with 4th
[] Show number of errors and warnings?
[] Mouseover error and warning conditions. 
[] do something with (parsingOption) in process_wysiwyg_export()
[] Instructions and whats going on for future users

Takes a Salsify export, parses it, and ...
Export must have [PARTCODE or Product ID, Nutrients, Ingredients, Other] (TODO: create Toast ), export automatically contains Product ID, which is required for re-import
Removes parent record (other column remain), parses by option, leaves other columns as-is...


Accepts all columns, but only checks for errors on...
Once verified, can either be exported for a client or the corrected version can be reimported back into Salsify.


Export for customers
(Apply hidden columns)
(By Parsing Option)
[] How to account for errors and warnings?
[] Should remove Product ID 

... Add a row
... Delete a row
[] Reimport a Pipeify export

[] Changing Option, reverts edited table data. Save to localstorage before change?
[] Style each partcode together?
[] Style each ingredient type together?
[] Headers checkboxes to hide columns
[] Option to fix things like remove HTML from cell
[] Drag n drop rows later



[x] Working on the pasting format for US Nutrients
[x] new line after each ~
[x] Make sure that all the imports, copy, and pasting work.
[x] change product ID

[] Next get the export to spreadheet

[] separtate code into fucntional modules/files and
[] check for potential memory leaks


[] Add edit icon to all the Product ID headers: opens small modal with dialogue to change all.
[] Live Preview should have a button to activate. Slides up a div from the bottom that takes up about 40% of the window.
[] Explicit PLM because Sue is still doing the old way

Looks good. Now we need to add the Download Set export logic. Using the existing code in import-export, extend both our tables to meet the spreasheet's specs and row and column data for US and CA. Keep in mind, the US is exporting to PLM_ props per (models.js) and CA is exporting LABEL_DATASET_NUTRIENT_A and LABEL_DATASET_OTHER_INGREDS_A. When exporting we need to append the localization ( - en-US) to the id LABEL_DATASET_NUTRIENT_A - en-US. This is the only prop that needs locale.

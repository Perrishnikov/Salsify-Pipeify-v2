/**
 * Updates rows by making specific cells editable based on data type.
 *
 * @param {Row[]} rows - Array of rows containing cell data.
 * @returns {Row[]} - The updated array of rows with specified cells marked as editable.
 */
function per_pipe_per_partcode_4b(rows) {
    rows.forEach((row) => {
        row.cells.forEach((cell) => {
            
            // Get the object representing the ingredient type of the current row
            const ingredientTypeObject = getObjectByIngredientType(row.cells);

            // Check if the ingredient type is either LABEL_DATASET_NUTRIENT_A.name or LABEL_DATASET_INGREDIENTS_A.name
            if (
                ingredientTypeObject.value === LABEL_DATASET_NUTRIENT_A.name ||
                ingredientTypeObject.value === LABEL_DATASET_INGREDIENTS_A.name
            ) {
                // Define an array of cell types that should be made editable
                const makeEditable = [
                    ORDER.id,
                    QUANTITY.id,
                    UOM.id,
                    DV.id,
                    SYMBOL.id,
                    FOOT.id,
                ];

                // Loop through the list of cell types and set isEditable to true if the cell matches the type
                makeEditable.forEach((name) => {
                    if (name === cell.type) {
                        cell.isEditable = true;
                    }
                });

                // Must valdate the Cells now
                const cellType = cell.type;
                const value = cell.value;
                
                if (cellType === ORDER.id) {
                    cell.status = createCell.validateOrder(value);
                } else if (cellType === DESCRIPTION.id) {
                    cell.status = createCell.validateDescription(value);
                } else if (cellType === QUANTITY.id) {
                    cell.status = createCell.validateQuantity(value);
                } else if (cellType === UOM.id) {
                    cell.status = createCell.validateUom(value);
                } else if (cellType === DV.id) {
                    cell.status = createCell.validateDvAmount(
                        value,
                        ingredientTypeObject.value
                    );
                } else if (cellType === SYMBOL.id) {
                    cell.status = createCell.validateSymbol(
                        value,
                        ingredientTypeObject.value
                    );
                } else if (cellType === FOOT.id) {
                    cell.status = createCell.validateFootnote(
                        value,
                        ingredientTypeObject.value
                    );
                }
            }

            // Check if the ingredient type is either LABEL_DATASET_NUTRIENT_A.name, LABEL_DATASET_INGREDIENTS_A.name, or LABEL_DATASET_OTHER_INGREDS_A.name
            if (
                ingredientTypeObject.value === LABEL_DATASET_NUTRIENT_A.name ||
                ingredientTypeObject.value ===
                    LABEL_DATASET_INGREDIENTS_A.name ||
                ingredientTypeObject.value ===
                    LABEL_DATASET_OTHER_INGREDS_A.name
            ) {
                // Define an array with DESCRIPTION.id
                const makeEditable = [DESCRIPTION.id];

                // Loop through the list of cell types and set isEditable to true if the cell matches the type
                makeEditable.forEach((name) => {
                    if (name === cell.type) {
                        cell.isEditable = true;
                    }
                });
            }
        });
    });

    return rows;
}

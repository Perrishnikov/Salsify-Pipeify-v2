/**
 * Retrieves an object from an array where the `type` property equals 'INGREDIENT_TYPE'.
 *
 * @param {Array<Object<string,string>>} array - The array of objects to search.
 * @returns {Object|null} - The first object with `type` equal to 'INGREDIENT_TYPE', or null if not found.
 */
function getObjectByIngredientType(array) {
    // Use the `find` method to locate the object with `type` equal to 'INGREDIENT_TYPE'
    return array.find((obj) => obj.type === 'INGREDIENT_TYPE') || null;
}

/**
 * Removes items from the end of an array if the length is greater than the specified length.
 *
 * @param {Array} arr - The array to modify.
 * @param {number} x - The maximum allowed length of the array.
 */
function removeExcessItems(arr, x) {
    // Check if the array length is greater than the specified length
    if (arr.length > x) {
        // Calculate the index to start removing items
        const startIndex = x;

        // Calculate the number of items to remove
        const itemsToRemove = arr.length - x;

        // Remove the items from the array using splice()
        arr.splice(startIndex, itemsToRemove);
    }
}

/**
 * No validations
 * @param {string[]} pipes
 * @returns
 */
function createNutrientCells_RowValidation(pipes, rowStatus) {
    // Safely access each value in the pipes array using optional chaining
    //Row validation
    if (pipes.length < 8) {
        // console.error('Nuts less than 8');
        rowStatus.addWarning(
            'Nutrient pipes are less than 8. Cell data is likely incorrect'
        );
    } else if (pipes.length > 8) {
        rowStatus.addWarning(
            'Nutrient pipes are greater than 8. Cell data is likely incorrect'
        );
        removeExcessItems(pipes, 8);
    } else if (pipes.length == 8) {
        // status.addInfo('Just right');
    }

    const order = pipes[0]?.trim() || '';
    const shortDesc = pipes[1]?.trim() || '';
    const longDesc = pipes[2]?.trim() || '';
    const qty = pipes[3]?.trim() || '';
    const uom = pipes[4]?.trim() || '';
    const dvAmt = pipes[5]?.trim() || '';
    const symbol = pipes[6]?.trim() || '';
    const foot = pipes[7]?.trim() || '';

    // Column 1: Order
    const orderCell = createCell.order({ value: order, isEditable: false });

    // Column 2: Description
    const descCell = createCell.description({
        value: coalesce(longDesc, shortDesc),
        isEditable: false,
    });
    // Column 3: Quantity
    const qtyCell = createCell.quantity({ value: qty, isEditable: false });
    // Column 4: Unit of Measure (dont validate cells here)
    const uomCell = createCell.uom({ value: uom, isEditable: false });
    // Column 5: Daily Valuem (dont validate cells here)
    const dvAmtCell = createCell.dvAmount({
        value: dvAmt,
        isEditable: false,
    });
    // Column 6: Symbol (dont validate cells here)
    const symbolCell = createCell.symbol({
        value: symbol,
        isEditable: false,
    });
    // Column 7: Footnote (dont validate cells here)
    const footnoteCell = createCell.footnote({
        value: foot,
        isEditable: false,
    });

    const cells = [];
    cells.push(
        orderCell,
        descCell,
        qtyCell,
        uomCell,
        dvAmtCell,
        symbolCell,
        footnoteCell
    );

    return cells;
}

/**
 *
 * @param {string[]} pipes
 * @returns
 */
function createIngredientCells_RowValidation(pipes, rowStatus) {
    /* Row validation */
    if (pipes.length < 9) {
        rowStatus.addWarning(
            'Ingredient pipes are less than 9. Cell data is likely incorrect'
        );
    } else if (pipes.length > 9) {
        rowStatus.addWarning(
            'Ingredient pipes are greater than 9. Cell data is likely incorrect'
        );
        removeExcessItems(pipes, 9);
    } else if (pipes.length == 9) {
        // status.addInfo('Just right');
    }
    /* Ingredient validation */
    const order = pipes[0]?.trim() || '';
    const shortDesc = pipes[1]?.trim() || '';
    const qty = pipes[2]?.trim() || '';
    const uom = pipes[3]?.trim() || '';
    const unknown4 = pipes[4]?.trim() || '';
    const dvAmt = pipes[5]?.trim() || '';
    const symbol = pipes[6]?.trim() || '';
    const foot = pipes[7]?.trim() || '';
    const unknown8 = pipes[8]?.trim() || '';
    // Column 1: Order
    const orderCell = createCell.order({
        value: order,
        isEditable: false,
    });
    // Column 2: Description
    const descCell = createCell.description({
        value: shortDesc,
        isEditable: false,
    });
    // Column 3: Quantity
    const qtyCell = createCell.quantity({ value: qty, isEditable: false });
    // Column 4: Unit of Measure
    const uomCell = createCell.uom({ value: uom, isEditable: false });
    // Column 5: Daily Value
    const dvAmtCell = createCell.dvAmount({ value: dvAmt, isEditable: false });
    // Column 6: Symbol
    const symbolCell = createCell.symbol({ value: symbol, isEditable: false });
    // Column 7: Footnote
    const footnoteCell = createCell.footnote({
        value: foot,
        isEditable: false,
    });

    const cells = [];
    cells.push(
        orderCell,
        descCell,
        qtyCell,
        uomCell,
        dvAmtCell,
        symbolCell,
        footnoteCell
    );

    return cells;
}

/**
 *
 * @param {string} value
 * @returns
 */
function createOtherCells(value) {
    // Column 1: Order
    const orderCell = createCell.order({
        value: '',
        isEditable: false,
    });
    // Column 2: Description
    const descCell = createCell.description({
        value,
        isEditable: false,
        shouldValidate: false,
    });
    // Column 3: Quantity
    const qtyCell = createCell.quantity({ value: '', isEditable: false });
    // Column 4: Unit of Measure
    const uomCell = createCell.uom({ value: '', isEditable: false });
    // Column 5: Daily Value
    const dvAmtCell = createCell.dvAmount({ value: '', isEditable: false });
    // Column 6: Symbol
    const symbolCell = createCell.symbol({ value: '', isEditable: false });
    // Column 7: Footnote
    const footnoteCell = createCell.footnote({ value: '', isEditable: false });

    const cells = [];
    cells.push(
        orderCell,
        descCell,
        qtyCell,
        uomCell,
        dvAmtCell,
        symbolCell,
        footnoteCell
    );

    return cells;
}

/**
 * Creates an array of rows, each representing a single ingredient from `MERGED_INGREDIENTS` in each row.
 *
 * @param {Array<Array<Cell>>} rows - An array of arrays, each representing a row of data with Cell instances.
 * @returns {Array<Array<Cell>>} - An array of rows, each representing a single ingredient from `MERGED_INGREDIENTS` in each row.
 */
function per_pipe_per_partcode_3(rows) {
    const rowsOfIngredients = [];

    // Iterate through each row of data
    rows.forEach((row) => {
        // Process each cell in the row
        // console.log(`row`, row);
        const ingredientType = row.cells.find(
            (cell) => cell.type === INGREDIENT_TYPE.id
        );
        // console.log({ingredientType});

        row.cells.forEach((cell) => {
            // console.log(`cell`, cell);

            if (cell.type === MERGED_INGREDIENTS.id) {
                const ingredientsArray = cell.value.split('|');
                // console.log(`ingredientsArray`, cell.type, ingredientsArray);

                // Split the merged ingredient value by the import delimiter
                const ingredientTypeObject = getObjectByIngredientType(
                    row.cells
                );

                // Create a new row without the MERGED_INGREDIENTS cell
                const nonIngredientCells = row.cells
                    .filter((c) => c !== cell)
                    .map(cloneCell);

                const rowStatus = new Status();

                // Process the type of ingredient
                if (
                    ingredientTypeObject.value === LABEL_DATASET_NUTRIENT_A.name
                ) {
                    // Create nutrient cells for the table
                    const nutrientCells = createNutrientCells_RowValidation(
                        ingredientsArray,
                        rowStatus
                    );
                    // console.log(nutrientCells);

                    nonIngredientCells.push(...nutrientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_INGREDIENTS_A.name
                ) {
                    // Create ingredient cells for the table
                    const ingredientCells = createIngredientCells_RowValidation(
                        ingredientsArray,
                        rowStatus
                    );
                    nonIngredientCells.push(...ingredientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_OTHER_INGREDS_A.name
                ) {
                    const otherCells = createOtherCells(
                        ingredientsArray,
                        rowStatus
                    );

                    // Add other cells to the new row
                    nonIngredientCells.push(...otherCells);
                }
                const row_id = generateRandomString(9)
                // Add the processed new row to the array of ingredients rows
                const newRow = new Row(nonIngredientCells, row_id, rowStatus);

                rowsOfIngredients.push(newRow);
            }
        });
    });
    // console.log(`rowsOfIngredients`, rowsOfIngredients);
    return rowsOfIngredients;
}

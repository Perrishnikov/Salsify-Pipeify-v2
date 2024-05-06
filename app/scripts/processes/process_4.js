
/**
 *
 * @param {string[]} pipes
 * @param {Status} rowStatus
 * @returns
 */
function createNutrientCells_ErrorChecking(pipes, rowStatus) {
    //Row validation
    if (pipes.length < 8) {
        rowStatus.addError(
            'Nutrient pipes are less than 8. Cell data is likely incorrect'
        );
    } else if (pipes.length > 8) {
        rowStatus.addError(
            'Nutrient pipes are greater than 8. Cell data is likely incorrect'
        );
    } else if (pipes.length == 8) {
        // status.addInfo('Just right');
    }

    const order = pipes[0].trim();
    const shortDesc = pipes[1].trim();
    const longDesc = pipes[2].trim();
    const qty = pipes[3].trim();
    const uom = pipes[4].trim();
    const dvAmt = pipes[5].trim();
    const symbol = pipes[6].trim();
    const foot = pipes[7].trim();

    // Column 1: Order
    const orderCell = createCell.order({ value: order });
    // Column 2: Description
    const descCell = createCell.description({
        value: coalesce(longDesc, shortDesc),
    });
    // Column 3: Quantity
    const qtyCell = createCell.quantity({ value: qty });
    // Column 4: Unit of Measure
    const uomCell = createCell.uom({ value: uom });
    // Column 5: Daily Value
    const dvAmtCell = createCell.dvAmount({ value: dvAmt });
    // Column 6: Symbol
    const symbolCell = createCell.symbol({ value: symbol });
    // Column 7: Footnote
    const footnoteCell = createCell.footnote({ value: foot });

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
 * @param {Status} rowStatus
 * @returns
 */
function createIngredientCells_ErrorChecking(pipes, rowStatus) {
    /* Row validation */
    if (pipes.length < 9) {
        rowStatus.addError(
            'Ingredient pipes are less than 9. Cell data is likely incorrect'
        );
    } else if (pipes.length > 9) {
        rowStatus.addError(
            'Ingredient pipes are greater than 9. Cell data is likely incorrect'
        );
    } else if (pipes.length == 9) {
        // status.addInfo('Just right');
    }

    //? Maybe these belong in Cell validation instead?
    if (pipes[4]) {
        // throw new Error('Ingredient has unaccounted pipe [4]');
        rowStatus.addWarning('Ingredient has unaccounted pipe [4]');
    }
    if (pipes[7]) {
        // throw new Error('Ingredient has unaccounted pipe [7]');
        rowStatus.addWarning('Ingredient has unaccounted pipe [7]');
    }
    if (pipes[8]) {
        // throw new Error('Ingredient has unaccounted pipe [8]');
        rowStatus.addWarning('Ingredient has unaccounted pipe [8]');
    }

    /* Ingredient validation */
    const order = pipes[0].trim();
    const shortDesc = pipes[1].trim();
    const qty = pipes[2].trim();
    const uom = pipes[3].trim();
    const unknown4 = pipes[4].trim();
    const dvAmt = pipes[5].trim();
    const symbol = pipes[6].trim();
    const foot = pipes[7].trim();
    // const unknown8 = pipes[8].trim();

    // Column 1: Order
    const orderCell = createCell.order({ value: order });
    // console.log(`orderCell`, orderCell);
    // Column 2: Description
    const descCell = createCell.description({ value: shortDesc });
    // Column 3: Quantity
    const qtyCell = createCell.quantity({ value: qty });
    // Column 4: Unit of Measure
    const uomCell = createCell.uom({ value: uom });
    // Column 5: Daily Value
    const dvAmtCell = createCell.dvAmount({ value: dvAmt });
    // Column 6: Symbol
    const symbolCell = createCell.symbol({ value: symbol });
    // Column 7: Footnote
    const footnoteCell = createCell.footnote({ value: foot });

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

function createOtherCells_ErrorChecking(value, rowStatus) {
    // Column 1: Order
    const orderCell = createCell.order({
        value: '',
        isEditable: false,
    });
    // Column 2: Description
    const descCell = createCell.description({ value });
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
function per_pipe_per_partcode_4(rows) {
    const rowsOfIngredients = [];

    // Iterate through each row of data
    rows.forEach((row) => {
        // Process each cell in the row
        // console.log(`row`, row);

        row.cells.forEach((cell) => {
            // console.log(`cell`, cell);

            // Check if the cell is of type MERGED_INGREDIENTS
            if (cell.type === MERGED_INGREDIENTS.id) {
                const ingredientsArray = cell.value.split('|');
                // console.log(`ingredientsArray`,cell.type, ingredientsArray);

                // Split the merged ingredient value by the import delimiter
                const ingredientTypeObject = getObjectByIngredientType(row.cells);

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
                    const nutrientCells = createNutrientCells_ErrorChecking(
                        ingredientsArray,
                        rowStatus
                    );

                    nonIngredientCells.push(...nutrientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_INGREDIENTS_A.name
                ) {
                    // Create ingredient cells for the table
                    const ingredientCells = createIngredientCells_ErrorChecking(
                        ingredientsArray,
                        rowStatus
                    );
                    nonIngredientCells.push(...ingredientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_OTHER_INGREDS_A.name
                ) {
                    const otherCells = createOtherCells_ErrorChecking(
                        ingredientsArray,
                        rowStatus
                    );

                    // Add other cells to the new row
                    nonIngredientCells.push(...otherCells);
                }
                // Add the processed new row to the array of ingredients rows
                const newRow = new Row(nonIngredientCells, rowStatus);

                rowsOfIngredients.push(newRow);
            }
        });
    });
    return rowsOfIngredients;
}

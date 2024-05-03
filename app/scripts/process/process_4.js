function canBeParsedAsNumber(str) {
    const parsedNumber = Number(str);
    return !isNaN(parsedNumber);
}

/**
 * Removes HTML tags from the given string.
 * @param {string} string - The string containing HTML tags to be stripped.
 * @returns {string} The string with HTML tags removed.
 */
function stripHTML(string) {
    // 03242 has <sub> tag
    var regex = /(<([^>]+)>)/gi;

    return string.replace(regex, '');
}

function standardTestIsTrue(valueToTest) {
    // if the value is found, return true, else false
    if (
        valueToTest.toLowerCase().includes('calories') |
        valueToTest.toLowerCase().includes('carbohydrate') |
        valueToTest.toLowerCase().includes('total sugars') |
        valueToTest.toLowerCase().includes('total sugar') |
        valueToTest.toLowerCase().includes('added sugars') |
        valueToTest.toLowerCase().includes('added sugar') |
        valueToTest.toLowerCase().includes('dietary') |
        valueToTest.toLowerCase().includes('total fat') |
        valueToTest.toLowerCase().includes('protein') |
        valueToTest.toLowerCase().includes('saturated') |
        valueToTest.toLowerCase().includes('trans fat') |
        valueToTest.toLowerCase().includes('transfat') |
        valueToTest.toLowerCase().includes('cholesteral')
    ) {
        return true;
    } else {
        return false;
    }
}

const validationTests = {
    isNotEmpty: (str1, status) => {
        const pattern = /\S+/;
        if (!pattern.test(str1)) {
            status.addError('! isNotEmpty');
        }
        // console.assert(pattern.test(str1), `! isNotEmpty`);
        return validationTests;
    },
    canBeParsedAsNumber(str, status) {
        const parsedNumber = !isNaN(Number(str));
        // console.log(`parsedNumber`, parsedNumber);
        if (!parsedNumber) {
            status.addError('! isNumber');
            // console.log(status);
        }
        return validationTests;
    },
    isNumber: (str1, status) => {
        const pattern = /^\d+$/;
        if (!pattern.test(str1)) {
            status.addError('! isNumber');
        }
        // console.log(pattern.test(str1), '! isNumber');
        return validationTests;
    },
    isNotSame: (str1, str2, status) => {
        if (str1 !== str2) {
            status.addError('! isNotSame');
        }
        return validationTests;
    },
    isLessThan: (str1, max, status) => {
        if (str1.length >= max) {
            status.addError('! isLessThan');
        }
        return validationTests;
    },
    isGreaterThan: (str1, min, status) => {
        if (str1.length <= min) {
            status.addError('! isGreaterThan');
        }
        return validationTests;
    },
    isValidUOM: (value, status) => {
        const validUOMs = [
            'mg',
            'mcg',
            'g',
            'ml',
            'l',
            'oz',
            'CFU',
            'mcg DFE',
            'mg DFE',
            '',
            'IU',
        ];
        if (!validUOMs.includes(value)) {
            status.addError('! isValidUOM');
        }
        return validationTests;
    },
};

const createCell = {
    order: ({ value, exception = null, isEditable = true, shouldValidate = true }) => {
        const orderCell = new Cell({
            value: value,
            type: 'ORDER',
            status: createCell.validateOrder(value, exception),
            header: new Header({
                id: 'ORDER',
                name: 'Order',
            }),
            isEditable: isEditable,
        });
        return orderCell;
    },
    validateOrder(value, exception) {
        const status = new Status();

        /**@type {number} */
        if (exception === 'OTHER') {
            validationTests.canBeParsedAsNumber(value, status);
        } else {
            validationTests
                .canBeParsedAsNumber(value, status)
                .isNotEmpty(value, status);
        }

        return status;
    },
    // DESC
    description: ({ value, exception = null, isEditable = true }) => {
        const descCell = new Cell({
            value: value,
            type: 'DESCRIPTION',
            status: createCell.validateDescription(value),
            header: new Header({
                id: 'DESCRIPTION',
                name: 'Description',
            }),
            isEditable: isEditable,
        });
        return descCell;
    },
    validateDescription: (value) => {
        const status = new Status();

        return status;
    },
    //QTY
    quantity: ({ value, exception = null, isEditable = true }) => {
        const qtyCell = new Cell({
            value: value,
            type: 'QUANTITY',
            status: createCell.validateQuantity(value),
            header: new Header({
                id: 'QUANTITY',
                name: 'Qty',
            }),
            isEditable: isEditable,
        });
        return qtyCell;
    },
    validateQuantity: (value) => {
        const status = new Status();

        return status;
    },
    // UOM
    uom: ({ value, exception = null, isEditable = true }) => {
        const uomCell = new Cell({
            value: value,
            type: 'UOM',
            status: createCell.validateUom(value),
            header: new Header({
                id: 'UOM',
                name: 'UOM',
            }),
            isEditable: isEditable,
        });
        return uomCell;
    },
    validateUom: (value) => {
        const status = new Status();

        return status;
    },
    //DVAMT
    dvAmount: ({ value, exception = null, isEditable = true }) => {
        const dvAmtCell = new Cell({
            value: value,
            type: 'DV',
            status: createCell.validateDvAmount(value),
            header: new Header({
                id: 'DV',
                name: 'DV',
            }),
            isEditable: isEditable,
        });
        return dvAmtCell;
    },
    validateDvAmount: (value) => {
        const status = new Status();

        return status;
    },
    //SYMBOL
    symbol: ({ value, exception = null, isEditable = true }) => {
        const symbolCell = new Cell({
            value: value,
            type: 'SYMBOL',
            status: createCell.validateSymbol(value),
            header: new Header({
                id: 'SYMBOL',
                name: 'Sym.',
            }),
            isEditable: isEditable,
        });
        return symbolCell;
    },
    validateSymbol: (value) => {
        const status = new Status();

        return status;
    },
    //FOOTNOTE
    footnote: ({ value, exception = null, isEditable = true }) => {
        const footnoteCell = new Cell({
            value: value,
            type: 'FOOT',
            status: createCell.validateFootnote(value),
            header: new Header({
                id: 'FOOT',
                name: 'Foot.',
            }),
            isEditable: isEditable,
        });
        return footnoteCell;
    },
    validateFootnote: (value) => {
        const status = new Status();

        return status;
    },
};

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
        exception: 'OTHER',
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
                    ingredientTypeObject.value === LABEL_DATASET_NUTRIENT_A.abbr
                ) {
                    // Create nutrient cells for the table
                    const nutrientCells = createNutrientCells_ErrorChecking(
                        ingredientsArray,
                        rowStatus
                    );

                    nonIngredientCells.push(...nutrientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_INGREDIENTS_A.abbr
                ) {
                    // Create ingredient cells for the table
                    const ingredientCells = createIngredientCells_ErrorChecking(
                        ingredientsArray,
                        rowStatus
                    );
                    nonIngredientCells.push(...ingredientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_OTHER_INGREDS_A.abbr
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

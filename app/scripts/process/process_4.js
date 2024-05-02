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
    order: (value, exception = null) => {
        const orderCell = new Cell({
            value: value,
            type: 'ORDER',
            status: createCell.validateOrder(value, exception),
            header: new Header({
                id: 'ORDER',
                name: 'Order',
            }),
        });
        return orderCell;
    },
    validateOrder(value, exception) {
        const status = new Status();

        /**@type {number} */
        if (exception === 'OTHER') {
            console.log('OTHER');
            validationTests.canBeParsedAsNumber(value, status);
        } else {
            validationTests
                .canBeParsedAsNumber(value, status)
                .isNotEmpty(value, status);
        }

        return status;
    },
    // DESC
    description: (value) => {
        const descCell = new Cell({
            value: value,
            type: 'DESCRIPTION',
            status: createCell.validateDescription(value),
            header: new Header({
                id: 'DESCRIPTION',
                name: 'Description',
            }),
        });
        return descCell;
    },
    validateDescription: (value) => {
        const status = new Status();

        return status;
    },
    //QTY
    quantity: (value) => {
        const qtyCell = new Cell({
            value: value,
            type: 'QUANTITY',
            status: createCell.validateQuantity(value),
            header: new Header({
                id: 'QUANTITY',
                name: 'Qty',
            }),
        });
        return qtyCell;
    },
    validateQuantity: (value) => {
        const status = new Status();

        return status;
    },
    // UOM
    uom: (value) => {
        const uomCell = new Cell({
            value: value,
            type: 'UOM',
            status: createCell.validateUom(value),
            header: new Header({
                id: 'UOM',
                name: 'UOM',
            }),
        });
        return uomCell;
    },
    validateUom: (value) => {
        const status = new Status();

        return status;
    },
    //DVAMT
    dvAmount: (value) => {
        const dvAmtCell = new Cell({
            value: value,
            type: 'DV',
            status: createCell.validateDvAmount(value),
            header: new Header({
                id: 'DV',
                name: 'DV',
            }),
        });
        return dvAmtCell;
    },
    validateDvAmount: (value) => {
        const status = new Status();

        return status;
    },
    //SYMBOL
    symbol: (value) => {
        const symbolCell = new Cell({
            value: value,
            type: 'SYMBOL',
            status: createCell.validateSymbol(value),
            header: new Header({
                id: 'SYMBOL',
                name: 'Sym.',
            }),
        });
        return symbolCell;
    },
    validateSymbol: (value) => {
        const status = new Status();

        return status;
    },
    //FOOTNOTE
    footnote: (value) => {
        const footnoteCell = new Cell({
            value: value,
            type: 'FOOT',
            status: createCell.validateFootnote(value),
            header: new Header({
                id: 'FOOT',
                name: 'Foot.',
            }),
        });
        return footnoteCell;
    },
    validateFootnote: (value) => {
        const status = new Status();

        return status;
    },
};

// class Type {
//     constructor() {}

//     validateOrder() {
//         const order = this.order;
//         const cellStatus = new Status();

//         // console.log(`ValidateOrder`);
//         validateTests
//             .canBeParsedAsNumber(order, cellStatus)
//             .isNotEmpty(order, cellStatus);

//         return cellStatus;
//     }
// }
// class Nutrient extends Type {
//     /**@type {number} */
//     order;
//     /**@type {string} */
//     shortDesc;
//     /**@type {string} */
//     longDesc;
//     /**@type {string} */
//     desc;
//     /**@type {number | undefined} */
//     qty;
//     /**@type {number | undefined} */
//     uom;
//     /**@type {number | undefined} */
//     dvAmt;
//     /**@type {string} */
//     symbol;
//     /**@type {string} */
//     foot;
//     constructor() {
//         super();
//     }
// }
// class Ingredient extends Type {
//     /**@type {number} */
//     order;
//     /**@type {string} */
//     shortDesc;
//     /**@type {number | undefined} */
//     qty;
//     /**@type {number | undefined} */
//     uom;
//     /**@type {number | undefined} */
//     dvAmt;
//     /**@type {SYMBOL} */
//     symbol;
//     /**@type {string} */
//     foot;
//     /**@type {string} */
//     unknown;
//     constructor() {
//         super();
//     }
// }

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
    const orderCell = createCell.order(order);
    // Column 2: Description
    const descCell = createCell.description(coalesce(longDesc, shortDesc));
    // Column 3: Quantity
    const qtyCell = createCell.quantity(qty);
    // Column 4: Unit of Measure
    const uomCell = createCell.uom(uom);
    // Column 5: Daily Value
    const dvAmtCell = createCell.dvAmount(dvAmt);
    // Column 6: Symbol
    const symbolCell = createCell.symbol(symbol);
    // Column 7: Footnote
    const footnoteCell = createCell.footnote(foot);

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
            'Ingredient paipes are greater than 9. Cell data is likely incorrect'
        );
    } else if (pipes.length == 9) {
        // status.addInfo('Just right');
    }
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
    const unknown8 = pipes[8].trim();

    // Column 1: Order
    const orderCell = createCell.order(order);
    // console.log(`orderCell`, orderCell);
    // Column 2: Description
    const descCell = createCell.description(shortDesc);
    // Column 3: Quantity
    const qtyCell = createCell.quantity(qty);
    // Column 4: Unit of Measure
    const uomCell = createCell.uom(uom);
    // Column 5: Daily Value
    const dvAmtCell = createCell.dvAmount(dvAmt);
    // Column 6: Symbol
    const symbolCell = createCell.symbol(symbol);
    // Column 7: Footnote
    const footnoteCell = createCell.footnote(foot);

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
    const orderCell = createCell.order('', 'OTHER');
    // Column 2: Description
    const descCell = createCell.description(value);
    // Column 3: Quantity
    const qtyCell = createCell.quantity('');
    // Column 4: Unit of Measure
    const uomCell = createCell.uom('');
    // Column 5: Daily Value
    const dvAmtCell = createCell.dvAmount('');
    // Column 6: Symbol
    const symbolCell = createCell.symbol('');
    // Column 7: Footnote
    const footnoteCell = createCell.footnote('');

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
 * Creates an array of Cells for table columns from the given nutrient or ingredient object.
 *
 * @param {Nutrient | Ingredient} obj - The nutrient or ingredient object to process.
 * @returns {Array<Cell>} - An array of Cells representing table columns.
 */
function createCellsForTableErrorChecking(obj) {
    // console.log(`createCellsForTableErrorChecking`, obj);
    // const cells = [];
    // // Create Cell instances for each table column
    // // Column 1: Order
    // const orderCell = new Cell({
    //     value: obj.order,
    //     type: 'ORDER',
    //     status: obj.status,
    //     header: new Header({
    //         id: 'ORDER',
    //         name: 'Order',
    //     }),
    // });
    // // Column 2: Description
    // const descCell = new Cell({
    //     value: obj.desc,
    //     type: 'DESCRIPTION',
    //     header: new Header({
    //         id: 'DESCRIPTION',
    //         name: 'Description',
    //     }),
    // });
    // // Column 3: Quantity
    // const qtyCell = new Cell({
    //     value: obj.qty,
    //     type: 'QUANTITY',
    //     header: new Header({
    //         id: 'QUANTITY',
    //         name: 'Qty',
    //     }),
    // });
    // // Column 4: Unit of Measure
    // const uomCell = new Cell({
    //     value: obj.uom,
    //     type: 'UOM',
    //     header: new Header({
    //         id: 'UOM',
    //         name: 'UOM',
    //     }),
    // });
    // // Column 5: Daily Value
    // const dvAmtCell = new Cell({
    //     value: obj.dvAmt,
    //     type: 'DV',
    //     header: new Header({
    //         id: 'DV',
    //         name: 'DV',
    //     }),
    // });
    // // Column 6: Symbol
    // const symbolCell = new Cell({
    //     value: obj.symbol,
    //     type: 'SYMBOL',
    //     header: new Header({
    //         id: 'SYMBOL',
    //         name: 'Sym.',
    //     }),
    // });
    // // Column 7: Footnote
    // const footnoteCell = new Cell({
    //     value: obj.foot,
    //     type: 'FOOT',
    //     header: new Header({
    //         id: 'FOOT',
    //         name: 'Foot.',
    //     }),
    // });
    // // Add the created Cell instances to the array
    // cells.push(
    //     orderCell,
    //     descCell,
    //     qtyCell,
    //     uomCell,
    //     dvAmtCell,
    //     symbolCell,
    //     footnoteCell
    // );
    // // Return the array of Cells
    // console.log(`cells`, cells);
    // return cells;
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

        row.forEach((cell) => {
            // console.log(`cell`, cell);

            // Check if the cell is of type MERGED_INGREDIENTS
            if (cell.type === MERGED_INGREDIENTS.id) {
                const ingredientsArray = cell.value.split('|');
                // console.log(`ingredientsArray`,cell.type, ingredientsArray);

                // Split the merged ingredient value by the import delimiter
                const ingredientTypeObject = getObjectByIngredientType(row);

                // Create a new row without the MERGED_INGREDIENTS cell
                const nonIngredientCells = row
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
                    // const nutrientCells = createCellsForTableErrorChecking({
                    //     order: nutrient.order,
                    //     desc: nutrient.desc,
                    //     qty: nutrient.qty,
                    //     uom: nutrient.uom,
                    //     dvAmt: nutrient.dvAmt,
                    //     symbol: nutrient.symbol,
                    //     foot: nutrient.foot,
                    // });
                    // Add nutrient cells to the new row
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
                    // const ingredientCells = createCellsForTableErrorChecking({
                    //     order: ingredient.order,
                    //     desc: ingredient.shortDesc,
                    //     qty: ingredient.qty,
                    //     uom: ingredient.uom,
                    //     dvAmt: ingredient.dvAmt,
                    //     symbol: ingredient.symbol,
                    //     foot: ingredient.foot,
                    // });

                    // Add ingredient cells to the new row
                    // nonIngredientCells.push(...ingredientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_OTHER_INGREDS_A.abbr
                ) {
                    //
                    // const otherCells = createOtherCells_ErrorChecking;
                    // cell.value, rowStatus;
                    const otherCells = createOtherCells_ErrorChecking(
                        ingredientsArray,
                        rowStatus
                    );
                    // Create other cells for the table
                    // const otherCells = createCellsForTableErrorChecking({
                    //     order: '',
                    //     desc: cell.value,
                    //     qty: '',
                    //     uom: '',
                    //     dvAmt: '',
                    //     symbol: '',
                    //     foot: '',
                    // });
                    // Add other cells to the new row
                    nonIngredientCells.push(...otherCells);
                }
                // Add the processed new row to the array of ingredients rows
                const newRow = new Row(nonIngredientCells, rowStatus);

                rowsOfIngredients.push(newRow);
            }
        });
    });
    console.log(`rowsOfIngredients`, rowsOfIngredients);
    return rowsOfIngredients;
}

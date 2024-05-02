// class Type {
//     constructor() {}
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

function createNutrient(pipes) {
    if (pipes.length !== 8) {
        throw new Error('Nutrient not expected length of 8');
    }
    // console.log(`createNutrient pipes`, pipes.length, pipes);
    const order = pipes[0].trim();
    const shortDesc = pipes[1].trim();
    const longDesc = pipes[2].trim();
    const qty = pipes[3].trim();
    const uom = pipes[4].trim();
    const dvAmt = pipes[5].trim();
    const symbol = pipes[6].trim();
    const foot = pipes[7].trim();

    let nutrient = new Nutrient();
    nutrient.order = order;
    nutrient.shortDesc = shortDesc;
    nutrient.longDesc = longDesc;
    nutrient.desc = coalesce(longDesc, shortDesc);
    nutrient.qty = qty;
    nutrient.uom = uom;
    nutrient.dvAmt = dvAmt;
    nutrient.symbol = symbol; //"%"
    nutrient.foot = foot; //"†"

    return nutrient;
}

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
//     constructor() {
//         super();
//     }
// }

function createIngredient(pipes) {
    if (pipes.length !== 9) {
        throw new Error("Ingredient doesn't have length of 9");
    }
    if (pipes[4]) {
        throw new Error('Ingredient has unaccounted pipe [4]');
    }
    if (pipes[7]) {
        throw new Error('Ingredient has unaccounted pipe [7]');
    }
    if (pipes[8]) {
        throw new Error('Ingredient has unaccounted pipe [8]');
    }
    const order = pipes[0].trim();
    const shortDesc = pipes[1].trim();
    const qty = pipes[2].trim();
    const uom = pipes[3].trim();
    // const unk = pipes[4].trim();
    const dvAmt = pipes[5].trim();
    const symbol = pipes[6].trim();
    const foot = pipes[7].trim();

    let ingredient = new Ingredient();
    ingredient.order = order;
    ingredient.shortDesc = shortDesc;
    ingredient.qty = qty;
    ingredient.uom = uom;
    ingredient.dvAmt = dvAmt;
    ingredient.symbol = symbol;
    ingredient.foot = foot;

    return ingredient;
}

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
 * Creates an array of Cells for table columns from the given nutrient or ingredient object.
 *
 * @param {Nutrient | Ingredient} obj - The nutrient or ingredient object to process.
 * @returns {Array<Cell>} - An array of Cells representing table columns.
 */
function createCellsForTable(obj) {
    const cells = [];

    // Create Cell instances for each table column
    // Column 1: Order
    const orderCell = new Cell({
        value: obj.order,
        type: 'ORDER',
        header: new Header({
            id: 'ORDER',
            name: 'Order',
        }),
    });

    // Column 2: Description
    const descCell = new Cell({
        value: obj.desc,
        type: 'DESCRIPTION',
        header: new Header({
            id: 'DESCRIPTION',
            name: 'Description',
        }),
    });

    // Column 3: Quantity
    const qtyCell = new Cell({
        value: obj.qty,
        type: 'QUANTITY',
        header: new Header({
            id: 'QUANTITY',
            name: 'Qty',
        }),
    });

    // Column 4: Unit of Measure
    const uomCell = new Cell({
        value: obj.uom,
        type: 'UOM',
        header: new Header({
            id: 'UOM',
            name: 'UOM',
        }),
    });

    // Column 5: Daily Value
    const dvAmtCell = new Cell({
        value: obj.dvAmt,
        type: 'DV',
        header: new Header({
            id: 'DV',
            name: 'DV',
        }),
    });

    // Column 6: Symbol
    const symbolCell = new Cell({
        value: obj.symbol,
        type: 'SYMBOL',
        header: new Header({
            id: 'SYMBOL',
            name: 'Sym.',
        }),
    });

    // Column 7: Footnote
    const footnoteCell = new Cell({
        value: obj.foot,
        type: 'FOOT',
        header: new Header({
            id: 'FOOT',
            name: 'Foot.',
        }),
    });

    // Add the created Cell instances to the array
    cells.push(
        orderCell,
        descCell,
        qtyCell,
        uomCell,
        dvAmtCell,
        symbolCell,
        footnoteCell
    );

    // Return the array of Cells
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

        row.forEach((cell) => {
            // console.log(`cell`, cell);

            // Check if the cell is of type MERGED_INGREDIENTS
            if (cell.type === MERGED_INGREDIENTS.id) {
                const ingredientsArray = cell.value.split('|');
                // console.log(`ingredientsArray`,cell.type, ingredientsArray);

                // Split the merged ingredient value by the import delimiter
                const ingredientTypeObject = getObjectByIngredientType(row);

                // Create a new row without the MERGED_INGREDIENTS cell
                const newRow = row.filter((c) => c !== cell).map(cloneCell);

                // Process the type of ingredient
                if (
                    ingredientTypeObject.value === LABEL_DATASET_NUTRIENT_A.abbr
                ) {
                    // Create nutrient cells for the table
                    const nutrient = createNutrient(ingredientsArray);
                    const nutrientCells = createCellsForTable({
                        order: nutrient.order,
                        desc: nutrient.desc,
                        qty: nutrient.qty,
                        uom: nutrient.uom,
                        dvAmt: nutrient.dvAmt,
                        symbol: nutrient.symbol,
                        foot: nutrient.foot,
                    });

                    // Add nutrient cells to the new row
                    newRow.push(...nutrientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_INGREDIENTS_A.abbr
                ) {
                    // Create ingredient cells for the table
                    const ingredient = createIngredient(ingredientsArray);
                    const ingredientCells = createCellsForTable({
                        order: ingredient.order,
                        desc: ingredient.shortDesc,
                        qty: ingredient.qty,
                        uom: ingredient.uom,
                        dvAmt: ingredient.dvAmt,
                        symbol: ingredient.symbol,
                        foot: ingredient.foot,
                    });

                    // Add ingredient cells to the new row
                    newRow.push(...ingredientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_OTHER_INGREDS_A.abbr
                ) {
                    // Create other cells for the table
                    const otherCells = createCellsForTable({
                        order: '',
                        desc: cell.value,
                        qty: '',
                        uom: '',
                        dvAmt: '',
                        symbol: '',
                        foot: '',
                    });
                    // Add other cells to the new row
                    newRow.push(...otherCells);
                }
                // Add the processed new row to the array of ingredients rows
                rowsOfIngredients.push(newRow);
            }
        });
    });
    // console.log(`rowsOfIngredients`, rowsOfIngredients);
    return rowsOfIngredients;
}

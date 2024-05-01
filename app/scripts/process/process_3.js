/**
 * Gets the last key in an object.
 *
 * @param {Object} obj - The object to get the last key from.
 * @returns {string} - The last key in the object.
 */
function getNextKey(obj) {
    // Get an array of keys from the object
    const keys = Object.keys(obj);
    // console.log(`keys`, keys, keys.length);

    // Return the last key in the array of keys
    return keys.length;
}

class Nutrient {
    /**@type {number} */
    order;
    /**@type {string} */
    shortDesc;
    /**@type {string} */
    longDesc;
    /**@type {string} */
    coalesced;
    /**@type {number | undefined} */
    qty;
    /**@type {number | undefined} */
    uom;
    /**@type {number | undefined} */
    dvAmt;
    /**@type {SYMBOL} */
    symbol;
    /**@type {string} */
    foot;
}

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
    nutrient.coalesced = coalesce(longDesc, shortDesc);
    nutrient.qty = qty;
    nutrient.uom = uom;
    nutrient.dvAmt = dvAmt;
    nutrient.symbol = symbol; //"%"
    nutrient.foot = foot; //"†"

    return nutrient;
}

/**
 * Adds `Cell` instances for a nutrient to the `duplicatedObject` based on nutrient properties.
 *
 * @param {Nutrient} nutrient - The nutrient object with properties: order, coalesced, qty, uom, dvAmt, symbol, footnote.
 * @param {Object.<number, Cell>} object - The object to which new `Cell` instances will be added.
 * @returns {Object.<number, Cell>} - The updated `duplicatedObject` with new `Cell` instances added.
 */
/*
function createCellsForNutrient(nutrient, object) {
    const duplicatedObject = deepCopyObjectWithCells(object);

    const orderCell = createOrderCell(nutrient.order);
    const orderKey = getNextKey(duplicatedObject);
    duplicatedObject[orderKey] = orderCell;

    const descCell = createDescCell(nutrient.coalesced);
    const descKey = getNextKey(duplicatedObject);
    duplicatedObject[descKey] = descCell;

    const qtyCell = createQtyCell(nutrient.qty);
    const qtyKey = getNextKey(duplicatedObject);
    duplicatedObject[qtyKey] = qtyCell;

    const uomCell = createUomCell(nutrient.uom);
    const uomKey = getNextKey(duplicatedObject);
    duplicatedObject[uomKey] = uomCell;

    const dvAmtCell = createDvAmtCell(nutrient.dvAmt);
    const dvAmtKey = getNextKey(duplicatedObject);
    duplicatedObject[dvAmtKey] = dvAmtCell;

    const symbolCell = createSymbolCell(nutrient.symbol);
    const symbolKey = getNextKey(duplicatedObject);
    duplicatedObject[symbolKey] = symbolCell;

    const footnoteCell = createFootnoteCell(nutrient.foot);
    const footnoteKey = getNextKey(duplicatedObject);
    duplicatedObject[footnoteKey] = footnoteCell;

    return duplicatedObject;
}
*/

class Ingredient {
    /**@type {number} */
    order;
    /**@type {string} */
    shortDesc;
    /**@type {number | undefined} */
    qty;
    /**@type {number | undefined} */
    uom;
    /**@type {number | undefined} */
    dvAmt;
    /**@type {SYMBOL} */
    symbol;
    /**@type {string} */
    foot;
}

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

function deepCopyIngred(object) {
    // Create a new object to hold the duplicated keys and deep-copied Cell instances
    const duplicatedObject = {};

    // Iterate through the original object
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            const cell = object[key];
            if (cell instanceof Cell) {
                // Perform a deep copy of the Cell instance
                const copiedCell = deepCopyCell(cell);
                console.log(`copiedCell`, key, copiedCell);
                // Add the deep-copied Cell instance to the new object using the same key
                duplicatedObject[key] = copiedCell;
                console.log(duplicatedObject);
            } else {
                console.error('unexpected type');
            }
        }
    }

    // Return the duplicated object
    return duplicatedObject;
}

/**
 * Adds `Cell` instances for a nutrient to the `duplicatedObject` based on nutrient properties.
 *
 * @param {Ingredient} ingredient - The nutrient object with properties: order, coalesced, qty, uom, dvAmt, symbol, footnote.
 * @param {Object.<number, Cell>} object - The object to which new `Cell` instances will be added.
 * @returns {Object.<number, Cell>} - The updated `duplicatedObject` with new `Cell` instances added.
 */
function createCellsForIngredient(ingredient) {
    const ingredientCells = [];

    const orderCell = createOrderCell(ingredient.order);
    const descCell = createDescCell(ingredient.shortDesc);
    const qtyCell = createQtyCell(ingredient.qty);
    const uomCell = createUomCell(ingredient.uom);
    const dvAmtCell = createDvAmtCell(ingredient.dvAmt);
    const symbolCell = createSymbolCell(ingredient.symbol);
    const footnoteCell = createFootnoteCell(ingredient.foot);

    ingredientCells.push(
        orderCell,
        descCell,
        qtyCell,
        uomCell,
        dvAmtCell,
        symbolCell,
        footnoteCell
    );
    return ingredientCells;
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

function createCellsForNutrient(nutrient) {
    const nutrientCells = [];
    const orderCell = createOrderCell(nutrient.order);
    const descCell = createDescCell(nutrient.coalesced);
    const qtyCell = createQtyCell(nutrient.qty);
    const uomCell = createUomCell(nutrient.uom);
    const dvAmtCell = createDvAmtCell(nutrient.dvAmt);
    const symbolCell = createSymbolCell(nutrient.symbol);
    const footnoteCell = createFootnoteCell(nutrient.foot);

    nutrientCells.push(
        orderCell,
        descCell,
        qtyCell,
        uomCell,
        dvAmtCell,
        symbolCell,
        footnoteCell
    );

    return nutrientCells;
}

function createCellsForOther(value) {
    const otherCells = [];

    const orderCell = createOrderCell('');
    const descCell = createDescCell(value);
    const qtyCell = createQtyCell('');
    const uomCell = createUomCell('');
    const dvAmtCell = createDvAmtCell('');
    const symbolCell = createSymbolCell('');
    const footnoteCell = createFootnoteCell('');

    otherCells.push(
        orderCell,
        descCell,
        qtyCell,
        uomCell,
        dvAmtCell,
        symbolCell,
        footnoteCell
    );
    return otherCells;
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
                // Split the merged ingredient value by the import delimiter
                const ingredientTypeObject = getObjectByIngredientType(row);

                const ingredientsArray = cell.value.split('|');
                // console.log(`ingredientsArray`,cell.type, ingredientsArray);

                // Remove the original MERGED_INGREDIENTS Create a deep copy of the row without the MERGED_INGREDIENTS cell
                const newRow = row.filter((c) => c !== cell).map(cloneCell);

                if (
                    ingredientTypeObject.value === LABEL_DATASET_NUTRIENT_A.abbr
                ) {
                    const nutrient = createNutrient(ingredientsArray);
                    // console.log('nutrient', nutrient);
                    const nutrientCells = createCellsForNutrient(nutrient);
                    // console.log(`nutrientCells`, nutrientCells);

                    newRow.push(...nutrientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_INGREDIENTS_A.abbr
                ) {
                    const ingredient = createIngredient(ingredientsArray);

                    const ingredientCells =
                        createCellsForIngredient(ingredient);

                    newRow.push(...ingredientCells);
                } else if (
                    ingredientTypeObject.value ===
                    LABEL_DATASET_OTHER_INGREDS_A.abbr
                ) {
                    const other = createCellsForOther(cell.value);

                    newRow.push(...other);
                }
                rowsOfIngredients.push(newRow);
            }
        });
    });
    // console.log(`rowsOfIngredients`, rowsOfIngredients);
    return rowsOfIngredients;
}
/**
 * //* 3rd
 * @param {Array<Object.<number, Cell>>} rows - An array of merged JSON data.
 * @returns {Array<ObjectWithEntity>} - An array of objects representing rows of ingredients.
 */

// function per_pipe_per_partcode_3(rows) {
//     console.log(rows);

//     // const rowsOfIngredients = [];

//     return rows.map((row_as_obj) => {
//         //! Create new cells for each split
//         // For each obj, get it's cell
//         //duplicate all the Cells and update the MERGED_INGREDIENT value to tilde
//         let duplicatedObject = deepCopyObjectWithCells(row_as_obj);
//                     const nextIndex = Object.keys(duplicatedObject).length;

//         const typeKey = getCellKeyBy(INGREDIENT_TYPE.id, duplicatedObject);
//         /** @type {Cell} */
//         const typeCell = duplicatedObject[typeKey];
//         const type = typeCell.value;
//         // console.log(`typeCell`, typeCell);
//         console.log(`duplicatedObject ------>`, type, duplicatedObject);
//         const ingredientKey = getCellKeyBy(
//             MERGED_INGREDIENTS.id,
//             duplicatedObject
//         );
//         /** @type {Cell} */
//         const ingredientCell = duplicatedObject[ingredientKey];
//         const ingredientValue = ingredientCell.value;
//         // console.log(`ingredientCell --->`, ingredientCell);

//         const delimitedArray = ingredientValue.split('|');

//         if (type === LABEL_DATASET_NUTRIENT_A.abbr) {
//             // const delimitedArray = ingredientValue.split('|');
//             /**@type {Nutrient} */
// const nutrient = createNutrient(delimitedArray);
// // console.log(nutrient);
// const nutrientCells = createCellsForNutrient(
//     nutrient,
//     duplicatedObject
// );
// // console.log(`nutrientCells`, nutrientCells);
// rowsOfIngredients.push(nutrientCells);
//         } else if (type === LABEL_DATASET_INGREDIENTS_A.abbr) {
//             // const delimitedArray = ingredientValue.split('|');
//             // console.log(`delimitedArray ingredient`, delimitedArray);

//             // if (delimitedArray.length > 0) {
//             const ingredient = createIngredient(delimitedArray);
//             // console.log(`Ingredient`, ingredient);

//             const ingredientCells = createCellsForIngredient(
//                 ingredient,
//                 duplicatedObject
//             );
//             // Determine the next available index

//             // Add the Cell objects to the sequence object
//             ingredientCells.forEach((cell, index) => {
//                 duplicatedObject[nextIndex + index] = cell;
//             });

//             // ingredientCells.forEach((cell, index) => {
//             //     const keys = Object.keys(duplicatedObject).length;
//             //     // const nextKey = getNextKey(duplicatedObject);
//             //     console.log(`cell`, keys, cell);
//             //     duplicatedObject[length.toString()] = cell;
//             // });

//             // rowsOfIngredients.push(ingredientCells);
//             console.log(`.........................`, duplicatedObject);
//             // }
//             return duplicatedObject;
//         }
//     });
//     console.log(rowsOfIngredients);
//     return rowsOfIngredients;
// }

/*
    rowsOfIngredients.forEach((row) => {
        const mergedIngredient = row[merged_ingredient_entity.id];

        const delimitedArray = mergedIngredient.split('|');

        // console.log(delimitedArray);
        const type = row[ingredient_type_entity.id];

        const rowCopy = JSON.parse(JSON.stringify(row));
        const combinedCopy = { ...rowCopy, ...pipedObject };
        const cleanCopy = removeKeysFromObject(combinedCopy, [
            merged_ingredient_entity.id,
        ]);

        console.log(`type: `, type);
        if (type === LABEL_DATASET_NUTRIENT_A.abbr) {
            const order = delimitedArray[0].trim();
            const shortDesc = delimitedArray[1].trim();
            const longDesc = delimitedArray[2].trim();
            const coelesced = coalesce(longDesc, shortDesc);
            const qty = delimitedArray[3].trim();
            const uom = delimitedArray[4].trim();
            const dvAmt = delimitedArray[5].trim();
            const symbol = delimitedArray[6].trim();
            const foot = delimitedArray[7].trim();

            cleanCopy.ORDER = order;
            cleanCopy.DESC = coelesced;
            cleanCopy.QTY = qty;
            cleanCopy.UOM = uom;
            cleanCopy.DV = dvAmt;
            cleanCopy.SYMBOL = symbol;
            cleanCopy.FOOTNOTE = foot;

            // console.log(`cleanCopy`, cleanCopy);
            // console.log(`rowCopy`, rowCopy);
            newEntities.push(cleanCopy);
        } else if (type === LABEL_DATASET_INGREDIENTS_A.abbr) {
            // console.log(`Ingredient`)
            const order = delimitedArray[0].trim();
            const shortDesc = delimitedArray[1].trim();
            const qty = delimitedArray[2].trim();
            const uom = delimitedArray[3].trim();
            const unk = delimitedArray[4].trim();
            const dvAmt = delimitedArray[5].trim();
            const asterisk = delimitedArray[6].trim();
            const foot = delimitedArray[7].trim();

            cleanCopy.ORDER = order;
            cleanCopy.DESC = shortDesc;
            cleanCopy.QTY = qty;
            cleanCopy.UOM = uom;
            cleanCopy.DV = dvAmt;
            cleanCopy.SYMBOL = asterisk;
            cleanCopy.FOOTNOTE = foot;
            // cleanCopy.unk= unk

            if (unk) {
                console.error(`unk`, unk);
            }

            newEntities.push(cleanCopy);
        }

        if (type === LABEL_DATASET_OTHER_INGREDS_A.abbr) {
            // console.log('Other');
            const other = delimitedArray[0].trim();
            cleanCopy.DESC = other;
            newEntities.push(cleanCopy);
        }
    });

    */

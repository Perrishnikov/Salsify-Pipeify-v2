/**
 * Creates a deep copy of a Cell instance, including deep copying its nested Header object.
 *
 * @param {Cell} cell - The Cell instance to deep copy.
 * @returns {Cell|null} - A new Cell instance with the copied properties, or null if the input Cell is undefined or null.
 */
function deepCopyCell(cell) {
    if (!cell) {
        console.error('The provided Cell instance is undefined or null.');
        return null;
    }

    let headerProps = {};
    // Iterate through the keys of the original object
    for (const key in cell.header) {
        if (cell.header.hasOwnProperty(key)) {
            const value = cell.header[key];
            headerProps[key] = value;
        }
    }
    // console.log(`headerProps: `, headerProps);
    const deepCopiedCell = new Cell({
        value: cell.value,
        type: cell.type,
        header: new Header(headerProps), // Deep copy nested Header object
        status: new Status(), // Deep copy nested Status object
    });
    // console.log(`deepCopiedCell`, deepCopiedCell, deepCopiedCell);
    return deepCopiedCell;
}

/**
 * Duplicates an object where the keys are numbers and the values are instances of the Cell class.
 * The function performs a deep copy of each Cell instance and returns a new object.
 *
 * @param {Object.<number, Cell>} object - The original object with numbered keys and values of type Cell.
 * @returns {Object.<number, Cell>} - A new object with the same structure and deep-copied Cell instances.
 */
function deepCopyObjectWithCells(object) {
    // Create a new object to hold the duplicated keys and deep-copied Cell instances
    const duplicatedObject = {};

    // Iterate through the original object
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            const cell = object[key];
            if (cell instanceof Cell) {
                // Perform a deep copy of the Cell instance
                const copiedCell = deepCopyCell(cell);

                // Add the deep-copied Cell instance to the new object using the same key
                duplicatedObject[key] = copiedCell;
            } else {
                console.error('unexpected type');
            }
        }
    }

    // Return the duplicated object
    return duplicatedObject;
}

/**
 * Retrieves the key of the Cell instance from an {Object.<number, Cell>} structure whose type is 'INGREDIENT_TYPE'.
 *
 * @param {Object.<number, Cell>} obj - The object structure to search through.
 * @returns {number|null} - The key (number) of the Cell instance whose type is 'INGREDIENT_TYPE', or null if not found.
 */
function getCellKeyBy(cell_type, obj) {
    // Iterate through the object structure
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const cell = obj[key];

            // Check if the Cell instance's type is 'INGREDIENT_TYPE'
            if (cell.type === cell_type) {
                // Return the key (number) if the type matches
                return parseInt(key, 10); // Convert the key to a number and return it
            }
        }
    }

    // If no Cell instance with type 'INGREDIENT_TYPE' is found, return null
    return null;
}

/**
 * Removes and returns an object from an array based on its type.
 *
 * @param {Array<Object>} array - The array of objects to search.
 * @param {string} type - The type to search for.
 * @returns {Object|null} - The removed object if found, or null if not found.
 */
function popObjectByType(array, type) {
    // Find the index of the object with the specified type
    const index = array.findIndex(obj => obj.type === type);

    // If the object is found, remove it from the array using splice
    if (index !== -1) {
        // Remove the object and return it
        return array.splice(index, 1)[0];
    }

    // If the object is not found, return null
    return null;
}

/**
 * Creates an array of rows, each representing a single ingredient from `MERGED_INGREDIENTS` in each row.
 *
 * @param {Array<Array<Cell>>} rows - An array of arrays, each representing a row of data with Cell instances.
 * @returns {Array<Array<Cell>>} - An array of rows, each representing a single ingredient from `MERGED_INGREDIENTS` in each row.
 */
function per_ingred_per_partcode_2(rows) {
    // Array to hold the final rows of Cell instances for each ingredient
    const rowsOfIngredients = [];

    // Iterate through each row of data
    rows.forEach((row) => {
        // Process each cell in the row
        row.forEach((cell) => {
            // Check if the cell is of type MERGED_INGREDIENTS
            if (cell.type === MERGED_INGREDIENTS.id) {
                // Split the merged ingredient value by the import delimiter
                const ingredientsArray = cell.value.split(importDelimiter);

                // Create a new row for each ingredient
                ingredientsArray.forEach((ingredient) => {
                    // Create a copy of the row without the merged ingredients cell
                    const newRow = row.filter(c => c.type !== MERGED_INGREDIENTS.id);

                    // Create a new Cell for the ingredient
                    const ingredientCell = new Cell({
                        value: ingredient,
                        type: MERGED_INGREDIENTS.id,
                        header: new Header({
                            id: MERGED_INGREDIENTS.id,
                            name: MERGED_INGREDIENTS.abbr,
                        }),
                    });

                    // Add the ingredient Cell to the new row
                    newRow.push(ingredientCell);

                    // Add the new row to the final array of rows
                    rowsOfIngredients.push(newRow);
                });
            }
        });
    });

    return rowsOfIngredients;
}

/**
 * 2
 * Creates an array of objects, each representing a row of ingredients with a column for each type.
 *
 * @param {Array<Object.<number, Cell>>} rows - An array of merged JSON data.
 * @returns {Array<ObjectWithEntity>} - An array of objects representing rows of ingredients.
 */
// function per_ingred_per_partcode_2(rows) {
//     const rowsOfIngredients = [];

//     rows.forEach((row_as_obj) => {
//         // console.log(row_as_obj);

//         // TODO: remove for loop like in process_3 Access directly.
//         // For each obj, get it's cell
//         for (const obj in row_as_obj) {
//             // console.log(`obj`, obj);
//             /** @type {Cell} */
//             const cell = row_as_obj[obj];
//             // console.log(`cell:`, cell);

//             /** For every ingredient in MERGED_INGREDIENTS */
//             if (cell.type === MERGED_INGREDIENTS.id) {
//                 //... create a new row for every ingredient
//                 // console.log(`cell`, cell);

//                 const mergedIngredient = cell.value;
//                 const delimitedArray = mergedIngredient.split(importDelimiter);

//                 delimitedArray.forEach((tilde) => {
//                     // console.log(`tilde`, tilde);
//                     //0: PARTCODE
//                     //1: Product ID
//                     //2: PRODUCT_NAME
//                     //3: INGREDIENT_TYPE
//                     //4: MERGED_INGREDIENTS

//                     //duplicate all the Cells and update the MERGED_INGREDIENT value to tilde
//                     const duplicatedObject =
//                         deepCopyObjectWithCells(row_as_obj);

//                     // Retrieve the key of the Cell instance with type 'MERGED_INGREDIENTS'
//                     const ingredientTypeKey = getCellKeyBy(
//                         MERGED_INGREDIENTS.id,
//                         duplicatedObject
//                     );

//                     duplicatedObject[ingredientTypeKey].value = tilde;

//                     rowsOfIngredients.push(duplicatedObject);
//                 });
//             }
//         }
//     });

//     return rowsOfIngredients;
// }

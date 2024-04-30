/**
 * //* Used in 1st
 * Removes an array of string values from an array of strings.
 *
 * @param {Array<string>} originalArray - The original array of strings.
 * @param {Array<string>} valuesToRemove - The array of string values to remove from the original array.
 * @returns {Array<string>} - A new array with the specified values removed.
 */
function removeStringsFromArray(originalArray, valuesToRemove) {
    // Create a Set from the values to remove for efficient look-up
    const valuesToRemoveSet = new Set(valuesToRemove);

    // Filter the original array, keeping only values not in the Set
    return originalArray.filter((value) => !valuesToRemoveSet.has(value));
}

//* Used in 1st
// function abbreviateIngredientType(type) {
//     if (type === LABEL_DATASET_NUTRIENT_A.id) {
//         return LABEL_DATASET_NUTRIENT_A.abbr;
//     } else if (type === LABEL_DATASET_INGREDIENTS_A.id) {
//         return LABEL_DATASET_INGREDIENTS_A.abbr;
//     } else if (type === LABEL_DATASET_OTHER_INGREDS_A.id) {
//         return LABEL_DATASET_OTHER_INGREDS_A.abbr;
//     } else {
//         return 'error';
//     }
// }

/**
 * //* 1st
 * Creates an array of entities from rows of data by merging specified ingredients and types.
 *
 * @param {Array<Object.<number, Cell>>} rows - The array of rows of data to process.
 * @param {Array<string>} columnNames - 
 * @param {Array<string>} ingredients_to_merge - The array of keys representing ingredients to merge.
 * @param {} substitute_values - 
 * @returns {Array<Object>} - An array of entities created from the rows of data.
 */
function per_type_per_partcode_1({
    rows,
    columnNames,
    ingredients_to_merge,
    substitute_values,
}) {
    /** @type {Row[]} - return this */
    const rowsOfCells = [];

    // remove LABEL_DATASET_OTHER_INGREDS_A and others
    const salsifyKeys = removeStringsFromArray(
        columnNames,
        ingredients_to_merge
    );
    // console.log(`salsifyKeys`, salsifyKeys);

    rows.forEach((row) => {
        /** create this...
         {
            0: <Cell> {
                header: {id: '', name: ''},
                value: '',
                type: '',
            }
         }
         */

        /** Get the non-ingredient Cells. Do this once outside the for loop below. (PARTCODE, Product ID) */
        // object to hold all the Cells
        const salsify_cells = {};

        // capture the last index so ingredients can continue
        let nextIndex = 0;

        salsifyKeys.forEach((name, index) => {
            // console.log(`key`, key);
            const value = row[name] || ''; // return '' if not found
            const type = name;
            const header = new Header({ id: name, name: name });

            const salsify_cell = new Cell({
                value,
                type,
                header,
            });

            // add Cells to the object
            salsify_cells[index] = salsify_cell;

            // capture the last index so ingredients can continue
            nextIndex = index;
        });
        // console.log(`salsify_cells`, salsify_cells);
        /** end */

        //do these second
        //* Create 3 rows, 1 for each type
        for (const ingredient_type of ingredients_to_merge) {
            //LABEL_DATASET_OTHER_INGREDS_A
            /** If the row[key] matches an ingredient to merge... */
            const ingredient_value = row[ingredient_type] || '';

            // don't create a row if there is no LABEL_DATASET_OTHER_INGREDS_A
            if (ingredient_value) {
                let index = (nextIndex += 1);
                // console.log(ingredient_type, ingredient_value);

                /** Substitutions */
                const substitution_found = substitute_values.find(
                    (obj) => obj.id === ingredient_type
                );
                // console.log(`substitution_found`, substitution_found);

                let type_value = ''

                if (substitution_found) {
                    type_value = substitution_found.abbr;
                } else {
                    type_value = ingredient_type;
                }

                // create Type Cell to add to type_row
                const type_cell = new Cell({
                    value: type_value,
                    type: INGREDIENT_TYPE.id,
                    header: new Header({
                        id: INGREDIENT_TYPE.id,
                        name: INGREDIENT_TYPE.abbr,
                    }),
                });
                // copy existing props into new object
                const type_row = { ...salsify_cells };

                // {4: type_cell}
                type_row[index] = type_cell;
                // console.log(`type_row`, type_row);

                const merged_ingred_cell = new Cell({
                    value: ingredient_value,
                    type: MERGED_INGREDIENTS.id,
                    header: new Header({
                        id: MERGED_INGREDIENTS.id,
                        name: MERGED_INGREDIENTS.abbr,
                    }),
                });

                // {5: merged_ingred_cell}
                type_row[(index += 1)] = merged_ingred_cell;

                rowsOfCells.push(type_row);
            }
        }
    });

    return rowsOfCells;
}

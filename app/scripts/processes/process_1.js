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

/**
 * Creates a new row of Cell instances for each key in the `ingredients_to_merge` Set.
 *
 * @param {Object} options - The options object.
 * @param {Array<Object<string,string>} options.rows - An array of objects representing each row of data.
 * @param {Set<string>} options.ingredients_to_merge - A set of column names to merge into one Cell.
 * @param {Array<string>} options.columnNames - An array of column names for which to create Cell instances.
 * @param {Array<string>} options.substitute_values - An array of column names for which to create Cell instances.
 * @returns {Array<Cell[]>} - An array of arrays, each representing a new row with Cell instances for a key in the ingredients_to_merge Set.
 */
function per_type_per_partcode_1({
    rows,
    columnNames,
    ingredients_to_merge,
    substitute_values,
}) {
    /** @type {Cell[]} - final rows of Cells */
    const rowsOfrowsOfCells = [];

    // Filter column names to remove ingredients to merge
    const salsifyKeys = removeStringsFromArray(
        columnNames,
        ingredients_to_merge
    );

    // Process each row
    rows.forEach((row) => {
        // Create an array to hold Cells for non-ingredient columns (PARTCODE, Product ID)
        const salsifyCells = salsifyKeys.map((name) => {
            const value = row[name] || '';
            const header = new Header({ id: name, name });
            return new Cell({ value, type: name, header });
        });

        // Process each ingredient type in the `ingredients_to_merge` set.Create up to 3 rows, 1 for each type
        ingredients_to_merge.forEach((ingredientType) => {
            // Get the value for the ingredient type
            const ingredientValue = row[ingredientType] || '';

            // Skip if no value is found
            if (!ingredientValue) return;
            // console.log(`ingredient_value`, ingredient_value);

            // Create a new row by copying salsifyCells
            const rowForType = salsifyCells.map(cloneCell);

            /** Substitutions for ingredient type */
            const substitutionFound = substitute_values.find(
                (obj) => obj.id === ingredientType
            );

            let typeValue = '';

            if (substitutionFound) {
                typeValue = substitutionFound.name;
            } else {
                typeValue = ingredientType;
            }

            // Create a Cell for the ingredient type
            const typeCell = new Cell({
                value: typeValue,
                type: INGREDIENT_TYPE.id,
                header: new Header({
                    id: INGREDIENT_TYPE.id,
                    name: INGREDIENT_TYPE.name,
                }),
            });
            // Add the type Cell to the row
            rowForType.push(typeCell);

            // Create a Cell for the merged ingredient value
            const mergedIngredientCell = new Cell({
                value: ingredientValue,
                type: MERGED_INGREDIENTS.id,
                header: new Header({
                    id: MERGED_INGREDIENTS.id,
                    name: MERGED_INGREDIENTS.name,
                }),
            });
            // Add the merged ingredient Cell to the row
            rowForType.push(mergedIngredientCell);

            const newRow = new Row(rowForType);

            // Add the row to the final array of Cell arrays
            // rowsOfrowsOfCells.push(rowForType);
            rowsOfrowsOfCells.push(newRow);
        });
    });

    return rowsOfrowsOfCells;
}

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
                    // Create a deep copy of the row without the MERGED_INGREDIENTS cell
                    const newRow = row.filter((c) => c !== cell).map(cloneCell);

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

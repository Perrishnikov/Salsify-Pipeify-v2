/**
 * //* Used in 2nd
 * Removes specified keys from an object and returns a new object.
 *
 * @param {Object} obj - The original object from which keys should be removed.
 * @param {Array<string>} keysToRemove - An array of keys to remove from the object.
 * @returns {Object} - A new object with specified keys removed.
 */
function removeKeysFromObject(obj, keysToRemove) {
    // Create a shallow copy of the original object
    const newObj = { ...obj };

    // Iterate through each key in the keysToRemove array
    keysToRemove.forEach((key) => {
        // Remove the key from the new object using the delete operator
        delete newObj[key];
    });

    // Return the new object with specified keys removed
    return newObj;
}

/**
 * //* 2nd
 * @param {*} entityRows
 * @returns
 */
function createRowForEachInredient(entityRows) {
    const rowsOfIngredients = [];
    entityRows.forEach((row) => {
        // console.log('modifiedObj', modifiedObj);

        const mergedIngredient = row[merged_ingredient_entity.id];
        // console.log(row);

        /** If row has MERGED_INGREDIENTS */
        if (mergedIngredient) {
            // Split the string by the tilde (~) delimiter
            const delimitedArray = mergedIngredient.split(importDelimiter);

            delimitedArray.forEach((ingredient) => {
                const rowCopy = JSON.parse(JSON.stringify(row));

                const cleanCopy = removeKeysFromObject(rowCopy, [
                    merged_ingredient_entity.id,
                    ingredient_type_entity.id,
                ]);

                const type = row[ingredient_type_entity.id];

                // MERGED_INGREDIENTS = 1|Calories||25| |||
                cleanCopy[merged_ingredient_entity.id] = ingredient;

                // INGREDIENT_TYPE = LABEL_DATASET_NUTRIENT_A - en-US
                cleanCopy[ingredient_type_entity.id] = type;

                rowsOfIngredients.push(cleanCopy);
            });
        }
    });
    return rowsOfIngredients;
}

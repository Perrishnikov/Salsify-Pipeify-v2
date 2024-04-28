/**
 * //* Used in 1st & Meh
 * Returns all unique keys from an array of objects.
 *
 * @param {Array<Object>} arrayOfObjects - The array of objects to process.
 * @returns {Array<string>} - An array of unique keys from the objects.
 */
function getUniqueKeys(arrayOfObjects) {
    // Create a Set to store unique keys
    const uniqueKeysSet = new Set();

    // Loop through each object in the array
    for (const obj of arrayOfObjects) {
        // Loop through each key in the current object
        for (const key in obj) {
            // Add the key to the Set
            uniqueKeysSet.add(key);
        }
    }

    // Convert the Set to an array and return it
    return Array.from(uniqueKeysSet);
}

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
function abbreviateIngredientType(type) {
    if (type === LABEL_DATASET_NUTRIENT_A.id) {
        return LABEL_DATASET_NUTRIENT_A.abbr;
    } else if (type === LABEL_DATASET_INGREDIENTS_A.id) {
        return LABEL_DATASET_INGREDIENTS_A.abbr;
    } else if (type === LABEL_DATASET_OTHER_INGREDS_A.id) {
        return LABEL_DATASET_OTHER_INGREDS_A.abbr;
    } else {
        return 'error';
    }
}

/**
 * //* 1st
 * Creates an array of entities from rows of data by merging specified ingredients and types.
 *
 * @param {Array<Object>} rows_of_data - The array of rows of data to process.
 * @param {Array<string>} ingredients_to_merge - The array of keys representing ingredients to merge.
 * @param {Header} merged_ingredient_entity - The merged ingredient entity.
 * @param {Header} ingredient_type_entity - The ingredient type entity.
 * @returns {Array<Object>} - An array of entities created from the rows of data.
 */
function createRowForEachMergedIngredientType(
    rows_of_data,
    ingredients_to_merge,
    merged_ingredient_entity,
    ingredient_type_entity
) {
    // PARTCODE, Product ID, LABEL_DATASET_OTHER_INGREDS_A, ...
    const uniqueKeys = getUniqueKeys(rows_of_data);

    // remove LABEL_DATASET_OTHER_INGREDS_A and others
    const salsifyKeys = removeStringsFromArray(
        uniqueKeys,
        ingredients_to_merge
    );

    /** @type {Row} */
    const rowsOfIngredient = [];

    rows_of_data.forEach((row) => {
        const entity = {};

        for (const key of salsifyKeys) {
            const value = row[key] || ''; // return '' if not found
            entity[key] = value;
        }

        for (const key of ingredients_to_merge) {
            //LABEL_DATASET_OTHER_INGREDS_A
            /** If the row[key] matches an ingredient to merge... */
            const value = row[key];
            if (value) {
                // copy existing props into new object
                const ingredientRow = { ...entity };
                // add MERGED_INGREDIENTS: value
                ingredientRow[merged_ingredient_entity.id] = value;
                // add INGREDIENT_TYPE: LABEL_DATASET_OTHER_INGREDS_A
                ingredientRow[ingredient_type_entity.id] =
                    abbreviateIngredientType(key);

                rowsOfIngredient.push(ingredientRow);
            }
        }
    });

    return rowsOfIngredient;
}

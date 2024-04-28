const importDelimiter = `~`;

function formatter(desc, amount, uom, dv, percent, symbol) {
    return `${desc}|${amount}|${uom}|${dv}|${percent}|${symbol}~`;
}

/**
 * Returns the first non-null value from the provided values.
 * @param {*} value1 - The first value to check.
 * @param {*} value2 - The second value to check.
 * @returns {*} The first non-null value, or null if both values are null.
 */
function coalesce(value1, value2) {
    // return 1at value if there is one, else 2nd, or nothing
    let value;

    if (value1) {
        value = value1;
    } else if (value2) value = value2;
    else {
        value = null;
    }
    return value;
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

/** ********************************************************************* */
/**
 * Represents a data cell with specified properties.
 * @class
 */
class Entity {
    /**
     * Constructs a new instance of `CellData`.
     * @param {Object} params - The parameters for the `CellData` instance.
     * @param {string} params.id - The ID of the cell.
     * @param {string} params.name - The name of the cell.
     * @param {string} params.type - The type of the cell.
     * @param {number} [params.index] - The index of the cell (optional).
     * @param {any} [params.value=null] - The value of the cell (optional, defaults to `null`).
     */
    constructor({ id, name, type, index, value = null }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.index = index;
        this.value = value;
    }
}

/**
 { 
    "LABEL_DATASET_INGREDIENTS_A - en-US": "6|Black Elder (Sambucus nigra L.) Extract (berry) standardized to anthocyanins from 3,200 mg of premium cultivar elderberries per teaspoon|100|mg|||**||"
    "LABEL_DATASET_NUTRIENT_A - en-US": "1|Calories||25| |||"
    "LABEL_DATASET_NUTRIENT_A - en-US_1": "2|Total Carbohydrate||8|g|3|%|†"
    "LABEL_DATASET_NUTRIENT_A - en-US_2": "3|Total Sugars||0|g|**||"
    "LABEL_DATASET_NUTRIENT_A - en-US_3": "4|Includes 0 g Added Sugars||0||||"
    "LABEL_DATASET_NUTRIENT_A - en-US_4": "5|Sugar Alcohol||8|g|**||"    ​​
    LABEL_DATASET_OTHER_INGREDS_A: "sorbitol, purified water, glycerin, natural flavor, preservatives to maintain freshness (citric acid, potassium sorbate"
    PARTCODE: "6971"
    "Product ID": "00033674069714"
    __rowNum__: 1
    "salsify:data_inheritance_hierarchy_level_id": "variant"
    "salsify:parent_id": "6971"
 }
 */

/**
 * Represents a data structure containing various attributes and their values.
 *
 * @typedef {Object} SalsifyObject
 * @property {string} LABEL_DATASET_INGREDIENTS_A - The ingredient data in en-US format.
 * @property {string} LABEL_DATASET_NUTRIENT_A - The nutrient data in en-US format.
 * @property {string} LABEL_DATASET_OTHER_INGREDS_A - The other ingredient data.
 * @property {string} PARTCODE - The part code.
 * @property {string} Product_ID - The product ID.
 */

//
function indexTheEntities(headers_row, cleaned_rows) {
    const indexed_headers = headers_row.map((cell, index) => {
        cell.index = index;
        return cell;
    });

    const indexed_rows = cleaned_rows.map((row) => {
        return row.map((entity) => {
            const id = entity.id;
            const header = headers_row.filter((obj) => obj.id === id)[0];
            entity.index = header.index;
            return entity;
        });
    });

    return { indexed_headers, indexed_rows };
}

/**
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
 * Creates an array of entities from rows of data by merging specified ingredients and types.
 *
 * @param {Array<Object>} rows_of_data - The array of rows of data to process.
 * @param {Array<string>} ingredients_to_merge - The array of keys representing ingredients to merge.
 * @param {Entity} merged_ingredient_entity - The merged ingredient entity.
 * @param {Entity} ingredient_type_entity - The ingredient type entity.
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
                ingredientRow[ingredient_type_entity.id] = key;

                rowsOfIngredient.push(ingredientRow);
            }
        }
    });

    return rowsOfIngredient;
}

/**
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

const pipedObject = {
    ORDER: '',
    // SHORT_DESC: '',
    // LONG_DESC: '',
    DESC: '',
    QTY: '',
    UOM: '',
    DV: '',
    SYMBOL: '',
    DEF: '',
    FOOTNOTE: '',
    // ASTERISK: ''
};
function createColumnForEachPipe(rowsOfIngredients) {
    console.log(rowsOfIngredients);

    const newEntities = [];

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

        // console.log(`type: `, type);
        if (type === 'LABEL_DATASET_NUTRIENT_A - en-US') {
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
        } else if (type === 'LABEL_DATASET_INGREDIENTS_A - en-US') {
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

        if (type === 'LABEL_DATASET_OTHER_INGREDS_A') {
            //TODO
            // console.log('Other');
            const other = delimitedArray[0].trim();
            cleanCopy.DESC = other;
            newEntities.push(cleanCopy);
        }
        // console.log(`pipe`, pipe);
        // const cleanCopy = removeKeysFromObject(rowCopy, [
        //     merged_ingredient_entity.id,
        //     ingredient_type_entity.id,
        // ]);
        // delete rowCopy[merged_ingredient_entity.id];
        // delete rowCopy[ingredient_type_entity.id];

        // MERGED_INGREDIENTS = 1|Calories||25| |||
        // cleanCopy[merged_ingredient_entity.id] = ingredient;

        // INGREDIENT_TYPE = LABEL_DATASET_NUTRIENT_A - en-US
        // cleanCopy[ingredient_type_entity.id] = type;

        // rowsOfIngredients.push(cleanCopy);
        // });
    });

    return newEntities;
}
const ingredients_to_merge = [
    'LABEL_DATASET_NUTRIENT_A - en-US',
    'LABEL_DATASET_INGREDIENTS_A - en-US',
    'LABEL_DATASET_OTHER_INGREDS_A',
];
const merged_ingredient_entity = new Entity({
    id: 'MERGED_INGREDIENTS',
    name: 'Ingredient Info',
    type: 'MERGED_INGREDIENTS',
});
const ingredient_type_entity = new Entity({
    id: 'INGREDIENT_TYPE',
    name: 'Type',
    type: 'INGREDIENT_TYPE',
});

function switch_parsingOptions(mergedJsonData, parsingOption) {
    console.log(`parsingOption `, parsingOption);
    switch (parsingOption) {
        case 'raw3':
            /** [3,3] Meh - Creates 3 columns for each of the ingredient types and 1 row per partcode */

            // PARTCODE, Product ID, LABEL_DATASET_OTHER_INGREDS_A, ...
            const uniqueKeys = getUniqueKeys(mergedJsonData);
            /** @type {Row} */
            const rowsOfIngredient = [];

            mergedJsonData.forEach((row) => {
                const entity = {};

                for (const key of uniqueKeys) {
                    const value = row[key] || ''; // return '' if not found
                    entity[key] = value;
                }

                rowsOfIngredient.push(entity);

                // console.log(`entity`, entity);
            });
            // return null
            return rowsOfIngredient;
            break;
        case 'raw4':
            {
                /** 1st - [1,x] Creates 1 column for all ingredients and up to 3 rows per partcode. */

                const entityRows = createRowForEachMergedIngredientType(
                    mergedJsonData,
                    ingredients_to_merge,
                    merged_ingredient_entity,
                    ingredient_type_entity
                );

                return entityRows;
            }
            break;
        case 'pipe4':
            {
                /** 2nd - [1,x] Creates 1 column for all ingredinets and x rows per ~ per partcode. */

                const entityRows = createRowForEachMergedIngredientType(
                    mergedJsonData,
                    ingredients_to_merge,
                    merged_ingredient_entity,
                    ingredient_type_entity
                );

                const rowsOfIngredients = createRowForEachInredient(entityRows);
                // console.log(rowsOfIngredients);

                return rowsOfIngredients;
            }
            break;
        case 'pipe5':
            /** 3rd - [8,x] Creates 8 columns, 1 for each pipe and x rows per ~ per partcode. */
            const entityRows = createRowForEachMergedIngredientType(
                mergedJsonData,
                ingredients_to_merge,
                merged_ingredient_entity,
                ingredient_type_entity
            );

            const rowsOfIngredients = createRowForEachInredient(entityRows);
            // console.log(rowsOfIngredients);

            const columnOfPipes = createColumnForEachPipe(rowsOfIngredients);

            return columnOfPipes;
            break;
        default:
            break;
    }
}

function callIngredientParseOption(parsingOption) {
    try {
        const jsonString = localStorage.getItem('original_merged');
        const jsonObject = JSON.parse(jsonString);

        const entityRows = switch_parsingOptions(jsonObject, parsingOption);
        // console.log(`entityRows`, entityRows);

        //* SORT - start */
        // Define the columns to move to the front
        const columnsToMoveToFront = ['PARTCODE', 'Product ID'];

        // Move specified columns to the front of each object
        const movedToFront = moveColumnsToFront(
            entityRows,
            columnsToMoveToFront
        );

        // Move specified columns to the end of each object
        const reorderedData = moveColumnsToEnd(
            movedToFront,
            ingredients_to_merge
        );

        //* SORT - done */
        const { jsonDataSheet, wbString } = create_AoO_sheet(reorderedData);
        //* returned SheetsJS data */

        /* Store the binary string in localStorage to Download Parsed File later */
        localStorage.setItem('workbook', wbString);
        storeJsonObjectInLocalStorage(jsonDataSheet, 'download_json');

        /* Create DOM elements */
        const htmlTable = create_html_table(jsonDataSheet, null);

        // Get container element to append the table
        const tableContainer = document.getElementById('table-container');
        // Clear any old table
        tableContainer.innerHTML = '';
        tableContainer.appendChild(htmlTable);
    } catch (error) {
        switch (error.message) {
            case 'arrayOfObjects is null':
                break;
            default:
                console.dir(error);
                showToast(`Unexpected error: ${error}`, 'error');
                break;
        }
    }
}

/** MAIN ****************************************************************/
function salsify_preprocess(jsonData, parsingOption) {
    //* Clean jsonData first before storing it */
    /** Filter out parents - EA only */
    const varientsOnly = [...jsonData].filter(
        (obj) =>
            obj['salsify:data_inheritance_hierarchy_level_id'] === 'variant'
    );

    /* Remove props that start woth "salsify:" */
    const nonSalsifyPropsOnly = varientsOnly.map((obj) => {
        Object.keys(obj).forEach((key) => {
            // If the key starts with the prefix "salsify:", delete the key and its value from the object
            if (key.startsWith('salsify:')) {
                delete obj[key];
            }
        });
        return obj;
    });
    // console.dir(nonSalsifyPropsOnly);
    // console.log(`parsingOption:`, parsingOption);

    /** @type {SalsifyObject[]} */
    const mergedJsonData =
        prepreprocess_mergeMultipleIngredients(nonSalsifyPropsOnly);
    // console.log('mergedJsonData', mergedJsonData);

    storeJsonObjectInLocalStorage('original_merged', mergedJsonData);

    //* Done with Salsify processing */
    callIngredientParseOption(parsingOption);
}

/********************************************************************* */
function moveColumnsToFront(data, columnsToMove) {
    // Create a new array to hold the reordered objects
    const reorderedData = [];

    // Iterate through each object in the original data
    data.forEach((obj) => {
        // Create a new object
        const reorderedObj = {};

        // Move specified columns to the front of the object
        columnsToMove.forEach((key) => {
            if (obj.hasOwnProperty(key)) {
                reorderedObj[key] = obj[key];
            }
        });

        // Add remaining columns that are not in the specified list
        for (const key in obj) {
            if (!reorderedObj.hasOwnProperty(key)) {
                reorderedObj[key] = obj[key];
            }
        }

        // Add the reordered object to the new array
        reorderedData.push(reorderedObj);
    });

    // Return the new array of objects with specified columns moved to the front
    return reorderedData;
}

/**
 * Moves specified columns to the end of each object in an array of objects.
 *
 * @param {Array<Object>} data - The original array of objects.
 * @param {Array<string>} columnsToMove - An array of property keys to move to the end of each object.
 * @returns {Array<Object>} - A new array of objects with specified columns moved to the end of each object.
 */
function moveColumnsToEnd(data, columnsToMove) {
    // Create a new array to hold the reordered objects
    const reorderedData = [];

    // Iterate through each object in the original data
    data.forEach((obj) => {
        // Create a new object
        const reorderedObj = {};

        // Add remaining columns (not in the specified list) to the new object
        for (const key in obj) {
            if (!columnsToMove.includes(key)) {
                reorderedObj[key] = obj[key];
            }
        }

        // Add specified columns to the end of the object
        columnsToMove.forEach((key) => {
            if (obj.hasOwnProperty(key)) {
                reorderedObj[key] = obj[key];
            }
        });

        // Add the reordered object to the new array
        reorderedData.push(reorderedObj);
    });

    // Return the new array of objects with specified columns moved to the end
    return reorderedData;
}

/**
 * Stores a JSON object in localStorage.
 *
 * @param {string} key - The key under which the JSON object should be stored.
 * @param {Object} jsonObject - The JSON object to store.
 */
function storeJsonObjectInLocalStorage(key, jsonObject) {
    // Convert the JSON object to a JSON string using JSON.stringify()
    const jsonString = JSON.stringify(jsonObject);

    // Store the JSON string in localStorage under the given key
    localStorage.setItem(key, jsonString);
}

/**
 * Merges columns in the provided JSON data based on specified prefixes and returns a new array of objects with merged data.
 *
 * This function takes a JSON array of rows (objects) as input, iterates through each row, and combines values in columns
 * that match specified prefixes (e.g., "LABEL_DATASET_INGREDIENTS_A - en-US" and "LABEL_DATASET_NUTRIENT_A - en-US").
 * It then constructs a new array of rows with the merged data, keeping non-merged columns intact.
 *
 * @param {Array<Object>} jsonData - The JSON array of rows (objects) containing data from the Excel file.
 * @returns {Array<Object>} - A new JSON array of rows (objects) with merged data.
 */
function prepreprocess_mergeMultipleIngredients(jsonData) {
    // Define the column prefixes you want to merge
    const mergePrefixes = [
        'LABEL_DATASET_INGREDIENTS_A - en-US',
        'LABEL_DATASET_NUTRIENT_A - en-US',
    ];

    // Create an array to hold the new JSON data with merged columns
    const mergedJsonData = jsonData.map((row) => {
        // Create a new object to hold the merged row
        let mergedRow = {};

        // Iterate through the merge prefixes
        mergePrefixes.forEach((prefix) => {
            // Initialize a variable to hold the combined value
            let combinedValue = '';

            // Iterate through the keys in the row to find columns matching the prefix
            Object.keys(row).forEach((key) => {
                if (key.startsWith(prefix)) {
                    // Add the value to the combinedValue with a ~ delimiter if not the first value
                    if (combinedValue) {
                        combinedValue += `${importDelimiter}${row[key]}`;
                    } else {
                        combinedValue = row[key];
                    }
                }
            });

            // If there's a combined value, add it to the merged row under the prefix key
            if (combinedValue) {
                mergedRow[prefix] = combinedValue;
            }
        });

        // Add all the non-merged keys and values from the original row to the merged row
        Object.keys(row).forEach((key) => {
            // If the key doesn't match any merge prefix, add it to the merged row
            const isMergedPrefix = mergePrefixes.some((prefix) =>
                key.startsWith(prefix)
            );
            if (!isMergedPrefix) {
                mergedRow[key] = row[key];
            }
        });

        return mergedRow;
    });

    return mergedJsonData;
}

/** ************************************************************* */

/* Function to generate HTML table from JSON data */
function create_html_table(data, radioOption = null) {
    const myTable = document.createElement('table');
    myTable.setAttribute('id', 'my-table');

    // Add table header
    const headerRow = document.createElement('tr');
    for (const key in data[0]) {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    }
    myTable.appendChild(headerRow);

    // Add table rows
    data.forEach((item) => {
        const row = document.createElement('tr');
        for (const key in item) {
            const cell = document.createElement('td');
            cell.textContent = item[key];
            row.appendChild(cell);
        }
        myTable.appendChild(row);
    });

    return myTable;
}

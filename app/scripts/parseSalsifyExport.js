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

/************************************************************************ */

/**
 * Represents a data cell with specified properties.
 * @class
 */
class Header {
    /**
     * Constructs a new instance of `CellData`.
     * @param {Object} params - The parameters for the `CellData` instance.
     * @param {string} params.id - The ID of the cell.
     * @param {string} params.name - The name of the cell.
     * @param {string} params.type - The type of the cell.
     * @param {number} [params.index] - The index of the cell (optional).
     * @param {any} [params.value=null] - The value of the cell (optional, defaults to `null`).
     */
    constructor({ id, name }) {
        this.id = id;
        this.name = name;
    }
}

// Array has Objects
// An Object for each Row
// Object has key for each column
// key is header
// value is cell value

class Cell {
    /** @type {string} */
    value = '';

    /** @type {string} PARTCODE, Product ID, MERGED_INGREDIENT, */
    type;

    /** @type {Header} */
    header;

    /** @type {Status} */
    status;
    constructor({ value, header, type, status = null }) {
        this.value = value;
        this.type = type;
        this.header = header;
        this.status = status;
    }
}

/**
 * Represents a substitution object.
 *
 * @typedef {Object} Substitution
 * @property {string} id - The unique identifier for the substitution.
 * @property {string} abbr - The abbreviation for the substitution.
 */
/**@type {Substitution} */
const LABEL_DATASET_NUTRIENT_A = {
    id: 'LABEL_DATASET_NUTRIENT_A - en-US',
    abbr: 'Nutrients',
};
/**@type {Substitution} */
const LABEL_DATASET_INGREDIENTS_A = {
    id: 'LABEL_DATASET_INGREDIENTS_A - en-US',
    abbr: 'Ingredients',
};
/**@type {Substitution} */
const LABEL_DATASET_OTHER_INGREDS_A = {
    id: 'LABEL_DATASET_OTHER_INGREDS_A',
    abbr: 'Other',
};
/**@type {Substitution} */
const MERGED_INGREDIENTS = {
    id: 'MERGED_INGREDIENTS',
    abbr: 'Ingredient Info',
};
/**@type {Substitution} */
const INGREDIENT_TYPE = {
    id: 'INGREDIENT_TYPE',
    abbr: 'Type',
};

const ingredients_to_merge = [
    LABEL_DATASET_NUTRIENT_A.id,
    LABEL_DATASET_INGREDIENTS_A.id,
    LABEL_DATASET_OTHER_INGREDS_A.id,
];

/**
 * Returns all unique keys from an array of objects.
 *
 * @param {Array<Object>} arrayOfObjects - The array of objects to process.
 * @returns {Array<string>} - An array of unique keys from the objects.
 */
function getUniqueColumnNames(arrayOfObjects) {
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
 * An array of objects, where each object has a numerical key and a value of type Entity.
 *
 * @typedef {Object.<number, Cell>} ObjectWithEntity
 */

/**
 * Triggered when radio buttons change
 * @param {*} mergedJsonData
 * @param {*} parsingOption
 * @returns
 */
function switch_parsingOptions(mergedJsonData, parsingOption) {
    // console.log('mergedJsonData', mergedJsonData);
    // console.log(`parsingOption `, parsingOption);

    const uniqueColumnNames = getUniqueColumnNames(mergedJsonData);
    // console.log(`uniqueKeys`, uniqueKeys);

    const orderedColumnNames = uniqueColumnNames
        .moveToFrontById('PRODUCT_NAME')
        .moveToFrontById('Product ID')
        .moveToFrontById('PARTCODE')
        .moveToEndById(LABEL_DATASET_NUTRIENT_A.id)
        .moveToEndById(LABEL_DATASET_INGREDIENTS_A.id)
        .moveToEndById(LABEL_DATASET_OTHER_INGREDS_A.id);
    // console.log(`orderedColumnNames`, orderedColumnNames);

    switch (parsingOption) {
        case 'meh':
            {
                /** [3,3] Meh - Creates 3 columns for each of the ingredient types and 1 row per partcode */

                const rowsOfCells = option_0({
                    rows: mergedJsonData,
                    columnNames: orderedColumnNames,
                    substitute_headers: [
                        LABEL_DATASET_NUTRIENT_A,
                        LABEL_DATASET_INGREDIENTS_A,
                        LABEL_DATASET_OTHER_INGREDS_A,
                    ],
                });

                return rowsOfCells;
            }
            break;
        case 'option1':
            {
                /** 1st - [1,x] Creates 1 column for all ingredients and up to 3 rows per partcode. */

                const rowsOfCells = per_type_per_partcode_1({
                    rows: mergedJsonData,
                    columnNames: orderedColumnNames,
                    ingredients_to_merge,
                    substitute_values: [
                        LABEL_DATASET_NUTRIENT_A,
                        LABEL_DATASET_INGREDIENTS_A,
                        LABEL_DATASET_OTHER_INGREDS_A,
                    ],
                });

                return rowsOfCells;
            }
            break;
        case 'option2':
            {
                /** 2nd - [1,x] Creates 1 column for all ingredinets and x rows per ingredient per partcode. */

                const rowsOfCells = per_type_per_partcode_1({
                    rows: mergedJsonData,
                    columnNames: orderedColumnNames,
                    ingredients_to_merge,
                    substitute_values: [
                        LABEL_DATASET_NUTRIENT_A,
                        LABEL_DATASET_INGREDIENTS_A,
                        LABEL_DATASET_OTHER_INGREDS_A,
                    ],
                });

                const rowsOfIngredients = per_ingred_per_partCode_2(
                    rowsOfCells,
                    ingredients_to_merge
                );

                return rowsOfIngredients;
            }
            break;
        case 'option3':
            {
                /** 3rd - [8,x] Creates 8 columns, 1 for each pipe and x rows per ~ per partcode. */
                const rowsOfCells = per_type_per_partcode_1({
                    rows: mergedJsonData,
                    columnNames: orderedColumnNames,
                    ingredients_to_merge,
                    substitute_values: [
                        LABEL_DATASET_NUTRIENT_A,
                        LABEL_DATASET_INGREDIENTS_A,
                        LABEL_DATASET_OTHER_INGREDS_A,
                    ],
                });

                const rowsOfIngredients = per_ingred_per_partCode_2(
                    rowsOfCells,
                    ingredients_to_merge
                );
                // console.log(rowsOfIngredients);

                const columnOfPipes =
                    per_pipe_per_partcode_3(rowsOfIngredients);

                return columnOfPipes;
            }
            break;
        case 'option4':
            // {
            //     const entityRows = per_type_per_partcode_1(
            //         mergedJsonData,
            //         ingredients_to_merge,
            //         merged_ingredient_subst,
            //         ingredient_type_subst
            //     );

            //     const rowsOfIngredients = per_ingred_per_partCode_2(entityRows);
            //     // console.log(rowsOfIngredients);

            //     const columnOfPipes =
            //         per_pipe_per_partcode_3(rowsOfIngredients);

            //     console.log(columnOfPipes);

            //     columnOfPipes.map((row) => {
            //         console.log(`row: `, row);
            //         if (
            //             row.INGREDIENT_TYPE ===
            //             'LABEL_DATASET_NUTRIENT_A - en-US'
            //         ) {
            //             const order = row.ORDER;
            //             console.log(`order: `, order);
            //         }
            //         return row;
            //     });
            //     return columnOfPipes;
            // }
            break;
        default:
            break;
    }

    // return reordered;
}

function process_parsing_option(parsingOption) {
    // try {
        const jsonString = localStorage.getItem('original_merged');
        const jsonObject = JSON.parse(jsonString);

        /** Create all the data here */
        const entityRows = switch_parsingOptions(jsonObject, parsingOption);
        // console.log(`entityRows`, entityRows);

        //* SORT - start */
        // Define the columns to move to the front
        // const columnsToMoveToFront = ['PARTCODE', 'Product ID'];

        // Move specified columns to the front of each object
        // const movedToFront = moveColumnsToFront(
        //     entityRows,
        //     columnsToMoveToFront
        // );

        // Move specified columns to the end of each object
        // const reorderedData = moveColumnsToEnd(
        //     entityRows,
        //     ingredients_to_merge
        // );

        //* SORT - done */

        // const { jsonDataSheet, wbString } = create_AoO_sheet(reorderedData);
        //* returned SheetsJS data */

        /* Store the binary string in localStorage to Download Parsed File later */
        // localStorage.setItem('workbook', wbString);
        // storeJsonObjectInLocalStorage(jsonDataSheet, 'download_json');

        /* //! DOM doesnt need workbook Create DOM elements */
        // const htmlTable = create_html_table(reorderedData, null);
        const htmlTable = create_html_table_with_entities(entityRows, null);

        // Get container element to append the table
        const tableContainer = document.getElementById('table-container');
        // Clear any old table
        tableContainer.innerHTML = '';
        tableContainer.appendChild(htmlTable);
    // } catch (error) {
    //     switch (error.message) {
    //         case 'arrayOfObjects is null':
    //             break;
    //         default:
    //             console.dir(error);
    //             showToast(`Unexpected error: ${error}`, 'error');
    //             break;
    //     }
    // }
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
    process_parsing_option(parsingOption);
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
        LABEL_DATASET_NUTRIENT_A.id,
        LABEL_DATASET_INGREDIENTS_A.id,
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

/********************************************************************* */

// Extend the Array prototype with a new function called moveToFrontById
Array.prototype.moveToFrontById = function (id) {
    // Find the index of the object with the specified `id` property
    //! const index = this.findIndex((obj) => obj.id === id);
    const index = this.findIndex((name) => name === id);

    // If the object is found and the index is not the first index, proceed
    if (index > 0) {
        // Splice the object out of the array
        const [obj] = this.splice(index, 1);
        // Insert the object at the front of the array
        this.unshift(obj);
    }

    return this;
};
/**
 * Moves an object with the specified `id` to the end of an array of objects.
 *
 * @param {string} id - The `id` of the object to move to the end of the array.
 * @returns {Array<Object>} - The array with the object moved to the end.
 */
Array.prototype.moveToEndById = function (id) {
    // Find the index of the object with the specified `id` property
    const index = this.findIndex((name) => name === id);

    // If the object is found and the index is not already at the end, proceed
    if (index > -1 && index < this.length - 1) {
        // Remove the object from its current position
        const [obj] = this.splice(index, 1);
        // Add the object to the end of the array
        this.push(obj);
    }

    return this;
};

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

/** ************************************************************* */

/* Function to generate HTML table from JSON data */
function create_html_table_with_entities(data, radioOption = null) {
    const myTable = document.createElement('table');
    myTable.setAttribute('id', 'my-table');

    // Add table header
    const headerRow = document.createElement('tr');
    for (const key in data[0]) {
        const headerName = data[0][key].header.name;
        // console.log('headerName', headerName);
        const th = document.createElement('th');
        th.textContent = headerName; //*
        headerRow.appendChild(th);
    }
    myTable.appendChild(headerRow);

    // Add table rows
    data.forEach((item) => {
        const row = document.createElement('tr');
        for (const key in item) {
            const cell = document.createElement('td');
            cell.textContent = item[key].value; //*
            row.appendChild(cell);
        }
        myTable.appendChild(row);
    });

    return myTable;
}

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

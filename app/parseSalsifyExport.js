const RAW = 'Raw';
const CLEAN = 'Clean Pipes';
const PARSE = 'Parse Columns';

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
 * Cleans and merges rows of data based on merge ingredients and unique headers.
 * @param {Object[]} rows_of_each_data - An array of objects, each representing a row of data.
 * @param {Object} merge_ingredients - An object containing merge ingredients information.
 * @param {Entity} merge_ingredients.merge_into_entity - The ID for merged ingredients (e.g., 'MERGED_INGREDIENTS').
 * @param {string[]} merge_ingredients.merge_these - An array of keys to be merged.
 * @returns {Object} An object containing `headers_row` and `entity_rows` arrays.
 * @returns {Entity[]} Object.headers_row - An array of header cells.
//  * @returns {{{Entity[], Entity[]}}} Object.entity_rows - An array of arrays, each containing `CellData` objects representing rows of data.
 */
// function mergeIngredientsIntoRows_createEntities(
//     rows_of_each_data,
//     merge_ingredients,
//     ingredient_type_entity
// ) {
//     const header_names = []; //thrown away (use for index?)
//     /** @type {Entity[]} */
//     const headers_row = [];
//     /** @type {Entity[][]} */
//     const entity_rows = [];

//     const merge_into_entity = merge_ingredients.merge_into_entity;

//     rows_of_each_data.forEach((row_of_data) => {
//         /** @type {Entity[]} */
//         const newRow = [];
//         console.log(`row_of_data`, row_of_data);

//         Object.entries(row_of_data).forEach(([key, value]) => {
//             // key: 'PARTCODE', value: '10078'
//             console.log(key, value);

//             /* does the clean_key match a merged_ingredient? */
//             const key_matches = merge_ingredients.merge_these.find((obj) => {
//                 // console.log(obj);
//                 return obj === key; //*
//             });

//             /* Create Cells to push into the Row array */
//             if (key_matches) {
//                 /* Creates an ingredient cell (key_matches: 'LABEL_DATASET_INGREDIENTS_A - en-US') */

//                 // Add MERGED_INGREDIENTS to the list of headers
//                 const found = header_names.includes(merge_into_entity.id);

//                 /* Push THE (merged) Ingredient HEADER */
//                 if (!found) {
//                     // const merged_header = new Entity({
//                     //     id: merge_ingredients.id, // 'MERGED_INGREDIENTS'
//                     //     name: merge_ingredients.name, // 'Ingredient Info'
//                     //     type: merge_ingredients.type,
//                     // });
//                     header_names.push(merge_into_entity.id);
//                     headers_row.push(ingredient_type_entity);
//                 }

//                 // console.log(`key_matches: `, key_matches, value);
//                 /* Regardless, push an ingredient Cell */
//                 const merged_ingredient = new Entity({
//                     id: merge_ingredients.id,
//                     name: merge_ingredients.name,
//                     type: key_matches,
//                     value: value,
//                 });
//                 /*{
//                         id:MERGED_INGREDIENTS,
//                         name: 'Ingredient Info',
//                         type: 'LABEL_DATASET_INGREDIENTS_A - en-US',
//                         value: 'Microcrystalline cellulose, corn starch,...'
//                     }*/
//                 newRow.push(merged_ingredient);
//             } else {
//                 /* Creates a non-ingredient cell (PARTCODE, Product ID)*/

//                 /** Push non-ingredient HEADER */
//                 const found = header_names.includes(key);
//                 if (!found) {
//                     const header = new Entity({
//                         id: key,
//                         name: key,
//                         type: key,
//                     });
//                     header_names.push(key);
//                     headers_row.push(header);
//                 }

//                 /* Regardless, push non-ingredient Cell (PARTCODE) */
//                 const entity = new Entity({
//                     id: key,
//                     name: key,
//                     type: key,
//                     value: value,
//                 });

//                 newRow.push(entity);
//             }
//         });
//         // console.log(`newRow`, newRow);
//         entity_rows.push(newRow);
//     });

//     // console.log('header_names', header_names);
//     return { headers_row, entity_rows };
// }

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
 * Moves an object with a specific `id` to the last item in an array.
 * @param {Object[]} array - The array of objects.
 * @param {string|number} targetId - The `id` of the object to move.
 */
function sortAndmoveIngredientsToLast(array, targetId) {
    const copiedArray = [...array];

    copiedArray.sort((a, b) => {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    });

    // Find the index of the object with the specified `id`
    const index = copiedArray.findIndex((obj) => obj.id === targetId);

    // Check if the object was found
    if (index !== -1) {
        // Remove the object from its current position
        const [obj] = copiedArray.splice(index, 1);

        // Add the object to the end of the array
        copiedArray.push(obj);
    }

    return copiedArray;
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
function createArrayOfEntities(
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

function switch_parsingOptions(mergedJsonData, parsingOption) {
    console.log(`parsingOption `, parsingOption);
    switch (parsingOption) {
        case 'raw3':
            console.log(`TODO: Raw3`);

        case 'raw4':
            /**   Raw4 - [2,x] MERGE 2 -> PARSE create one column for all ingredients and one for type; One row per ingredient */
            const ingredients_to_merge = [
                'LABEL_DATASET_OTHER_INGREDS_A',
                'LABEL_DATASET_NUTRIENT_A - en-US',
                'LABEL_DATASET_INGREDIENTS_A - en-US',
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

            const entityRows = createArrayOfEntities(
                mergedJsonData,
                ingredients_to_merge,
                merged_ingredient_entity,
                ingredient_type_entity
            );

            return entityRows;
        default:
            break;
    }
}

/** MAIN */
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

    const mergedJsonData = merge_multiple_ingredients(nonSalsifyPropsOnly);
    // console.log('mergedJsonData', mergedJsonData);
    storeJsonObjectInLocalStorage('original_merged', mergedJsonData);

    //* Done with Salsify processing */

    try {
        const jsonString = localStorage.getItem('original_merged');
        const jsonObject = JSON.parse(jsonString);

        const entityRows = switch_parsingOptions(jsonObject, parsingOption);
        // console.log(`entityRows`, entityRows);

        const { jsonDataSheet, wbString } = create_AoO_sheet(entityRows);
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
        console.error('Failed to parse JSON:', error);
        //TODO: Thow exception to DOM
    }
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
function merge_multiple_ingredients(jsonData) {
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
                        combinedValue += `~${row[key]}`;
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
/**
 * Generates checkboxes dynamically based on the clean headers array and appends them to the DOM.
 * @param {string[]} all_the_headers - An array of clean header names.
 * @param {object} headersToMerge - An object containing information about headers to merge.
 * @param {string[]} headersToMerge.headers - An array of headers to merge.
 * @param {string} headersToMerge.mergeAs - A message to append to the label for headers to merge.
 */
// function dom_generateCheckboxes(all_the_headers, headersToMerge) {
//     const headerCheckboxes = document.getElementById('headerCheckboxes');

//     // Store the reference to the first child element
//     const subtitleDiv = headerCheckboxes.firstElementChild;
//     headerCheckboxes.innerHTML = '';
//     // Append back the preserved first child
//     headerCheckboxes.appendChild(subtitleDiv);

//     // Iterate through the array of strings
//     all_the_headers.forEach((header_name) => {
//         const container = document.createElement('div');
//         container.classList.add('option-div');

//         // Create a checkbox element
//         const checkbox = document.createElement('input');
//         checkbox.type = 'checkbox';
//         checkbox.checked = true; // Checkbox is checked by default
//         checkbox.value = header_name;

//         // Add event listener to log value when clicked
//         checkbox.addEventListener('click', (e) => {
//             console.log(e.target.value);
//         });

//         // Create a label element for the checkbox
//         const label = document.createElement('label');
//         label.classList.add('radio-checkbox-label');

//         const labelName = headersToMerge.headers.includes(header_name)
//             ? `${header_name} as (${headersToMerge.mergeAs})`
//             : header_name;

//         label.appendChild(document.createTextNode(labelName));

//         // Append checkbox and label to container
//         container.appendChild(checkbox);
//         container.appendChild(label);

//         headerCheckboxes.appendChild(container);
//     });
// }

/**
 * Converts an array of objects to an HTML table.
 *
 * @param {Array<Object>} aoo - The array of objects to convert.
 * @returns {string} - The HTML string representing the table.
 */
function convertAoOToHtml(aoo) {
    if (aoo.length === 0) {
        return '';
    }

    // Create the table
    let html = '<table>';

    // Get the headers (keys) from the first object
    const headers = Object.keys(aoo[0]);

    // Create the table header row
    html += '<thead><tr>';
    for (const header of headers) {
        html += `<th>${header}</th>`;
    }
    html += '</tr></thead>';

    // Create the table body
    html += '<tbody>';
    for (const obj of aoo) {
        html += '<tr>';
        for (const header of headers) {
            const value = obj[header] || ''; // Get the value for the header key
            html += `<td>${value}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody>';

    // Close the table
    html += '</table>';

    return html;
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

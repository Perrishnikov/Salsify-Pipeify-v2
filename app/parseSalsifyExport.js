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
 * Removes '_' followed by a number from the end of a string.
 * @param {string} str - The string to remove '_' and number from.
 * @returns {string} The modified string with '_' and number removed from the end.
 */
function removeUnderscoreAndNumber(str) {
    // Use a regular expression to match '_' followed by one or more digits at the end of the string
    const regex = /_\d+$/;
    // Replace the matched pattern with an empty string

    return str.replace(regex, '');
}

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
 * @param {string} merge_ingredients.id - The ID for merged ingredients (e.g., 'MERGED_INGREDIENTS').
 * @param {string} merge_ingredients.name - The name for merged ingredients (e.g., 'Ingredient Info').
 * @param {string[]} merge_ingredients.merge_these - An array of keys to be merged.
 * @returns {Object} An object containing `headers_row` and `entity_rows` arrays.
 * @returns {Entity[]} Object.headers_row - An array of header cells.
//  * @returns {{{Entity[], Entity[]}}} Object.entity_rows - An array of arrays, each containing `CellData` objects representing rows of data.
 */
function mergeIngredientsIntoRows_createEntities(
    rows_of_each_data,
    merge_ingredients
) {
    const header_names = []; //thrown away (use for index?)
    /** @type {Entity[]} */
    const headers_row = [];
    /** @type {Entity[][]} */
    const entity_rows = [];

    rows_of_each_data.forEach((row_of_data) => {
        /** @type {Entity[]} */
        const newRow = [];

        Object.entries(row_of_data).forEach(([key, value]) => {
            // key: 'PARTCODE', value: '10078'
            // console.log(key, value);

            /* does the clean_key match a merged_ingredient? */
            const key_matches = merge_ingredients.merge_these.find((obj) => {
                // console.log(obj);
                return obj === key; //*
            });

            /* Create Cells to push into the Row array */
            if (key_matches) {
                /* Creates an ingredient cell (key_matches: 'LABEL_DATASET_INGREDIENTS_A - en-US') */

                const found = header_names.includes(merge_ingredients.id);

                /* Push THE (merged) Ingredient HEADER */
                if (!found) {
                    const merged_header = new Entity({
                        id: merge_ingredients.id, // 'MERGED_INGREDIENTS'
                        name: merge_ingredients.name, // 'Ingredient Info'
                        type: merge_ingredients.type,
                    });
                    header_names.push(merge_ingredients.id);
                    headers_row.push(merged_header);
                }

                // console.log(`key_matches: `, key_matches, value);
                /* Regardless, push an ingredient Cell */
                const merged_ingredient = new Entity({
                    id: merge_ingredients.id,
                    name: merge_ingredients.name,
                    type: key_matches,
                    value: value,
                });
                /*{
                        id:MERGED_INGREDIENTS,
                        name: 'Ingredient Info',
                        type: 'LABEL_DATASET_INGREDIENTS_A - en-US',
                        value: 'Microcrystalline cellulose, corn starch,...'
                    }*/
                newRow.push(merged_ingredient);
            } else {
                /* Creates a non-ingredient cell (PARTCODE, Product ID)*/

                /** Push non-ingredient HEADER */
                const found = header_names.includes(key);
                if (!found) {
                    const header = new Entity({
                        id: key,
                        name: key,
                        type: key,
                    });
                    header_names.push(key);
                    headers_row.push(header);
                }

                /* Regardless, push non-ingredient Cell (PARTCODE) */
                const entity = new Entity({
                    id: key,
                    name: key,
                    type: key,
                    value: value,
                });

                newRow.push(entity);
            }
        });
        // console.log(`newRow`, newRow);
        entity_rows.push(newRow);
    });

    // console.log('header_names', header_names);
    return { headers_row, entity_rows };
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
 * Extracts unique IDs from an array of arrays.
 * @param {Array<Array<{ id: string }>>} arrayOfArrays - An array of arrays, each containing objects with an `id` property.
 * @returns {string[]} An array of unique IDs extracted from the input array of arrays.
 */
function getUniqueIds(arrayOfArrays) {
    /** @type {string[]} */
    const uniqueIds = [];

    arrayOfArrays.forEach((array) => {
        // console.log(array);
        array.forEach((subArray) => {
            // console.log(subArray.id);
            if (!uniqueIds.includes(subArray.id)) {
                uniqueIds.push(subArray.id);
            }
        });
    });

    return uniqueIds;
}

/**
 * Creates rows for each ingredient by filtering and processing rows based on merge ingredients and unique IDs.
 * @param {Array<Array>} cleaned_rows - An array of arrays, where each inner array contains objects representing rows of data.
 * @param {Object} merge_ingredients - An object containing merge ingredients information.
 * @param {string} merge_ingredients.id - The ID for merged ingredients.
 * @param {string[]} non_merged_uniqueIds - An array of non-merged unique IDs.
 * @returns {Array[]} An array of arrays, where each inner array represents rows for each ingredient.
 */
function createRowForEachIngredient(
    cleaned_rows,
    merge_ingredients,
    non_merged_uniqueIds
) {
    return cleaned_rows.map((clean_row) => {
        // console.log('clean_row:', clean_row);

        /** Include only rows that have id === MERGED_INGREDIENTS */
        const ingredient_rows = clean_row.filter((item) => {
            // console.log(`item: `, item.id);
            return item.id === merge_ingredients.id;
        });

        /** Include only rows that are !== MERGED_INGREDIENTS */
        const other_rows = clean_row.filter((item) => {
            return item.id !== merge_ingredients.id;
        });

        /** Loop over each non_merged_uniqueIds.
         * If found, return the value
         * If not, return '' (accomodate missing PRODUCT_NAME's)
         */
        const placeHolders = [];
        for (let index = 0; index < non_merged_uniqueIds.length; index++) {
            const element = non_merged_uniqueIds[index];
            // console.log(`element:`, element);

            const found = other_rows.filter((other_row) => {
                const id = other_row.id;
                // console.log('id: ', id);
                return id === element;
            })[0];
            // console.log(`found: `, found);
            if (found) {
                placeHolders.push(found);
            } else {
                /** Push a placeholder for missing values */
                const bogus = new Entity({
                    id: element,
                    name: element,
                    type: element,
                    value: '',
                });
                placeHolders.push(bogus);
            }
        }

        // console.log(`other_rows: `, other_rows);
        // console.log(`placeHolders:`, placeHolders);

        const ingredRow = ingredient_rows.map((ingred) => {
            return [...placeHolders, ingred];
        });
        // console.log(`ingredRow`, ingredRow);
        return ingredRow;
    });
}

/**
 * Indexes the headers and rows based on their IDs and returns the indexed headers and rows.
 *
 * This function takes a row of header objects (`headers_row`) and an array of cleaned rows (`cleaned_rows`) as input.
 * It assigns an index property to each header object based on its position in the row and associates each entity in the cleaned rows
 * with the corresponding index from the header row based on their IDs.
 *
 * @param {Array<Object>} headers_row - The row of header objects, where each object represents a header and may contain an ID property.
 * @param {Array<Array<Object>>} cleaned_rows - An array of cleaned rows, where each row is an array of entities (objects) that may contain an ID property.
 * @returns {Object} - An object containing two properties:
 *                    - `indexed_headers`: An array of header objects with an additional index property indicating their position in the row.
 *                    - `indexed_rows`: An array of rows, where each row contains entities (objects) with an additional index property indicating the corresponding header index.
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

function getHeadersAndRows(mergedJsonData, parsingOption) {
    console.log(`parsingOption `, parsingOption);
    switch (parsingOption) {
        case 'raw1':
            // let header_only_row = [];
            // let values_only_rows = []

            /** @type {Entity[]} */
            const headers = [];
            /** @type {Entity[][]} */
            const rows = [];

            console.log(`Hello World!`);
            return { header_only_row, values_only_rows };

        case 'raw2':
            /**  create one column for all ingredient types; ~ delimited */
            const merge_ingredients = {
                merge_these: [
                    'LABEL_DATASET_OTHER_INGREDS_A',
                    'LABEL_DATASET_NUTRIENT_A - en-US',
                    'LABEL_DATASET_INGREDIENTS_A - en-US',
                ],
                id: 'MERGED_INGREDIENTS',
                name: 'Ingredient Info',
                type: 'MERGED_INGREDIENTS',
            };

            let { headers_row, entity_rows } =
                mergeIngredientsIntoRows_createEntities(
                    mergedJsonData,
                    merge_ingredients
                );

            //TODO: add a column for 'pipeify:type' here
            // addTypeColumn(headers_row, entity_rows);

            // console.log(`headers_row`, headers_row);
            // console.log('entity_rows', entity_rows);

            const sorted_headers = sortAndmoveIngredientsToLast(
                headers_row,
                merge_ingredients.id
            );

            const { indexed_headers, indexed_rows } = indexTheEntities(
                sorted_headers,
                entity_rows
            );
            // console.log('indexed_headers', indexed_headers);
            // console.log('indexed_rows', indexed_headers);

            /* To get non_merged_uniqueIds */
            /* [ "PARTCODE", "Product ID", "MERGED_INGREDIENTS", "PRODUCT_NAME" ] */
            const uniqueIds = getUniqueIds(indexed_rows);

            /* Part of creating a Row */
            /* [ "PARTCODE", "Product ID", "PRODUCT_NAME" ] */
            const non_merged_uniqueIds = uniqueIds.filter(
                (id) => id !== merge_ingredients.id
            );

            /*** Prep arrays to send to SheetsJS ***/
            /* Create Non-Header Row */
            const ingredient_only_rows = createRowForEachIngredient(
                indexed_rows,
                merge_ingredients,
                non_merged_uniqueIds
            ).flat();
            console.log(`ingredient_only_rows: `, ingredient_only_rows);

            const header_only_row = indexed_headers.map((header) => {
                /* Retrun header name */
                return header.name;
            });
            console.log(`header_only_row: `, header_only_row);

            const values_only_rows = ingredient_only_rows.map((row) => {
                /** Return column value(s) */
                return row.map((obj) => obj.value);
            });

            return { header_only_row, values_only_rows };
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

        //TODO: sort each partcode's merged by "order"
        // TODO: New option: Raw is combine all ingredients into one cell with pipe. 2) Row per ingredient type 3) Row per ingredient.
        // TODO: Sub radios? Raw, but merged into ingreds

        const { header_only_row, values_only_rows } = getHeadersAndRows(
            jsonObject,
            parsingOption
        );

        //* returned SheetsJS data */
        const { jsonDataSheet, wbString } = xlsx_create_workbook([
            header_only_row,
            ...values_only_rows,
        ]);
        // console.log(jsonDataSheet);

        /* Store the binary string in localStorage to Download Parsed File later */
        // localStorage.setItem('workbook', wbString);
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

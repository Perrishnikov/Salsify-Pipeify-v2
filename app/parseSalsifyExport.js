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

function hasUnderscoreAndNumber(str) {
    // Use a regular expression to match '_' followed by one or more digits at the end of the string
    const regex = /_\d+$/;

    return regex.test(str);
}

/**
 * Removes elements from the first array that exist in the second array.
 * @param {Array} arr1 - The array to modify.
 * @param {Array} arr2 - The array containing elements to remove.
 */
function removeElementsFromArray(arr1, arr2) {
    arr1.forEach((item, index) => {
        if (arr2.includes(item)) {
            arr1.splice(index, 1);
        }
    });
}

class Header {
    constructor(id, name, type = null) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
}
class Entity extends Header {
    constructor(id, name, type, value) {
        super(id, name, type);
        this.value = value;
    }
}

/**
 * Sorts an array of objects by the `id` property in reverse alphabetical order.
 * @param {Object[]} arrayOfObjects - The array of objects to be sorted.
 * @returns {Object[]} The sorted array of objects.
 */
function sortObjectsByIdReverseAlphabetical(arrayOfObjects) {
    return arrayOfObjects.sort((a, b) => {
        // Compare the `id` properties of the objects in reverse alphabetical order
        if (a.id < b.id) {
            return 1; // `b` should come before `a`
        } else if (a.id > b.id) {
            return -1; // `a` should come before `b`
        } else {
            return 0; // `a` and `b` have equal `id` properties
        }
    });
}
/**
 * Extracts headers from rows of data and matches them with merge ingredients.
 * @param {Object[]} rows_of_each_data - An array of objects, each representing a row of data.
 * @param {Object} merge_ingredients - An object containing merge ingredients information.
 * @param {string} merge_ingredients.id - The ID for merged ingredients.
 * @param {string} merge_ingredients.name - The name for merged ingredients.
 * @param {string[]} merge_ingredients.merge_these - An array of keys to be merged with the rows of data.
 * @returns {{Header[], Entity[]}} An array of arrays, where each inner array contains Entity objects representing the merged rows.
 */
function cleanAndMergeRows(rows_of_each_data, merge_ingredients) {
    const header_names = []; //thrown away
    const headers_row = [];
    const entity_rows = [];

    rows_of_each_data.forEach((row_of_data) => {
        const newRow = [];

        Object.entries(row_of_data).forEach(([key, value]) => {
            // key: 'PARTCODE', value: '10078'

            /* ignore headers that start with "salsify:"*/
            if (!key.startsWith('salsify:')) {
                // console.log(`key: ${key}, value: ${value}`);

                /* remove headers that end with _n */
                const clean_key = removeUnderscoreAndNumber(key);
                // console.log('clean_key: ', clean_key);

                /* does the clean_key match a merged_ingredient? */
                const key_matches = merge_ingredients.merge_these.find(
                    (obj) => {
                        // console.log(obj);
                        return obj === clean_key;
                    }
                );

                if (key_matches) {
                    // console.log(`key_matches: `, key_matches, value);

                    const merged_ingredient = new Entity(
                        merge_ingredients.id, // 'MERGED_INGREDIENTS'
                        merge_ingredients.name, // 'Ingredient Info'
                        key_matches, // 'LABEL_DATASET_INGREDIENTS_A - en-US'
                        value // 'Microcrystalline cellulose, corn starch,...'
                    );
                    newRow.push(merged_ingredient);

                    /** HEADER */
                    const found = header_names.includes(merge_ingredients.id);
                    if (!found) {
                        const merged_header = new Header(
                            merge_ingredients.id, // 'MERGED_INGREDIENTS'
                            merge_ingredients.name, // 'Ingredient Info'
                            merge_ingredients.type
                        );
                        header_names.push(merge_ingredients.id);
                        headers_row.push(merged_header);
                    }
                } else {
                    /* add the non-ingredient headers like PARTCODE */
                    const entity = new Entity(
                        clean_key,
                        clean_key,
                        clean_key,
                        value
                    );

                    newRow.push(entity);

                    /** HEADER */
                    const found = header_names.includes(clean_key);
                    if (!found) {
                        const header = new Header(
                            clean_key,
                            clean_key,
                            clean_key
                        );
                        header_names.push(clean_key);
                        headers_row.push(header);
                    }
                }
            }
        });
        entity_rows.push(newRow);
    });

    // console.log(entity_rows);
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
                const bogus = new Entity(element, element, element, '');
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

/** MAIN */
function salsify_preprocess(original_jsonData) {
    /** Filter out parents - EA only */
    const rows_of_each_data = [...original_jsonData].filter(
        (obj) =>
            obj['salsify:data_inheritance_hierarchy_level_id'] === 'variant'
    );
    // console.log(rows_of_each_data);

    /** Merge all these Salsify:Id's into 1 column */
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

    const { headers_row, entity_rows: cleaned_rows } = cleanAndMergeRows(
        rows_of_each_data,
        merge_ingredients
    );

    const sortedHeaders = sortObjectsByIdReverseAlphabetical(headers_row);
    const sortedEntities = sortObjectsByIdReverseAlphabetical(cleaned_rows);

    // cleaned_rows.forEach((row) => console.log(row));

    const uniqueIds = getUniqueIds(sortedEntities);
    //[ "PARTCODE", "Product ID", "MERGED_INGREDIENTS", "PRODUCT_NAME" ]
    // console.log(uniqueIds);

    const non_merged_uniqueIds = uniqueIds.filter(
        (id) => id !== merge_ingredients.id
    );
    //[ "PARTCODE", "Product ID", "PRODUCT_NAME" ]
    // console.log(non_merged_uniqueIds);

    const ingredient_only_rows = createRowForEachIngredient(
        sortedEntities,
        merge_ingredients,
        non_merged_uniqueIds
    ).flat();

    // console.log(`ingredient_only_rows: `, ingredient_only_rows);

    /**
     *
     * TODO: create table with only selected keys and values
     *
     */
    const header_only_row = sortedHeaders.map((header) => {
        // console.log(name);
        // const header = new Header(name, name, name);
        return header.name;
    });
    // console.log(`header_only_row: `, header_only_row);
    const values_only_rows = ingredient_only_rows.map((row) => {
        /** Return column values */
        return row.map((obj) => obj.value);
    });

    console.log(header_only_row);

    const { jsonData, wbString } = xlsx_create_workbook([
        header_only_row, ...values_only_rows,
    ]);

    console.log(jsonData);
    // Store the binary string in localStorage
    localStorage.setItem('workbook', wbString);

    const htmlTable = create_html_table(jsonData, null);

    // Get container element to append the table
    const tableContainer = document.getElementById('table-container');
    // Clear any old table
    tableContainer.innerHTML = '';
    tableContainer.appendChild(htmlTable);
}

/**
 * Generates checkboxes dynamically based on the clean headers array and appends them to the DOM.
 * @param {string[]} all_the_headers - An array of clean header names.
 * @param {object} headersToMerge - An object containing information about headers to merge.
 * @param {string[]} headersToMerge.headers - An array of headers to merge.
 * @param {string} headersToMerge.mergeAs - A message to append to the label for headers to merge.
 */
function dom_generateCheckboxes(all_the_headers, headersToMerge) {
    const headerCheckboxes = document.getElementById('headerCheckboxes');

    // Store the reference to the first child element
    const subtitleDiv = headerCheckboxes.firstElementChild;
    headerCheckboxes.innerHTML = '';
    // Append back the preserved first child
    headerCheckboxes.appendChild(subtitleDiv);

    // Iterate through the array of strings
    all_the_headers.forEach((header_name) => {
        const container = document.createElement('div');
        container.classList.add('option-div');

        // Create a checkbox element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true; // Checkbox is checked by default
        checkbox.value = header_name;

        // Add event listener to log value when clicked
        checkbox.addEventListener('click', (e) => {
            console.log(e.target.value);
        });

        // Create a label element for the checkbox
        const label = document.createElement('label');
        label.classList.add('radio-checkbox-label');

        const labelName = headersToMerge.headers.includes(header_name)
            ? `${header_name} as (${headersToMerge.mergeAs})`
            : header_name;

        label.appendChild(document.createTextNode(labelName));

        // Append checkbox and label to container
        container.appendChild(checkbox);
        container.appendChild(label);

        headerCheckboxes.appendChild(container);
    });
}

/**
 * @param {array} data
 * @returns {void}
 */
function parseSalsifyExport(data) {
    // returns only the EA's, no parents
    const varientsOnly = data.filter(
        (obj) =>
            obj['salsify:data_inheritance_hierarchy_level_id'] === 'variant'
    );

    let allowedHeaders = [];
    let disallowedHeaders = [];
    let finale = [];
    //
    varientsOnly.forEach((row_of_data) => {
        // console.log(item);
        // let LABEL_DATASET_NUTRIENT_A = [];
        // let LABEL_DATASET_INGREDIENTS_A = [];
        // let LABEL_DATASET_OTHER_INGREDS_A = [];

        const ALL_INGS = [];

        // populate the allowedHeaders
        for (let key in row_of_data) {
            // each object has 'Product ID'
            // key: 'PARTCODE', value: '10078'

            if (row_of_data.hasOwnProperty(key)) {
                const value = row_of_data[key];
                // console.log(key, ' :', value);
                // Push unique column headers into array AND add nut/ing/other to their respective arrays.
                if (key.startsWith('LABEL_DATASET_NUTRIENT_A')) {
                    // LABEL_DATASET_NUTRIENT_A.push(value);
                    ALL_INGS.push(LABEL_formatter(NUT, value));

                    if (!allowedHeaders.includes('LABEL_DATASET_NUTRIENT_A')) {
                        // allowedHeaders.push('LABEL_DATASET_NUTRIENT_A');
                    }
                } else if (key.startsWith('LABEL_DATASET_INGREDIENTS_A')) {
                    // LABEL_DATASET_INGREDIENTS_A.push(value);
                    ALL_INGS.push(LABEL_formatter(ING, value));
                    if (
                        !allowedHeaders.includes('LABEL_DATASET_INGREDIENTS_A')
                    ) {
                        // allowedHeaders.push('LABEL_DATASET_INGREDIENTS_A');
                    }
                } else if (key.startsWith('LABEL_DATASET_OTHER_INGREDS_A')) {
                    // LABEL_DATASET_OTHER_INGREDS_A.push(value);
                    ALL_INGS.push(LABEL_formatter(OTHER, value));

                    if (
                        !allowedHeaders.includes(
                            'LABEL_DATASET_OTHER_INGREDS_A'
                        )
                    ) {
                        // allowedHeaders.push('LABEL_DATASET_OTHER_INGREDS_A');
                    }
                } else if (
                    allowedHeaderKeys.includes(key) &
                    !allowedHeaders.includes(key)
                ) {
                    // push all allowed headers into allowedHeaders

                    allowedHeaders.push(key);
                } else {
                    disallowedHeaders.push(key);
                }
            }

            // console.log(item[obj]);
        }
        // console.log('headers', allowedHeaders);
        // console.log('disallowed', disallowedHeaders);
        // console.log(LABEL_DATASET_INGREDIENTS_A);
        // console.log(LABEL_DATASET_NUTRIENT_A);
        // console.log(LABEL_DATASET_OTHER_INGREDS_A);

        const concatenatedArray = ALL_INGS.map((sheetRow, index) => {
            let shit = allowedHeaders.map((key) => row_of_data[key]);

            shit.push(sheetRow.get('type'), sheetRow.get('data'));
            // console.log(shit);

            return shit;
        });

        finale.push(...concatenatedArray);
        // console.log('numRowsPerVarient', numRowsPerVarient);

        //TODO: Error objects
        // const cleanNuts = LABEL_DATASET_NUTRIENT_A.map((row) => {
        //     let header = row.split('|');

        //     const shortDesc = header[1].trim();
        //     const longDesc = header[2].trim();
        //     let desc = coalesce(longDesc, shortDesc).trim();
        //     let amount = header[3].trim();
        //     let uom = header[4].trim();
        //     let dv = header[5].trim();
        //     const percent = header[6].trim(); // % or ''
        //     const symbol = header[7].trim(); // † or **
        //     // let definition = header[8].trim()

        //     if (standardTestIsTrue(desc)) {
        //         return;
        //     }
        //     //amount
        //     if (amount === '') {
        //         amount = 'ERROR';
        //     } else if (isNaN(parseInt(amount.replace(/,/g, ''), 10))) {
        //         //should be number
        //         amount = 'ERROR';
        //     }
        //     //uom
        //     if (uom === '') {
        //         uom = 'ERROR';
        //     } else if (!isNaN(parseInt(uom.replace(/,/g, ''), 10))) {
        //         //should NOT be number
        //         uom = 'ERROR';
        //     }
        //     //dv
        //     if (isNaN(parseInt(dv.replace(/[,<]/g, ''), 10))) {
        //         //should be number
        //         dv = 'ERROR';
        //     }

        //     return formatter(desc, amount, uom, dv, percent, symbol);
        // });

        // console.log('cleanNuts', cleanNuts);
        // TODO: Get this to export now....
    });

    allowedHeaders.push(...['TYPE', 'DATA']);
    // console.log(allowedHeaders);
    let grass = [allowedHeaders, ...finale];
    // console.log(...grass);

    const checkedRadioButton = getCheckedRadioButtonId();

    const { jsonData, wbString } = xlsx_create_workbook(
        grass,
        checkedRadioButton
    );

    // Store the binary string in localStorage
    localStorage.setItem('workbook', wbString);

    const htmlTable = create_html_table(jsonData, checkedRadioButton);

    // Get container element to append the table
    const tableContainer = document.getElementById('table-container');
    // Clear any old table
    tableContainer.innerHTML = '';
    tableContainer.appendChild(htmlTable);
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

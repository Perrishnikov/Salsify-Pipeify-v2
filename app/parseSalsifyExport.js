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

const allowedHeaderKeys = ['PARTCODE', 'Product ID'];

const ING = 'ING';
const NUT = 'NUT';
const OTHER = 'OTHER';

/**
 * Formats the given type and data into a Map object.
 * @param {string} type - The type to be formatted.
 * @param {*} data - The data to be formatted.
 * @returns {Map} A Map object containing the formatted type and data.
 */
function LABEL_formatter(type, data) {
    let mapp = new Map([
        ['type', type],
        ['data', data],
        ['error', null],
    ]);
    // console.log(mapp);
    return mapp;
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

/**
 * Extracts clean headers from a row of data, excluding Salsify generated headers,
 * and converts headers with underscores and numbers to arrays.
 * @param {Object[]} row - The row of data containing headers.
 * @returns {Object} An object containing clean headers and headers as arrays.
 * @returns {string[]} Object.clean_headers - An array of clean headers.
 * @returns {string[]} Object.headers_as_arrays - An array of headers as arrays.
 */
function extractColumnHeadersFrom(row, rows_to_columns) {
    // other headers
    const clean_headers = [];
    // only clean _1
    const headers_as_arrays = [];

    row.forEach((row_of_data) => {
        outerLoop: for (let key in row_of_data) {
            // key: 'PARTCODE', value: '10078'

            if (row_of_data.hasOwnProperty(key)) {
                // console.log(`key: ${key}, value: ${row_of_data[key]}`);

                // exclude Salsify generated headers
                if (key.startsWith('salsify:')) {
                    continue;
                }

                // const clean_key = removeUnderscoreAndNumber(key);

                innerLoop: for (let i = 0; i < rows_to_columns.length; i++) {
                    // if key starts with
                    if (key.startsWith(rows_to_columns[i])) {
                        if (!headers_as_arrays.includes(rows_to_columns[i])) {
                            headers_as_arrays.push(rows_to_columns[i]);
                        }
                        // Skip potentially adding this to the clean_headers later
                        continue outerLoop;
                    }
                }

                // include only unique keys to clean_headers
                if (!clean_headers.includes(key)) {
                    // and only add it if headers_as_arrays doesn't have it
                    if (!headers_as_arrays.includes(key)) {
                        clean_headers.push(key);
                    }
                }
            }
        }
    });
    // the first LABEL_DATASET_NUTRIENT_A - en-US without underscore and numbers
    // removeElementsFromArray(clean_headers, headers_as_arrays);

    return { clean_headers, headers_as_arrays };
}

/**
 * Merges variant data with dirty headers into a map, updating clean headers accordingly.
 * @param {Object[]} varientsOnly - Array of variant objects.
 * @param {string[]} clean_headers - Array of clean headers.
 * @param {string[]} headersToMerge - Array of dirty headers.
 */
function mapValuesToColumns(varientsOnly, clean_headers, headersToMerge) {
    // varientsOnly.forEach()
    const array_of_maps = [];

    for (let index = 0; index < varientsOnly.length; index++) {
        const row_of_data = varientsOnly[index];
        // console.log('row_of_data: ', row_of_data);
        const keys_values = new Map();

        Object.entries(row_of_data).forEach(([item_key, item_value]) => {
            if (!item_key.startsWith('salsify:')) {
                console.log(`item_key: ${item_key}, item_value: ${item_value}`);

                innerLoop: for (
                    let i = 0;
                    i < headersToMerge.headers.length;
                    i++
                ) {
                    const merged_header = headersToMerge.headers[i];
                    const merged_key = headersToMerge.mergeAs;

                    console.log(
                        `merged_key: ${merged_key}, merged_header: ${merged_header}`
                    );

                    // Check if the string value starts with the current element in the array
                    if (item_key.startsWith(merged_header)) {
                        const ingredientMap = new Map();
                        /**
                         {
                            type: LABEL_DATASET_INGREDIENTS_A,
                            value: "5|Proprietary Blend: Echinacea angustifolia (root) extract and Echinacea purpurea (flower) extract; Propolis|239|mg|||**||"
                         }
                         */

                        //
                        if (!keys_values.has(merged_key)) {
                            // INGREDIENT INFO, 5|Proprietary Blend: Echinacea angustifolia (root) extract and Echinacea purpurea (flower) extract; Propolis|239|mg|||**||
                            ingredientMap.set('type', merged_header);
                            ingredientMap.set('value', item_value);

                            keys_values.set(merged_key, [ingredientMap]);
                            // keys_values.set(merged_key, [item_value]);
                            //
                        } else if (keys_values.has(merged_key)) {
                            const existing_map = keys_values.get(merged_key);

                            ingredientMap.set('type', merged_header);
                            ingredientMap.set('value', item_value);

                            keys_values.set(merged_key, [ingredientMap]);

                            keys_values.set(merged_key, [
                                ...existing_map,
                                ingredientMap,
                            ]);
                            // keys_values.set(merged_key, [
                            //     ...existing_ingred,
                            //     item_value,
                            // ]);
                        }
                        // Skip potentially adding this to the clean_headers later
                        continue innerLoop;
                    } else if (clean_headers.includes(item_key)) {
                        /** Other Column headers like Partcode and Product ID */
                        // PRODUCT_NAME, Sambucus Immune Syrup For Kids 4 oz
                        keys_values.set(item_key, item_value);
                    }
                }
            }

            // else if (item_key.startsWith('LABEL_DATASET_INGREDIENTS_A')) {
            //     if (item.has('LABEL_DATASET_INGREDIENTS_A - en-US')) {
            //         const currently = item.get(
            //             'LABEL_DATASET_INGREDIENTS_A - en-US'
            //         );

            //         item.set('LABEL_DATASET_INGREDIENTS_A - en-US', [
            //             currently,
            //             item_value,
            //         ]);
            //     } else {
            //         item.set('LABEL_DATASET_INGREDIENTS_A - en-US', [
            //             item_value,
            //         ]);
            //     }
            // } else if (item_key.startsWith('LABEL_DATASET_NUTRIENT_A')) {
            //     if (item.has('LABEL_DATASET_NUTRIENT_A - en-US')) {
            //         const currently = item.get(
            //             'LABEL_DATASET_NUTRIENT_A - en-US'
            //         );

            //         item.set('LABEL_DATASET_NUTRIENT_A - en-US', [
            //             currently,
            //             item_value,
            //         ]);
            //     } else {
            //         item.set('LABEL_DATASET_NUTRIENT_A - en-US', [item_value]);
            //     }
            // }
        });

        // console.log('item', keys_values);
        array_of_maps.push(keys_values);
    }
    // console.log(keys_values);
    return array_of_maps;
}

class Header {
    constructor(id, name, types = null) {
        this.id = id;
        this.name = name;
        this.types = types;
    }
}
class Entity extends Header {
    constructor(id, name, types, value) {
        super(id, name, types);
        this.value = value;
    }
}

function perry_extract_headers(rows_of_each_data, merge_ingredients) {
    const headers_row = [];
    const entity_rows = [];

    rows_of_each_data.forEach((row_of_data) => {
        Object.entries(row_of_data).forEach(([key, value]) => {
            // key: 'PARTCODE', value: '10078'

            /* ignore headers that start with "salsify:"*/
            if (!key.startsWith('salsify:')) {
                console.log(`key: ${key}, value: ${value}`);

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
                    console.log(`key_matches: `, key_matches, value);
                    /* is there already a MERGED_INGREDIENT Header? */
                    const header_exists = headers_row.find(
                        //'MERGED_INGREDIENT'
                        (obj) => obj.id === merge_ingredients.id
                    );

                    if (!header_exists) {
                        const merged_ingredient_header = new Header(
                            merge_ingredients.id,
                            merge_ingredients.name,
                            merge_ingredients.merge_these
                        );
                        headers_row.push(merged_ingredient_header);
                    }
                } else {
                    /* add the non-ingredient headers like PARTCODE */
                    const header_exists = headers_row.find(
                        (obj) => obj.id === clean_key
                    );

                    if (!header_exists) {
                        const standard_header = new Header(
                            clean_key,
                            clean_key,
                            [clean_key]
                        );
                        headers_row.push(standard_header);
                    }
                }
            }
        });
    });

    console.log(headers_row);
    return headers_row;
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

/** Creating a new row for every ingredient */
function perry_extract_ingredients(
    rows_of_each_data,
    merge_ingredients,
    headers_row
) {
    const ingredient_rows = [];

    rows_of_each_data.forEach((row) => {
        console.log(`row: `, row);
        const newRow = new Map();

        headers_row.forEach((header) => {
            const header_id = header.id;
            const header_name = header.name;
            const header_types = header.types;

            console.log(
                `id: ${header_id}, name: ${header_name}, types: [${header.types}]`
            );

            header_types.forEach(type => {
                const key = ''
                const value = ''
            })
            // let keyToFind = row[header_id];
            // // Check if the key exists in the array
            // const keyExists = header_types.includes(keyToFind);

            // if (keyExists) {
            //     console.log(`The key "${keyToFind}" exists in the array.`);
            // } else {
            //     console.log(
            //         `The key "${keyToFind}" does not exist in the array.`
            //     );
            // }

            // if(row[header_id]){
            // console.log(`row[header_id]: ${row[header_id]}`);
            // newRow.set(header_id, );
            // }
        });

        //    Object.entries(row_of_data).forEach(([key, value]) => {
        // key: 'PARTCODE', value: '10078'
        /* ignore headers that start with "salsify:"*/
        //    if (!key.startsWith('salsify:')) {
        //        // console.log(`key: ${key}, value: ${row_of_data[key]}`);
        //        /* remove headers that end with _n */
        // const clean_key = removeUnderscoreAndNumber(key);
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
    /** If present, add these values to the clean headers instead of the _1, _2, etc values */
    const LABEL_DATASET_INGREDIENTS_A = 'LABEL_DATASET_INGREDIENTS_A - en-US';
    const LABEL_DATASET_NUTRIENT_A = 'LABEL_DATASET_NUTRIENT_A - en-US';
    const LABEL_DATASET_OTHER_INGREDS_A = 'LABEL_DATASET_OTHER_INGREDS_A';
    const merge_these_columns = [
        LABEL_DATASET_INGREDIENTS_A,
        LABEL_DATASET_NUTRIENT_A,
        LABEL_DATASET_OTHER_INGREDS_A,
    ];
    const merge_ingredients = {
        merge_these: merge_these_columns,
        id: 'MERGED_INGREDIENTS',
        name: 'Ingredient Info',
    };

    const headers_row = perry_extract_headers(
        rows_of_each_data,
        merge_ingredients
    );

    // const ingredients_rows = perry_extract_ingredients(
    //     rows_of_each_data,
    //     merge_ingredients,
    //     headers_row
    // );

    // takes all the "good" column headers and includes the merged ones if present.
    // const { clean_headers, headers_as_arrays } = extractColumnHeadersFrom(
    //     rows_of_each_data,
    //     merge_these_columns
    // );

    // console.log(headers_as_arrays);
    // console.log(clean_headers);

    /**
     *
     * TODO: create table with only selected keys and values
     *
     * TODO:combine nuts, ings, other into DATA column header, and change TYPE to user friendly (for download)
     *
     * arrays as DATA in DOM
     *
     * convert consts to arrays in Map (convert columns to rows)
     */

    // const headersToMerge = {
    //     mergeAs: 'INGREDIENT INFO',
    //     mergeAsId: 'MERGED_INGREDIENTS',
    //     mergeAsName: 'Ingredient Info',
    //     headers: [...merge_these_columns, 'LABEL_DATASET_OTHER_INGREDS_A'],
    // };

    // console.log(headersToMerge);
    // removeElementsFromArray(clean_headers, headersToMerge.headers);

    // dom_generateCheckboxes(
    //     [...clean_headers, ...merge_these_columns],
    //     headersToMerge
    // );

    // const data_map = mapValuesToColumns(
    //     rows_of_each_data,
    //     clean_headers,
    //     headersToMerge
    // );
    // console.log(data_map);
    // let grass = [allowedHeaders, ...finale];
    // // console.log(...grass);

    // const checkedRadioButton = getCheckedRadioButtonId();

    // const { jsonData, wbString } = xlsx_create_workbook(
    //     grass,
    //     checkedRadioButton
    // );
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

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

/**
 * Merges variant data with dirty headers into a map, updating clean headers accordingly.
 * @param {Object[]} varientsOnly - Array of variant objects.
 * @param {string[]} dirty_headers - Array of dirty headers.
 * @param {string[]} clean_headers - Array of clean headers.
 */
function mergeNutIngOther(varientsOnly, dirty_headers, clean_headers) {
    // dirty_headers.forEach((dirty_header_str) => {
    // varientsOnly.forEach()
    for (let index = 0; index < varientsOnly.length; index++) {
        const item = new Map();

        const row_of_data = varientsOnly[index];
        // console.log('row_of_data: ', row_of_data);

        Object.entries(row_of_data).forEach(([item_key, item_value]) => {
            // console.log(`${item_key}: ${item_value}`);

            if (clean_headers.includes(item_key)) {
                item.set(item_key, item_value);
            } else if (item_key.startsWith('LABEL_DATASET_INGREDIENTS_A')) {
                if (item.has('LABEL_DATASET_INGREDIENTS_A - en-US')) {
                    const currently = item.get(
                        'LABEL_DATASET_INGREDIENTS_A - en-US'
                    );

                    item.set('LABEL_DATASET_INGREDIENTS_A - en-US', [
                        currently,
                        item_value,
                    ]);
                } else {
                    item.set('LABEL_DATASET_INGREDIENTS_A - en-US', [
                        item_value,
                    ]);
                }
            } else if (item_key.startsWith('LABEL_DATASET_NUTRIENT_A')) {
                if (item.has('LABEL_DATASET_NUTRIENT_A - en-US')) {
                    const currently = item.get(
                        'LABEL_DATASET_NUTRIENT_A - en-US'
                    );

                    item.set('LABEL_DATASET_NUTRIENT_A - en-US', [
                        currently,
                        item_value,
                    ]);
                } else {
                    item.set('LABEL_DATASET_NUTRIENT_A - en-US', [item_value]);
                }
            }
        });

        console.log('item', item);
    }
}

/**
 * Extracts clean column headers from a row of data, ignoring headers starting with 'salsify:'.
 * @param {Object[]} row - The row of data containing column headers.
 * @returns {{ clean_headers: string[], dirty_headers: string[] }} An object containing arrays of clean and dirty column headers.
 */
function getHeaders(row) {
    const clean_headers = [];
    const dirty_headers = [];
    // const dirty_values = [];

    row.forEach((row_of_data) => {
        for (let key in row_of_data) {
            // key: 'PARTCODE', value: '10078'

            if (row_of_data.hasOwnProperty(key)) {
                // const dirty_value = row_of_data[key];

                const clean_key = removeUnderscoreAndNumber(key);

                // exclude Salsify generated headers
                if (clean_key.startsWith('salsify:')) {
                    continue;
                }

                // dirty_values.push(dirty_value);
                // include only unique keys
                if (!clean_headers.includes(clean_key)) {
                    clean_headers.push(clean_key);
                } else if (!dirty_headers.includes(key)) {
                    dirty_headers.push(key);
                }
            }
        }
    });
    // console.log(clean_headers);
    return { clean_headers, dirty_headers };
}

function salsify_preprocess(jsonData) {
    // returns only the EA's, no parents
    const varientsOnly = jsonData.filter(
        (obj) =>
            obj['salsify:data_inheritance_hierarchy_level_id'] === 'variant'
    );

    // clean_headers has headers without '_1' from LABEL_DATASET_INGREDIENTS_A
    const { clean_headers, dirty_headers } = getHeaders(varientsOnly);
    // console.log(dirty_headers);

    dom_generateCheckboxes(clean_headers);

    /**
     *
     * TODO: create table with only selected keys and values
     *
     * TODO:combine nuts, ings, other into DATA column header, and change TYPE to user friendly (for download)
     */

    mergeNutIngOther(varientsOnly, dirty_headers, clean_headers);
    // let grass = [allowedHeaders, ...finale];
    // // console.log(...grass);

    // const checkedRadioButton = getCheckedRadioButtonId();

    // const { jsonData, wbString } = xlsx_create_workbook(
    //     grass,
    //     checkedRadioButton
    // );
}

/**
 * Generates HTML checkboxes for each string in an array.
 * @param {string[]} stringsArray - The array of strings.
 * @param {HTMLElement} container - The container element to append the checkboxes to.
 * @returns {void}
 */
function dom_generateCheckboxes(stringsArray) {
    const headerCheckboxes = document.getElementById('headerCheckboxes');

    // Store the reference to the first child element
    const subtitleDiv = headerCheckboxes.firstElementChild;
    headerCheckboxes.innerHTML = '';
    // Append back the preserved first child
    headerCheckboxes.appendChild(subtitleDiv);

    // Iterate through the array of strings
    stringsArray.forEach((header_name) => {
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
            // console.dir(e)
        });

        // Create a label element for the checkbox
        const label = document.createElement('label');
        label.classList.add('radio-checkbox-label');
        label.appendChild(document.createTextNode(header_name));

        // Append checkbox and label to container
        container.appendChild(checkbox);
        container.appendChild(label);

        headerCheckboxes.appendChild(container);
        // headerCheckboxes.appendChild(document.createElement('br')); // Add line break for spacing
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

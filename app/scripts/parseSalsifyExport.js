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

/************************************************************************ */

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

const ingredients_to_merge = new Set([
    LABEL_DATASET_NUTRIENT_A.id,
    LABEL_DATASET_INGREDIENTS_A.id,
    LABEL_DATASET_OTHER_INGREDS_A.id,
]);

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
                console.log({rowsOfCells});
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

                const rowsOfIngredients =
                    per_ingred_per_partcode_2(rowsOfCells);

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

                const rowsOfIngredients =
                    per_ingred_per_partcode_2(rowsOfCells);

                const depipedColumns =
                    per_pipe_per_partcode_3(rowsOfIngredients);

                return depipedColumns;
            }
            break;
        case 'option4':
            {
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

                const rowsOfIngredients =
                    per_ingred_per_partcode_2(rowsOfCells);

                const errorCheckedColumns =
                    per_pipe_per_partcode_4(rowsOfIngredients);

                console.log({errorCheckedColumns});
                return errorCheckedColumns;
            }
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
    // const htmlTable = create_html_table_with_entities(entityRows, null);
    const htmlTable = create_html_table_rows_and_errors(entityRows, null);

    // Get container element to append the table
    const tableContainer = document.getElementById('table-container');
    // Clear any old table
    tableContainer.innerHTML = '';
    tableContainer.appendChild(htmlTable);

    // Call the function to set the initial height
    // setTableContainerHeight();
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
// Array.prototype.moveToFrontById = function (id) {

Object.defineProperty(Array.prototype, 'moveToFrontById', {
    value: function (id) {
        // Find the index of the object with the specified `id` property
        const index = this.findIndex((obj) => obj.id === id);

        // If the object is found and its index is not the first index, move the object to the front
        if (index > 0) {
            // Remove the object from the array at the found index
            const [obj] = this.splice(index, 1);
            // Insert the object at the front of the array
            this.unshift(obj);
        }

        // Return the array to allow chaining
        return this;
    },
    enumerable: false, // Set the property as non-enumerable
    writable: true,
    configurable: true,
});
/**
 * Moves an object with the specified `id` to the end of an array of objects.
 *
 * @param {string} id - The `id` of the object to move to the end of the array.
 * @returns {Array<Object>} - The array with the object moved to the end.
 */
Object.defineProperty(Array.prototype, 'moveToEndById', {
    value: function (id) {
        const index = this.findIndex((name) => name === id);

        // If the object is found and the index is not already at the end, proceed
        if (index > -1 && index < this.length - 1) {
            // Remove the object from its current position
            const [obj] = this.splice(index, 1);
            // Add the object to the end of the array
            this.push(obj);
        }

        return this;
    },
    enumerable: false, // Set the property as non-enumerable
    writable: true,
    configurable: true,
});

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

function createPopover(type, content, index) {
    const statusSymbol = `
        <div id="pop-div-${(type, index)}">
            <button class="icon" popovertarget="pop-row-${(type, index)}">
            <span class="material-symbols-outlined" role="button" >${type}</span>
            </button>
            <div id="pop-row-${(type, index)}" popover anchor="pop-div-${
        (type, index)
    }">
                ${content}
            </div>
        </div>`;

    return statusSymbol;
}

function createCellWithPopover(type, content, index, value) {
    // <span class="material-symbols-outlined" role="button">
    //     ${type}
    // </span>;
    const statusSymbol = `
        <div id="pop-div-${index}">
            <button class="icon" popovertarget="pop-row-${index}">
                ${value}
            </button>
            <div id="pop-row-${index}" popover anchor="pop-div-${index}">
                ${content}
            </div>
            
        </div>`;

    return statusSymbol;
}

/**
 * Creates rows for an HTML table and handles row status.
 *
 * @param {Row[]} rows - An array of Row instances to create the table rows from.
 * @returns {HTMLTableElement} - The created HTML table element.
 */
function create_html_table_rows_and_errors(rows) {
    // Create the table element
    const myTable = document.createElement('table');
    myTable.setAttribute('id', 'my-table');

    // Check if any Row has a status
    let rowHasMessages = false;
    for (const row of rows) {
        if (row.status && row.status.hasMessages) {
            rowHasMessages = true;
            break;
        }
    }

    // Add the table header if rows are present and if there is any status
    if (rows.length > 0) {
        const headerRow = document.createElement('tr');
        headerRow.classList.add('sticky-header');

        // Add the status header column if there is a status
        if (rowHasMessages) {
            const statusHeader = document.createElement('th');
            statusHeader.textContent = '';
            headerRow.appendChild(statusHeader);
        }
        // console.log({rows});
        // Add other headers
        rows[0].cells.forEach((cell) => {
            const th = document.createElement('th');
            th.textContent = cell.header.name;
            headerRow.appendChild(th);
        });
        myTable.appendChild(headerRow);
    }

    // Add table rows
    rows.forEach((row, index) => {
        const tableRow = document.createElement('tr');

        // Add a status cell at the beginning of the row if there is a status
        if (rowHasMessages) {
            const statusCell = document.createElement('td');
            let statusSymbol = '';
            let popoverContent = '';

            // Determine the appropriate icon and message for the popover
            if (row.status.errors.length > 0) {
                popoverContent += row.status.errors.join('<br>');
            }
            if (row.status.warnings.length > 0) {
                popoverContent += row.status.warnings.join('<br>');
            }
            if (row.status.info.length > 0) {
                popoverContent += row.status.info.join('<br>');
            }

            //TODO: account for multiple classes in the same row
            if (row.status.errors.length > 0) {
                statusSymbol = createPopover('error', popoverContent, index);
                tableRow.classList.add('error-row');
            } else if (row.status.warnings.length > 0) {
                statusSymbol = createPopover('warning', popoverContent, index);
                tableRow.classList.add('warning-row');
            } else if (row.status.info.length > 0) {
                statusSymbol = createPopover('info', popoverContent, index);
                tableRow.classList.add('info-row');
            }

            statusCell.innerHTML = statusSymbol;

            tableRow.appendChild(statusCell);
        }

        // Add cells to the row
        row.cells.forEach((cell, cellIndex) => {
            const td = document.createElement('td');

            // Create a container for the cell content and chevron icon
            const cellContainer = document.createElement('div');
            cellContainer.classList.add('cell-container');

            // Set the cell text content to the cell value
            const cellValue = document.createElement('span');
            cellValue.textContent = cell.value;
            cellValue.classList.add('cell-value');

            // Set the cell as content editable if it is editable
            if (cell.isEditable) {
                // td.setAttribute('contenteditable', 'true');
                cellValue.setAttribute('contenteditable', 'true');

                // Create a span element for the chevron icon
                const chevron = document.createElement('span');
                chevron.innerHTML = '▶'; // Unicode character for down chevron

                // Apply a CSS class for styling the chevron
                chevron.classList.add('chevron-icon');

                // Append the chevron to the cell container
                cellContainer.appendChild(chevron);
            }

            // Append the cell value to the cell container
            cellContainer.appendChild(cellValue);

            // Append the cell container to the table cell
            td.appendChild(cellContainer);

            // Handle the cell status if it exists
            if (cell.status.hasMessages) {
                console.log({ cell });
                // Apply CSS classes based on cell status
                if (cell.status.errors.length > 0) {
                    td.classList.add('error-cell');
                    const pc = cell.status.errors.join('<br>');
                    const goodies = createCellWithPopover(
                        'error',
                        pc,
                        cellIndex,
                        cell.value
                    );
                    td.innerHTML = goodies;
                }
                if (cell.status.warnings.length > 0) {
                    td.classList.add('warning-cell');
                }
                if (cell.status.info.length > 0) {
                    td.classList.add('info-cell');
                }
            }

            tableRow.appendChild(td);
        });

        // Add the row to the table
        myTable.appendChild(tableRow);
    });

    // makeTableCellsEditable(myTable);

    

    return myTable;
}


//TODO: Add an event listener to adjust the height when the window is resized
// window.addEventListener('resize', setTableContainerHeight);


//TODO: Function to calculate and set the height of the table container
function setTableContainerHeight() {
    // Get the table container element
    const tableContainer = document.querySelector('#table-container');

    // Calculate the height of any fixed elements above the table (e.g., headers, navigation)
    const headerHeight =
        document.querySelector('#radioButtons')?.offsetHeight || 0;
    const navigationHeight = document.querySelector('nav')?.offsetHeight || 0;

    // Calculate the available height for the table container
    const availableHeight = window.innerHeight - headerHeight - navigationHeight;

    // Set the height of the table container
    tableContainer.style.height = `${availableHeight}px`;
}

// function makeTableCellsEditable(table) {
//     console.log(`makeTableCellsEditable`, table);
//     // Add a double-click event listener to each table cell (`td`)
//     table.querySelectorAll('td').forEach((td) => {
//         td.addEventListener('dblclick', handleCellDoubleClick);
//     });
// }

function handleCellDoubleClick(event) {
    const cell = event.target;
    console.log(cell);
    // Get the associated `Cell` instance from the data attribute
    const cellInstance = cell.cellInstance;

    // Check if the cell is editable
    if (!cellInstance || !cellInstance.isEditable) {
        // If the cell is not editable, do nothing
        return;
    }

    // Proceed with editing the cell if `isEditable` is `true`
    const originalContent = cell.textContent;

    // Create an input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalContent;

    // Replace the cell content with the input element
    cell.textContent = '';
    cell.appendChild(input);

    // Focus the input element and select its content
    input.focus();
    input.select();

    // Add an event listener to handle changes to the input
    input.addEventListener('blur', function () {
        // When the input loses focus, save the changes
        const newContent = input.value;

        // Update the cell content to the new value
        cell.textContent = newContent;

        // Update the `Cell` instance value with the new content
        cellInstance.value = newContent;

        // Perform any other necessary actions here, such as saving to a data structure or server
    });

    // Optionally, handle the Enter key to save changes
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            // When Enter is pressed, trigger a blur event to save changes
            input.blur();
        }
    });
}

/**
 * Creates an HTML table from the provided data, with an option to customize using a radio option.
 *
 * @param {Cell[][]} data - The data to create the table from.
 * @returns {HTMLTableElement} - The created HTML table element.
 */
// function create_html_table_with_entities(data) {
//     // Create the table element
//     const myTable = document.createElement('table');
//     myTable.setAttribute('id', 'my-table');

//     // Add the table header
//     const headerRow = document.createElement('tr');
//     Object.values(data[0]).forEach((cell) => {
//         const th = document.createElement('th');
//         th.textContent = cell.header.name;
//         headerRow.appendChild(th);
//     });
//     myTable.appendChild(headerRow);

//     // Add table rows
//     data.forEach((item) => {
//         const row = document.createElement('tr');
//         Object.values(item).forEach((cell) => {
//             const td = document.createElement('td');
//             td.textContent = cell.value;
//             row.appendChild(td);
//         });
//         myTable.appendChild(row);
//     });

//     return myTable;
// }

/* Function to generate HTML table from JSON data */
// function create_html_table(data, radioOption = null) {
//     const myTable = document.createElement('table');
//     myTable.setAttribute('id', 'my-table');

//     // Add table header
//     const headerRow = document.createElement('tr');
//     for (const key in data[0]) {
//         const th = document.createElement('th');
//         th.textContent = key;
//         headerRow.appendChild(th);
//     }
//     myTable.appendChild(headerRow);

//     // Add table rows
//     data.forEach((item) => {
//         const row = document.createElement('tr');
//         for (const key in item) {
//             const cell = document.createElement('td');
//             cell.textContent = item[key];
//             row.appendChild(cell);
//         }
//         myTable.appendChild(row);
//     });

//     return myTable;
// }

function preprocess_export_file(parsingOption) {

    //TODO: Unsubstitute Headers for reimport function
    // Get the table element
    const myTable = document.getElementById('my-table');

    // Initialize an array to hold the data
    const data = [];

    // Get the table headers
    const headers = Array.from(myTable.querySelectorAll('th')).map(
        (th) => th.textContent
    );
    //TODO: Unsubstitute here
    data.push(headers);

    // Get the table rows
    const rows = myTable.querySelectorAll('tr');

    // Iterate over each row
    rows.forEach((row, rowIndex) => {
        // Skip the header row
        if (rowIndex === 0) return;

        // Initialize an array to hold the row data
        const rowData = [];

        // Get the cells in the row
        const cells = row.querySelectorAll('.cell-value');

        // Iterate over each cell
        cells.forEach((cell) => {
            // Add the cell value to the row data
            rowData.push(cell.textContent);
        });

        // Add the row data to the data
        data.push(rowData);


    });


    xlsx_export_current_table(data)
    
    if(parsingOption !== 'option4'){
        showToast(`Data is not validated`, 'warning');
    }

    // // Convert the data to a worksheet
    // const worksheet = XLSX.utils.aoa_to_sheet(data);

    // // Create a new workbook
    // const workbook = XLSX.utils.book_new();

    // // Append the worksheet to the workbook
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // // Write the workbook to a file
    // XLSX.writeFile(workbook, 'output.xlsx');
}

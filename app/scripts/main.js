// import { Tooltip, Popover } from './bootstrap.bundle.min.js';

const popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
);
const popoverList = popoverTriggerList.map(
    (popoverTriggerEl) => new Popover(popoverTriggerEl)
);

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Bootstrap components
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new Tooltip(tooltipTriggerEl);
    });

    const popoverTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="popover"]')
    );
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new Popover(popoverTriggerEl);
    });
});

// Extend the Array prototype with a new function called moveToFrontById
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

/************************************************************************ */

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
function processOptionWithData(mergedJsonData, parsingOption) {
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

                // Row validation
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

                // Row validation
                const depipedColumns =
                    per_pipe_per_partcode_3(rowsOfIngredients);

                const errorCheckedCells =
                    per_pipe_per_partcode_4b(depipedColumns);

                // console.log(errorCheckedCells);
                return errorCheckedCells;
            }
            break;
        default:
            break;
    }
}

/** MAIN ****************************************************************/
function createNewTable(parsingOption, productIdValue) {
    // console.log('Hello World', parsingOption, productIdValue);

    const fauxJsonObject = [
        {
            'Product ID': productIdValue,
            'LABEL_DATASET_INGREDIENTS_A - en-US': '1||||||||',
            'LABEL_DATASET_NUTRIENT_A - en-US': '1|||||||',
            LABEL_DATASET_OTHER_INGREDS_A: 'x',
        },
    ];

    const rows = processOptionWithData(fauxJsonObject, parsingOption);
    // console.log(rows);

    // Create the table element
    const newTable = document.createElement('table');
    newTable.setAttribute('id', 'table-newIng');
    // newTable.classList.add('table')

    const headerRow = document.createElement('tr');

    if (parsingOption === 'option4') {
        //* For Popover Menu
        const menuHeader = document.createElement('th');
        headerRow.appendChild(menuHeader);
    }

    // Add other headers
    rows[0].cells.forEach((cell) => {
        const th = document.createElement('th');
        th.textContent = cell.header.name;
        headerRow.appendChild(th);
    });
    newTable.appendChild(headerRow);

    rows.forEach((row) => {
        let tableRow;
        if (parsingOption === 'option4') {
            tableRow = createTableRow(row, createMenuPopover);
        } else {
            tableRow = createTableRow(row, null);
        }
        newTable.appendChild(tableRow);
    });

    // Get container element to append the table
    const tableContainer = document.getElementById('newIng-table-container');

    // Clear any old table
    tableContainer.innerHTML = '';

    // Give it the new data
    tableContainer.appendChild(newTable);

    attachBlurEventToTableCells(newTable);

    applyHandlePopoverMenuClickToTable('table-newIng');
}

// TODO: move this into a scope. Presently needs to be outside because it's adding listerers from three places (461, )
const buttonsWithListeners = new WeakSet();

/**
 * Attaches the handlePopoverMenuClick function to each button with the class
 * .popover-menu-item within the my-table table.
 *
 * @param {string} tableId - The ID of the table element (e.g., 'my-table').
 */
function applyHandlePopoverMenuClickToTable(tableId = 'my-table') {
    // Create a WeakSet to store buttons that already have the event listener attached
    // console.log(tableId);
    // const buttonsWithListeners = new WeakSet();

    // Get the table element by its ID
    const table = document.getElementById(tableId);

    // If the table is found
    if (table) {
        // Select all buttons with the class .popover-menu-item within the table
        const buttons = table.querySelectorAll('.popover-menu-item');

        // Attach the handlePopoverMenuClick function as a click event listener to each button
        buttons.forEach((button) => {
            // Check if the button already has the event listener
            if (!buttonsWithListeners.has(button)) {
                // button.addEventListener('click', handlePopoverMenuClick);
                button.addEventListener('click', (event) => {
                    handlePopoverMenuClick(event, tableId);
                });
                // Add the button to the WeakSet
                buttonsWithListeners.add(button);
            }
        });
    } else {
        console.error(`Table with ID '${tableId}' not found.`);
    }
}

/**
 * Handles the click event on popover menu items.
 *
 * @param {Event} e - The click event object.
 */
function handlePopoverMenuClick(e, tableId) {
    // Get the button that was clicked
    const button = e.target.closest('.popover-menu-item');
    // console.log(button.id);
    if (button) {
        // Extract button ID and index from the button's ID attribute
        const [buttonId, index] = button.id.split('-');

        // Find the row ID from the closest parent <tr> element with the data-row_id attribute
        const targetRow = e.target.closest('tr[data-row_id]');
        const rowIdFromDom = targetRow ? targetRow.dataset.row_id : null;

        // Get the table element
        const table = document.getElementById(tableId);
        if (!rowIdFromDom || !table) {
            bootToast('Target row or table not found', 'danger');
            console.error('Target row or table not found.');
            return;
        }

        /**@type {Row} */
        let rowIndex;

        // Loop through table rows to find the target row by its data-row_id
        for (let i = 1; i < table.rows.length; i++) {
            const row = table.rows[i];
            const rowId = row.dataset.row_id;

            if (rowId === rowIdFromDom) {
                rowIndex = i;
                const newCells = [];

                // console.log(row);

                // ADD
                if (buttonId === 'addAbove' || buttonId === 'addBelow') {
                    let ingredientType = Array.from(row.cells)
                        .map((cell) => {
                            // console.log(cell.children[0]);
                            if (
                                cell.children[0].cell &&
                                cell.children[0].cell.type ===
                                    INGREDIENT_TYPE.id
                            ) {
                                return cell.children[0].cell.value;
                            }
                        })
                        .filter((item) => item !== undefined)[0];

                    // console.log({ cellType: ingredientType });
                    //dont duplicate Other row
                    if (ingredientType === LABEL_DATASET_OTHER_INGREDS_A.name) {
                        bootToast(
                            `Other Rows may not be added or deleted.`,
                            'info'
                        );
                        const popover = e.target.closest('[popover]');
                        if (popover) {
                            popover.togglePopover();
                        }
                        return;
                    }

                    // Copy cells from the target row to create a new row
                    for (let j = 0; j < row.cells.length; j++) {
                        const cellContainer = row.cells[j].firstChild;
                        const cell = cellContainer ? cellContainer.cell : null;

                        if (cell && cell instanceof Cell) {
                            // const newCell = cloneEmptyCell(cell);
                            let newCell;
                            // If the cell is editable, reset its value
                            if (cell.isEditable === true) {
                                newCell = cloneEmptyCell(cell);
                                newCell.value = '';
                                // console.log(cell);
                                if (cell.type === ORDER.id) {
                                    newCell.status =
                                        createCell.validateOrder('');
                                } else if (cell.type === DESCRIPTION.id) {
                                    newCell.status =
                                        createCell.validateDescription('');
                                } else if (cell.type === QUANTITY.id) {
                                    newCell.status =
                                        createCell.validateQuantity('');
                                } else if (cell.type === UOM.id) {
                                    newCell.status = createCell.validateUom('');
                                } else if (cell.type === DV.id) {
                                    //Need to pass ingredient type to constructor
                                    newCell.status =
                                        createCell.validateDvAmount(
                                            '',
                                            ingredientType
                                        );
                                }
                                //defaults to false
                                // newCell.isEditable = true;
                            } else {
                                newCell = cloneCell(cell);
                            }

                            newCells.push(newCell);
                        }
                    }

                    const newRow = new Row(newCells, generateRandomString(9));
                    const tableRow = createTableRow(newRow, createMenuPopover);

                    // Insert the new row above or below the target row
                    if (buttonId === 'addAbove') {
                        targetRow.parentNode.insertBefore(tableRow, targetRow);
                    } else if (buttonId === 'addBelow') {
                        if (targetRow.nextSibling) {
                            targetRow.parentNode.insertBefore(
                                tableRow,
                                targetRow.nextSibling
                            );
                        } else {
                            targetRow.parentNode.appendChild(tableRow);
                        }
                    }

                    applyHandlePopoverMenuClickToTable(tableId);

                    // Toggle the popover if it exists
                    const popover = e.target.closest('[popover]');
                    if (popover) {
                        popover.togglePopover();
                    }
                    break;

                    //ADD
                } else if (buttonId === 'delete') {
                    // Confirm dialog
                    const modal = new bootstrap.Modal(
                        document.getElementById('confirmationModal')
                    );
                    modal.show();

                    // get delete button
                    document
                        .getElementById('confirmDelete')
                        .addEventListener('click', () => {
                            const modal = bootstrap.Modal.getInstance(
                                document.getElementById('confirmationModal')
                            );

                            deleteRow(e, tableId);

                            modal.hide();
                        });
                }
            }
        }
        updateDividerCss(table);
    }
}

/**
 * Adds or removes the 'divider' class from table rows based on product ID differences.
 *
 * @param {HTMLTableElement} table - The table to update.
 */
function updateDividerCss(table) {
    Array.from(table.rows).forEach((row, index) => {
        const thisProductId = row.dataset.productId;
        const thatProductId = Array.from(table.rows)[index - 1];
        // console.log(thatProductId?.dataset.productId);
        // console.log(thisProductId, index);

        // console.log(thisProductId !== thatProductId?.dataset.productId);
        if (thisProductId !== thatProductId?.dataset.productId) {
            row.classList.add('divider');
        } else {
            row.classList.remove('divider');
        }
    });
}

/**
 * Remove from scope
 * @param {Event} e
 * @param {string} tableId
 */

function deleteRow(e, tableId) {
    const targetRow = e.target.closest('tr[data-row_id]');
    const rowIdFromDom = targetRow ? targetRow.dataset.row_id : null;

    const table = document.getElementById(tableId);

    let rowIndex;
    // Loop through table rows to find the target row by its data-row_id and delete it
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const rowId = row.dataset.row_id;

        if (rowId === rowIdFromDom) {
            rowIndex = i;
            break;
            // const newCells = [];
        }
    }
    if (rowIndex !== undefined) {
        table.deleteRow(rowIndex);
    }
}
/**
 * Creates a menu popover element for a table row with given ID.
 *
 * @param {string} rowId - The ID of the row for which the popover menu is created.
 * @returns {HTMLTableCellElement} The table cell containing the popover menu.
 */
function createMenuPopover(rowId) {
    const td = document.createElement('td');
    td.innerHTML = `
    
    <div class="cell-container" id="pop-menu-div-${rowId}">
        <button class="icon" popovertarget="pop-menu-open-${rowId}">
            <span class="material-symbols-outlined">menu_open</span>
        </button>

        <div class="popover-menu bs-secondary" id="pop-menu-open-${rowId}" popover anchor="pop-menu-div-${rowId}">
            
            <button class="btn btn-light popover-menu-item" id="addAbove-${rowId}" type="button">
                <span class="material-symbols-outlined">add</span> Add Row Above
            </button>
            <button class="btn btn-light popover-menu-item" id="addBelow-${rowId}" type="button">
                <span class="material-symbols-outlined">add</span> Add Row Below
            </button>
            <button class="btn btn-light popover-menu-item" id="delete-${rowId}" type="button">
                <span class="material-symbols-outlined">delete</span> Delete Row
            </button>
        </div>
    </div>
    
    `;

    return td;
}

/* *********************************************************************/
/**
<table>
    <tr>
        <th></th>
    </tr>
    <tr data-row_id="alkwjra">
        //Menu
        <td>
            <div id="pop-menu-div-#" class="cell-container">
                <button class="icon" popovertarget="menu-open">
                    <span>menu_open</span>
                </button>
                <div id="pop-menu-open-#">
                    <button><span>addAbove</span></button>
                    <button><span>addBelow</span></button>
                    <button><span>delete</span></button>
                </div>
            </div>
        </td>

        //Salsify Props
        <td>
            <div class="cell-container">
                <span class="cell-value">
                    00033674069738
                </span>
            </div>
        </td>

        //Editable
        <td>
            <div class="cell-container">
                <span class="chevron-icon">▶</span>
                <span class="cell-value" contenteditable="true">
                    1
                </span>
            </div>
        </td>

    </tr>
</table>
 */

/**
 * Creates a table row element from the provided row data.
 *
 * @param {Object} rowData - The data for the new row.
 * @param {Array<Cell>} rowData.cells - Array of cell data objects.
 * @param {string} rowData.id - The ID for the row.
 * @param {Function} [headerCallback=null] - Optional callback function to create the header cell.
 * @param {number} index - The index of the row.
 * @returns {HTMLTableRowElement} The created table row element.
 */
function createTableRow(rowData, headerCallback = null, index) {
    const tableRow = document.createElement('tr');
    tableRow.dataset.row_id = rowData.id;

    // Add header cell if headerCallback is provided
    if (headerCallback) {
        tableRow.appendChild(headerCallback(rowData.id));
    }

    // Add data cells
    rowData.cells.forEach((cell, cellIndex) => {
        const td = document.createElement('td');
        const cellContainer = document.createElement('div');
        cellContainer.classList.add('cell-container');
        cellContainer.cell = cell;
        td.appendChild(cellContainer);

        // Apply errors to the cell container
        addErrorsToDom(cell.status, cellContainer.classList);

        // Add classes to rows for type id
        if (cell.type === INGREDIENT_TYPE.id) {
            tableRow.dataset.type = cell.value;
        }

        //add the product id for a css divider
        if (cell.type === 'Product ID') {
            tableRow.dataset.productId = cell.value;
        }

        if (cell.isEditable) {
            // Set the cell content based on its editable status
            cellContainer.innerHTML = `
                <span class="chevron-icon">▶</span>
                <span class="cell-value" contenteditable="true">
                    ${cell.value}
                </span>
            `;
        } else {
            cellContainer.innerHTML = `
                <span class="cell-value">
                    ${cell.value}
                </span>
            `;
        }

        tableRow.appendChild(td);
    });

    return tableRow;
}

/**
 * Updates the 'Product ID' in each object of the array to the specified value.
 *
 * @param {Array} arr - The array of objects to update.
 * @param {string} newProductId - The new value to set for the 'Product ID'.
 * @returns {Array} - A new array of objects with updated 'Product ID'.
 */
function updateProductIds(arr, newProductId) {
    return arr.map((obj) => ({
        ...obj,
        'Product ID': newProductId,
    }));
}

/**
 * Filters each object in an array to include only the specified keys.
 *
 * @param {Array} arr - The array of objects to filter.
 * @param {Array} keysToKeep - The array of keys to keep in each object.
 * @returns {Array} - The array of filtered objects.
 */
const filterObjectsArrayByKeys = (arr, keysToKeep) =>
    arr.map((obj) =>
        Object.keys(obj)
            .filter((key) => keysToKeep.includes(key))
            .reduce((filteredObj, key) => {
                filteredObj[key] = obj[key];
                return filteredObj;
            }, {})
    );

/**
 * Gets unique values for a key from an array of objects.
 *
 * @param {Array} arr - The array of objects.
 * @param {string} key - The key to extract values from.
 * @returns {Array} - Unique values for the key.
 */
function getUniqueProductIds(arr, key) {
    const ids = arr.map((obj) => obj[key]);
    return [...new Set(ids)];
}

/**
 * Replaces the 'Product ID' in local storage data and updates the storage.
 *
 * @param {string} productId - The new 'Product ID' value to set.
 * @param {string} tableId - The key for accessing the data in local storage.
 *
 * @returns {void}
 */
function replaceProductId(productId, tableId) {
    // console.log('replaceProductId: ', productId, tableId);

    const data = getLocalStorage(tableId);
    if (data) {
        // console.log(data);
        const updatedArray = updateProductIds(data, productId);
        setLocalStorage(updatedArray, tableId);
        main_process('option4', tableId);
    } else {
        bootToast(`No data found for "${tableId}"`, 'danger');
    }
}

/* ************************************************************** */
/**
 *
 * @param {*} parsingOption - option4
 * @param {string} tableId - validate | duplicate
 * @returns
 */
function main_process(parsingOption, tableId) {
    console.log({ tableId }, 'do it here DUPLICATE');

    // set in salsify_preprocess
    let jsonObject = getLocalStorage(tableId);
    if (!jsonObject) {
        return;
    }

    // main_process is only called on validate and duplicate
    if (tableId === 'validate') {
        const dwnbtn = document.getElementById('download-validate-salsify-btn');
        const custbtn = document.getElementById(
            'download-validate-customer-btn'
        );
        if (getLocalStorage(tableId)) {
            custbtn.disabled = false;

            if (parsingOption === 'option4') {
                dwnbtn.disabled = false;
            } else {
                dwnbtn.disabled = true;
            }
        } else {
            custbtn.disabled = true;
            dwnbtn.disabled = true;
        }
    } else if (tableId === 'duplicate') {
        const uniqueProductIds = getUniqueProductIds(jsonObject, 'Product ID');

        // Verify that only 1 product ID exists in the data. Fail if not....
        if (uniqueProductIds.length > 1) {
            bootToast(
                `Can only replace Product ID of one item. ${uniqueProductIds.length} found`,
                'danger',
                'Failed'
            );
            console.error(uniqueProductIds); // Output: ['123', '456', '789']
            return;
        }

        // undisable Replace Product ID button
        const duplicateBtn = document.getElementById('duplicate-submit-btn');
        duplicateBtn.disabled = false;

        const keepers = [
            LABEL_DATASET_NUTRIENT_A.id,
            LABEL_DATASET_INGREDIENTS_A.id,
            LABEL_DATASET_OTHER_INGREDS_A.id,
            'Product ID',
        ];

        // Filter each object in the array
        const cleanColumnsArray = filterObjectsArrayByKeys(jsonObject, keepers);

        // set and get the keeper columns
        setLocalStorage(cleanColumnsArray, tableId);

        jsonObject = getLocalStorage(tableId);
    }

    // console.log(jsonObject);
    const rows = processOptionWithData(jsonObject, parsingOption);

    // Create the table element
    const myTable = document.createElement('table');
    myTable.setAttribute('id', `table-${tableId}`);

    // TODO: row validations?
    // Check if any Row has a status
    // let rowHasMessages = false;
    // for (const row of rows) {
    //     if (row.status && row.status.hasMessages) {
    //         rowHasMessages = true;
    //         break;
    //     }
    // }

    // Add the table header if rows are present and if there is any status
    const headerRow = document.createElement('tr');

    //* For Popover Menu
    if (parsingOption === 'option4') {
        const menuHeader = document.createElement('th');
        headerRow.appendChild(menuHeader);
    }

    // Add other headers
    rows[0].cells.forEach((cell) => {
        const th = document.createElement('th');
        th.textContent = cell.header.name;
        headerRow.appendChild(th);
    });
    myTable.appendChild(headerRow);

    rows.forEach((row) => {
        let tableRow;
        if (parsingOption === 'option4') {
            tableRow = createTableRow(row, createMenuPopover);
        } else {
            tableRow = createTableRow(row, null);
        }
        myTable.appendChild(tableRow);
    });

    updateDividerCss(myTable);

    // Get container element to append the table
    const tableContainer = document.getElementById(
        `${tableId}-table-container`
    );

    if (tableContainer) {
        // Clear any old table
        tableContainer.innerHTML = '';
        // Give it the new data
        tableContainer.appendChild(myTable);

        attachBlurEventToTableCells(myTable);

        applyHandlePopoverMenuClickToTable(`table-${tableId}`);
    }
}

/** BLUR Validations *********************************************************/
/**
 * Adds or removes error and warning classes to a cell's parent class list based on the status object.
 *
 * @param {Status} status - The status object containing error and warning information.
 * @param {DOMTokenList} parentClasslist - The class list of the cell's parent element.
 */
function addErrorsToDom(status, parentClasslist) {
    // console.log({ status });
    // console.dir(parentClasslist);

    if (status.hasMessages) {
        if (status.errors.length > 0) {
            parentClasslist.add('error-cell');
        }
        if (status.warnings.length > 0) {
            parentClasslist.add('warning-cell');
            //? update cell.value to valid innerText?
        }
    } else {
        parentClasslist.remove('error-cell', 'warning-cell');
    }
}

/**
 * Get the ingredient value from the DOM
 * Depending on the ingredient type, the validation changes
 * @param {EventTarget} target
 * @returns {string} - Other, Ingredients, Nutrients
 */
function getIngredientTypeFromDom(target) {
    const parentRow = target.parentNode.parentNode.parentNode;

    const ingredientCell = Array.from(parentRow.cells)
        .map((cell) => {
            if (
                cell.firstChild.cell &&
                cell.firstChild.cell.type === INGREDIENT_TYPE.id
            ) {
                return cell;
            }
        })
        .filter((cell) => cell !== undefined);

    // console.log(ingredientCell);
    const ingredValue = ingredientCell[0].firstChild.cell.value;
    return ingredValue;
}

/**
 * Attaches a blur event listener to HTML table cells in a dynamically created table.
 *
 * @param {HTMLTableElement} table - The HTML table element to monitor for blur events on its cells.
 */
function attachBlurEventToTableCells(table) {
    // Define a named event handler function
    function handleBlurEvent(e) {
        /** @type {Cell} */
        const cell = e.target.parentElement.cell || null;

        if (cell) {
            const cellType = cell.type;

            // Clean empty cells

            let innerText = e.target.innerText.trim();
            // Remove <br> elements
            innerText = innerText.replace(/<br\s*\/?>/gi, '');

            // Remove carriage returns and newlines
            innerText = innerText.replace(/[\r\n]+/g, '');

            //Set the cell value so it exports
            cell.value = innerText;

            const ingredValue = getIngredientTypeFromDom(e.target);
            /**@type {Status} */
            let status = null;

            if (cellType === ORDER.id) {
                status = createCell.validateOrder(innerText);
            } else if (cellType === DESCRIPTION.id) {
                status = createCell.validateDescription(innerText);
            } else if (cellType === QUANTITY.id) {
                status = createCell.validateQuantity(innerText);
            } else if (cellType === UOM.id) {
                status = createCell.validateUom(innerText);
            } else if (cellType === DV.id) {
                status = createCell.validateDvAmount(innerText, ingredValue);
            } else if (cellType === SYMBOL.id) {
                status = createCell.validateSymbol(innerText, ingredValue);
            } else if (cellType === FOOT.id) {
                status = createCell.validateFootnote(innerText, ingredValue);
            }
            // console.log(status);

            //must set the new status on the parent
            cell.status = status;

            const parentClasslist = e.target.parentElement.classList;
            addErrorsToDom(status, parentClasslist);
        }
    }

    table.removeEventListener('blur', handleBlurEvent, true);

    // Add the named event handler function to the `table` element
    table.addEventListener('blur', handleBlurEvent, true);

    table.addEventListener('keydown', (event) => {
        // Check if the event target is an editable cell
        if (event.target.cell && event.key === 'Enter') {
            // Prevent the default action of inserting a new line
            event.preventDefault();
        }
    });

    function handleMouseOver(e) {
        const parentClasslist = Array.from(e.target.parentElement.classList);
        const classesToCheck = ['error-cell', 'warning-cell'];
        const hasAnyClass = classesToCheck.some((className) =>
            parentClasslist.includes(className)
        );

        const parentCell = e.target.parentElement; // Accessing the parent element correctly
        const hasMessages = parentCell?.cell?.status?.hasMessages; // Use optional chaining

        if (hasAnyClass && hasMessages) {
            const messages = [
                ...parentCell.cell.status.errors,
                ...parentCell.cell.status.warnings,
            ];

            const popover = document.createElement('div');
            popover.id = 'popover-message';
            popover.classList.add('not-popover');

            if (parentCell.cell.status.warnings.length > 0) {
                popover.classList.add('warning-border');
            }
            if (parentCell.cell.status.errors.length > 0) {
                popover.classList.add('danger-border');
            }

            popover.textContent = messages;
            popover.style.left = `${e.pageX - 48}px`;
            popover.style.top = `${e.pageY + 6}px`;

            document.body.appendChild(popover);
            // console.log(messages);
        }
    }

    function handleMouseOut(e) {
        const popover = document.querySelector('#popover-message');
        if (popover) {
            popover.remove();
        }
    }
    table.removeEventListener('mouseover', handleMouseOver, true);
    table.removeEventListener('mouseout', handleMouseOut, true);
    table.addEventListener('mouseover', handleMouseOver, true);
    table.addEventListener('mouseout', handleMouseOut, true);
}

/********************************************************************* */
function process_wysiwyg_export() {
    const myTable = document.getElementById('table-validate');

    if (!myTable) {
        bootToast(`No Data to Export`, 'danger');
    }
    // Initialize an array to hold the data
    const tableData = [];

    // Get the table rows
    const rows = myTable.querySelectorAll('tr');

    // Iterate over each row
    rows.forEach((row, rowIndex) => {
        // Skip the header row
        if (rowIndex === 0) return;

        // console.log(row);
        let exportObj = {};

        Array.from(row.cells).forEach((cell) => {
            const cellContainer = cell.firstChild;
            /** @type {Cell} */
            const cellData = cellContainer ? cellContainer.cell : undefined;
            if (cellData !== undefined) {
                const name = cellData.header.name;

                //disregard Product Id.
                if (name === 'Product ID') {
                    return;
                }
                // console.log(name, cellData);
                exportObj[name] = cellData.value;
            } else {
                // console.log('cellData is undefined');
            }
        });
        tableData.push(exportObj);
    });

    xlsx_exportWYSIWYG(tableData);
}

/**
 * Process reimport of Salsify data.
 *
 * @param {string} parsingOption - The parsing option for reimport.
 */
function process_for_salsify(parsingOption, tableDataFromDom) {
    // const myTable = document.getElementById('my-table');

    if (!tableDataFromDom) {
        bootToast(`No Data to Export`, 'danger');
    }
    // Initialize an array to hold the data
    const tableData = [];

    // Get the table rows
    const rows = tableDataFromDom.querySelectorAll('tr');

    // get unique Product ID's, one per row
    const uniqueProductIds = new Set();
    // Product ID
    rows.forEach((row, rowIndex) => {
        // Skip the header row
        if (rowIndex === 0) return;

        Array.from(row.cells).forEach((cell) => {
            const cellContainer = cell.firstChild;
            /** @type {Cell} */
            const cellData = cellContainer ? cellContainer.cell : undefined;

            if (cellData?.header.id === 'Product ID') {
                // console.log(cellData);
                uniqueProductIds.add(cellData.value);
            }
        });
    });

    // console.log(uniqueProductIds);
    // Loop through product IDs
    uniqueProductIds.forEach((productId) => {
        // Loop through the rows
        let rowObj = {};
        rowObj['Product ID'] = productId;
        //nuts ~
        let idNuts = [];
        //ingreds ~
        let idIngreds = [];
        //other

        rows.forEach((row, rowIndex) => {
            // Skip the header row
            if (rowIndex === 0) return;

            let goTime = false;

            // Loop through the cells in the current row
            for (const cell of Array.from(row.cells)) {
                const cellContainer = cell.firstChild;
                /** @type {Cell} */
                const cellData = cellContainer ? cellContainer.cell : undefined;

                // Check if the cell contains the product ID we are looking for
                if (
                    cellData?.header.id === 'Product ID' &&
                    cellData?.value === productId
                ) {
                    // Set the flag to true and break the loop to start processing
                    goTime = true;
                    break;
                }
            }

            let ingredientType = null;
            // let pipeArray = [];
            let nutrient = new Array(8).fill('');
            let ingredient = new Array(9).fill('');
            // If goTime is true, process the remaining cells in the current row
            if (goTime) {
                //see what the ingredient type is
                for (const cell of Array.from(row.cells)) {
                    const cellContainer = cell.firstChild;
                    /** @type {Cell} */
                    const cellData = cellContainer
                        ? cellContainer.cell
                        : undefined;

                    if (cellData?.header.id === INGREDIENT_TYPE.id) {
                        ingredientType = cellData.value;
                    }
                }

                for (const cell of Array.from(row.cells)) {
                    const cellContainer = cell.firstChild;
                    /** @type {Cell} */
                    const cellData = cellContainer
                        ? cellContainer.cell
                        : undefined;

                    if (ingredientType === LABEL_DATASET_NUTRIENT_A.name) {
                        // console.log(cellData);
                        switch (cellData?.type) {
                            case ORDER.id:
                                nutrient.splice(0, 1, cellData.value); // Insert at index 0
                                break;
                            case DESCRIPTION.id:
                                nutrient.splice(1, 1, cellData.value); // Insert at index 1
                                break;
                            case QUANTITY.id:
                                nutrient.splice(3, 1, cellData.value); // Insert at index 3
                                break;
                            case UOM.id:
                                nutrient.splice(4, 1, cellData.value); // Insert at index 4
                                break;
                            case DV.id:
                                nutrient.splice(5, 1, cellData.value); // Insert at index 5
                                break;
                            case SYMBOL.id:
                                nutrient.splice(6, 1, cellData.value); // Insert at index 6
                                break;
                            case FOOT.id:
                                nutrient.splice(7, 1, cellData.value); // Insert at index 7
                                break;
                        }
                    } else if (
                        ingredientType === LABEL_DATASET_INGREDIENTS_A.name
                    ) {
                        // INGREDIENTS
                        switch (cellData?.type) {
                            case ORDER.id:
                                ingredient.splice(0, 1, cellData.value); // Insert at index 0
                                break;
                            case DESCRIPTION.id:
                                ingredient.splice(1, 1, cellData.value); // Insert at index 1
                                break;
                            case QUANTITY.id:
                                ingredient.splice(2, 1, cellData.value); // Insert at index 3
                                break;
                            case UOM.id:
                                ingredient.splice(3, 1, cellData.value); // Insert at index 4
                                break;
                            case DV.id:
                                ingredient.splice(5, 1, cellData.value); // Insert at index 5
                                break;
                            case SYMBOL.id:
                                ingredient.splice(6, 1, cellData.value); // Insert at index 6
                                break;
                            case FOOT.id:
                                ingredient.splice(7, 1, cellData.value); // Insert at index 7
                                break;
                        }
                    } else if (
                        ingredientType === LABEL_DATASET_OTHER_INGREDS_A.name
                    ) {
                        if (cellData?.type === DESCRIPTION.id) {
                            rowObj[LABEL_DATASET_OTHER_INGREDS_A.id] =
                                cellData.value;
                        }
                    }
                }
                const nutrientValues = nutrient.some((value) => value !== '');
                if (nutrientValues) {
                    idNuts.push(nutrient);
                }
                const ingredientValues = ingredient.some(
                    (value) => value !== ''
                );
                if (ingredientValues) {
                    idIngreds.push(ingredient);
                }
            }
        });

        if (idNuts.length > 0) {
            const result = idNuts
                .map((innerArray) => innerArray.join('|'))
                .join('~');

            rowObj[LABEL_DATASET_NUTRIENT_A.id] = result;
        }

        if (idIngreds.length > 0) {
            const result = idIngreds
                .map((innerArray) => innerArray.join('|'))
                .join('~');

            rowObj[LABEL_DATASET_INGREDIENTS_A.id] = result;
        }

        // console.log(rowObj);
        tableData.push(rowObj);
    });

    // console.log(tableData);
    xlsx_exportForSalsify(tableData);
    // console.log({ arrayOfProductIds });
}

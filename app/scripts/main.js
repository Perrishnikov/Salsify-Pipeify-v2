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

                return errorCheckedCells;
            }
            break;
        default:
            break;
    }
}

/** MAIN ****************************************************************/

/**
 * Attaches the handlePopoverMenuClick function to each button with the class
 * .popover-menu-item within the my-table table.
 *
 * @param {string} tableId - The ID of the table element (e.g., 'my-table').
 */
function applyHandlePopoverMenuClickToTable(tableId = 'my-table') {
    // Create a WeakSet to store buttons that already have the event listener attached
    const buttonsWithListeners = new WeakSet();

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
                button.addEventListener('click', handlePopoverMenuClick);
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
function handlePopoverMenuClick(e) {
    // Get the button that was clicked
    const button = e.target.closest('.popover-menu-item');

    if (button) {
        // Extract button ID and index from the button's ID attribute
        const [buttonId, index] = button.id.split('-');

        // Find the row ID from the closest parent <tr> element with the data-row_id attribute
        const targetRow = e.target.closest('tr[data-row_id]');
        const rowIdFromDom = targetRow ? targetRow.dataset.row_id : null;

        // Get the table element
        const table = document.getElementById('my-table');
        if (!rowIdFromDom || !table) {
            //TODO: Toast this
            console.error('Target row or table not found.');
            return;
        }

        /**@type {Row} */
        let rowIndex;

        if (buttonId === 'addAbove' || buttonId === 'addBelow') {
            // Loop through table rows to find the target row by its data-row_id
            for (let i = 1; i < table.rows.length; i++) {
                const row = table.rows[i];
                const rowId = row.dataset.row_id;

                if (rowId === rowIdFromDom) {
                    rowIndex = i;
                    const newCells = [];

                    // console.log(row);
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

                    // Copy cells from the target row to create a new row
                    for (let j = 0; j < row.cells.length; j++) {
                        const cellContainer = row.cells[j].firstChild;
                        const cell = cellContainer ? cellContainer.cell : null;

                        // ! Validate here
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
                                    //TODO: New Ingredient DV is not validating.
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

                    // Reapply event listeners to the table
                    applyHandlePopoverMenuClickToTable();

                    // Toggle the popover if it exists
                    const popover = e.target.closest('[popover]');
                    if (popover) {
                        popover.togglePopover();
                    }
                    break;
                }
            }
        } else if (buttonId === 'delete') {
            // Loop through table rows to find the target row by its data-row_id and delete it
            for (let i = 1; i < table.rows.length; i++) {
                const row = table.rows[i];
                const rowId = row.dataset.row_id;

                if (rowId === rowIdFromDom) {
                    rowIndex = i;
                    break;
                }
            }

            if (rowIndex !== undefined) {
                table.deleteRow(rowIndex);
            }
        }
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
    // td.setAttribute('data-custom', 'do-not-copy');
    td.innerHTML = `
    
    <div class="cell-container" id="pop-menu-div-${rowId}">
        <button class="icon" popovertarget="pop-menu-open-${rowId}">
            <span class="material-symbols-outlined">menu_open</span>
        </button>

        <div class="popover-menu" id="pop-menu-open-${rowId}" popover anchor="pop-menu-div-${rowId}">
            
            <button class="popover-menu-item" id="addAbove-${rowId}" type="button">
                <span class="material-symbols-outlined">add</span> Add Row Above
            </button>
            <button class="popover-menu-item" id="addBelow-${rowId}" type="button">
                <span class="material-symbols-outlined">add</span> Add Row Below
            </button>
            <button class="popover-menu-item" id="delete-${rowId}" type="button">
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

        // Set the cell content based on its editable status
        if (cell.isEditable) {
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

/* ************************************************************** */
function main_process(parsingOption) {
    // set in salsify_preprocess
    const jsonObject = getLocalStorage();

    const rows = processOptionWithData(jsonObject, parsingOption);

    // Create the table element
    const myTable = document.createElement('table');
    myTable.setAttribute('id', 'my-table');

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
    //TODO: cleanup hardcoded option4
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

    //TODO: cleanup hardcoded option4
    rows.forEach((row) => {
        // console.log(row);
        let tableRow;
        if (parsingOption === 'option4') {
            tableRow = createTableRow(row, createMenuPopover);
        } else {
            tableRow = createTableRow(row, null);
        }
        myTable.appendChild(tableRow);
    });

    // Get container element to append the table
    const tableContainer = document.getElementById('table-container');

    // Clear any old table
    tableContainer.innerHTML = '';
    // Give it the new data
    tableContainer.appendChild(myTable);

    attachBlurEventToTableCells(myTable);

    applyHandlePopoverMenuClickToTable();
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
            e.target.innerText = e.target.innerText.trim();
            const innerText = e.target.innerText;
            //Set the cell value so it exports
            cell.value = innerText;

            const ingredValue = getIngredientTypeFromDom(e.target);
            /**@type {Status} */
            let status = null;

            //TODO: Verify that these are validating as expected
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

    //charactter limits?
    // table.addEventListener('input', (event) => {
    //     // Check if the event target is an editable cell (td element)
    //     if (event.target.cell.type === 'ORDER') {
    //         const cellContent = event.target.textContent;
    //         console.log({ cellContent });
    //         const charLimit = 3;
    //         // If the content length exceeds the character limit
    //         if (cellContent.length > charLimit) {
    //             // Truncate the cell content to the character limit
    //             event.target.textContent = cellContent.slice(0, charLimit);

    //             // Optionally, place the cursor at the end of the truncated text
    //             const range = document.createRange();
    //             range.setStart(event.target.childNodes[0], charLimit);
    //             range.collapse(true);
    //             const selection = window.getSelection();
    //             selection.removeAllRanges();
    //             selection.addRange(range);
    //         }
    //     }
    // });
}

/********************************************************************* */
function process_wysiwyg_export(parsingOption) {
    // Get the table element
    // TODO: change hard-code
    const myTable = document.getElementById('my-table');

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
            // console.log(cellData);
            if (cellData !== undefined) {
                const name = cellData.header.name;

                exportObj[name] = cellData.value;
            } else {
                //     //TODO: Toast this?
            }
        });
        tableData.push(exportObj);
    });

    console.log(tableData);
    xlsx_exportWYSIWYG(tableData);

    // if (parsingOption !== 'option4') {
    //     showToast(`Data is not validated`, 'warning');
    // }
}

/**
 * Process reimport of Salsify data.
 *
 * @param {string} parsingOption - The parsing option for reimport.
 */
function process_reimport_salsify(parsingOption) {
    // TODO: Unsubstitute Headers for reimport function
    // TODO: change hard-code
    const myTable = document.getElementById('my-table');

    // Initialize an array to hold the data
    const tableData = [];

    // Get the table rows
    const rows = myTable.querySelectorAll('tr');

    const mergedValues = [
        ORDER.id,
        DESCRIPTION.id,
        QUANTITY.id,
        UOM.id,
        DV.id,
        SYMBOL.id,
        FOOT.id,
    ];
    //! get unique Product ID's, one per row
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

    console.log(uniqueProductIds);
    let arrayOfProductIds = [];

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
                                cellData.value[0];
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

        console.log(rowObj);
    });
    // console.log({ arrayOfProductIds });
}
// function ada(ingredientType, cellData, mergedValues) {
//     const pipeArray = [];

//     if (ingredientType === LABEL_DATASET_NUTRIENT_A.name) {
//         pipeArray = new Array(8).fill('');
//     } else if (ingredientType === LABEL_DATASET_INGREDIENTS_A.name) {
//         pipeArray = new Array(9).fill('');
//     }

//     if (mergedValues.includes(cellData?.type)) {
//         if (ingredientType === LABEL_DATASET_NUTRIENT_A.name) {
//             // NUTRIENTS
//             switch (cellData.type) {
//                 case ORDER.id:
//                     pipeArray.splice(0, -1, cellData.value); // Insert at index 0
//                     break;
//                 case DESCRIPTION.id:
//                     pipeArray.splice(1, -1, cellData.value); // Insert at index 1
//                     break;
//                 case QUANTITY.id:
//                     pipeArray.splice(3, -1, cellData.value); // Insert at index 3
//                     break;
//                 case UOM.id:
//                     pipeArray.splice(4, -1, cellData.value); // Insert at index 4
//                     break;
//                 case DV.id:
//                     pipeArray.splice(5, -1, cellData.value); // Insert at index 5
//                     break;
//                 case SYMBOL.id:
//                     pipeArray.splice(6, -1, cellData.value); // Insert at index 6
//                     break;
//                 case FOOT.id:
//                     pipeArray.splice(7, -1, cellData.value); // Insert at index 7
//                     break;
//             }
//         } else if (ingredientType === LABEL_DATASET_INGREDIENTS_A.name) {
//             // INGREDIENTS
//             switch (cellData.type) {
//                 case ORDER.id:
//                     pipeArray.splice(0, -1, cellData.value); // Insert at index 0
//                     break;
//                 case DESCRIPTION.id:
//                     pipeArray.splice(1, -1, cellData.value); // Insert at index 1
//                     break;
//                 case QUANTITY.id:
//                     pipeArray.splice(2, -1, cellData.value); // Insert at index 3
//                     break;
//                 case UOM.id:
//                     pipeArray.splice(3, -1, cellData.value); // Insert at index 4
//                     break;
//                 case DV.id:
//                     pipeArray.splice(5, -1, cellData.value); // Insert at index 5
//                     break;
//                 case SYMBOL.id:
//                     pipeArray.splice(6, -1, cellData.value); // Insert at index 6
//                     break;
//                 case FOOT.id:
//                     pipeArray.splice(7, -1, cellData.value); // Insert at index 7
//                     break;
//             }
//         }
//     }

//     return pipeArray;
// }

//! for each row for each productId, create a column of ingredientType
// uniqueProductIds.forEach((productId) => {
//     let exportObj = {};
//     exportObj['Product ID'] = productId;

//     // console.log('product ID: ', productId);

//     rows.forEach((row, rowIndex) => {
//         // Skip the header row
//         if (rowIndex === 0) return;

//         // Each row has ingredientType
//         const ingredientType = Array.from(row.cells)
//             .map((cell) => {
//                 if (cell.children[0]?.cell?.type === INGREDIENT_TYPE.id) {
//                     return cell.children[0].cell.value;
//                 }
//             })
//             .filter((item) => item !== undefined)[0];

//         // console.log({ ingredientType });
//         const rowProductId = Array.from(row.cells)
//             .map((cell) => {
//                 if (
//                     cell.children[0]?.cell?.type === 'Product ID' &&
//                     cell.children[0]?.cell?.value === productId
//                 ) {
//                     return cell.children[0].cell.value;
//                 }
//             })
//             .filter((item) => item !== undefined)[0];

//         if (rowProductId !== productId) {
//             return;
//         }

//         const otherIngreds = Array.from(row.cells)
//             .map((cell) => {
//                 if (
//                     // cell.children[0].cell?.type === 'Product ID' &&
//                     ingredientType === LABEL_DATASET_OTHER_INGREDS_A.name &&
//                     cell.children[0]?.cell?.type === DESCRIPTION.id
//                 ) {
//                     return cell.children[0].cell.value;
//                 }
//             })
//             .filter((item) => item !== undefined)[0];

//         // console.log(otherIngreds);
//         const id = LABEL_DATASET_OTHER_INGREDS_A.id;
//         // console.log(cellData);
//         exportObj[id] = otherIngreds;
//         // let pipeArray = [];

//         // console.log(rowProductId, ingredientType);
//         // if (ingredientType === LABEL_DATASET_NUTRIENT_A.name) {
//         //     pipeArray = new Array(8).fill('');
//         // } else if (ingredientType === LABEL_DATASET_INGREDIENTS_A.name) {
//         //     pipeArray = new Array(9).fill('');
//         // }
//         // console.log(ingredientType, pipeArray);

//         // Array.from(row.cells).forEach((cell) => {
//         //     const cellContainer = cell.firstChild;
//         //     /** @type {Cell} */
//         //     const cellData = cellContainer ? cellContainer.cell : undefined;

//         //     // if (cellData?.header.id === 'Product ID') {
//         //     //     const id = cellData.header.id;
//         //     //     exportObj[id] = cellData.value;
//         //     // }

//         //     if (ingredientType === LABEL_DATASET_OTHER_INGREDS_A.name) {
//         //         // OTHER INGREDIENTS
//         //         if (cellData?.type === DESCRIPTION.id) {

//         //             const id = LABEL_DATASET_OTHER_INGREDS_A.id;
//         //             console.log(cellData);
//         //             exportObj[id] = cellData.value;
//         //         }
//         //     }
//         // });
//         // console.log('done', pipeArray);
//         tableData.push(exportObj);
//     });
//     // console.log(tableData);
// });

// Iterate over each row
// rows.forEach((row, rowIndex) => {
//     // Skip the header row
//     if (rowIndex === 0) return;

//     const ingredientType = Array.from(row.cells)
//         .map((cell) => {
//             if (
//                 cell.children[0].cell &&
//                 cell.children[0].cell.type === INGREDIENT_TYPE.id
//             ) {
//                 return cell.children[0].cell.value;
//             }
//         })
//         .filter((item) => item !== undefined)[0];

//     Array.from(row.cells).forEach((cell) => {
//         const cellContainer = cell.firstChild;
//         /** @type {Cell} */
//         const cellData = cellContainer ? cellContainer.cell : undefined;

//         if (cellData?.header.id === 'Product ID') {
//             console.log(cellData);
//             uniqueProductIds.add(cellData.value);
//         }
//     });

//     let pipeArray = [];

//     if (ingredientType === LABEL_DATASET_NUTRIENT_A.name) {
//         pipeArray = new Array(8).fill('');
//     } else if (ingredientType === LABEL_DATASET_INGREDIENTS_A.name) {
//         pipeArray = new Array(9).fill('');
//     }
//     // console.log(ingredientType, pipeArray);

//     let exportObj = {};

//     // Array.from(row.cells).forEach((cell) => {
//     //     const cellContainer = cell.firstChild;
//     //     /** @type {Cell} */
//     //     const cellData = cellContainer ? cellContainer.cell : undefined;

//     //     if (cellData?.header.id === 'Product ID') {
//     //         const id = cellData.header.id;
//     //         exportObj[id] = cellData.value;
//     //     }

//     //     if (ingredientType === LABEL_DATASET_OTHER_INGREDS_A.name) {
//     //         // OTHER INGREDIENTS
//     //         if (cellData) {
//     //             console.log(cellData);
//     //             const id = LABEL_DATASET_OTHER_INGREDS_A.id;
//     //             console.log(cellData);
//     //             exportObj[id] = cellData.value;
//     //         }
//     //     }
//     // });
//     // console.log('done', pipeArray);
//     tableData.push(exportObj);
// });
// console.log([...uniqueProductIds]);
// console.log(tableData);
// xlsx_exportWYSIWYG(tableData);
// }

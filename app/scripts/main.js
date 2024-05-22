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

/**
 * Attaches the handlePopoverMenuClick function to each button with the class
 * .popover-menu-item within the my-table table.
 *
 * @param {string} tableId - The ID of the table element (e.g., 'my-table').
 */
function applyHandlePopoverMenuClickToTable(tableId) {
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
 * Callback function to handle button clicks in the popover-menu.
 *
 * @param {Event} e - The click event object.
 */
function handlePopoverMenuClick(e) {
    // Get the button that was clicked
    const button = e.target.closest('.popover-menu-item');

    // Determine the action based on the button's text content or another attribute
    if (button) {
        const [buttonId, index] = button.id.split('-');

        const rowId = e.target.closest(`tr[data-row_id]`).dataset.row_id;
        console.log(rowId);
        // console.log(buttonId, index);

        // Perform actions based on button text
        if (buttonId === 'addAbove') {
            addRowAbove(rowId);
        } else if (buttonId === 'addBelow') {
            addRowBelow(rowId);
        } else if (buttonId === 'delete') {
            deleteRow(rowId);
        }
    }

    const popover = e.target.closest('[popover]')

    popover.togglePopover()
}


function addRowAbove(dataId) {
    // //! parsing creates new ID;s
    const table = document.getElementById('my-table');

    /**@type {Row} */
    // let newRow;
    let rowIndex;

    // Copy the whole table. Iterate over each row in the table
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const rowId = row.dataset.row_id;

        if (rowId === dataId) {
            rowIndex = i;
            /** @type {Cell[]} */
            const newCells = [];

            // Iterate over each cell in the row
            for (let j = 0; j < row.cells.length; j++) {
                const cell = row.cells[j].firstChild.cell;

                // Extract the text content of the cell and push it to the rowData array
                if (cell && cell instanceof Cell) {
                    // console.log(cell);
                    const newCell = cloneCell(cell);

                    if (cell.isEditable === true) {
                        newCell.value = '';
                        newCell.isEditable = true;
                    }
                    newCells.push(newCell);
                }
            }

            newRow = new Row(newCells, generateRandomString(9));

            continue;
        }
    }
    //! do it here
    //* TODO: Copy the correct cells.
    // TODO: create new Row
    // TODO: Inset into new table []
    // TODO: Create HTML table or append to existing....
    // TODO: verify that listeners still work.
    console.log(newRow);
    const tableRow = createTableRow(newRow, createMenuPopover, 666);
    console.log(tableRow);

    if (rowIndex !== undefined) {
        const targetRow = table.rows[rowIndex];
        targetRow.parentNode.insertBefore(tableRow, targetRow);

        applyHandlePopoverMenuClickToTable('my-table');
    }
}

/**
 * Function to add a row below the current row.
 */
function addRowBelow(index) {
    console.log(`Adding a row below ${index}`);
}

/**
 * Function to delete the current row.
 */
function deleteRow(index) {
    console.log(`Deleted row ${index}`);
    // Add your logic to delete the current row
}

function createMenuPopover(index) {
    const td = document.createElement('td');
    td.setAttribute('data-custom', 'do-not-copy');
    td.innerHTML = `
    
    <div class="cell-container" id="pop-menu-div-${index}">
        <button class="icon" popovertarget="pop-menu-open-${index}">
            <span class="material-symbols-outlined">menu_open</span>
        </button>

        <div class="popover-menu" id="pop-menu-open-${index}" popover anchor="pop-menu-div-${index}">
            
            <button class="popover-menu-item" id="addAbove-${index}" type="button">
                <span class="material-symbols-outlined">add</span> Add Row Above ${index}
            </button>
            <button class="popover-menu-item" id="addBelow-${index}" type="button">
                <span class="material-symbols-outlined">add</span> Add Row Below ${index}
            </button>
            <button class="popover-menu-item" id="delete-${index}" type="button">
                <span class="material-symbols-outlined">delete</span> Delete Row ${index}
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
    <tr data-id="alkwjra">
        //Menu
        <td data-custom="do-not-copy">
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

function createTableRow(rowData, headerCallback = null, index) {
    const tableRow = document.createElement('tr');
    tableRow.dataset.row_id = rowData.id;
    // console.log({ rowData });
    // console.log(rowData.id);

    // 1st Column added here
    if (headerCallback) {
        tableRow.appendChild(headerCallback(index));
    }

    // Data columns
    rowData.cells.forEach((cell, cellIndex) => {
        const td = document.createElement('td');
        const cellContainer = document.createElement('div');
        cellContainer.classList.add('cell-container');
        cellContainer.cell = cell;
        td.appendChild(cellContainer);

        // use the same method as blur to apply errors
        addErrorsToDom(cell.status, cellContainer.classList);

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
    let rowHasMessages = false;
    for (const row of rows) {
        if (row.status && row.status.hasMessages) {
            rowHasMessages = true;
            break;
        }
    }

    // Add the table header if rows are present and if there is any status
    const headerRow = document.createElement('tr');

    //* For Popover Menu
    const menuHeader = document.createElement('th');
    headerRow.appendChild(menuHeader);

    // Add other headers
    rows[0].cells.forEach((cell) => {
        const th = document.createElement('th');
        th.textContent = cell.header.name;
        headerRow.appendChild(th);
    });
    myTable.appendChild(headerRow);

    //! Do it here
    rows.forEach((row, index) => {
        // console.log(row);
        const tableRow = createTableRow(row, createMenuPopover, index + 1);
        console.log('tableRow init', tableRow);
        myTable.appendChild(tableRow);
    });

    // Get container element to append the table
    const tableContainer = document.getElementById('table-container');

    // Clear any old table
    tableContainer.innerHTML = '';
    // Give it the new data
    tableContainer.appendChild(myTable);

    attachBlurEventToTableCells(myTable);

    applyHandlePopoverMenuClickToTable('my-table');
}

/** BLUR Validations *********************************************************/
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
                cell.firstChild.cell.type === 'INGREDIENT_TYPE'
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
    // console.log(`attachBlurEventToTableCells`);
    // Define a named event handler function

    function handleBlurEvent(e) {
        /** @type {Cell} */
        const cell = e.target.parentElement.cell || null;

        if (cell) {
            const cellType = cell.type;

            // Clean empty cells
            e.target.innerText = e.target.innerText.trim();
            const innerText = e.target.innerText;
            // console.log(e.target);
            const ingredValue = getIngredientTypeFromDom(e.target);
            // console.log({ ingredValue });
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

    xlsx_exportWYSIWYG(data);

    if (parsingOption !== 'option4') {
        showToast(`Data is not validated`, 'warning');
    }
}

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
function main_process(parsingOption) {
    // set in salsify_preprocess
    const jsonObject = getLocalStorage();

    const rows = processOptionWithData(jsonObject, parsingOption);

    // const htmlTable = createHtmlTable(rowsOfData, null);

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
        // console.log(row);

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
            // Attach the object directly to the cell using a custom property
            cellValue.cell = cell;

            // Set the cell as content editable if it is editable
            if (cell.isEditable) {
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

            tableRow.appendChild(td);
        });

        // Add the row to the table
        myTable.appendChild(tableRow);
    });

    // Get container element to append the table
    const tableContainer = document.getElementById('table-container');

    // Clear any old table
    tableContainer.innerHTML = '';
    tableContainer.appendChild(myTable);

    attachBlurEventToTableCells(myTable);
}

function addErrorsToDom(status, parentClasslist) {
    // console.log({ status });
    // console.dir(parentClasslist);
    if (status.hasMessages) {
        if (status.errors.length > 0) {
            parentClasslist.add('error-cell');
        }
        if (status.warnings.length > 0) {
            parentClasslist.add('warning-cell');
            //TODO: update cell.value to valid innerText
        }
    } else {
        // e.target.parentElement.classList = [];
        // e.target.parentElement.classList.add('cell-value');
        parentClasslist.remove('error-cell', 'warning-cell');
    }
}

/**
 * Depending on the ingredient type, the validation changes
 * @param {EventTarget} target 
 * @returns {string} - Other, Ingredients, Nutrients
 */
function getIngredientTypeFromDom(target) {
    const parentRow = target.parentNode.parentNode.parentNode;

    const ingredientCell = Array.from(parentRow.cells)
        .map((cell) => {
            return Array.from(cell.firstChild.childNodes).find(
                (child) => child.cell && child.cell.type === 'INGREDIENT_TYPE'
            );
        })
        .filter((cell) => cell !== undefined); // Filter out undefined and null values

    const ingredValue = ingredientCell[0].cell.value;
    return ingredValue;
}

/**
 * Attaches a blur event listener to HTML table cells in a dynamically created table.
 *
 * @param {HTMLTableElement} table - The HTML table element to monitor for blur events on its cells.
 */
function attachBlurEventToTableCells(table) {
    // console.log(`attachBlurEventToTableCells`);
    // Add a blur event listener to the table element
    table.addEventListener(
        'blur',
        (e) => {
            if (e.target.classList.contains('cell-value')) {
                /** @type {Cell} */
                const cell = e.target.cell;
                const cellType = cell.type;
                // console.log({ cell });
                // console.log(e.target);
                e.target.innerText = e.target.innerText.trim();
                const innerText = e.target.innerText;

                const parentClasslist = e.target.parentElement.classList;
                let status = null;

                switch (cellType) {
                    case ORDER.id:
                        status = createCell.validateOrder(innerText);

                        break;

                    case DESCRIPTION.id:
                        status = createCell.validateDescription(innerText);

                        break;

                    case QUANTITY.id:
                        status = createCell.validateQuantity(innerText);

                        break;

                    case UOM.id:
                        status = createCell.validateUom(innerText);

                        break;

                    case DV.id:
                        {
                            const ingredValue = getIngredientTypeFromDom(
                                e.target
                            );

                            status = createCell.validateDvAmount(
                                innerText,
                                ingredValue
                            );
                        }
                        break;

                    case SYMBOL.id:
                        {
                            const ingredValue = getIngredientTypeFromDom(
                                e.target
                            );

                            status = createCell.validateSymbol(
                                innerText,
                                ingredValue
                            );
                        }

                        break;
                    case FOOT.id:
                        {
                            // Depending on the ingredient type, the validation changes
                            const ingredValue = getIngredientTypeFromDom(
                                e.target
                            );

                            status = createCell.validateFootnote(
                                innerText,
                                ingredValue
                            );
                        }

                        break;
                    default:
                        break;
                }

                addErrorsToDom(status, parentClasslist);
            }
        },
        true
    ); // The true option makes the event listener capture the event during the capture phase

    table.addEventListener('keydown', (event) => {
        // Check if the event target is an editable cell
        if (event.target.cell && event.key === 'Enter') {
            // Prevent the default action of inserting a new line
            event.preventDefault();
        }
    });

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

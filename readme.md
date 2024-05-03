## Features

* scan all rows
    * remove rows that are not EA's

* scan all headers
    * create array of unique headers (headers_row)
        
        * ignore headers that start with "salsify:"

        * remove headers that end with _n

        * if any headers that startwith [these_names], create new header called "Ingredient Info", if it doesn't exist

        * {Header extends Entity}
            {
                id: "MERGED_INGREDIENT",
                name: "Ingredient Info",
                type (lookup): "LABEL_DATASET_INGREDIENTS_A",
                value: null
            }, {
                id: "PARTCODE",
                name: "Partcode",
                type (lookup): "PARTCODE",
                value: null
            },


    * create array of reformatted rows (mapped_rows):

        * Iterate each existing row. Each row becomes a Map. 
            
            * loop each header in headers_row....
            
                * if any item_key that startwith [these_names], create merged_ingredient{Entity}
                    * {
                        id: "Ingredient Info",
                        name: "Ingredient Info",
                        type: "LABEL_DATASET_INGREDIENTS_A"
                        value: "2|Total Carbohydrate||8|g|3|%|†"
                    }
                
                * else create standard{Entity}
                    * {
                        id: "PARTCODE",
                        name: "SKU",
                        value: "6971"
                    }
    [ 
        { Map
            PARTCODE {Entity}: {
                <!-- id: ""Partcode, -->
                name: "PARTCODE",
                value: "6971"
            },
            Product ID {Entity}: {
                name: "Product ID",
                value: "00033674069714"
            }
            MERGED_INGREDIENTS {Entity}: {
                <!-- id: "Ingredient Info", -->
                name: "Ingredient Info",
                type: "LABEL_DATASET_INGREDIENTS_A"
                value: "2|Total Carbohydrate||8|g|3|%|†"
            }
        },
        ...
    ]
    
create a function based on these parameters that returns a new row for each key in the ingredients_to_merge Set
/**
 * Creates Cells for each row based on column names and merges ingredients as necessary.
 *
 * @param {Object} options - The options object.
 * @param {Array<Object>} options.rows - An array of objects representing each row of data.
 * @param {Set<string>} options.ingredients_to_merge - An array of column names to merge into one Cell.
 * @param {Array<string>} options.columnNames - An array of column names for which to create Cell instances.
 * @returns {Array<Cell[]>} - An array of arrays, each containing Cell instances for a row.
 */

 using the table structure in the function, create a new function that pulls data from the span with calls of cell-value, and the appropriate headers,  for export with sheetsjs
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
        console.log({rows});
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
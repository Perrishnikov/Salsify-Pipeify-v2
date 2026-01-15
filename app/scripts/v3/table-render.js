/** @typedef {import('./types.js').V3Row} V3Row */
/** @typedef {import('./types.js').V3TableDef} V3TableDef */

/**
 * @param {string} tag
 * @param {string} className
 * @param {string} text
 * @returns {HTMLElement}
 */
function tableRenderCreateElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) {
        el.className = className;
    }
    if (typeof text === 'string') {
        el.textContent = text;
    }
    return el;
}

/**
 * @param {string} label
 * @param {string} action
 * @param {string} tableKey
 * @param {string} rowId
 * @returns {HTMLButtonElement}
 */
function tableRenderCreateRowActionItem(label, action, tableKey, rowId) {
    const button = tableRenderCreateElement(
        'button',
        'dropdown-item',
        label
    );
    button.type = 'button';
    button.dataset.rowAction = action;
    button.dataset.tableKey = tableKey;
    button.dataset.rowId = rowId;
    return button;
}

/**
 * @param {V3Row} row
 * @param {import('./types.js').V3Column} column
 * @returns {string}
 */
function tableRenderGetCellValue(row, column) {
    if (!row) {
        return '';
    }
    if (row.cells && row.cells[column.id] !== undefined) {
        return row.cells[column.id];
    }
    if (row[column.id] !== undefined) {
        return row[column.id];
    }
    return '';
}

/**
 * @param {V3TableDef} tableDef
 * @returns {HTMLTableRowElement}
 */
function tableRenderHeaderRow(tableDef) {
    const headerRow = document.createElement('tr');
    tableDef.columns.forEach(function (column) {
        const label = column.label || '';
        const th = tableRenderCreateElement('th', '', label);
        th.dataset.colId = column.id;
        headerRow.appendChild(th);
    });
    return headerRow;
}

/**
 * @param {V3TableDef} tableDef
 * @param {V3Row} row
 * @param {number} rowIndex
 * @returns {HTMLTableRowElement}
 */
function tableRenderRow(tableDef, row, rowIndex) {
    const tr = document.createElement('tr');
    if (row && row.id) {
        tr.dataset.rowId = row.id;
    } else if (rowIndex !== undefined) {
        tr.dataset.rowId = 'row-' + rowIndex;
    }
    if (row && row.type) {
        tr.dataset.type = row.type;
    } else if (tableDef && tableDef.rowType) {
        tr.dataset.type = tableDef.rowType;
    }

    tableDef.columns.forEach(function (column) {
        const td = document.createElement('td');
        const cellContainer = tableRenderCreateElement('div', 'cell-container');
        const value = tableRenderGetCellValue(row, column);

        if (column.isControl) {
            const rowId = tr.dataset.rowId || '';
            if (column.id === 'ROW_ACTIONS') {
                if (tableDef.rowType !== 'Other') {
                    const dropdown = tableRenderCreateElement(
                        'div',
                        'dropdown'
                    );
                    dropdown.dataset.rowMenuContainer = 'true';
                    const toggle = tableRenderCreateElement(
                        'button',
                        'btn btn-light btn-sm dropdown-toggle',
                        'Row Actions'
                    );
                    toggle.type = 'button';
                    toggle.dataset.rowMenu = 'true';
                    toggle.setAttribute('aria-expanded', 'false');

                    const menu = tableRenderCreateElement(
                        'div',
                        'dropdown-menu'
                    );
                    menu.dataset.rowMenuList = 'true';
                    menu.appendChild(
                        tableRenderCreateRowActionItem(
                            'Add Above',
                            'add-above',
                            tableDef.key,
                            rowId
                        )
                    );
                    menu.appendChild(
                        tableRenderCreateRowActionItem(
                            'Add Below',
                            'add-below',
                            tableDef.key,
                            rowId
                        )
                    );
                    menu.appendChild(
                        tableRenderCreateRowActionItem(
                            'Delete',
                            'delete',
                            tableDef.key,
                            rowId
                        )
                    );

                    dropdown.appendChild(toggle);
                    dropdown.appendChild(menu);
                    cellContainer.appendChild(dropdown);
                }
            } else if (column.id === 'ROW_PASTE') {
                if (tableDef.pasteMode === 'row') {
                    const pasteButton = tableRenderCreateElement(
                        'button',
                        'btn btn-light btn-sm',
                        'Row Paste'
                    );
                    pasteButton.type = 'button';
                    pasteButton.dataset.pasteAction = 'row';
                    pasteButton.dataset.tableKey = tableDef.key;
                    pasteButton.dataset.rowId = rowId;
                    cellContainer.appendChild(pasteButton);
                }
            }
        } else {
            const cellValue = tableRenderCreateElement(
                'div',
                'cell-value',
                String(value)
            );
            cellValue.dataset.colId = column.id;
            if (!column.isFixed) {
                cellValue.setAttribute('contenteditable', 'true');
            } else {
                cellValue.setAttribute('contenteditable', 'false');
            }
            cellContainer.appendChild(cellValue);
        }

        td.appendChild(cellContainer);
        tr.appendChild(td);
    });

    return tr;
}

/**
 * @param {V3TableDef} tableDef
 * @param {V3Row[]} rows
 * @returns {HTMLTableElement}
 */
export function tableRenderRenderTable(tableDef, rows) {
    const table = document.createElement('table');
    table.dataset.tableKey = tableDef.key;
    table.dataset.tableId = tableDef.tableId;

    table.appendChild(tableRenderHeaderRow(tableDef));
    rows.forEach(function (row, index) {
        table.appendChild(tableRenderRow(tableDef, row, index + 1));
    });

    return table;
}

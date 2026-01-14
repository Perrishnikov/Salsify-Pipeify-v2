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
            if (tableDef.pasteMode === 'row') {
                const pasteButton = tableRenderCreateElement(
                    'button',
                    'btn btn-light btn-sm',
                    'Paste'
                );
                pasteButton.type = 'button';
                pasteButton.dataset.pasteAction = 'row';
                pasteButton.dataset.tableKey = tableDef.key;
                pasteButton.dataset.rowId = tr.dataset.rowId || '';
                cellContainer.appendChild(pasteButton);
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

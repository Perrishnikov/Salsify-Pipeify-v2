/** @typedef {import('./types.js').V3Row} V3Row */
/** @typedef {import('./types.js').V3State} V3State */
/** @typedef {import('./types.js').V3TableDef} V3TableDef */

/**
 * @param {V3TableDef} tableDef
 * @param {number} rowIndex
 * @returns {V3Row}
 */
export function stateCreateEmptyRow(tableDef, rowIndex) {
    const cells = {};
    tableDef.columns.forEach(function (column) {
        cells[column.id] = '';
    });
    return {
        id: 'row-' + rowIndex,
        type: tableDef.rowType,
        cells: cells,
    };
}

/**
 * @param {V3TableDef[]} tableDefs
 * @returns {Record<string, V3Row[]>}
 */
function stateCreateTableData(tableDefs) {
    const data = {};
    tableDefs.forEach(function (tableDef, index) {
        data[tableDef.key] = [stateCreateEmptyRow(tableDef, index + 1)];
    });
    return data;
}

/**
 * @param {string} countryCode
 * @param {V3TableDef[]} tableDefs
 * @returns {V3State}
 */
export function stateCreateState(countryCode, tableDefs) {
    return {
        countryCode: countryCode,
        tableDefs: tableDefs,
        tableData: stateCreateTableData(tableDefs),
        lastAction: 'init',
    };
}

/**
 * @param {V3State} state
 */
export function stateResetTables(state) {
    state.tableData = stateCreateTableData(state.tableDefs);
    state.lastAction = 'clear';
}

/**
 * @param {V3State} state
 * @param {string} tableKey
 * @param {string} rowId
 * @param {string} colId
 * @param {string} value
 */
export function stateUpdateCell(state, tableKey, rowId, colId, value) {
    const rows = state.tableData[tableKey];
    if (!rows) {
        return;
    }
    const targetRow = rows.find(function (row) {
        return row.id === rowId;
    });
    if (!targetRow) {
        return;
    }
    targetRow.cells[colId] = value;
    state.lastAction = 'edit';
}

/**
 * @param {V3State} state
 * @param {string} tableKey
 * @returns {string}
 */
export function stateGetTableProductId(state, tableKey) {
    const rows = state.tableData[tableKey] || [];
    for (let i = 0; i < rows.length; i += 1) {
        const cells = rows[i] && rows[i].cells ? rows[i].cells : null;
        if (cells && cells.PRODUCT_ID) {
            return cells.PRODUCT_ID;
        }
    }
    return '';
}

/**
 * @param {V3State} state
 * @param {string} tableKey
 * @returns {V3TableDef|null}
 */
function stateGetTableDef(state, tableKey) {
    const tableDefs = state.tableDefs || [];
    for (let i = 0; i < tableDefs.length; i += 1) {
        if (tableDefs[i].key === tableKey) {
            return tableDefs[i];
        }
    }
    return null;
}

/**
 * @param {V3Row[]} rows
 * @param {V3TableDef} tableDef
 * @returns {void}
 */
function stateNormalizeRows(rows, tableDef) {
    if (!rows) {
        return;
    }
    rows.forEach(function (row, index) {
        row.id = 'row-' + (index + 1);
        if (!row.type && tableDef && tableDef.rowType) {
            row.type = tableDef.rowType;
        }
    });
}

/**
 * @param {V3Row} row
 * @param {string} productId
 * @returns {void}
 */
function stateClearRowCells(row, productId) {
    if (!row || !row.cells) {
        return;
    }
    Object.keys(row.cells).forEach(function (key) {
        row.cells[key] = '';
    });
    if (productId) {
        row.cells.PRODUCT_ID = productId;
    }
}

/**
 * @param {V3State} state
 * @param {string} tableKey
 * @param {string} rowId
 * @param {'above'|'below'} position
 * @returns {boolean}
 */
export function stateInsertRow(state, tableKey, rowId, position) {
    const rows = state.tableData[tableKey];
    if (!rows) {
        return false;
    }
    const tableDef = stateGetTableDef(state, tableKey);
    if (!tableDef) {
        return false;
    }
    const rowIndex = rows.findIndex(function (row) {
        return row && row.id === rowId;
    });
    if (rowIndex < 0) {
        return false;
    }
    const insertIndex = position === 'below' ? rowIndex + 1 : rowIndex;
    const newRow = stateCreateEmptyRow(tableDef, rows.length + 1);
    const productId = stateGetTableProductId(state, tableKey);
    if (productId) {
        newRow.cells.PRODUCT_ID = productId;
    }
    rows.splice(insertIndex, 0, newRow);
    stateNormalizeRows(rows, tableDef);
    state.lastAction = 'row-insert';
    return true;
}

/**
 * @param {V3State} state
 * @param {string} tableKey
 * @param {string} rowId
 * @returns {boolean}
 */
export function stateDeleteRow(state, tableKey, rowId) {
    const rows = state.tableData[tableKey];
    if (!rows) {
        return false;
    }
    const tableDef = stateGetTableDef(state, tableKey);
    if (!tableDef) {
        return false;
    }
    const rowIndex = rows.findIndex(function (row) {
        return row && row.id === rowId;
    });
    if (rowIndex < 0) {
        return false;
    }
    const productId = stateGetTableProductId(state, tableKey);
    if (rows.length === 1) {
        stateClearRowCells(rows[0], productId);
        state.lastAction = 'row-clear';
        return true;
    }
    rows.splice(rowIndex, 1);
    stateNormalizeRows(rows, tableDef);
    state.lastAction = 'row-delete';
    return true;
}

/**
 * @param {V3State} state
 * @param {string} tableKey
 * @returns {V3Row[]}
 */
export function stateGetTableRows(state, tableKey) {
    return state.tableData[tableKey] || [];
}

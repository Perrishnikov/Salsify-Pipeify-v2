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
 * @returns {V3Row[]}
 */
export function stateGetTableRows(state, tableKey) {
    return state.tableData[tableKey] || [];
}

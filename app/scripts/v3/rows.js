import { parsingNormalizeValue, parsingParseDelimitedTable } from './parsing.js';
import { stateCreateEmptyRow } from './state.js';

/** @typedef {import('./types.js').V3Row} V3Row */
/** @typedef {import('./types.js').V3TableDef} V3TableDef */

/**
 * @param {V3TableDef} tableDef
 * @param {number} rowIndex
 * @param {string} productId
 * @param {Record<string, string>} values
 * @returns {V3Row}
 */
export function rowsCreateRow(tableDef, rowIndex, productId, values) {
    const row = stateCreateEmptyRow(tableDef, rowIndex);
    if (productId) {
        row.cells.PRODUCT_ID = productId;
    }
    Object.keys(values).forEach(function (key) {
        row.cells[key] = values[key];
    });
    return row;
}

/**
 * @param {Record<string, string>} values
 * @returns {boolean}
 */
function rowsHasValues(values) {
    return Object.keys(values).some(function (key) {
        return values[key] !== '';
    });
}

/**
 * @typedef {Object} RowsBuildOptions
 * @property {boolean} [ensureRow]
 */ //TODO: custom type

/**
 * @param {V3TableDef} tableDef
 * @param {string} productId
 * @param {string} text
 * @param {RowsBuildOptions} [options]
 * @returns {V3Row[]}
 */
export function rowsBuildIngredientRows(
    tableDef,
    productId,
    text,
    options
) {
    const config = options || {};
    const rows = [];
    const parsedRows = parsingParseDelimitedTable(text);

    parsedRows.forEach(function (cells) {
        const values = {
            ORDER: parsingNormalizeValue(cells[0]),
            DESCRIPTION: parsingNormalizeValue(cells[1]),
            QTY: parsingNormalizeValue(cells[2]),
            UOM: parsingNormalizeValue(cells[3]),
            SYMBOL: parsingNormalizeValue(cells[4]),
            definition: parsingNormalizeValue(cells[5]),
        };
        if (!rowsHasValues(values)) {
            return;
        }
        rows.push(rowsCreateRow(tableDef, rows.length + 1, productId, values));
    });

    if (config.ensureRow && rows.length === 0) {
        rows.push(rowsCreateRow(tableDef, rows.length + 1, productId, {}));
    }

    return rows;
}

/**
 * @param {V3TableDef} tableDef
 * @param {string} productId
 * @param {string} text
 * @param {RowsBuildOptions} [options]
 * @returns {V3Row[]}
 */
export function rowsBuildNutrientRows(tableDef, productId, text, options) {
    const config = options || {};
    const rows = [];
    const parsedRows = parsingParseDelimitedTable(text);

    parsedRows.forEach(function (cells) {
        const description =
            parsingNormalizeValue(cells[2]) ||
            parsingNormalizeValue(cells[1]);
        const values = {
            ORDER: parsingNormalizeValue(cells[0]),
            DESCRIPTION: description,
            QTY: parsingNormalizeValue(cells[3]),
            UOM: parsingNormalizeValue(cells[4]),
            DV: parsingNormalizeValue(cells[5]),
            PCT: parsingNormalizeValue(cells[6]),
            SYMBOL: parsingNormalizeValue(cells[7]),
            definition: parsingNormalizeValue(cells[8]),
        };
        if (!rowsHasValues(values)) {
            return;
        }
        rows.push(rowsCreateRow(tableDef, rows.length + 1, productId, values));
    });

    if (config.ensureRow && rows.length === 0) {
        rows.push(rowsCreateRow(tableDef, 1, productId, {}));
    }

    return rows;
}

/**
 * @param {V3TableDef} tableDef
 * @param {string} productId
 * @param {string} description
 * @returns {V3Row[]}
 */
export function rowsBuildOtherRows(tableDef, productId, description) {
    const row = rowsCreateRow(tableDef, 1, productId, {
        DESCRIPTION: parsingNormalizeValue(description),
    });
    return [row];
}

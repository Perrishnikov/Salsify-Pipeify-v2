/** @typedef {import('./types.js').V3DelimitedParseOptions} V3DelimitedParseOptions */

/**
 * @param {string} value
 * @returns {string}
 */
export function parsingNormalizeValue(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value).trim();
}

/**
 * @param {string} text
 * @param {string} delimiter
 * @returns {string[]}
 */
export function parsingSplitRows(text, delimiter) {
    const normalized = parsingNormalizeValue(text);
    if (!normalized) {
        return [];
    }
    return normalized
        .split(delimiter)
        .map(function (part) {
            return parsingNormalizeValue(part);
        })
        .filter(function (part) {
            return part.length > 0;
        });
}

/**
 * @param {string} text
 * @param {string} delimiter
 * @returns {string[]}
 */
export function parsingSplitCells(text, delimiter) {
    const normalized = parsingNormalizeValue(text);
    if (!normalized) {
        return [];
    }
    return normalized.split(delimiter).map(function (part) {
        return parsingNormalizeValue(part);
    });
}

/**
 * @param {string} text
 * @param {V3DelimitedParseOptions} [options]
 * @returns {string[][]}
 */
export function parsingParseDelimitedTable(text, options) {
    const config = options || {};
    const rowDelimiter = config.rowDelimiter || '~';
    const cellDelimiter = config.cellDelimiter || '|';
    const rows = parsingSplitRows(text, rowDelimiter);
    return rows.map(function (row) {
        return parsingSplitCells(row, cellDelimiter);
    });
}

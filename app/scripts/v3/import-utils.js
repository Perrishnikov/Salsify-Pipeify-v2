import { parsingNormalizeValue } from './parsing.js';

/** @typedef {import('./types.js').V3SpreadsheetData} V3SpreadsheetData */

/**
 * @typedef {Object} ImportUtilsHeaderRules
 * @property {string[]} [allowedDuplicateHeaders]
 * @property {string[]} [requiredHeaders]
 * @property {string} [productIdHeader]
 */ //TODO: custom type

/**
 * @typedef {Object} ImportUtilsVariantRules
 * @property {string} productIdHeader
 * @property {string} variantHeader
 */ //TODO: custom type

/**
 * @param {string} fileName
 * @returns {string}
 */
function importUtilsGetFileExtension(fileName) {
    if (!fileName) {
        return '';
    }
    const parts = fileName.toLowerCase().split('.');
    if (parts.length < 2) {
        return '';
    }
    return parts.pop() || '';
}

/**
 * @param {File} file
 * @returns {'csv'|'xlsx'|''}
 */
function importUtilsGetFileType(file) {
    const extension = importUtilsGetFileExtension(file ? file.name : '');
    if (extension === 'csv') {
        return 'csv';
    }
    if (extension === 'xlsx') {
        return extension;
    }
    return '';
}

/**
 * @returns {Promise<any>}
 */
async function importUtilsLoadXlsx() {
    if (globalThis && globalThis.XLSX) {
        return globalThis.XLSX;
    }
    const module = await import(
        'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/xlsx.mjs'
    );
    return module.default || module;
}

/**
 * @param {string} text
 * @returns {string[][]}
 */
function importUtilsParseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    let index = 0;

    while (index < text.length) {
        const char = text[index];
        if (inQuotes) {
            if (char === '"') {
                if (text[index + 1] === '"') {
                    cell += '"';
                    index += 1;
                } else {
                    inQuotes = false;
                }
            } else {
                cell += char;
            }
        } else if (char === '"') {
            inQuotes = true;
        } else if (char === ',') {
            row.push(cell);
            cell = '';
        } else if (char === '\n') {
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else if (char === '\r') {
            if (text[index + 1] !== '\n') {
                row.push(cell);
                rows.push(row);
                row = [];
                cell = '';
            }
        } else {
            cell += char;
        }
        index += 1;
    }

    row.push(cell);
    rows.push(row);

    return rows.filter(function (item) {
        return item.some(function (value) {
            return parsingNormalizeValue(value) !== '';
        });
    });
}

/**
 * @param {File} file
 * @returns {Promise<V3SpreadsheetData>}
 */
export async function importUtilsReadSpreadsheet(file) {
    const fileType = importUtilsGetFileType(file);
    if (!fileType) {
        throw new Error('File must be .csv or .xlsx.');
    }
    if (fileType === 'csv') {
        const text = await file.text();
        const rows = importUtilsParseCsv(text);
        const headers = (rows[0] || []).map(parsingNormalizeValue);
        return {
            headers: headers,
            rows: rows.slice(1),
        };
    }

    const xlsx = await importUtilsLoadXlsx();
    const data = await file.arrayBuffer();
    const workbook = xlsx.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
        blankrows: false,
    });
    const headers = (rows[0] || []).map(parsingNormalizeValue);
    return {
        headers: headers,
        rows: rows.slice(1),
    };
}

/**
 * @param {string[]} headers
 * @returns {Record<string, number[]>}
 */
export function importUtilsIndexHeaders(headers) {
    const indexMap = {};
    headers.forEach(function (header, index) {
        const normalized = parsingNormalizeValue(header);
        if (!normalized) {
            return;
        }
        if (!indexMap[normalized]) {
            indexMap[normalized] = [];
        }
        indexMap[normalized].push(index);
    });
    return indexMap;
}

/**
 * @param {string[]} headers
 * @returns {Record<string, number>}
 */
function importUtilsCountHeaders(headers) {
    const counts = {};
    headers.forEach(function (header) {
        const normalized = parsingNormalizeValue(header);
        if (!normalized) {
            return;
        }
        counts[normalized] = (counts[normalized] || 0) + 1;
    });
    return counts;
}

/**
 * @param {string[]} headers
 * @param {ImportUtilsHeaderRules} rules
 * @returns {string[]}
 */
export function importUtilsValidateHeaders(headers, rules) {
    const errors = [];
    const counts = importUtilsCountHeaders(headers);
    const required = rules ? rules.requiredHeaders || [] : [];
    const allowedDuplicateHeaders = rules
        ? rules.allowedDuplicateHeaders || []
        : [];
    const productIdHeader = rules ? rules.productIdHeader : '';
    const allowedDuplicates = new Set(allowedDuplicateHeaders);
    const requiredSet = new Set(required);

    if (productIdHeader) {
        requiredSet.add(productIdHeader);
    }

    Object.keys(counts).forEach(function (header) {
        if (!requiredSet.has(header)) {
            return;
        }
        if (counts[header] > 1 && !allowedDuplicates.has(header)) {
            errors.push('Duplicate header not allowed: ' + header + '.');
        }
    });

    requiredSet.forEach(function (header) {
        if (!counts[header]) {
            errors.push('Missing required header: ' + header + '.');
        }
    });

    return errors;
}

/**
 * @param {string} value
 * @returns {string}
 */
function importUtilsNormalizeProductId(value) {
    const normalized = parsingNormalizeValue(value);
    if (!normalized) {
        return '';
    }
    const digitsOnly = normalized.replace(/\D/g, '');
    if (digitsOnly.length === 14) {
        return digitsOnly;
    }
    return '';
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function importUtilsIsVariantValue(value) {
    const normalized = parsingNormalizeValue(value).toLowerCase();
    return normalized === 'variant' || normalized === 'varient';
}

/**
 * @param {string[][]} rows
 * @param {Record<string, number[]>} indexMap
 * @param {ImportUtilsVariantRules} rules
 * @returns {{row: string[], productId: string}|null}
 */
export function importUtilsFindVariantRow(rows, indexMap, rules) {
    const productIdHeader = rules ? rules.productIdHeader : '';
    const variantHeader = rules ? rules.variantHeader : '';
    const productIdIndex = indexMap[productIdHeader]
        ? indexMap[productIdHeader][0]
        : -1;
    const variantIndex = indexMap[variantHeader]
        ? indexMap[variantHeader][0]
        : -1;

    if (productIdIndex < 0 || variantIndex < 0) {
        return null;
    }

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const productId = importUtilsNormalizeProductId(row[productIdIndex]);
        if (!productId) {
            continue;
        }
        if (!importUtilsIsVariantValue(row[variantIndex])) {
            continue;
        }
        return { row: row, productId: productId };
    }

    return null;
}

/**
 * @param {string[]} row
 * @param {Record<string, number[]>} indexMap
 * @param {string} header
 * @returns {string[]}
 */
export function importUtilsGetColumnValues(row, indexMap, header) {
    const indices = indexMap[header] || [];
    return indices.map(function (index) {
        return parsingNormalizeValue(row[index]);
    });
}

/**
 * @param {string[]} row
 * @param {Record<string, number[]>} indexMap
 * @param {string} header
 * @returns {string}
 */
export function importUtilsGetColumnValue(row, indexMap, header) {
    const values = importUtilsGetColumnValues(row, indexMap, header);
    return values.length ? values[0] : '';
}

/**
 * @param {string} value
 * @param {string} delimiter
 * @returns {string}
 */
function importUtilsNormalizeSegment(value, delimiter) {
    let normalized = parsingNormalizeValue(value);
    if (!normalized) {
        return '';
    }
    while (normalized.endsWith(delimiter)) {
        normalized = normalized.slice(0, -delimiter.length).trim();
    }
    return normalized;
}

/**
 * @param {string[]} values
 * @param {string} delimiter
 * @returns {string}
 */
export function importUtilsMergeColumnValues(values, delimiter) {
    const segments = values
        .map(function (value) {
            return importUtilsNormalizeSegment(value, delimiter);
        })
        .filter(function (value) {
            return value !== '';
        });

    if (!segments.length) {
        return '';
    }
    return segments.join(delimiter) + delimiter;
}

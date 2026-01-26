import {
    pipeSchemaBuildRowDataList,
    pipeSchemaGetByTableKey,
    pipeSchemaSerializeRow,
    pipeSchemaSerializeRows,
} from './pipe-schema.js';
import { parsingNormalizeValue } from './parsing.js';
import { xlsxLoad } from './xlsx.js';

const exportProductIdHeader = 'Product ID';
const exportLocaleSuffix = ' - en-US';
const exportCaNutrientHeader = 'LABEL_DATASET_NUTRIENT_A';
const exportCaOtherHeader = 'LABEL_DATASET_OTHER_INGREDS_A';

/**
 * @param {Record<string, import('./types.js').V3Row[]>} tableData
 * @returns {string}
 */
function exportFindProductId(tableData) {
    const keys = Object.keys(tableData || {});
    for (let i = 0; i < keys.length; i += 1) {
        const rows = tableData[keys[i]];
        if (!rows) {
            continue;
        }
        for (let j = 0; j < rows.length; j += 1) {
            const cells = rows[j] && rows[j].cells ? rows[j].cells : null;
            if (cells && cells.PRODUCT_ID) {
                return parsingNormalizeValue(cells.PRODUCT_ID);
            }
        }
    }
    return '';
}

/**
 * @param {import('./types.js').V3Row[]} rows
 * @returns {string}
 */
function exportGetOtherDescription(rows) {
    if (!rows || !rows.length) {
        return '';
    }
    for (let i = 0; i < rows.length; i += 1) {
        const cells = rows[i] && rows[i].cells ? rows[i].cells : null;
        if (!cells) {
            continue;
        }
        const value = parsingNormalizeValue(cells.DESCRIPTION);
        if (value) {
            return value;
        }
    }
    return '';
}

/**
 * @param {string} value
 * @param {string} delimiter
 * @returns {string}
 */
function exportEnsureTrailingDelimiter(value, delimiter) {
    if (!value || !delimiter) {
        return value;
    }
    return value.endsWith(delimiter) ? value : value + delimiter;
}

/**
 * @param {string} tableKey
 * @param {import('./types.js').V3Row[]} rows
 * @returns {{rows: string[], joined: string}}
 */
function exportSerializeTableRows(tableKey, rows) {
    const schema = pipeSchemaGetByTableKey(tableKey);
    if (!schema) {
        return { rows: [], joined: '' };
    }
    const rowDataList = pipeSchemaBuildRowDataList(rows || [], schema);
    if (!rowDataList.length) {
        return { rows: [], joined: '' };
    }
    const serializedRows = rowDataList.map(function (rowData) {
        return pipeSchemaSerializeRow(rowData, schema);
    });
    let joined = pipeSchemaSerializeRows(rowDataList, schema);
    if (joined) {
        joined = exportEnsureTrailingDelimiter(joined, schema.rowDelimiter);
    }
    return { rows: serializedRows, joined: joined };
}

/**
 * @param {string[][]} rows
 * @returns {string[][]}
 */
function exportNormalizeExportRows(rows) {
    if (!rows || !rows.length) {
        return rows;
    }
    const headerRow = rows[0] || [];
    const keepIndices = [];
    headerRow.forEach(function (cell, index) {
        if (parsingNormalizeValue(cell) !== '') {
            keepIndices.push(index);
        }
    });
    if (!keepIndices.length) {
        return rows;
    }
    return rows.map(function (row, rowIndex) {
        const source = row || [];
        const nextRow = keepIndices.map(function (index) {
            return source[index] !== undefined ? source[index] : '';
        });
        if (rowIndex === 0) {
            return keepIndices.map(function (index) {
                return headerRow[index];
            });
        }
        return nextRow;
    });
}

/**
 * @param {Record<string, import('./types.js').V3Row[]>} tableData
 * @param {string} countryCode
 * @param {string} option
 * @returns {{rows: string[][], fileName: string, title: string, errors: string[]}}
 */
function exportBuildExport(tableData, countryCode, option) {
    const errors = [];
    const productId =
        option === 'new' ? '' : exportFindProductId(tableData);
    const fileId = productId ? ' ' + productId : '';

    if (countryCode === 'US') {
        const ingredientRows = exportSerializeTableRows(
            'US_INGREDIENTS',
            tableData.US_INGREDIENTS
        );
        const nutrientRows = exportSerializeTableRows(
            'US_NUTRIENTS',
            tableData.US_NUTRIENTS
        );
        const otherValue = exportGetOtherDescription(tableData.US_OTHER);

        const headerRow = [exportProductIdHeader];
        const dataRow = [productId];
        if (ingredientRows.joined) {
            headerRow.push('PLM1_RAW_MAT_QTY_DRAFT');
            dataRow.push(ingredientRows.joined);
        }
        if (nutrientRows.joined) {
            headerRow.push('PLM1_LDS_NUTRIENT');
            dataRow.push(nutrientRows.joined);
        }
        if (otherValue) {
            headerRow.push('PLM1_INGREDIENT_DRAFT_TEXT');
            dataRow.push(otherValue);
        }

        return {
            rows: [headerRow, dataRow],
            fileName: `Pipeify v3 US${fileId}.xlsx`,
            title: 'Pipeify v3 For PLM_1',
            errors: errors,
        };
    }

    if (countryCode === 'CA') {
        const ingredientRows = exportSerializeTableRows(
            'CA_INGREDIENTS',
            tableData.CA_INGREDIENTS
        );
        const otherValue = exportGetOtherDescription(tableData.CA_OTHER);
        const nutrientHeader = exportCaNutrientHeader + exportLocaleSuffix;
        const headerRow = [exportProductIdHeader];
        const dataRow = [productId];
        if (ingredientRows.rows.length) {
            const nutrientHeaders = Array(ingredientRows.rows.length).fill(
                nutrientHeader
            );
            headerRow.push.apply(headerRow, nutrientHeaders);
            dataRow.push.apply(dataRow, ingredientRows.rows);
        }
        if (otherValue) {
            headerRow.push(exportCaOtherHeader);
            dataRow.push(otherValue);
        }

        return {
            rows: [headerRow, dataRow],
            fileName: `Pipeify v3 CA${fileId}.xlsx`,
            title: 'Pipeify v3 For Salsify',
            errors: errors,
        };
    }

    errors.push('Unsupported country code: ' + countryCode + '.');
    return {
        rows: [],
        fileName: '',
        title: '',
        errors: errors,
    };
}

/**
 * @param {Record<string, import('./types.js').V3Row[]>} tableData
 * @param {string} countryCode
 * @param {string} option
 * @returns {Promise<{ok: boolean, errors?: string[], fileName?: string}>}
 */
export async function exportMapTablesToExport(
    tableData,
    countryCode,
    option
) {
    const exportPayload = exportBuildExport(
        tableData || {},
        countryCode,
        option || 'keep'
    );
    if (exportPayload.errors.length) {
        return {
            ok: false,
            errors: exportPayload.errors,
        };
    }
    const exportRows = exportNormalizeExportRows(exportPayload.rows);
    const xlsx = await xlsxLoad();
    const worksheet = xlsx.utils.aoa_to_sheet(exportRows);
    const workbook = xlsx.utils.book_new();

    workbook.Props = {
        Title: exportPayload.title,
        CreatedDate: new Date(),
        Company: "Nature's Way",
        Comments: '...',
    };

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    xlsx.writeFile(workbook, exportPayload.fileName);

    return {
        ok: true,
        fileName: exportPayload.fileName,
    };
}

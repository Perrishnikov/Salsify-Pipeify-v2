import {
    importUtilsFindVariantRow,
    importUtilsGetColumnValue,
    importUtilsGetColumnValues,
    importUtilsIndexHeaders,
    importUtilsLoadXlsx,
    importUtilsMergeColumnValues,
    importUtilsReadSpreadsheet,
    importUtilsValidateHeaders,
} from './import-utils.js';
import {
    pipeSchemaBuildRowDataList,
    pipeSchemaGetByTableKey,
    pipeSchemaSerializeRow,
    pipeSchemaSerializeRows,
} from './pipe-schema.js';
import { parsingNormalizeValue } from './parsing.js';
import {
    rowsBuildIngredientRows,
    rowsBuildNutrientRows,
    rowsBuildOtherRows,
} from './rows.js';

/** @typedef {import('./types.js').V3ImportResult} V3ImportResult */
/** @typedef {import('./types.js').V3TableDef} V3TableDef */

const mappingAllowedDuplicateHeader = 'LABEL_DATASET_INGREDIENTS_A - en-US';
const mappingProductIdHeader = 'Product ID';
const mappingVariantHeader = 'salsify:data_inheritance_hierarchy_level_id';
const mappingLocaleSuffix = ' - en-US';
const mappingCaNutrientHeader = 'LABEL_DATASET_NUTRIENT_A';
const mappingCaOtherHeader = 'LABEL_DATASET_OTHER_INGREDS_A';

const mappingCountryConfig = {
    US: {
        ingredient: {
            tableKey: 'US_INGREDIENTS',
            sourceHeader: 'PLM1_RAW_MAT_QTY_DRAFT',
        },
        nutrient: {
            tableKey: 'US_NUTRIENTS',
            sourceHeader: 'PLM1_LDS_NUTRIENT',
        },
        other: {
            tableKey: 'US_OTHER',
            sourceHeader: 'PLM1_INGREDIENT_DRAFT_TEXT',
        },
        requiredHeaders: [
            mappingProductIdHeader,
            mappingVariantHeader,
            'PLM1_RAW_MAT_QTY_DRAFT',
            'PLM1_LDS_NUTRIENT',
            'PLM1_INGREDIENT_DRAFT_TEXT',
        ],
        allowedDuplicateHeaders: [],
    },
    CA: {
        ingredient: {
            tableKey: 'CA_INGREDIENTS',
            sourceHeader: mappingAllowedDuplicateHeader,
        },
        other: {
            tableKey: 'CA_OTHER',
            sourceHeader: 'LABEL_DATASET_OTHER_INGREDS_A',
        },
        requiredHeaders: [
            mappingProductIdHeader,
            mappingVariantHeader,
            mappingAllowedDuplicateHeader,
            'LABEL_DATASET_OTHER_INGREDS_A',
        ],
        allowedDuplicateHeaders: [mappingAllowedDuplicateHeader],
    },
};

/**
 * @param {Record<string, import('./types.js').V3Row[]>} tableData
 * @returns {string}
 */
function mappingFindProductId(tableData) {
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
function mappingGetOtherDescription(rows) {
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
function mappingEnsureTrailingDelimiter(value, delimiter) {
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
function mappingSerializeTableRows(tableKey, rows) {
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
        joined = mappingEnsureTrailingDelimiter(
            joined,
            schema.rowDelimiter
        );
    }
    return { rows: serializedRows, joined: joined };
}

/**
 * @param {string[][]} rows
 * @returns {string[][]}
 */
function mappingNormalizeExportRows(rows) {
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
function mappingBuildExport(tableData, countryCode, option) {
    const errors = [];
    const productId =
        option === 'new' ? '' : mappingFindProductId(tableData);
    const fileId = productId ? ' ' + productId : '';

    if (countryCode === 'US') {
        const ingredientRows = mappingSerializeTableRows(
            'US_INGREDIENTS',
            tableData.US_INGREDIENTS
        );
        const nutrientRows = mappingSerializeTableRows(
            'US_NUTRIENTS',
            tableData.US_NUTRIENTS
        );
        const otherValue = mappingGetOtherDescription(
            tableData.US_OTHER
        );

        const headerRow = [mappingProductIdHeader];
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
        const ingredientRows = mappingSerializeTableRows(
            'CA_INGREDIENTS',
            tableData.CA_INGREDIENTS
        );
        const otherValue = mappingGetOtherDescription(
            tableData.CA_OTHER
        );
        const nutrientHeader =
            mappingCaNutrientHeader + mappingLocaleSuffix;
        const headerRow = [mappingProductIdHeader];
        const dataRow = [productId];
        if (ingredientRows.rows.length) {
            const nutrientHeaders = Array(ingredientRows.rows.length).fill(
                nutrientHeader
            );
            headerRow.push.apply(headerRow, nutrientHeaders);
            dataRow.push.apply(dataRow, ingredientRows.rows);
        }
        if (otherValue) {
            headerRow.push(mappingCaOtherHeader);
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
 * @param {V3TableDef[]} tableDefs
 * @param {string} tableKey
 * @returns {V3TableDef|null}
 */
function mappingGetTableDef(tableDefs, tableKey) {
    for (let i = 0; i < tableDefs.length; i += 1) {
        if (tableDefs[i].key === tableKey) {
            return tableDefs[i];
        }
    }
    return null;
}

/**
 * @param {string} fileName
 * @param {string} countryCode
 * @returns {V3ImportResult}
 */
function mappingCreateImportResult(fileName, countryCode) {
    return {
        ok: false,
        fileName: fileName,
        countryCode: countryCode,
        productId: '',
        tableData: {},
        errors: [],
        warnings: [],
    };
}

/**
 * @param {File} file
 * @param {string} countryCode
 * @param {V3TableDef[]} tableDefs
 * @returns {Promise<V3ImportResult>}
 */
export async function mappingMapImportToTables(
    file,
    countryCode,
    tableDefs
) {
    const result = mappingCreateImportResult(file ? file.name : '', countryCode);
    if (!file) {
        result.errors.push('No file selected for import.');
        return result;
    }

    const countryConfig = mappingCountryConfig[countryCode];
    if (!countryConfig) {
        result.errors.push('Unsupported country code: ' + countryCode + '.');
        return result;
    }

    let spreadsheet;
    try {
        spreadsheet = await importUtilsReadSpreadsheet(file);
    } catch (error) {
        result.errors.push(error && error.message ? error.message : 'Unable to read spreadsheet.');
        return result;
    }

    const headerErrors = importUtilsValidateHeaders(
        spreadsheet.headers,
        {
            requiredHeaders: countryConfig.requiredHeaders,
            allowedDuplicateHeaders: countryConfig.allowedDuplicateHeaders,
            productIdHeader: mappingProductIdHeader,
        }
    );
    if (headerErrors.length) {
        result.errors = result.errors.concat(headerErrors);
        return result;
    }

    const headerIndexMap = importUtilsIndexHeaders(spreadsheet.headers);
    const variantResult = importUtilsFindVariantRow(
        spreadsheet.rows,
        headerIndexMap,
        {
            productIdHeader: mappingProductIdHeader,
            variantHeader: mappingVariantHeader,
        }
    );
    if (!variantResult) {
        result.errors.push(
            'No variant row found with a 14 digit Product ID.'
        );
        return result;
    }

    const productId = variantResult.productId;
    const row = variantResult.row;
    result.productId = productId;

    const tableData = {};

    const ingredientTableDef = mappingGetTableDef(
        tableDefs,
        countryConfig.ingredient.tableKey
    );
    if (!ingredientTableDef) {
        result.errors.push('Missing table definition for Ingredients.');
        return result;
    }

    let ingredientValue = '';
    if (countryCode === 'CA') {
        const ingredientValues = importUtilsGetColumnValues(
            row,
            headerIndexMap,
            countryConfig.ingredient.sourceHeader
        );
        ingredientValue = importUtilsMergeColumnValues(ingredientValues, '~');
    } else {
        ingredientValue = importUtilsGetColumnValue(
            row,
            headerIndexMap,
            countryConfig.ingredient.sourceHeader
        );
    }

    const otherTableDef = mappingGetTableDef(
        tableDefs,
        countryConfig.other.tableKey
    );
    if (!otherTableDef) {
        result.errors.push('Missing table definition for Other Ingredients.');
        return result;
    }

    const otherValue = importUtilsGetColumnValue(
        row,
        headerIndexMap,
        countryConfig.other.sourceHeader
    );
    let nutrientTableDef = null;
    let nutrientValue = '';

    if (countryCode === 'US') {
        nutrientTableDef = mappingGetTableDef(
            tableDefs,
            countryConfig.nutrient.tableKey
        );
        if (!nutrientTableDef) {
            result.errors.push('Missing table definition for Nutrients.');
            return result;
        }

        nutrientValue = importUtilsGetColumnValue(
            row,
            headerIndexMap,
            countryConfig.nutrient.sourceHeader
        );
    }

    if (!ingredientValue && !otherValue && !nutrientValue) {
        result.errors.push(
            'No importable data found in non-Product ID columns. Check the country export (US vs CA).'
        );
        return result;
    }

    tableData[countryConfig.ingredient.tableKey] = rowsBuildIngredientRows(
        ingredientTableDef,
        productId,
        ingredientValue,
        { ensureRow: true }
    );

    tableData[countryConfig.other.tableKey] = rowsBuildOtherRows(
        otherTableDef,
        productId,
        otherValue
    );

    if (countryCode === 'US') {
        tableData[countryConfig.nutrient.tableKey] = rowsBuildNutrientRows(
            nutrientTableDef,
            productId,
            nutrientValue,
            { ensureRow: true }
        );
    }

    result.tableData = tableData;
    result.ok = true;
    return result;
}

/**
 * @param {Object} tableData
 * @param {string} countryCode
 * @param {string} option
 * @returns {Object}
 */
export async function mappingMapTablesToExport(
    tableData,
    countryCode,
    option
) {
    const exportPayload = mappingBuildExport(
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
    const exportRows = mappingNormalizeExportRows(exportPayload.rows);
    const xlsx = await importUtilsLoadXlsx();
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

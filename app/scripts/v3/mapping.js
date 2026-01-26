import {
    importUtilsFindVariantRow,
    importUtilsGetColumnValue,
    importUtilsGetColumnValues,
    importUtilsIndexHeaders,
    importUtilsMergeColumnValues,
    importUtilsReadSpreadsheet,
    importUtilsValidateHeaders,
} from './import-utils.js';
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
            mappingAllowedDuplicateHeader,
            'LABEL_DATASET_OTHER_INGREDS_A',
        ],
        allowedDuplicateHeaders: [mappingAllowedDuplicateHeader],
    },
};

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

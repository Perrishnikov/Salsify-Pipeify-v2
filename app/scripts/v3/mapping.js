/**
 * @param {File|null} file
 * @param {string} countryCode
 * @returns {Object}
 */
export function mappingMapImportToTables(file, countryCode) {
    return {
        fileName: file ? file.name : '',
        countryCode: countryCode,
        tables: {},
    };
}

/**
 * @param {Object} tableData
 * @param {string} countryCode
 * @param {string} option
 * @returns {Object}
 */
export function mappingMapTablesToExport(tableData, countryCode, option) {
    return {
        countryCode: countryCode,
        option: option,
        rows: [],
    };
}

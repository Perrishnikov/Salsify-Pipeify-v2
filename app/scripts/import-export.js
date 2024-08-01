/**
 { 
    "LABEL_DATASET_INGREDIENTS_A - en-US": "6|Black Elder (Sambucus nigra L.) Extract (berry) standardized to anthocyanins from 3,200 mg of premium cultivar elderberries per teaspoon|100|mg|||**||"
    "LABEL_DATASET_NUTRIENT_A - en-US": "1|Calories||25| |||"
    "LABEL_DATASET_NUTRIENT_A - en-US_1": "2|Total Carbohydrate||8|g|3|%|†"
    "LABEL_DATASET_NUTRIENT_A - en-US_2": "3|Total Sugars||0|g|**||"
    "LABEL_DATASET_NUTRIENT_A - en-US_3": "4|Includes 0 g Added Sugars||0||||"
    "LABEL_DATASET_NUTRIENT_A - en-US_4": "5|Sugar Alcohol||8|g|**||"    ​​
    LABEL_DATASET_OTHER_INGREDS_A: "sorbitol, purified water, glycerin, natural flavor, preservatives to maintain freshness (citric acid, potassium sorbate"
    PARTCODE: "6971"
    "Product ID": "00033674069714"
    __rowNum__: 1
    "salsify:data_inheritance_hierarchy_level_id": "variant"
    "salsify:parent_id": "6971"
 }
 */

/**
 * Represents a data structure containing various attributes and their values.
 *
 * @typedef {Object} SalsifyObject
 * @property {string} LABEL_DATASET_INGREDIENTS_A - The ingredient data in en-US format.
 * @property {string} LABEL_DATASET_NUTRIENT_A - The nutrient data in en-US format.
 * @property {string} LABEL_DATASET_OTHER_INGREDS_A - The other ingredient data.
 * @property {string} PARTCODE - The part code.
 * @property {string} Product_ID - The product ID.
 */

/**
 * Checks if any object in the array has a key named "Product ID" or "PARTCODE".
 *
 * @param {Array<Object>} data - The array of objects to check.
 * @returns {boolean} - Returns true if any object has a key named "Product ID".
 */
function hasProductId(data) {
    // return data.some((obj) => 'Product ID' | ('PARTCODE' in obj));
    return data.some((obj) => ('Product ID' in obj) | ('PARTCODE' in obj));
}

/**
 * Merges columns in the provided JSON data based on specified prefixes and returns a new array of objects with merged data.
 *
 * This function takes a JSON array of rows (objects) as input, iterates through each row, and combines values in columns
 * that match specified prefixes (e.g., "LABEL_DATASET_INGREDIENTS_A - en-US" and "LABEL_DATASET_NUTRIENT_A - en-US").
 * It then constructs a new array of rows with the merged data, keeping non-merged columns intact.
 *
 * @param {Array<Object>} jsonData - The JSON array of rows (objects) containing data from the Excel file.
 * @returns {Array<Object>} - A new JSON array of rows (objects) with merged data.
 */
function salsify_mergeIngredients(jsonData) {
    // Define the column prefixes you want to merge
    const mergePrefixes = [
        LABEL_DATASET_NUTRIENT_A.id,
        LABEL_DATASET_INGREDIENTS_A.id,
    ];

    // Create an array to hold the new JSON data with merged columns
    const mergedJsonData = jsonData.map((row) => {
        // Create a new object to hold the merged row
        let mergedRow = {};

        // Iterate through the merge prefixes
        mergePrefixes.forEach((prefix) => {
            // Initialize a variable to hold the combined value
            let combinedValue = '';

            // Iterate through the keys in the row to find columns matching the prefix
            Object.keys(row).forEach((key) => {
                if (key.startsWith(prefix)) {
                    // Add the value to the combinedValue with a ~ delimiter if not the first value
                    // console.log(prefix, row[key]);

                    if (combinedValue) {
                        combinedValue += `~${row[key]}`;
                    } else {
                        combinedValue = row[key];
                    }
                }
            });

            // If there's a combined value, add it to the merged row under the prefix key
            if (combinedValue) {
                mergedRow[prefix] = combinedValue;
            }
        });

        // Add all the non-merged keys and values from the original row to the merged row
        Object.keys(row).forEach((key) => {
            // If the key doesn't match any merge prefix, add it to the merged row
            const isMergedPrefix = mergePrefixes.some((prefix) =>
                key.startsWith(prefix)
            );
            if (!isMergedPrefix) {
                mergedRow[key] = row[key];
            }
        });

        return mergedRow;
    });

    return mergedJsonData;
}

/**
 * Preprocesses Salsify data by filtering, cleaning, and merging ingredients.
 * Sets the localStorage
 * @param {Object[]} jsonData - The raw JSON data from Salsify.
 * @param {string} parsingOption - The parsing option for processing.
 * @param {string} tableId - validate | duplicate
 */
function salsify_preprocess(jsonData, parsingOption, tableId) {
    // console.log(jsonData);
    // Filter out parents, keeping only variants. If it has them.
    const varientsOnly = [...jsonData].filter((obj) => {
        // console.log(obj);

        if (
            obj['salsify:data_inheritance_hierarchy_level_id'] &&
            obj['salsify:data_inheritance_hierarchy_level_id'] === 'variant'
        ) {
            // return (
            //     obj['salsify:data_inheritance_hierarchy_level_id'] === 'variant'
            // );
            return obj;
        }
        // comment to allow only varients...
        // else {

        //     return obj;
        // }
        if (
            obj['salsify:data_inheritance_hierarchy_level_id'] &&
            obj['salsify:data_inheritance_hierarchy_level_id'] === 'standalone'
        ) {
            bootToast('Not a Variant', 'danger');
        }
    });

    // Remove properties that start with "salsify:"
    const nonSalsifyPropsOnly = varientsOnly.map((obj) => {
        Object.keys(obj).forEach((key) => {
            // If the key starts with the prefix "salsify:", delete the key and its value from the object
            if (key.startsWith('salsify:')) {
                delete obj[key];
            }
        });
        return obj;
    });

    /** @type {SalsifyObject[]} */
    const mergedJsonData = salsify_mergeIngredients(nonSalsifyPropsOnly);

    // console.log('mergedJsonData', mergedJsonData);

    setLocalStorage(mergedJsonData, tableId);

    //* Done with Salsify processing */
    main_process(parsingOption, tableId);
}

function pipeify_preprocess(jsonData, parsingOption, tableId) {
    /** @type {SalsifyObject[]} */
    const mergedJsonData = salsify_mergeIngredients(jsonData);

    setLocalStorage(mergedJsonData, tableId);

    //* Done with Salsify processing */
    main_process(parsingOption, tableId);
}

/* XLSX Processing */
/**
 * Processes an Excel file.
 * @param {File} file - The Excel file to be processed.
 * @param {string} parsingOption - The parsing option to use.
 * @returns {Promise<string>} - A promise that resolves with the file type.
 */
async function xlsx_import_file(file, parsingOption, tableId) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                const metadata = workbook.Props;

                // console.log('reader.onload');
                // Validate the file type
                if (metadata?.Title === 'Pipeify v2 For Customers') {
                    // Resolve the promise with the fileType
                    reject('FOR CUSTOMER not handled');
                } else if (metadata?.Title === 'Pipeify v2 For Salsify') {
                    bootToast('Import from Pipeify', 'success', 'Success');
                    pipeify_preprocess(jsonData, parsingOption, tableId);
                    // Resolve the promise with the fileType
                    resolve('FROM PIPEIFY');
                } else if (hasProductId(jsonData)) {
                    bootToast(`Import from Salsify`, 'success', 'Success');
                    salsify_preprocess(jsonData, parsingOption, tableId);

                    // Resolve the promise with the fileType
                    resolve('FROM SALSIFY');
                } else {
                    reject(
                        'Spreadsheet must contain Salsify props or be a Pipeify export.'
                    );
                }
            } catch (error) {
                bootToast(error, 'danger');
                //toast is in dom.js
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        // Start reading the file
        reader.readAsArrayBuffer(file);
    });
}

/** EXPORT *************************************************** */
function xlsx_exportWYSIWYG(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    // Function to calculate the width of each column
    const calculateAutoWidths = (data, specificWidths = {}) => {
        const headers = Object.keys(data[0]);
        const maxLengths = headers.map((header) => header.length);

        data.forEach((row) => {
            headers.forEach((header, colIndex) => {
                const value = row[header];
                const contentLength = value ? value.toString().length : 0;
                maxLengths[colIndex] = Math.max(
                    maxLengths[colIndex],
                    contentLength
                );
            });
        });

        return headers.map((header, index) =>
            specificWidths[header]
                ? { wch: specificWidths[header] }
                : { wch: maxLengths[index] + 2 }
        );
    };

    // Set specific widths for columns by header name
    const specificWidths = {
        Description: 50, // Set width for the "Description" column
        // 'Product ID': 25, // Set width for the "Product ID" column
    };

    // Set auto widths for the columns, with specific widths for certain columns
    worksheet['!cols'] = calculateAutoWidths(data, specificWidths);
    const workbook = XLSX.utils.book_new();

    workbook.Props = {
        Title: 'Pipeify v2 For Customers',
        CreatedDate: new Date(),
        Company: "Nature's Way",
        Comments: '...',
    };

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, 'Pipeify (customer export).xlsx');

    bootToast(`File Download`, 'success', 'Success');
}

function xlsx_exportForSalsify(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Return and error if there is no table data
    if (data.length < 1) {
        bootToast(`No Table Data to Export`, 'danger');
        return;
    }

    // Get the keys of the first object to determine the number of columns
    const keys = Object.keys(data[0]);

    const numColumns = keys.length;

    // Define column widths
    const defaultWidth = 15;
    const colWidths = Array(numColumns).fill({ width: defaultWidth });
    worksheet['!cols'] = colWidths;

    // Set auto widths for the columns, with specific widths for certain columns
    // worksheet['!cols'] = calculateAutoWidths(data, specificWidths);
    const workbook = XLSX.utils.book_new();

    //Name the export
    let fileName = 'Pipeify (Salsify multi-item export).xlsx';
    const uniqueProductIds = [...new Set(data.map((obj) => obj['Product ID']))];
    // console.log(uniqueProductIds);
    if (uniqueProductIds.length === 1) {
        fileName = `Pipeify (Salsify ${uniqueProductIds[0]}).xlsx`;
    }

    workbook.Props = {
        Title: 'Pipeify v2 For Salsify',
        CreatedDate: new Date(),
        Company: "Nature's Way",
        Comments: '...',
    };

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, fileName);

    bootToast(`File Download`, 'success', 'Success');
}

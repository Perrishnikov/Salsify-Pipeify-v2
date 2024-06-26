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
 * TODO
 */
function pipeify_preprocess() {
    console.log(`TODO: pipeify_preprocess`);
}

/**
 * Checks if any object in the array has a key named "Product ID".
 *
 * @param {Array<Object>} data - The array of objects to check.
 * @returns {boolean} - Returns true if any object has a key named "Product ID".
 */
function hasProductId(data) {
    return data.some((obj) => 'Product ID' | ('PARTCODE' in obj));
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
 */
function salsify_preprocess(jsonData, parsingOption) {
    // Filter out parents, keeping only variants
    const varientsOnly = [...jsonData].filter(
        (obj) =>
            obj['salsify:data_inheritance_hierarchy_level_id'] === 'variant'
    );

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
    // console.dir(nonSalsifyPropsOnly);

    /** @type {SalsifyObject[]} */
    const mergedJsonData = salsify_mergeIngredients(nonSalsifyPropsOnly);
    // console.log('mergedJsonData', mergedJsonData);

    setLocalStorage(mergedJsonData);

    //* Done with Salsify processing */
    main_process(parsingOption);
}

/* XLSX Processing */
/**
 * Processes an Excel file.
 * @param {File} file - The Excel file to be processed.
 * @param {string} parsingOption - The parsing option to use.
 * @returns {Promise<string>} - A promise that resolves with the file type.
 */
async function xlsx_import_file(file, parsingOption) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                const metadata = workbook.Props;

                // Check if 'Pipeify' is in the title
                const isPipeify =
                    metadata.Title && metadata.Title.includes('Pipeify')
                        ? 'PIPEIFY'
                        : null;

                // Validate the file type
                if (hasProductId(jsonData)) {
                    salsify_preprocess(jsonData, parsingOption);

                    // Resolve the promise with the fileType
                    resolve('SALSIFY');
                } else if (isPipeify) {
                    pipeify_preprocess(jsonData, parsingOption);
                    // Resolve the promise with the fileType
                    resolve('PIPEIFY');
                } else {
                    reject(
                        'Spreadsheet must contain Salsify props or be a Pipeify export.'
                    );
                }
            } catch (error) {
                console.error('Error processing file:', error);
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
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    workbook.Props = {
        Title: 'Pipeify v2 Export',
        CreatedDate: new Date(),
        Company: "Nature's Way",
        Comments: '...',
    };

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, 'Pipeify.xlsx');
}

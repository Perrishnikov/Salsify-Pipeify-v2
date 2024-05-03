/**
 * Creates a workbook from the provided data and returns JSON data and binary string representations.
 * @param {Array<Array<*>>} data - The data to be included in the workbook. Each inner array represents a row of data.
 * @returns {{jsonData: Object[], wbString: string}} An object containing JSON data and a binary string representation of the workbook.
 */
function xlsx_create_workbook(data) {
    // Specify metadata properties
    const props = {
        Title: 'Pipeify Export',
        CreatedDate: new Date(),
        Company: "Nature's Way",
        Comments: '...',
    };

    // Sample data
    // let data = [
    //     ['Name', 'Age', 'City'],
    //     ['John', 30, 'New York'],
    //     ['Alice', 25, 'Los Angeles'],
    //     ['Bob', 35, 'Chicago'],
    // ];

    const workbook = XLSX.utils.book_new();

    // Convert data to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    const numberOfColumns = data[0].length;
    // worksheet['!cols'] = [
    //     { wch: 10 }, // Column A width
    //     { wch: 10 }, // Column B width
    //     { wch: 5 }, // Column C width
    //     { wch: 5 }, // Column C width
    // ];
    // TODO: create option for [line breaks] instead of new rows for data with the same partcode
    let cols = new Array(numberOfColumns).fill({ wch: 15 });

    // set the last column (data) to be wider
    cols[numberOfColumns - 1] = { wch: 30 };

    worksheet['!cols'] = cols;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pipeify');

    // Convert the workbook to a binary string
    const wbString = XLSX.write(workbook, {
        type: 'binary',
        bookType: 'xlsx',
        props: props,
    });

    // Convert data to JSON object
    const jsonDataSheet = XLSX.utils.sheet_to_json(worksheet);

    return { jsonDataSheet, wbString };
}

function create_AoO_sheet(data) {
    // Create a worksheet from the array of objects
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pipeify');

    // Write the workbook to a binary string
    const wbString = XLSX.write(workbook, {
        type: 'binary',
        bookType: 'xlsx',
        props: {
            Title: 'Pipeify v2 Export',
            CreatedDate: new Date(),
            Company: "Nature's Way",
            Comments: '...',
        },
    });

    // Convert worksheet to JSON with headers option
    // The header option specifies how to handle the first row:
    // - 1: Use the first row as headers
    // - 0: Treat the first row as data
    const jsonDataSheet = XLSX.utils.sheet_to_json(worksheet, {
        header: 0, // Try 0 if you are not sure the first row contains headers
        // defval: '', // Default value for missing cells
    });

    // console.log(jsonDataSheet);
    return { jsonDataSheet, wbString };
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

        // Initialize fileType
        let fileType = '';

        reader.onload = async (e) => {
            try {
                // Read the file data
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // Access workbook metadata
                const metadata = workbook.Props; // Alternatively: workbook.props

                console.log({ metadata });
                // Check if 'Pipeify' is in the title
                // const fileType =
                //     metadata.Title && metadata.Title.includes('Pipeify')
                //         ? 'PIPEIFY'
                //         : 'UNKNOWN';

                // Validate the file type
                if (hasProductId(jsonData)) {
                    fileType = 'SALSIFY';
                    salsify_preprocess(jsonData, parsingOption);

                    // Resolve the promise with the file type
                    resolve('SALSIFY');
                } else {
                    // fileType = 'PIPEIFY'; // Assuming the alternative file type is PIPEIFY
                    reject(
                        'Spreadsheet must contain Salsify props or be a Pipeify export.'
                    );
                }

                // Process the file
            } catch (error) {
                // Handle any errors that may occur
                console.error('Error processing file:', error);
                reject(error);
            }
        };

        reader.onerror = (e) => {
            // Handle error event
            console.error('Error reading file:', e);
            reject(e);
        };

        // Start reading the file
        reader.readAsArrayBuffer(file);
    });
}

// Called from parseSalsify
function xlsx_export_current_table(data) {

    // Convert the data to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    workbook.Props = {
        Title: 'Pipeify v2 Export',
        CreatedDate: new Date(),
        Company: 'Nature\'s Way',
        Comments: '...',
    };

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a file
    XLSX.writeFile(workbook, 'Pipeify.xlsx');
}

// Called from parseSalsify
function xlsx_export_for_salsify(data) {
    // Convert the data to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a file
    XLSX.writeFile(workbook, 'output.xlsx');
}

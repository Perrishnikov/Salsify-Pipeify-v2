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

    // worksheet['!cols'] = cols;

    //**************************** */
    // Define an array of objects (AoO)
    // const data = [
    //     { name: 'Alice', age: 30, occupation: 'Engineer' },
    //     { name: 'Bob', age: 28, occupation: 'Designer' },
    // ];

    // Create a worksheet from the array of objects
    // const worksheet = XLSX.utils.json_to_sheet(data);
    //****************************** */

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

/* XLSX Processing */
/**
 * Processes an Excel file.
 * @param {File} file - The Excel file to be processed.
 * @returns {void}
 */
function xlsx_import_file(file, parsingOption) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        salsify_preprocess(jsonData, parsingOption);
    };

    reader.readAsArrayBuffer(file);
}

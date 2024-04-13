function xlsx_export_file(data, checkedRadioButton) {
    // Specify metadata properties
    const props = {
        Title: 'Pipeify Export',
        // Author: 'John Doe',
        CreatedDate: new Date(),
        Company: 'Nature\'s Way',
        Comments: '...',
    };

    // Sample data
    // let data = [
    //     ['Name', 'Age', 'City'],
    //     ['John', 30, 'New York'],
    //     ['Alice', 25, 'Los Angeles'],
    //     ['Bob', 35, 'Chicago'],
    // ];

    let workbook = XLSX.utils.book_new();

    let worksheet = XLSX.utils.aoa_to_sheet(data);

    const numberOfColumns = data[0].length;
    // worksheet['!cols'] = [
    //     { wch: 10 }, // Column A width
    //     { wch: 10 }, // Column B width
    //     { wch: 5 }, // Column C width
    //     { wch: 5 }, // Column C width
    // ];
    let cols = new Array(numberOfColumns).fill({ wch: 15 });

    // set the last column (data) to be wider
    cols[numberOfColumns - 1] = { wch: 30 };
    // console.log(cols);
    worksheet['!cols'] = cols;
    // console.log(worksheet['!cols']);
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a file
    // moved to scripts.js
    // XLSX.writeFile(workbook, 'example.xlsx');
    // Convert the workbook to a binary string
    const wbString = XLSX.write(workbook, { type: 'binary', bookType: 'xlsx', props: props });

    // Store the binary string in localStorage
    localStorage.setItem('workbook', wbString);

    // Convert data to JSON object
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Generate HTML table
    const htmlTable = generateTable(jsonData, checkedRadioButton);

    return htmlTable;
}

/* XLSX Processing */
function xlsx_process_file(file) {
    let reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        parseSalsifyExport(jsonData);
    };

    reader.readAsArrayBuffer(file);
}

/* Function to generate HTML table from JSON data */
function generateTable(data, radioOption = null) {
    const myTable = document.createElement('table');
    myTable.setAttribute('id', 'my-table');

    // Add table header
    const headerRow = document.createElement('tr');
    for (const key in data[0]) {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    }
    myTable.appendChild(headerRow);

    // Add table rows
    data.forEach((item) => {
        const row = document.createElement('tr');
        for (const key in item) {
            const cell = document.createElement('td');
            cell.textContent = item[key];
            row.appendChild(cell);
        }
        myTable.appendChild(row);
    });

    return myTable;
}

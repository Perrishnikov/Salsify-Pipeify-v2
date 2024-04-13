const RAW = 'Raw';
const CLEAN = 'Clean Pipes';
const PARSE = 'Parse Columns';

function formatter(desc, amount, uom, dv, percent, symbol) {
    return `${desc}|${amount}|${uom}|${dv}|${percent}|${symbol}~`;
}

function coalesce(value1, value2) {
    // return 1at value if there is one, else 2nd, or nothing
    let value;

    if (value1) {
        value = value1;
    } else if (value2) value = value2;
    else {
        value = null;
    }
    return value;
}

function stripHTML(string) {
    // 03242 has <sub> tag
    var regex = /(<([^>]+)>)/gi;

    return string.replace(regex, '');
}

function standardTestIsTrue(valueToTest) {
    // if the value is found, return true, else false
    if (
        valueToTest.toLowerCase().includes('calories') |
        valueToTest.toLowerCase().includes('carbohydrate') |
        valueToTest.toLowerCase().includes('total sugars') |
        valueToTest.toLowerCase().includes('total sugar') |
        valueToTest.toLowerCase().includes('added sugars') |
        valueToTest.toLowerCase().includes('added sugar') |
        valueToTest.toLowerCase().includes('dietary') |
        valueToTest.toLowerCase().includes('total fat') |
        valueToTest.toLowerCase().includes('protein') |
        valueToTest.toLowerCase().includes('saturated') |
        valueToTest.toLowerCase().includes('trans fat') |
        valueToTest.toLowerCase().includes('transfat') |
        valueToTest.toLowerCase().includes('cholesteral')
    ) {
        return true;
    } else {
        return false;
    }
}

// Convert UOM's to allowed values = Grams, Micrograms, Milligrams
// const MCG = 'Micrograms';
// const MLG = 'Milligrams';
// const G = 'Grams';

// function convertUomToAllowedValues(uom) {
//     if (uom.toLowerCase() == 'g') {
//         uom = G;
//     } else if (uom.toLowerCase() == 'mcg') {
//         uom = MCG;
//     } else if (uom.toLowerCase() == 'mg') {
//         uom = MLG;
//     } else if ((uom == 'mcg DFE') | (uom == 'mcgDFE')) {
//         // uom = convertDFE(value)
//         uom = MCG;
//     } else if (uom == '') {
//         uom = 'ERROR';
//     } else if (!isNaN(uom)) {
//         uom = 'ERROR';
//     }
//     return uom;
// }

const allowedHeaderKeys = ['PARTCODE', 'Product ID'];

const ING = 'ING';
const NUT = 'NUT';
const OTHER = 'OTHER';

function LABEL_formatter(type, data) {
    let mapp = new Map([
        ['type', type],
        ['data', data],
        ['error', null],
    ]);
    // console.log(mapp);
    return mapp;
}

/**
 * @param {array} data
 * @returns {void}
 */
function parseSalsifyExport(data) {
    // returns only the EA's, no parents
    const varientsOnly = data.filter(
        (obj) =>
            obj['salsify:data_inheritance_hierarchy_level_id'] === 'variant'
    );

    let allowedHeaders = [];
    let disallowedHeaders = [];
    let finale = [];
    //
    varientsOnly.forEach((row_of_data) => {
        // console.log(item);
        // let LABEL_DATASET_NUTRIENT_A = [];
        // let LABEL_DATASET_INGREDIENTS_A = [];
        // let LABEL_DATASET_OTHER_INGREDS_A = [];

        const ALL_INGS = [];

        // populate the allowedHeaders
        for (let key in row_of_data) {
            // each object has 'Product ID'
            // key: 'PARTCODE', value: '10078'

            if (row_of_data.hasOwnProperty(key)) {
                const value = row_of_data[key];
                // console.log(key, ' :', value);
                // Push unique column headers into array AND add nut/ing/other to their respective arrays.
                if (key.startsWith('LABEL_DATASET_NUTRIENT_A')) {
                    // LABEL_DATASET_NUTRIENT_A.push(value);
                    ALL_INGS.push(LABEL_formatter(NUT, value));

                    if (!allowedHeaders.includes('LABEL_DATASET_NUTRIENT_A')) {
                        // allowedHeaders.push('LABEL_DATASET_NUTRIENT_A');
                    }
                } else if (key.startsWith('LABEL_DATASET_INGREDIENTS_A')) {
                    // LABEL_DATASET_INGREDIENTS_A.push(value);
                    ALL_INGS.push(LABEL_formatter(ING, value));
                    if (
                        !allowedHeaders.includes('LABEL_DATASET_INGREDIENTS_A')
                    ) {
                        // allowedHeaders.push('LABEL_DATASET_INGREDIENTS_A');
                    }
                } else if (key.startsWith('LABEL_DATASET_OTHER_INGREDS_A')) {
                    // LABEL_DATASET_OTHER_INGREDS_A.push(value);
                    ALL_INGS.push(LABEL_formatter(OTHER, value));

                    if (
                        !allowedHeaders.includes(
                            'LABEL_DATASET_OTHER_INGREDS_A'
                        )
                    ) {
                        // allowedHeaders.push('LABEL_DATASET_OTHER_INGREDS_A');
                    }
                } else if (
                    allowedHeaderKeys.includes(key) &
                    !allowedHeaders.includes(key)
                ) {
                    // push all allowed headers into allowedHeaders

                    allowedHeaders.push(key);
                } else {
                    disallowedHeaders.push(key);
                }
            }

            // console.log(item[obj]);
        }
        // console.log('headers', allowedHeaders);
        // console.log('disallowed', disallowedHeaders);
        // console.log(LABEL_DATASET_INGREDIENTS_A);
        // console.log(LABEL_DATASET_NUTRIENT_A);
        // console.log(LABEL_DATASET_OTHER_INGREDS_A);

        const concatenatedArray = ALL_INGS.map((sheetRow, index) => {
            let shit = allowedHeaders.map((key) => row_of_data[key]);

            shit.push(sheetRow.get('type'), sheetRow.get('data'));
            // console.log(shit);

            return shit;
        });

        finale.push(...concatenatedArray);
        // console.log('numRowsPerVarient', numRowsPerVarient);

        //TODO: Error objects
        // const cleanNuts = LABEL_DATASET_NUTRIENT_A.map((row) => {
        //     let header = row.split('|');

        //     const shortDesc = header[1].trim();
        //     const longDesc = header[2].trim();
        //     let desc = coalesce(longDesc, shortDesc).trim();
        //     let amount = header[3].trim();
        //     let uom = header[4].trim();
        //     let dv = header[5].trim();
        //     const percent = header[6].trim(); // % or ''
        //     const symbol = header[7].trim(); // † or **
        //     // let definition = header[8].trim()

        //     if (standardTestIsTrue(desc)) {
        //         return;
        //     }
        //     //amount
        //     if (amount === '') {
        //         amount = 'ERROR';
        //     } else if (isNaN(parseInt(amount.replace(/,/g, ''), 10))) {
        //         //should be number
        //         amount = 'ERROR';
        //     }
        //     //uom
        //     if (uom === '') {
        //         uom = 'ERROR';
        //     } else if (!isNaN(parseInt(uom.replace(/,/g, ''), 10))) {
        //         //should NOT be number
        //         uom = 'ERROR';
        //     }
        //     //dv
        //     if (isNaN(parseInt(dv.replace(/[,<]/g, ''), 10))) {
        //         //should be number
        //         dv = 'ERROR';
        //     }

        //     return formatter(desc, amount, uom, dv, percent, symbol);
        // });

        // console.log('cleanNuts', cleanNuts);
        // TODO: Get this to export now....
    });

    allowedHeaders.push(...['TYPE', 'DATA']);
    // console.log(allowedHeaders);
    let grass = [allowedHeaders, ...finale];
    // console.log(...grass);

    const checkedRadioButton = getCheckedRadioButtonId();

    const htmlTable = xlsx_export_file(grass, checkedRadioButton);

    // Get container element to append the table
    const tableContainer = document.getElementById('table-container');
    // Clear any old table
    tableContainer.innerHTML = '';
    tableContainer.appendChild(htmlTable);
}

/* ONCHAGE - RADIO BUTTON LISTENER */
const radioButtonsDiv = document.getElementById('radioButtons');
if (radioButtonsDiv) {
    radioButtonsDiv.addEventListener('change', function (e) {
        const selectedOption = e.target.id;
        console.log(`change table columns to ${selectedOption}`);
    });
}

/* CHECKED - RADIO BUTTON */
function getCheckedRadioButtonId() {
    const radioButtons = document.querySelectorAll(
        'input[name="parsingOptions"]'
    );

    let checkedRadioButton = null;

    radioButtons.forEach((radioButton) => {
        if (radioButton.checked) {
            checkedRadioButton = radioButton;

            return;
        }
    });

    return checkedRadioButton.id;
}

/* DROP BOX LISTENER */
const dropArea = document.getElementById('dropArea');
if (dropArea) {
    // Prevent default behavior (opening file in browser) when dragging over drop area
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    // Handle dropped files
    dropArea.addEventListener('drop', function (e) {
        e.preventDefault();

        // Check if files were dropped
        if (e.dataTransfer) {
            const file = e.dataTransfer.files[0];
            // xlsx.js
            xlsx_process_file(file);
        } else {
            console.log('No files were dropped.');
        }
    });

    // Handle file input change
    dropArea.addEventListener('click', function () {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xls, .xlsx';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            xlsx_process_file(file);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
}

const button_download = document.getElementById('download-btn');

// Add event listener for button press event
button_download.addEventListener('click', (e) => {
    
    // Retrieve the binary string from localStorage
    const retrievedWbString = localStorage.getItem('workbook');

    // Convert the binary string back to a workbook
    const workbook = XLSX.read(retrievedWbString, { type: 'binary' });
    
    const currentDate = new Date();
    const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
    const formattedDate = currentDate.toLocaleDateString('en-GB', options);

    // Write the workbook to a file
    XLSX.writeFile(workbook, `pipeify - ingedients - ${formattedDate}.xlsx`);
});

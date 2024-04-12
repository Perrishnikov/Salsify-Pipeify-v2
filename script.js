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

/**
 * @typedef {object} Row
 * @property {string} id an id
 * @property {string} name
 */

/** @type {Row} */
class Row {
    constructor(id, name=null, type=null, dataForThisType=null) {
        this.id = id;
        this.name = name;
    }
}

const allowedHeaderKeys = ['PARTCODE'];

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

    //
    varientsOnly.forEach((row_of_data) => {
        // console.log(item);
        let LABEL_DATASET_NUTRIENT_A = [];
        let LABEL_DATASET_INGREDIENTS_A = [];
        let LABEL_DATASET_OTHER_INGREDS_A = [];

        let allowedHeaders = [];
        let disallowedHeaders = [];

        // populate the allowedHeaders
        for (let key in row_of_data) {
            // each object has 'Product ID'
            // key: 'PARTCODE', value: '10078'

            if (row_of_data.hasOwnProperty(key)) {
                const value = row_of_data[key];
                // console.log(key, ' :', value);
                // Push unique column headers into array AND add nut/ing/other to their respective arrays.
                if (key.startsWith('LABEL_DATASET_NUTRIENT_A')) {
                    LABEL_DATASET_NUTRIENT_A.push(value);

                    if (!allowedHeaders.includes('LABEL_DATASET_NUTRIENT_A')) {
                        allowedHeaders.push('LABEL_DATASET_NUTRIENT_A');
                    }
                } else if (key.startsWith('LABEL_DATASET_INGREDIENTS_A')) {
                    LABEL_DATASET_INGREDIENTS_A.push(value);

                    if (
                        !allowedHeaders.includes('LABEL_DATASET_INGREDIENTS_A')
                    ) {
                        allowedHeaders.push('LABEL_DATASET_INGREDIENTS_A');
                    }
                } else if (key.startsWith('LABEL_DATASET_OTHER_INGREDS_A')) {
                    LABEL_DATASET_OTHER_INGREDS_A.push(value);

                    if (
                        !allowedHeaders.includes(
                            'LABEL_DATASET_OTHER_INGREDS_A'
                        )
                    ) {
                        allowedHeaders.push('LABEL_DATASET_OTHER_INGREDS_A');
                    }
                } else if (allowedHeaderKeys.includes(key)) {
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

        // let nutsMap = new Map();
        // function logMapElements(value, key) {
        //     console.log(`m[${key}] = ${value}`);
        // }
        // allowedHeaders.forEach((header) => {
        //     nutsMap.set(header, null);
        // });
        // nutsMap.forEach(logMapElements);
        // const concatenatedArray = [
        // // const numRowsPerVarient =
        //     ...LABEL_DATASET_NUTRIENT_A,
        //     ...LABEL_DATASET_INGREDIENTS_A,
        //     ...LABEL_DATASET_OTHER_INGREDS_A
        // ].map(row => {
        //     const row = Row(row_of_data.PARTCODE);
        //     console.log(row);
        // })
        // console.log('numRowsPerVarient', numRowsPerVarient);

        for (let i = 0; i < numRowsPerVarient; i++) {
            
            
        }

        //TODO: Error objects
        const cleanNuts = LABEL_DATASET_NUTRIENT_A.map((row) => {
            let header = row.split('|');

            const shortDesc = header[1].trim();
            const longDesc = header[2].trim();
            let desc = coalesce(longDesc, shortDesc).trim();
            let amount = header[3].trim();
            let uom = header[4].trim();
            let dv = header[5].trim();
            const percent = header[6].trim(); // % or ''
            const symbol = header[7].trim(); // † or **
            // let definition = header[8].trim()

            if (standardTestIsTrue(desc)) {
                return;
            }
            //amount
            if (amount === '') {
                amount = 'ERROR';
            } else if (isNaN(parseInt(amount.replace(/,/g, ''), 10))) {
                //should be number
                amount = 'ERROR';
            }
            //uom
            if (uom === '') {
                uom = 'ERROR';
            } else if (!isNaN(parseInt(uom.replace(/,/g, ''), 10))) {
                //should NOT be number
                uom = 'ERROR';
            }
            //dv
            if (isNaN(parseInt(dv.replace(/[,<]/g, ''), 10))) {
                //should be number
                dv = 'ERROR';
            }

            return formatter(desc, amount, uom, dv, percent, symbol);
        });

        // console.log('cleanNuts', cleanNuts);
        // TODO: Get this to export now....
    });

    // console.log(varientsOnly);
}

// XLSX & DOM Stuff ***************************************************************

function xlsx_export_file() {
    // Sample data
    let data = [
        ['Name', 'Age', 'City'],
        ['John', 30, 'New York'],
        ['Alice', 25, 'Los Angeles'],
        ['Bob', 35, 'Chicago'],
    ];

    let workbook = XLSX.utils.book_new();

    let worksheet = XLSX.utils.aoa_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a file
    XLSX.writeFile(workbook, 'example.xlsx');
}

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
}

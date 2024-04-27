/* ONCHAGE - RADIO BUTTON LISTENER */
const radioButtonsDiv = document.getElementById('radioButtons');
if (radioButtonsDiv) {
    radioButtonsDiv.addEventListener('change', function (e) {
        const selectedOption = e.target.id;

        // TODO: Update xlsx.js Table Format
        console.log(`change table columns to ${selectedOption}`);

        const parsingOption = getCheckedRadioButtonId();
        callIngredientParseOption(parsingOption);
    });
}

/* CHECKED - RADIO BUTTON */
/**
 * Gets the ID of the checked radio button.
 * @returns {string|null} The ID of the checked radio button, or null if none is checked.
 */
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

    return checkedRadioButton ? checkedRadioButton.id : null;
}

/**
 * Set the Parsing options back to option1 whenever a new file is uploaded.
 */
// function setRadioButtonDefault() {
//     const radioButtons = document.querySelectorAll(
//         'input[name="parsingOptions"]'
//     );

//     let checkedRadioButton = null;

//     radioButtons.forEach((radioButton) => {
//         // Check if the radio button's value matches the default value
//         if (radioButton.id === 'option1') {
//             // Set the radio button as checked
//             radioButton.checked = true;
//         }
//     });

//     return checkedRadioButton ? checkedRadioButton.id : null;
// }

/**
 * Appends the imported file name to the DOM element with ID 'fileName'.
 *
 * @param {string} fileName - The name of the imported file.
 */
function dom_append_filename(fileName) {
    const fileNameArea = document.getElementById('fileName');

    fileNameArea.textContent = `Imported File: ${fileName}`;
}

/**
 * Handles file import, appends the file name to the DOM, and initiates file processing.
 *
 * @param {File} file - The file to import and process.
 */
function importFileHandler(file) {
    const fileName = file.name;
    dom_append_filename(fileName);

    const parsingOption = getCheckedRadioButtonId();
    // xlsx.js
    xlsx_import_file(file, parsingOption);
}

/* DROP BOX LISTENER */
const dropArea = document.getElementById('dropArea');
if (dropArea) {
    // Prevent default behavior (opening file in browser) when dragging over drop area
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // Handle dropped files
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();

        // Check if files were dropped
        if (e.dataTransfer) {
            const file = e.dataTransfer.files[0];
            importFileHandler(file);
        } else {
            console.log('No files were dropped.');
        }
    });

    // Handle file input change
    dropArea.addEventListener('click', () => {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xls, .xlsx';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            importFileHandler(file);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
}

const button_download = document.getElementById('download-btn');
if (button_download) {
    button_download.addEventListener('click', (e) => {
        // Retrieve the binary string from localStorage
        const retrievedWbString = localStorage.getItem('workbook');

        // Convert the binary string back to a workbook
        const workbook = XLSX.read(retrievedWbString, { type: 'binary' });

        const currentDate = new Date();
        const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
        const formattedDate = currentDate.toLocaleDateString('en-GB', options);

        // Write the workbook to a file
        XLSX.writeFile(
            workbook,
            `pipeify - ingedients - ${formattedDate}.xlsx`
        );
    });
}

/**
 * Clears localStorage when the button with ID 'clear-localstorage-btn' is pressed.
 */
const clearButton = document.getElementById('clear-localstorage-btn');
// Check if the button exists
if (clearButton) {
    // Add a click event listener to the button
    clearButton.addEventListener('click', () => {
        localStorage.clear();

        // console.log('localStorage cleared');

        const table = document.getElementById('table-container');
        const fileName = document.getElementById('fileName');

        const hasChildren = table.childNodes.length > 0; // Using childNodes
        // or
        // const hasChildren = div.children.length > 0; // Using children

        if (hasChildren) {
            table.innerHTML = '';
            fileName.innerHTML = '';
            showToast(`Local Storage cleared`, 'info');
        }
    });
} else {
    // console.warn('Button with ID "clear-localstorage-btn" not found');
    showToast(`Button with ID "clear-localstorage-btn" not found`, 'error');
}

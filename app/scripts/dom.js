/* ONCHAGE - RADIO BUTTON LISTENER */
const radioButtonsDiv = document.getElementById('radioButtons');
if (radioButtonsDiv) {
    radioButtonsDiv.addEventListener('change', function (e) {
        const selectedOption = e.target.id;

        // TODO: Update xlsx.js Table Format
        console.log(`change table columns to ${selectedOption}`);

        const parsingOption = getCheckedRadioButtonId();
        process_parsing_option(parsingOption);
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
 * Handles the import of the file and updates the DOM.
 *
 * @param {File} file - The file to be imported.
 */
async function dom_importFileHandler(file) {
    const fileName = file.name;

    // Append file name to DOM
    const fileNameArea = document.getElementById('fileName');
    // fileNameArea.textContent = `Imported File: ${fileName}`;

    // Get the parsing option from the DOM
    const parsingOption = getCheckedRadioButtonId();

    // Try to import the file and handle errors
    try {
        // Use await to wait for the promise to resolve and retrieve the file type
        const fileType = await xlsx_import_file(file, parsingOption);

        // Update the DOM with the imported file name and type
        fileNameArea.textContent = `Imported File [${fileType}]: ${fileName}`;

    } catch (error) {

        showToast(`Issue handling file: ${error}`, 'error');

        console.error('Error reading file:', error);
    }
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
            dom_importFileHandler(file);
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
            dom_importFileHandler(file);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
}

const button_current_table = document.getElementById('download-wysiwyg-btn');
if (button_current_table) {
    
    button_current_table.addEventListener('click', (e) => {
        const parsingOption = getCheckedRadioButtonId();
        // Retrieve the binary string from localStorage
        // const retrievedWbString = localStorage.getItem('original_merged');

        // xlsx_export_current_table(retrievedWbString);
        preprocess_export_file(parsingOption);
        // // Convert the binary string back to a workbook
        // const workbook = XLSX.read(retrievedWbString, { type: 'binary' });

        // const currentDate = new Date();
        // const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
        // const formattedDate = currentDate.toLocaleDateString('en-GB', options);

        // // Write the workbook to a file
        // XLSX.writeFile(
        //     workbook,
        //     `pipeify - ingedients - ${formattedDate}.xlsx`
        // );
    });
}

const button_salsify_reimport = document.getElementById(
    'download-for-salsify-btn'
);
if (button_salsify_reimport) {
    button_salsify_reimport.addEventListener('click', (e) => {
        // Retrieve the binary string from localStorage
        // const retrievedWbString = localStorage.getItem('workbook');
        // // Convert the binary string back to a workbook
        // const workbook = XLSX.read(retrievedWbString, { type: 'binary' });
        // const currentDate = new Date();
        // const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
        // const formattedDate = currentDate.toLocaleDateString('en-GB', options);
        // // Write the workbook to a file
        // XLSX.writeFile(
        //     workbook,
        //     `pipeify - ingedients - ${formattedDate}.xlsx`
        // );
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
}

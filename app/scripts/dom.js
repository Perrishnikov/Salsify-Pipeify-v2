// function displayFileName() {
//     const fileInputValidate = document.getElementById('fileInputValidate');
//     const fileNameDiv = document.getElementById('fileName');
//     if (fileInputValidate.files.length > 0) {
//         fileInputValidate.innerText = `Selected file: ${fileInputValidate.files[0].name}`;
//     } else {
//         fileNameDiv.innerText = '';
//     }
// }

/** Tab 2 - Validate and Submit Product ID for New Ingredients */
// document.addEventListener('DOMContentLoaded', function () {
const form = document.querySelector('#newIngredSubmit');
if (form) {
    form.addEventListener('click', function (event) {
        const productIdInput = document.getElementById('product-id');
        const productIdValue = productIdInput.value.trim();

        event.preventDefault(); // Prevent form submission
        const feedbackDiv = document.querySelector('#newIngredFeedbackDiv');

        if (productIdValue.length !== 14 || !productIdValue.startsWith('000')) {
            feedbackDiv.classList.remove('d-none');
        } else {
            //main.js
            // const parsingOption = getCheckedRadioButtonId();
            createNewTable('option4', productIdValue);
            productIdInput.value = '';
            feedbackDiv.classList.add('d-none');

            //enable download button
            document
                .querySelector('#download-new-ing-salsify-btn')
                .removeAttribute('disabled');
            //disable create set button
            document
                .querySelector('#newIngredSubmit')
                .setAttribute('disabled', true);
        }
    });
}

const newSalsify = document.getElementById('download-new-ing-salsify-btn');
if (newSalsify) {
    newSalsify.addEventListener('click', (e) => {
        console.log(`download-for-salsify-btn`);
        console.log(newSalsify.value);
        const parsingOption = getCheckedRadioButtonId();

        const newTable = document.getElementById('new-table');
        process_for_salsify(parsingOption, newTable);
    });
}

const newClearSalsify = document.getElementById('clear-product-id-btn');
if (newClearSalsify) {
    newClearSalsify.addEventListener('click', (e) => {
        console.log(`clear!`);
        // console.log(newSalsify.value);
        // const parsingOption = getCheckedRadioButtonId();

        const newTable = document.getElementById('new-table-container');
        newTable.innerHTML = '';
        // process_for_salsify(parsingOption, newTable);
        document.querySelector('#newIngredSubmit').removeAttribute('disabled');

        document
            .querySelector('#download-new-ing-salsify-btn')
            .setAttribute('disabled', true);

        document.querySelector('#newIngredFeedbackDiv').classList.add('d-none');
    });
}

/* Tab 1 - ONCHAGE - RADIO BUTTON LISTENER */
const radioButtonsDiv = document.getElementById('radioButtons');
if (radioButtonsDiv) {
    radioButtonsDiv.addEventListener('change', (e) => {
        const selectedOption = e.target.id;

        // console.log(`change table columns to ${selectedOption}`);
        const dwnbtn = document.getElementById('download-for-salsify-btn');
        const custbtn = document.getElementById('download-wysiwyg-btn');
        const parsingOption = getCheckedRadioButtonId();

        if (getLocalStorage()) {
            custbtn.disabled = false;

            if (parsingOption === 'option4') {
                dwnbtn.disabled = false;
            } else {
                dwnbtn.disabled = true;
            }
        } else {
            custbtn.disabled = true;
            dwnbtn.disabled = true;
        }

        main_process(parsingOption);
    });
}

/* Tab 1 - CHECKED - RADIO BUTTON */
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
async function dom_importFileHandler(file, parsingOption) {
    const fileName = file.name;

    // Append file name to DOM
    const fileNameArea = document.getElementById('fileName');
    // fileNameArea.textContent = `Imported File: ${fileName}`;

    // Get the parsing option from the DOM
    // const parsingOption = getCheckedRadioButtonId();

    // Try to import the file and handle errors
    try {
        // Use await to wait for the promise to resolve and retrieve the file type
        const fileType = await xlsx_import_file(file, parsingOption);

        // Update the DOM with the imported file name and type
        fileNameArea.textContent = `Imported File [${fileType}]: ${fileName}`;
    } catch (error) {
        bootToast(error, 'danger', 'Unable to Import File');

        clearLocalStorageAndTable();

        console.error('Issue handling file"', error);
    }
}

/* Tab1 - DROP BOX LISTENER */
const validateDropArea = document.querySelector('#validateDropArea');
if (validateDropArea) {
    const parsingOption = getCheckedRadioButtonId();
    // Prevent default behavior (opening file in browser) when dragging over drop area
    validateDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // Handle dropped files
    validateDropArea.addEventListener('drop', (e) => {
        e.preventDefault();

        // Check if files were dropped
        if (e.dataTransfer) {
            const file = e.dataTransfer.files[0];
            dom_importFileHandler(file, parsingOption);
        } else {
            console.log('No files were dropped.');
        }
    });

    // Handle file input change
    validateDropArea.addEventListener('click', () => {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xls, .xlsx';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            dom_importFileHandler(file, parsingOption);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
}

/* Tab3 - Duplicate */
//! do it here
const duplicateDropArea = document.querySelector('#duplicateDropArea');
if (duplicateDropArea) {
    const parsingOption = getCheckedRadioButtonId();
    // Prevent default behavior (opening file in browser) when dragging over drop area
    duplicateDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // Handle dropped files
    duplicateDropArea.addEventListener('drop', (e) => {
        e.preventDefault();

        // Check if files were dropped
        if (e.dataTransfer) {
            const file = e.dataTransfer.files[0];
            dom_importFileHandler(file, 'option4');
        } else {
            console.log('No files were dropped.');
        }
    });

    // Handle file input change
    duplicateDropArea.addEventListener('click', () => {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xls, .xlsx';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            dom_importFileHandler(file, 'option4');
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
}

/** Export WSYWIG File */
const button_current_table = document.getElementById('download-wysiwyg-btn');
if (button_current_table) {
    button_current_table.addEventListener('click', (e) => {
        const parsingOption = getCheckedRadioButtonId();

        process_wysiwyg_export(parsingOption);
    });
}

/** Export Tab1 for Salsify file */
const button_salsify_reimport = document.getElementById(
    'download-for-salsify-btn'
);
if (button_salsify_reimport) {
    button_salsify_reimport.addEventListener('click', (e) => {
        // console.log(`download-for-salsify-btn`);
        const parsingOption = getCheckedRadioButtonId();

        const myTable = document.getElementById('my-table');
        process_for_salsify(parsingOption, myTable);
    });
}

function clearLocalStorageAndTable() {
    localStorage.clear();

    // console.log('localStorage cleared');

    const table = document.getElementById('validate-table-container');
    const fileName = document.getElementById('fileName');

    const hasChildren = table.childNodes.length > 0;

    //Clear the table
    if (hasChildren) {
        table.innerHTML = '';
        fileName.innerHTML = '';
        bootToast(`Local Storage cleared`, 'info');

        // Disable download buttons
        const dwnbtn = document.getElementById('download-for-salsify-btn');
        const custbtn = document.getElementById('download-wysiwyg-btn');
        custbtn.disabled = true;
        dwnbtn.disabled = true;
    }
}

/** Clear Button */
const clearButton = document.getElementById('clear-localstorage-btn');
if (clearButton) {
    clearButton.addEventListener('click', () => {
        clearLocalStorageAndTable();
    });
}

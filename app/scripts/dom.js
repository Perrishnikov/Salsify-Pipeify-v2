
const duplicateProductIdForm = document.querySelector(
    '#download-duplicate-salsify-btn'
);
if (duplicateProductIdForm) {

    duplicateProductIdForm.addEventListener('click', function (event) {
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

/** Tab 2 - Validate and Submit Product ID for New Ingredients */
// document.addEventListener('DOMContentLoaded', function () {
const newProductIdForm = document.querySelector('#newIngredSubmit');
if (newProductIdForm) {
    newProductIdForm.addEventListener('click', function (event) {
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

// NEW
const newSalsify = document.getElementById('download-new-ing-salsify-btn');
if (newSalsify) {
    newSalsify.addEventListener('click', (e) => {
        

        const parsingOption = getCheckedRadioButtonId();

        //
        const newTable = document.getElementById('table-new');
        process_for_salsify(parsingOption, newTable);
    });
}
//NEW
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
        const dwnbtn = document.getElementById('download-validate-salsify-btn');
        const custbtn = document.getElementById('download-validate-customer-btn');
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
async function dom_importFileHandler(file, tableId) {
    // Get the parsing option from the DOM
    let parsingOption;
    if (tableId === 'validate') {
        parsingOption = getCheckedRadioButtonId();
    } else if (tableId === 'duplicate') {
        parsingOption = 'option4';
    } else {
        console.error('tableId not found');
    }

    // Try to import the file and handle errors
    try {
        const fileName = file.name;

        // Append file name to DOM
        const fileNameArea = document.getElementById(`${tableId}-fileName`);
        // Use await to wait for the promise to resolve and retrieve the file type
        const fileType = await xlsx_import_file(file, parsingOption, tableId);

        // Update the DOM with the imported file name and type
        fileNameArea.textContent = `Imported File [${fileType}]: ${fileName}`;
    } catch (error) {
        bootToast(error, 'danger', 'Unable to Import File');

        clearLocalStorageAndTable();

        console.error('Issue handling file"', error);
    }
}

//! Do it here
/* DROP BOX LISTENERS */
const dropAreas = document.querySelectorAll('.drop-area').forEach((element) => {
    element.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary for the drop event to be triggered
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault(); // Necessary for the drop event to be triggered

        const closestDropArea = e.target.closest('.drop-area').id;
        if (closestDropArea) {

            const tableId = closestDropArea.split('-')[0];
            // Check if files were dropped
            if (e.dataTransfer) {
                const file = e.dataTransfer.files[0];
                dom_importFileHandler(file, tableId);
            } else {
                console.log('No files were dropped.');
            }
        }
    });

    // Handle file input change
    element.addEventListener('click', (e) => {
        const closestDropArea = e.target.closest('.drop-area').id;
        if (closestDropArea) {
            const tableId = closestDropArea.split('-')[0];

            let fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.xls, .xlsx';
            fileInput.style.display = 'none';

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                dom_importFileHandler(file, tableId);
            });

            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        }
    });
});

/** Export WSYWIG File */
const button_current_table = document.getElementById('download-validate-customer-btn');
if (button_current_table) {
    button_current_table.addEventListener('click', (e) => {
        const parsingOption = getCheckedRadioButtonId();

        process_wysiwyg_export(parsingOption);
    });
}

/** Export Tab1 for Salsify file */
const button_salsify_reimport = document.getElementById(
    'download-validate-salsify-btn'
);
if (button_salsify_reimport) {
    button_salsify_reimport.addEventListener('click', (e) => {
        const parsingOption = getCheckedRadioButtonId();

        const myTable = document.getElementById('table-validate');
        process_for_salsify(parsingOption, myTable);
    });
}

//TODO: clear all tables and filenames .forEach()
//TODO: Create new is handling itself. This needs to clear local storage for both tables
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
        const custbtn = document.getElementById('download-validate-customer-btn');
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

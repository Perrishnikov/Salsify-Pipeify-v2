const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

/** Tab1 - VALIDATE ********************************************************* */
/** Tab1 - Radio Change */
document.getElementById('radioButtons').addEventListener('change', (e) => {
    const selectedOption = e.target.id;
    const validate = 'validate';

    // console.log(`change table columns to ${selectedOption}`);
    const dwnbtn = document.getElementById('download-validate-salsify-btn');
    const custbtn = document.getElementById('download-validate-customer-btn');
    const parsingOption = getCheckedRadioButtonId();

    // console.log(getLocalStorage('validate'));
    // console.log(getLocalStorage());
    if (getLocalStorage(validate)) {
        custbtn.disabled = false;

        if (parsingOption === 'option4') {
            dwnbtn.disabled = false;
        } else {
            dwnbtn.disabled = true;
        }

        main_process(parsingOption, validate, null);
    } else {
        custbtn.disabled = true;
        dwnbtn.disabled = true;
    }
});

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

/** Tab1 - Button - Dowload Customer */
document
    .getElementById('download-validate-customer-btn')
    .addEventListener('click', (e) => {
        const parsingOption = getCheckedRadioButtonId();

        process_wysiwyg_export(parsingOption);
    });

/** Tab1 - Button - Dowload Salsify */
document
    .getElementById('download-validate-salsify-btn')
    .addEventListener('click', (e) => {
        const parsingOption = getCheckedRadioButtonId();

        const myTable = document.getElementById('table-validate');
        process_for_salsify(parsingOption, myTable);
    });

/** Tab2 - NEW ************************************************************** */
/** Tab2 - Button - Download Salsify */
document
    .getElementById('download-newIng-salsify-btn')
    .addEventListener('click', (e) => {
        const parsingOption = getCheckedRadioButtonId();

        //
        const newTable = document.getElementById('table-newIng');
        process_for_salsify(parsingOption, newTable);
    });

/** Tab2 - Button - Create */
document
    .querySelector('#newIng-submit-btn')
    .addEventListener('click', function (event) {
        const productIdInput = document.getElementById('input-newIng');
        const productIdValue = productIdInput.value.trim();

        event.preventDefault(); // Prevent form submission
        const feedbackDiv = document.querySelector('#newIng-feedback');

        if (productIdValue.length !== 14 || !productIdValue.startsWith('00')) {
            feedbackDiv.classList.remove('d-none');
        } else {
            //main.js
            createNewTable('option4', productIdValue);

            productIdInput.value = '';
            feedbackDiv.classList.add('d-none');

            //enable download button
            document
                .querySelector('#download-newIng-salsify-btn')
                .removeAttribute('disabled');
        }
    });

/** Tab3 - DUPLICATE ******************************************************** */
/** Tab3 - Button - Replace */
document
    .querySelector('#duplicate-submit-btn')
    .addEventListener('click', function (event) {
        const productIdInput = document.getElementById('input-duplicate');
        const productIdValue = productIdInput.value.trim();

        event.preventDefault(); // Prevent form submission
        const feedbackDiv = document.querySelector('#duplicate-feedback');

        if (productIdValue.length !== 14 || !productIdValue.startsWith('000')) {
            feedbackDiv.classList.remove('d-none');
        } else {
            const tableId = event.target.id.split('-')[0];

            const table = document.getElementById(`table-${tableId}`);
            if (table) {
                const success = replaceProductId(productIdValue, table);

                if (success) {
                    productIdInput.value = '';
                    feedbackDiv.classList.add('d-none');
                    const dwnbtn = document.getElementById(
                        'download-duplicate-salsify-btn'
                    );
                    dwnbtn.disabled = false;

                    // set flag for focusIn
                    localStorage.setItem('isProductIdReplaced', true);
                }
            } else {
                bootToast(`No data found for "${tableId}"`, 'danger');
            }
        }
    });

/** Tab3 - Button - Download Salsify */
document
    .querySelector('#download-duplicate-salsify-btn')
    .addEventListener('click', () => {
        const newTable = document.getElementById('table-duplicate');

        process_for_salsify('option4', newTable);
    });

const autoOrderButtons = document
    .querySelectorAll('button[id*="autoOrder"]')
    .forEach((element) => {
        element.addEventListener('click', (e) => {
            const id = e.target.id.split('-')[0];
            // console.log({ id });
            renumberOrderCells(`table-${id}`);
        });
    });

/** Tab4 - 1 Liners */
document
    .querySelector('#copy-edit-salsify-btn')
    .addEventListener('click', () => {
        const newTable = document.getElementById('table-edit');

        pipeifyEditForSalsify(newTable);
    });



/** Misc ******************************************************************** */
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
        // Use await to wait for the promise to resolve and retrieve the file type

        const fileType = await xlsx_import_file(file, parsingOption, tableId);

        if (tableId === 'validate') {
            const fileName = file.name;

            // Append file name to DOM
            const fileNameArea = document.getElementById(`${tableId}-fileName`);
            fileNameArea.textContent = `[${fileType}]: "${fileName}"`;
        }

        // Update the DOM with the imported file name and type
        // console.log('success dom_importFileHandler');
    } catch (error) {
        bootToast(error, 'danger', 'Unable to Import File');

        clearDomTable(tableId);

        console.error('Issue handling file"', error);
    }
}

/* All DROP BOX LISTENERS */
document.querySelectorAll('.drop-area').forEach((element) => {
    element.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary for the drop event to be triggered
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault(); // Necessary for the drop event to be triggered

        const closestDropArea = e.target.closest('.drop-area').id;
        if (closestDropArea) {
            const tableId = closestDropArea.split('-')[0];

            clearDomTable(tableId);
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

            clearDomTable(tableId);

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

/**
 * Clears local storage and the specified table.
 *
 * @param {string} tableId - The ID of the table to clear.
 */
function clearDomTable(tableId) {
    console.log('clearDomTable:', tableId);
    const table = document.getElementById(`${tableId}-table-container`);
    // const fileName = document.getElementById(`${tableId}-fileName`);

    const hasChildren = table.childNodes.length > 0;

    // Clear the table
    if (hasChildren) {
        // Disable current download buttons
        const dwnbtn = document.getElementById(
            `download-${tableId}-salsify-btn`
        );
        if (dwnbtn) {
            dwnbtn.disabled = true;
        }

        //disable download customer from validate
        const custbtn = document.getElementById(
            'download-validate-customer-btn'
        );
        if (custbtn) {
            custbtn.disabled = true;
        }
        //disable the replace product ID button if duplicate
        if (tableId === 'duplicate') {
            const duplicateBtn = document.getElementById(
                'duplicate-submit-btn'
            );
            duplicateBtn.disabled = true;

            //clear the flag for focusIn
            localStorage.removeItem('isProductIdReplaced');
        }
    }

    if (table) {
        table.innerHTML = '';
    }
}
function clearLocalStorage(tableId) {
    if (getLocalStorage(tableId)) {
        localStorage.removeItem(tableId);
        bootToast(`Local Storage cleared for "${tableId}"`, 'info');
    }
}

function clearFileName(tableId) {
    const fileNameDiv = document.getElementById(`${tableId}-fileName`);
    if (fileNameDiv) {
        fileNameDiv.innerHTML = '';
    }
    // Remove feedback message from duplicate and newIng
    const feedbackDiv = document.querySelector(`#${tableId}-feedback`);
    if (feedbackDiv) {
        feedbackDiv.classList.add('d-none');
    }
}

function clearInput(tableId) {
    const input = document.getElementById(`input-${tableId}`);
    if (input) {
        input.value = '';
    }
}
/** Clear Buttons */
document.getElementById('clear-validate-btn').addEventListener('click', (e) => {
    const split = e.target.id.split('-')[1];
    // console.log(split);
    clearDomTable(split);
    clearLocalStorage(split);
    clearFileName(split);
});

document
    .getElementById('clear-duplicate-btn')
    .addEventListener('click', (e) => {
        const split = e.target.id.split('-')[1];
        clearDomTable(split);
        clearLocalStorage(split);
        clearFileName(split);
        clearInput(split);
    });

document.getElementById('clear-newIng-btn').addEventListener('click', (e) => {
    const split = e.target.id.split('-')[1];
    clearDomTable(split);
    clearLocalStorage(split);
    clearFileName(split);
    clearInput(split);
});

document.getElementById('clear-edit-btn').addEventListener('click', (e) => {
    const split = e.target.id.split('-')[1];
    clearDomTable(split);
    clearLocalStorage(split);
    clearFileName(split);
    clearInput(split);
    // Update pipeify button text
    const pipeifyButton = document.querySelector('#copy-edit-salsify-btn');
    if (pipeifyButton) {
        pipeifyButton.textContent = `Pipeify`;
    }
});

/* Handle paste */
const editPasteArea = document.getElementById('edit-PasteArea');

editPasteArea.addEventListener('click', async () => {
    try {
        const pasteData = await navigator.clipboard.readText();
        console.log('Pasted text:', pasteData);
        if(!pasteData){
            bootToast(`Unable to read clipboard`, 'danger')
        }
        const validatedText = await validatePaste(pasteData);
        // make a row
        // if(validatedText){
        createMiniTableForEdit(validatedText);
        // }
    } catch (err) {
        console.error('Failed to read clipboard contents:', err);
    }
});

async function validatePaste(text) {
    return new Promise((resolve, reject) => {
        const maxLength = 1000;
        const minLength = 8;

        if (!text || text.length > maxLength || text.length < minLength) {
            bootToast(
                `Unable to handle pasted text. Out of range: ${text.length}`,
                'danger'
            );
            // return null;
            reject('Unable to handle pasted text');
        }

        const count = text.split('|').length;

        if (count !== 9 && count !== 8) {
            //8 for nutrients, 9 for ingredients
            bootToast(
                `Pasted data doesn't appear to be Nutrient or Ingredient. Pipe count = ${count}`,
                'danger'
            );
            reject('Not Ingredient or Nutrient');
        }

        resolve(text);
    });
}

/**
 * Handles the paste event to insert plain text into the focused element.
 * 
 * @param {ClipboardEvent} e - The paste event.
 * @returns {Promise<void>}
 */
document.addEventListener('paste', async (e) => {
    e.preventDefault(); // Prevent the default paste action

    try {
        // Get the text from the clipboard
        const text = await navigator.clipboard.readText();
        console.log('Pasted text:', text);

        // Determine the focused element
        const focusedElement = document.activeElement;

        // Check if the focused element is editable or an input
        if (
            focusedElement &&
            (focusedElement.isContentEditable ||
                focusedElement.tagName === 'TEXTAREA' ||
                focusedElement.tagName === 'INPUT')
        ) {
            // Set the text in the focused element
            if (focusedElement.isContentEditable) {
                focusedElement.textContent = text; // For contenteditable
            } else if (
                focusedElement.tagName === 'TEXTAREA' ||
                focusedElement.tagName === 'INPUT'
            ) {
                focusedElement.value = text; // For textarea/input
            }
        } else {
            console.warn('Focused element is not editable');
        }
    } catch (err) {
        console.error('Failed to read clipboard contents:', err);
    }
});
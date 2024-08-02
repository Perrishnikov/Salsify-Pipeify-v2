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

        main_process(parsingOption, validate);
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
                .querySelector('#download-newIng-salsify-btn')
                .removeAttribute('disabled');
            //disable create set button
            // document
            //     .querySelector('#newIng-submit-btn')
            //     .setAttribute('disabled', true);
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
            //! no- import validate table
            const tableId = event.target.id.split('-')[0];
            // createNewTable('option4', productIdValue);
            // console.log(tableId);
            if (getLocalStorage(tableId)) {
                const dwnbtn = document.getElementById(
                    'download-duplicate-salsify-btn'
                );
                replaceProductId(productIdValue, tableId);

                // undisable Download For Salsify button
                productIdInput.value = '';
                feedbackDiv.classList.add('d-none');
                dwnbtn.disabled = false;
            }

        }
    });

/** Tab3 - Button - Download Salsify */
document
    .querySelector('#download-duplicate-salsify-btn')
    .addEventListener('click', function (event) {
        const parsingOption = getCheckedRadioButtonId();

        const newTable = document.getElementById('table-duplicate');
        process_for_salsify('option4', newTable);
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
        const fileName = file.name;

        // Append file name to DOM
        const fileNameArea = document.getElementById(`${tableId}-fileName`);
        // Use await to wait for the promise to resolve and retrieve the file type
        const fileType = await xlsx_import_file(file, parsingOption, tableId);

        // Update the DOM with the imported file name and type
        fileNameArea.textContent = `Imported File [${fileType}]: ${fileName}`;
    } catch (error) {
        bootToast(error, 'danger', 'Unable to Import File');

        clearLocalStorageAndTable(tableId);

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

/**
 * Clears local storage and the specified table.
 *
 * @param {string} tableId - The ID of the table to clear.
 */
function clearLocalStorageAndTable(tableId) {
    localStorage.removeItem(tableId);
    bootToast(`Local Storage cleared for "${tableId}"`, 'info');

    const table = document.getElementById(`${tableId}-table-container`);
    const fileName = document.getElementById(`${tableId}-fileName`);

    const hasChildren = table.childNodes.length > 0;

    // Clear the table
    if (hasChildren) {
        table.innerHTML = '';
        if (fileName) {
            fileName.innerHTML = '';
        }

        // Remove feedback message from duplicate and newIng
        const feedbackDiv = document.querySelector(`#${tableId}-feedback`);
        if (feedbackDiv) {
            feedbackDiv.classList.add('d-none');
        }

        // Disable current download buttons
        const dwnbtn = document.getElementById(
            `download-${tableId}-salsify-btn`
        );
        dwnbtn.disabled = true;

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
        }
    }
}

/** Clear Buttons */
document.getElementById('clear-validate-btn').addEventListener('click', () => {
    clearLocalStorageAndTable('validate');
});

document.getElementById('clear-duplicate-btn').addEventListener('click', () => {
    clearLocalStorageAndTable('duplicate');
});

document.getElementById('clear-newIng-btn').addEventListener('click', () => {
    clearLocalStorageAndTable('newIng');
});

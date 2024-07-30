function displayFileName() {
    const fileInput = document.getElementById('fileInput');
    const fileNameDiv = document.getElementById('fileName');
    if (fileInput.files.length > 0) {
        fileNameDiv.innerText = `Selected file: ${fileInput.files[0].name}`;
    } else {
        fileNameDiv.innerText = '';
    }
}

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
            // bootToast(
            //     `Product ID must be 14 digits long and start with "000".`,
            //     'warning'
            // );
            // alert('Product ID must be 14 digits long and start with "000".');
            // event.preventDefault(); // Prevent form submission
            // const input = this.querySelector('#product-id');

            feedbackDiv.classList.remove('d-none');
            // input.classList.add('is-invalid');
        } else {
            //main.js

            const parsingOption = getCheckedRadioButtonId();
            createNewTable('option4', productIdValue);
            productIdInput.value = '';
            feedbackDiv.classList.add('d-none');
        }
    });
}
// document
//     .querySelector('form.needs-validation')
//     .addEventListener('submit', function (event) {
//         const input = this.querySelector('#product-id');
//         const feedbackDiv = this.querySelector('#newIngredFeedbackDiv');

//         const productIdInput = document.getElementById('product-id');
//         const productIdValue = productIdInput.value.trim();
//         event.preventDefault();
//         event.stopPropagation();

//         // if (!this.checkValidity()) {
//         if (productIdValue.length !== 14 || !productIdValue.startsWith('000')) {
//             // Show feedback and mark input as invalid
//             feedbackDiv.classList.remove('d-none');
//             input.classList.add('is-invalid');
//         } else {
//             // Hide feedback and remove invalid class
//             feedbackDiv.classList.add('d-none');
//             input.classList.remove('is-invalid');

//             const parsingOption = getCheckedRadioButtonId();
//             createNewTable('option4', productIdValue);
//             productIdInput.value = '';
//         }
//             feedbackDiv.classList.add('d-none');
//             input.classList.remove('is-invalid');
//         this.classList.add('was-validated');
//     });

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
        bootToast(error, 'danger', 'Unable to Import File');

        clearLocalStorageAndTable();

        console.error('Issue handling file"', error);
    }
}

/* Tab1 - DROP BOX LISTENER */
const dropArea = document.querySelector('#dropArea');
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

    const table = document.getElementById('table-container');
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

// TODO: Bootstrap Modal
/* Tab1 - HELP Modal */
const modal = document.getElementById('helpModal');

// Get the button that opens the modal
const helpBtn = document.getElementById('helpBtn');

// Get the <span> element that closes the modal
const span = document.getElementsByClassName('close')[0];

// When the user clicks the button, open the modal

helpBtn.onclick = function () {
    modal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
// window.onclick = function (event) {
//     if (event.target == modal) {
//         modal.style.display = 'none';
//     }
// }

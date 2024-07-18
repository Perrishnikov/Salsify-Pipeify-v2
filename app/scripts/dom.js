// Tabs
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    document.getElementById(tabName).style.display = 'flex';
    evt.currentTarget.className += ' active';
}

/* ONCHAGE - RADIO BUTTON LISTENER */
const radioButtonsDiv = document.getElementById('radioButtons');
if (radioButtonsDiv) {
    radioButtonsDiv.addEventListener('change', function (e) {
        const selectedOption = e.target.id;

        // console.log(`change table columns to ${selectedOption}`);
        const dwnbtn = document.getElementById('download-for-salsify-btn');

        const parsingOption = getCheckedRadioButtonId();

        if (parsingOption === 'option4') {
            dwnbtn.disabled = false;
        } else {
            dwnbtn.disabled = true;
        }

        main_process(parsingOption);
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

        clearLocalStorageAndTable();

        console.error('Issue handling file"', error);
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

/** Export WSYWIG File */
const button_current_table = document.getElementById('download-wysiwyg-btn');
if (button_current_table) {
    button_current_table.addEventListener('click', (e) => {
        const parsingOption = getCheckedRadioButtonId();

        process_wysiwyg_export(parsingOption);
    });
}

/** Export for Salsify file */
const button_salsify_reimport = document.getElementById(
    'download-for-salsify-btn'
);
if (button_salsify_reimport) {
    button_salsify_reimport.addEventListener('click', (e) => {
        // console.log(`download-for-salsify-btn`);
        const parsingOption = getCheckedRadioButtonId();

        process_for_salsify(parsingOption);
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
        showToast(`Local Storage cleared`, 'info');
    }
}

/** Clear Button */
const clearButton = document.getElementById('clear-localstorage-btn');
if (clearButton) {
    clearButton.addEventListener('click', () => {
        clearLocalStorageAndTable();
    });
}

// Get the modal
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
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

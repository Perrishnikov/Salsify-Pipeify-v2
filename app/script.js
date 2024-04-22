/* ONCHAGE - RADIO BUTTON LISTENER */
const radioButtonsDiv = document.getElementById('radioButtons');
if (radioButtonsDiv) {
    radioButtonsDiv.addEventListener('change', function (e) {
        const selectedOption = e.target.id;

        // TODO: Update xlsx.js Table Format
        console.log(`change table columns to ${selectedOption}`);
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
 * @returns 
 */
function setRadioButtonDefault() {
    const radioButtons = document.querySelectorAll(
        'input[name="parsingOptions"]'
    );

    let checkedRadioButton = null;

    radioButtons.forEach((radioButton) => {
        // Check if the radio button's value matches the default value
        if (radioButton.id === 'option1') {
            // Set the radio button as checked
            radioButton.checked = true;
        }
    });

    return checkedRadioButton ? checkedRadioButton.id : null;
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
            setRadioButtonDefault();
            const parsingOption = getCheckedRadioButtonId();
            
            const file = e.dataTransfer.files[0];
            // xlsx.js
            xlsx_import_file(file, parsingOption);
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
            setRadioButtonDefault();
            const file = e.target.files[0];
            // xlsx.js
            xlsx_import_file(file);
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

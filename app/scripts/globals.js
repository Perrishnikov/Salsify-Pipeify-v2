/**
 * Represents a data cell with specified properties.
 * @class
 */
class Header {
    /**
     * Constructs a new instance of `CellData`.
     * @param {Object} params - The parameters for the `CellData` instance.
     * @param {string} params.id - The ID of the cell.
     * @param {string} params.name - The name of the cell.
     * @param {string} params.type - The type of the cell.
     * @param {number} [params.index] - The index of the cell (optional).
     * @param {any} [params.value=null] - The value of the cell (optional, defaults to `null`).
     */
    constructor({ id, name }) {
        this.id = id;
        this.name = name;
    }
}

class Status {
    constructor() {
        this.hasMessages = false; // Indicates if there are any errors
        this.errors = []; // Array to hold error messages
        this.warnings = []; // Array to hold warning messages
        this.info = []; // Array to hold informational messages
    }

    // Adds an error message and sets hasMessages to true
    addError(message) {
        this.errors.push(message);
        this.hasMessages = true;
    }

    // Adds a warning message
    addWarning(message) {
        this.warnings.push(message);
        this.hasMessages = true;
    }

    // Adds an informational message
    addInfo(message) {
        this.info.push(message);
        this.hasMessages = true;
    }

    // Clears all error messages and resets hasMessages
    clearErrors() {
        this.errors = [];
        this.hasMessages = false;
    }

    // Clears all warning messages
    clearWarnings() {
        this.warnings = [];
        this.hasMessages = false;
    }

    // Clears all informational messages
    clearInfo() {
        this.info = [];
        this.hasMessages = false;
    }

    // Clears all messages and resets hasMessages
    reset() {
        this.clearErrors();
        this.clearWarnings();
        this.clearInfo();
    }
}

class Row {
    /**@type {Status} */
    status;

    /** @type {Cell[]} "row status" */
    cells;

    constructor(cells, status = new Status()) {
        this.cells = cells;

        this.status = status;
    }
}

class Cell {
    /** @type {string} */
    value = '';

    /** @type {string} PARTCODE, Product ID, MERGED_INGREDIENT, */
    type;

    /** @type {Header} */
    header;

    /** @type {Status} "cell status" */
    status;

    constructor({ value, header, type, status = new Status() }) {
        this.value = value;
        this.type = type;
        this.header = header;
        this.status = status;
    }
}

/**
 * Helper function to create a deep copy of a Cell instance.
 *
 * @param {Cell} cell - The Cell instance to clone.
 * @returns {Cell} - A deep copy of the Cell instance.
 */
function cloneCell(cell) {
    return new Cell({
        value: cell.value,
        type: cell.type,
        header: new Header({
            id: cell.header.id,
            name: cell.header.name,
        }),
    });
}

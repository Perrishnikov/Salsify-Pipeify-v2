const ORDER = {
    id: 'ORDER',
    name: 'Order',
};

const DESCRIPTION = {
    id: 'DESCRIPTION',
    name: 'Description'
};

const QUANTITY = {
    id: 'QUANTITY',
    name: 'Qty'
};

const UOM = {
    id: 'UOM',
    name: 'UOM'
};

const DV = {
    id: 'DV',
    name: 'DV'
}

const SYMBOL = {
    id: 'SYMBOL',
    name: 'Sym.'
};

const FOOT = {
    id: 'FOOT',
    name: 'Foot.'
};

/**
 * Represents a substitution object.
 *
 * @typedef {Object} Substitution
 * @property {string} id - The unique identifier for the substitution.
 * @property {string} abbr - The abbreviation for the substitution.
 */
/**@type {Substitution} */
const LABEL_DATASET_NUTRIENT_A = {
    id: 'LABEL_DATASET_NUTRIENT_A - en-US',
    abbr: 'Nutrients',
};
/**@type {Substitution} */
const LABEL_DATASET_INGREDIENTS_A = {
    id: 'LABEL_DATASET_INGREDIENTS_A - en-US',
    abbr: 'Ingredients',
};
/**@type {Substitution} */
const LABEL_DATASET_OTHER_INGREDS_A = {
    id: 'LABEL_DATASET_OTHER_INGREDS_A',
    abbr: 'Other',
};
/**@type {Substitution} */
const MERGED_INGREDIENTS = {
    id: 'MERGED_INGREDIENTS',
    abbr: 'Ingredient Info',
};
/**@type {Substitution} */
const INGREDIENT_TYPE = {
    id: 'INGREDIENT_TYPE',
    abbr: 'Type',
};

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
        if ((this.info.length === 0) & (this.warnings.length === 0)) {
            this.hasMessages = false;
        }
    }

    // Clears all warning messages
    clearWarnings() {
        this.warnings = [];
        if ((this.info.length === 0) & (this.errors.length === 0)) {
            this.hasMessages = false;
        }
    }

    // Clears all informational messages
    clearInfo() {
        this.info = [];
        if ((this.warnings.length === 0) & (this.errors.length === 0)) {
            this.hasMessages = false;
        }
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
    /** @type {string | number} */
    value = '';

    /** @type {string | number} - fails validation */
    badValue = '';

    /** @type {string} PARTCODE, Product ID, MERGED_INGREDIENT, */
    type;

    /** @type {Header} */
    header;

    /** @type {Status} "cell status" */
    status;

    /** @type {boolean} */
    isEditable;

    constructor({
        value,
        header,
        type,
        status = new Status(),
        isEditable = false,
    }) {
        this.value = value;
        this.type = type;
        this.header = header;
        this.status = status;
        this.isEditable = isEditable;
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

/**
 * Stores a JSON object in localStorage.
 *
 * @param {Object} jsonObject - The JSON object to store.
 */
function setLocalStorage(jsonObject) {
    // Convert the JSON object to a JSON string using JSON.stringify()
    const jsonString = JSON.stringify(jsonObject);

    // Store the JSON string in localStorage under the given key
    localStorage.setItem('original_merged', jsonString);
}

function getLocalStorage() {
    const jsonString = localStorage.getItem('original_merged');
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
}

/**
 * Returns the first non-null value from the provided values.
 * @param {*} value1 - The first value to check.
 * @param {*} value2 - The second value to check.
 * @returns {*} The first non-null value, or null if both values are null.
 */
function coalesce(value1, value2) {
    // return 1at value if there is one, else 2nd, or nothing
    let value;

    if (value1) {
        value = value1;
    } else if (value2) value = value2;
    else {
        value = null;
    }
    return value;
}

function canBeParsedAsNumber(str) {
    const parsedNumber = Number(str);
    return !isNaN(parsedNumber);
}

/**
 * Removes HTML tags from the given string.
 * @param {string} string - The string containing HTML tags to be stripped.
 * @returns {string} The string with HTML tags removed.
 */
function stripHTML(string) {
    // 03242 has <sub> tag
    var regex = /(<([^>]+)>)/gi;

    return string.replace(regex, '');
}

function standardTestIsTrue(valueToTest) {
    // if the value is found, return true, else false
    if (
        valueToTest.toLowerCase().includes('calories') |
        valueToTest.toLowerCase().includes('carbohydrate') |
        valueToTest.toLowerCase().includes('total sugars') |
        valueToTest.toLowerCase().includes('total sugar') |
        valueToTest.toLowerCase().includes('added sugars') |
        valueToTest.toLowerCase().includes('added sugar') |
        valueToTest.toLowerCase().includes('dietary') |
        valueToTest.toLowerCase().includes('total fat') |
        valueToTest.toLowerCase().includes('protein') |
        valueToTest.toLowerCase().includes('saturated') |
        valueToTest.toLowerCase().includes('trans fat') |
        valueToTest.toLowerCase().includes('transfat') |
        valueToTest.toLowerCase().includes('cholesteral')
    ) {
        return true;
    } else {
        return false;
    }
}

class Test {
    /**@type {boolean} */
    failed;
    /**@type {string} */
    message;
    /**@type {string} */
    invalidValue;
    /**
     * @constructor
     * @param {boolean} failed -
     * @param {string} message -
     * @param {string} invalidValue -
     */
    constructor(failed = false, message = '', invalidValue = '') {
        this.failed = failed;
        this.message = message;
        this.invalidValue = invalidValue;
    }
}

/**
 * @class
 * @classdesc A class representing a Tester.
 */
class Tester {
    /**@type {string} */
    trimmedValue;
    /**@type {Test[]} */
    tests;
    /**@type {boolean} */
    failed;

    /**
     * @constructor
     * @param {string} trimmedValue - The trimmed value to be tested.
     */
    constructor(trimmedValue) {
        this.trimmedValue = trimmedValue;
        this.tests = [];
        this.failed = false;
    }
    /**
     * Calls a callback function for each failed test.
     * @param {function} callback - The callback function to be called for each failed test.
     */
    forEachFailure(callback) {
        this.tests.forEach((test) => {
            if (test.failed) {
                callback.call(this, test.message);
            }
        });
        return this;
    }

    shouldNotBeEmpty() {
        let test = new Test();
        const pattern = /\S+/;

        if (!pattern.test(this.trimmedValue)) {
            const message = 'trimmedValue is Empty';
            test = new Test(true, message, '');
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }
    shouldBeEmpty() {
        let test = new Test();
        // const pattern = /\S+/;

        if (this.trimmedValue !== '') {
            const message = 'trimmedValue is not Empty';
            test = new Test(true, message, '');
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }

    shouldBeParsedAsNumber() {
        const parsedNumber = !isNaN(Number(this.trimmedValue));
        let test = new Test();

        if (!parsedNumber) {
            const message = `${this.trimmedValue} is Not a Number`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }
    shouldNotBeParsedAsNumber() {
        // Check if the trimmed value is not a number
        const isNotNumber = isNaN(Number(this.trimmedValue));
        let test = new Test();

        if (isNotNumber) {
            const message = `${this.trimmedValue} is not a number`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }

        
        this.tests.push(test);

        
        return this;
    }
    shouldBeLessThanLength() {
        let test = new Test();
        const length = this.trimmedValue.length;

        if (length >= test) {
            const message = `${this.trimmedValue} is longer than ${test} characters`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }

    shouldBeMoreThanLength() {
        let test = new Test();
        const length = this.trimmedValue.length;

        if (length <= test) {
            const message = `${this.trimmedValue} is shorter than ${test} characters`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }

    shouldBeValidOUM() {
        let test = new Test();
        const value = this.trimmedValue.toLowerCase();
        const units = [
            'mg',
            'mcg',
            'g',
            'ml',
            'l',
            'oz',
            'CFU'.toLowerCase(),
            'mcg DFE'.toLowerCase(),
            'mg DFE'.toLowerCase(),
            '',
            'IU'.toLowerCase(),
        ];

        if (!units.includes(value)) {
            const message = `${this.value} may not be valid UOM`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }

    shouldBeValidSymbol_Nutrient() {
        let test = new Test();
        const value = this.trimmedValue.toLowerCase();
        const allowedValues = ['%', ''];

        if (!allowedValues.includes(value)) {
            const message = `${this.value} may not be valid Symbol`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }

    shouldBeValidSymbol_Ingredient() {
        let test = new Test();
        const value = this.trimmedValue.toLowerCase();
        const allowedValues = ['**', ''];

        if (!allowedValues.includes(value)) {
            const message = `${this.value} may not be valid Symbol`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }
    shouldBeValidFootnote_Nutrient() {
        let test = new Test();
        const value = this.trimmedValue.toLowerCase();
        const doubleDagger = '\u2021';
        const dagger = 'U+2020';
        const allowedValues = ['†', '‡', ''];

        if (!allowedValues.includes(value)) {
            const message = `${this.value} may not be valid Footnote`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }
}

const createCell = {
    order: ({ value, isEditable = true }) => {
        const orderCell = new Cell({
            value: value,
            type: ORDER.id,
            status: isEditable ? createCell.validateOrder(value) : new Status(),
            header: new Header({
                id: ORDER.id,
                name: ORDER.name,
            }),
            isEditable: isEditable,
        });
        return orderCell;
    },
    validateOrder(value) {
        const status = new Status();
        const trimmedValue = value.toString().trim();
        // const maxLength = 6;

        const testForErrors = new Tester(trimmedValue)
            .shouldBeParsedAsNumber()
            .forEachFailure(status.addError.bind(status));

        const testForWarnings = new Tester(trimmedValue)
            .shouldNotBeEmpty()
            .forEachFailure(status.addWarning.bind(status));

        return status;
    },
    // DESC
    description: ({ value, isEditable = true }) => {
        const descCell = new Cell({
            value: value,
            type: DESCRIPTION.id,
            status: isEditable
                ? createCell.validateDescription(value)
                : new Status(),
            header: new Header({
                id: DESCRIPTION.id,
                name: DESCRIPTION.name,
            }),
            isEditable: isEditable,
        });
        return descCell;
    },
    validateDescription: (value) => {
        const status = new Status();
        const trimmedValue = value.toString().trim();
        // console.log({ trimmedValue });

        const testForWarnings = new Tester(trimmedValue)
            .shouldNotBeEmpty()
            // .shouldNotBeParsedAsNumber()
            .forEachFailure(status.addWarning.bind(status));

        return status;
    },
    //QTY
    quantity: ({ value, isEditable = true }) => {
        const qtyCell = new Cell({
            value: value,
            type: QUANTITY.id,
            status: isEditable
                ? createCell.validateQuantity(value)
                : new Status(),
            header: new Header({
                id: QUANTITY.id,
                name: QUANTITY.name,
            }),
            isEditable: isEditable,
        });
        return qtyCell;
    },
    validateQuantity: (value) => {
        let status = new Status();
        const trimmedValue = value.toString().trim();
        const charsToRemove = ['<', ','];
        let cleanString = trimmedValue;

        charsToRemove.forEach((char) => {
            cleanString = cleanString.split(char).join('');
        });

        const testForErrors = new Tester(cleanString)
            .shouldBeParsedAsNumber()
            .forEachFailure(status.addError.bind(status));

        const testForWarnings = new Tester(trimmedValue)
            .shouldNotBeEmpty()
            .forEachFailure(status.addWarning.bind(status));
        return status;
    },
    // UOM
    uom: ({ value, isEditable = true }) => {
        const uomCell = new Cell({
            value: value,
            type: UOM.id,
            status: isEditable ? createCell.validateUom(value) : new Status(),
            header: new Header({
                id: UOM.id,
                name: UOM.name,
            }),
            isEditable: isEditable,
        });
        return uomCell;
    },
    validateUom: (value) => {
        const status = new Status();
        const trimmedValue = value.toString().trim();

        const testForWarnings = new Tester(trimmedValue)
            .shouldBeValidOUM()
            .forEachFailure(status.addWarning.bind(status));

        return status;
    },
    //DVAMT
    dvAmount: ({ value, isEditable = true, ingredType = '' }) => {
        const dvAmtCell = new Cell({
            value: value,
            type: DV.id,
            status: isEditable
                ? createCell.validateDvAmount(value, ingredType)
                : new Status(),
            header: new Header({
                id: DV.id,
                name: DV.name,
            }),
            isEditable: isEditable,
        });
        return dvAmtCell;
    },
    validateDvAmount: (value, ingredType) => {
        const status = new Status();
        const trimmedValue = value.toString().trim();
        // const charsToRemove = ['**', '<', ','];
        let cleanString = trimmedValue;

        if (ingredType === LABEL_DATASET_NUTRIENT_A.name) {
            const charsToRemove = ['**', '<', ','];
            // console.log({ ingredType });
            charsToRemove.forEach((char) => {
                cleanString = cleanString.split(char).join('');
            });

            const testForErrors = new Tester(cleanString)
                .shouldBeParsedAsNumber()
                .forEachFailure(status.addWarning.bind(status));
        } else if (ingredType === LABEL_DATASET_INGREDIENTS_A.name) {
            const testForWarnings = new Tester(trimmedValue)
                // .shouldNotBeEmpty()
                .shouldBeEmpty()
                .forEachFailure(status.addWarning.bind(status));
        }

        return status;
    },
    //SYMBOL
    symbol: ({ value, isEditable = true, ingredType = '' }) => {
        const symbolCell = new Cell({
            value: value,
            type: SYMBOL.id,
            status: isEditable
                ? createCell.validateSymbol(value, ingredType)
                : new Status(),
            header: new Header({
                id: SYMBOL.id,
                name: SYMBOL.name,
            }),
            isEditable: isEditable,
        });
        return symbolCell;
    },
    validateSymbol: (value, ingredType) => {
        const status = new Status();
        const trimmedValue = value.toString().trim();

        if (ingredType === LABEL_DATASET_NUTRIENT_A.name) {
            const testForErrors = new Tester(trimmedValue)
                .shouldBeValidSymbol_Nutrient()
                .forEachFailure(status.addWarning.bind(status));
        } else if (ingredType === LABEL_DATASET_INGREDIENTS_A.name) {
            const testForWarnings = new Tester(trimmedValue)
                .shouldBeValidSymbol_Ingredient()
                .forEachFailure(status.addWarning.bind(status));
        }
        return status;
    },
    //FOOTNOTE
    footnote: ({ value, isEditable = true, ingredType = '' }) => {
        const footnoteCell = new Cell({
            value: value,
            type: FOOT.id,
            status: isEditable
                ? createCell.validateFootnote(value, ingredType)
                : new Status(),
            header: new Header({
                id: FOOT.id,
                name: FOOT.name,
            }),
            isEditable: isEditable,
        });
        return footnoteCell;
    },
    validateFootnote: (value, ingredType) => {
        // U+2020 	† 	Dagger 	0914
        // U+2021 	‡ 	Double dagger
        const status = new Status();
        const trimmedValue = value.toString().trim();

        if (ingredType === LABEL_DATASET_NUTRIENT_A.name) {
            const testForErrors = new Tester(trimmedValue)
                .shouldBeValidFootnote_Nutrient()
                .forEachFailure(status.addWarning.bind(status));
        } else if (ingredType === LABEL_DATASET_INGREDIENTS_A.name) {
            const testForWarnings = new Tester(trimmedValue)
                .shouldBeEmpty()
                .forEachFailure(status.addWarning.bind(status));
        }
        return status;
    },
};

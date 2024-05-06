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
                // console.log(`FAILED`, test.message);

                callback.call(this, test.message);
            }
        });
        return this;
    }

    shouldNotBeEmpty() {
        const pattern = /\S+/;
        let test = new Test();

        if (!pattern.test(this.trimmedValue)) {
            const message = 'trimmedValue is Empty';
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

    shouldBeLessThanLength(test) {
        const length = this.trimmedValue.length;
        console.log({ length });

        if (length >= test) {
            const message = `${this.trimmedValue} is longer than ${test} characters`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }

    shouldBeMoreThanLength(test) {
        const length = this.trimmedValue.length;
        console.log({ length });

        if (length <= test) {
            const message = `${this.trimmedValue} is shorter than ${test} characters`;
            test = new Test(true, message, this.trimmedValue);
            this.failed = true;
        }
        this.tests.push(test);
        return this;
    }

    mayContainCharacter(character) {}
}
const validationTests = {
    isNotEmpty_Error: (str1, status) => {
        const pattern = /\S+/;
        if (!pattern.test(str1)) {
            status.addError('! isNotEmpty');
        }
        // console.assert(pattern.test(str1), `! isNotEmpty`);
        return validationTests;
    },
    isNotEmpty_Warning: (str1, status) => {
        const pattern = /\S+/;
        if (!pattern.test(str1)) {
            status.addWarning('! isNotEmpty');
        }
        // console.assert(pattern.test(str1), `! isNotEmpty`);
        return validationTests;
    },
    canBeParsedAsNumber_Error(str, status) {
        const parsedNumber = !isNaN(Number(str));
        // console.log(`parsedNumber`, parsedNumber);
        if (!parsedNumber) {
            status.addError('! isNumber');
            // console.log(status);
        }
        return validationTests;
    },
    isNumber: (str1, status) => {
        const pattern = /^\d+$/;
        if (!pattern.test(str1)) {
            status.addError('! isNumber');
        }
        // console.log(pattern.test(str1), '! isNumber');
        return validationTests;
    },
    isNotSame: (str1, str2, status) => {
        if (str1 !== str2) {
            status.addError('! isNotSame');
        }
        return validationTests;
    },
    isLessThanLength: (str1, max, status) => {
        if (str1.length >= max) {
            status.addError('! isLessThan');
        }
        return validationTests;
    },
    isGreaterThanEqualToLength: (str1, test, status) => {
        str1.trim();
        console.log(`str length`, str1.length);
        if (str1.length < test + 1) {
            status.addError('! isGreaterThan');
        }
        return validationTests;
    },
    isGreaterThanValue: (num, test, status) => {},
    isLessThanValue: (num, test, status) => {},
    mayContainCharacter(symbol, status) {
        console.log({ status });
        console.log({ symbol });
        console.log(validationTests);
        return validationTests;
    },
    isValidUOM: (value, status) => {
        const validUOMs = [
            'mg',
            'mcg',
            'g',
            'ml',
            'l',
            'oz',
            'CFU',
            'mcg DFE',
            'mg DFE',
            '',
            'IU',
        ];
        if (!validUOMs.includes(value)) {
            status.addError('! isValidUOM');
        }
        return validationTests;
    },
};

// U+2020 	† 	Dagger 	0914
// U+2021 	‡ 	Double dagger
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

        validationTests.isNotEmpty_Warning(trimmedValue, status);

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

        // if (){

        // }
        validationTests.canBeParsedAsNumber_Error(trimmedValue, status);
        // console.log({bill});
        // validationTests
        //     .isNotEmpty_Warning(trimmedValue, status)
        //     .mayContainCharacter('<', status);

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

        return status;
    },
    //DVAMT
    dvAmount: ({ value, isEditable = true }) => {
        const dvAmtCell = new Cell({
            value: value,
            type: DV.id,
            status: isEditable
                ? createCell.validateDvAmount(value)
                : new Status(),
            header: new Header({
                id: DV.id,
                name: DV.name,
            }),
            isEditable: isEditable,
        });
        return dvAmtCell;
    },
    validateDvAmount: (value) => {
        const status = new Status();

        return status;
    },
    //SYMBOL
    symbol: ({ value, isEditable = true }) => {
        const symbolCell = new Cell({
            value: value,
            type: SYMBOL.id,
            status: isEditable
                ? createCell.validateSymbol(value)
                : new Status(),
            header: new Header({
                id: SYMBOL.id,
                name: SYMBOL.name,
            }),
            isEditable: isEditable,
        });
        return symbolCell;
    },
    validateSymbol: (value) => {
        const status = new Status();

        return status;
    },
    //FOOTNOTE
    footnote: ({ value, isEditable = true }) => {
        const footnoteCell = new Cell({
            value: value,
            type: FOOT.id,
            status: isEditable
                ? createCell.validateFootnote(value)
                : new Status(),
            header: new Header({
                id: FOOT.id,
                name: FOOT.name,
            }),
            isEditable: isEditable,
        });
        return footnoteCell;
    },
    validateFootnote: (value) => {
        const status = new Status();

        return status;
    },
};

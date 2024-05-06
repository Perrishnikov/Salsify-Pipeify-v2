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

const validationTests = {
    isNotEmpty: (str1, status) => {
        const pattern = /\S+/;
        if (!pattern.test(str1)) {
            status.addError('! isNotEmpty');
        }
        // console.assert(pattern.test(str1), `! isNotEmpty`);
        return validationTests;
    },
    canBeParsedAsNumber(str, status) {
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
    order: ({
        value,
        // exception = null,
        isEditable = true,
        // shouldValidate = true,
    }) => {
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

        const minLength = 1;
        const maxLength = 6;

        validationTests.canBeParsedAsNumber(trimmedValue, status);
        // .isNotEmpty(value, status)
        // .isGreaterThanEqualToLength(value, minLength, status);

        return status;
    },
    // DESC
    description: ({ value, exception = null, isEditable = true }) => {
        const descCell = new Cell({
            value: value,
            type: DESCRIPTION.id,
            status: createCell.validateDescription(value),
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
        console.log({ trimmedValue });
        validationTests.isNotEmpty(trimmedValue, status);
        // .isGreaterThanEqualToLength(value, minLength, status)
        return status;
    },
    //QTY
    quantity: ({ value, exception = null, isEditable = true }) => {
        const qtyCell = new Cell({
            value: value,
            type: QUANTITY.id,
            status: createCell.validateQuantity(value),
            header: new Header({
                id: QUANTITY.id,
                name: QUANTITY.name,
            }),
            isEditable: isEditable,
        });
        return qtyCell;
    },
    validateQuantity: (value) => {
        const status = new Status();

        return status;
    },
    // UOM
    uom: ({ value, exception = null, isEditable = true }) => {
        const uomCell = new Cell({
            value: value,
            type: UOM.id,
            status: createCell.validateUom(value),
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
    dvAmount: ({ value, exception = null, isEditable = true }) => {
        const dvAmtCell = new Cell({
            value: value,
            type: DV.id,
            status: createCell.validateDvAmount(value),
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
    symbol: ({ value, exception = null, isEditable = true }) => {
        const symbolCell = new Cell({
            value: value,
            type: SYMBOL.id,
            status: createCell.validateSymbol(value),
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
    footnote: ({ value, exception = null, isEditable = true }) => {
        const footnoteCell = new Cell({
            value: value,
            type: FOOT.id,
            status: createCell.validateFootnote(value),
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

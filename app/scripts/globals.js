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

class Status {}

class Cell {
    /** @type {string} */
    value = '';

    /** @type {string} PARTCODE, Product ID, MERGED_INGREDIENT, */
    type;

    /** @type {Header} */
    header;

    /** @type {Status} */
    status;

    constructor({ value, header, type, status = null }) {
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

// function createOrderCell(value) {
//     const ORDER = new Header({
//         id: 'ORDER',
//         name: 'Order',
//     });
//     const orderCell = new Cell({
//         value: value,
//         type: ORDER.id,
//         header: ORDER,
//     });
//     return orderCell;
// }
// function createDescCell(value) {
//     const DESC = new Header({
//         id: 'DESCRIPTION',
//         name: 'Description',
//     });
//     const descCell = new Cell({
//         value: value,
//         type: DESC.id,
//         header: DESC,
//     });
//     return descCell;
// }

// function createQtyCell(value) {
//     const QTY = new Header({
//         id: 'QTY',
//         name: 'Qty',
//     });
//     const qtyCell = new Cell({
//         value: value,
//         type: QTY.id,
//         header: QTY,
//     });
//     return qtyCell;
// }

// function createUomCell(value) {
//     const UOM = new Header({
//         id: 'UOM',
//         name: 'UOM',
//     });

//     const uomCell = new Cell({
//         value: value,
//         type: UOM.id,
//         header: UOM,
//     });
//     return uomCell;
// }

// function createDvAmtCell(value) {
//     const dvAmtCell = new Cell({
//         value: value,
//         type: 'DVA',
//         header: new Header({
//             id: 'DVA',
//             name: 'DV %',
//         }),
//     });
//     return dvAmtCell;
// }

// function createSymbolCell(value) {
//     const symbolCell = new Cell({
//         value: value,
//         type: 'SYMBOL',
//         header: new Header({
//             id: 'SYMBOL',
//             name: 'Sym.',
//         }),
//     });
//     return symbolCell;
// }

// function createFootnoteCell(value) {
//         const footnoteCell = new Cell({
//             value: value,
//             type: 'FOOT',
//             header: new Header({
//                 id: 'FOOT',
//                 name: 'Foot.',
//             }),
//         });
//         return footnoteCell;
// }
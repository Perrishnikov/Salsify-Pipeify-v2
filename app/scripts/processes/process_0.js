/**
 * Creates an array of objects, each representing a row of ingredients with a column for each type.
 *
 * @param {Array<Object.<number, Cell>>} rows - An array of merged JSON data.
 * @param {Array<string>} columnNames - An array of reordered keys for headers.
 * @param {Array<Col>} substitute_headers - An array of reordered keys for headers.
 * @returns {Array<ObjectWithEntity>} - An array of objects representing rows of ingredients.
 */
function option_0({ rows, columnNames, substitute_headers }) {
    const rowsOfCells = [];

    // create an new Entity for each row of objects()

    rows.forEach((row) => {
        // const rowStatus = new Status();
        // basically hold anonymous object {0: Entity, 1: Entity}
        // its a Cell and not Entity because the number of Cells in unknown
        // each object needs to be able to return a KEY and VALUE to sheetsjs

        // const cells = {};
        const cells = []

        columnNames.forEach((name, index) => {
            const substitution_found = substitute_headers.find(
                (obj) => obj.id === name
            );
            // console.log(`substitution_found`, substitution_found);

            const header = new Header({ id: name, name: name });

            if (substitution_found) {
                header.name = substitution_found.name;
            } else {
                header.name = name;
            }

            const cell = new Cell({
                value: row[name] || '',
                type: name,
                header: header,
            });

            // cells[index] = cell;
            cells.push(cell)
            
        });

        const newRow = new Row(cells);
        rowsOfCells.push(newRow);
        // rowsOfCells.push(cells);
    });

    return rowsOfCells;
}

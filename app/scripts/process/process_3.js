//* Used in 3rd
// TODO: class or better Object
const pipedObject = {
    ORDER: '',
    // SHORT_DESC: '',
    // LONG_DESC: '',
    DESC: '',
    QTY: '',
    UOM: '',
    DV: '',
    SYMBOL: '',
    DEF: '',
    FOOTNOTE: '',
    // ASTERISK: ''
};
/**
 * //* 3rd
 * @param {*} rowsOfIngredients
 * @returns
 */
function per_pipe_per_partcode_3(rowsOfIngredients) {
    // console.log(rowsOfIngredients);

    const newEntities = [];

    rowsOfIngredients.forEach((row) => {
        const mergedIngredient = row[merged_ingredient_entity.id];

        const delimitedArray = mergedIngredient.split('|');

        // console.log(delimitedArray);
        const type = row[ingredient_type_entity.id];

        const rowCopy = JSON.parse(JSON.stringify(row));
        const combinedCopy = { ...rowCopy, ...pipedObject };
        const cleanCopy = removeKeysFromObject(combinedCopy, [
            merged_ingredient_entity.id,
        ]);

        console.log(`type: `, type);
        if (type === LABEL_DATASET_NUTRIENT_A.abbr) {
            const order = delimitedArray[0].trim();
            const shortDesc = delimitedArray[1].trim();
            const longDesc = delimitedArray[2].trim();
            const coelesced = coalesce(longDesc, shortDesc);
            const qty = delimitedArray[3].trim();
            const uom = delimitedArray[4].trim();
            const dvAmt = delimitedArray[5].trim();
            const symbol = delimitedArray[6].trim();
            const foot = delimitedArray[7].trim();

            cleanCopy.ORDER = order;
            cleanCopy.DESC = coelesced;
            cleanCopy.QTY = qty;
            cleanCopy.UOM = uom;
            cleanCopy.DV = dvAmt;
            cleanCopy.SYMBOL = symbol;
            cleanCopy.FOOTNOTE = foot;

            // console.log(`cleanCopy`, cleanCopy);
            // console.log(`rowCopy`, rowCopy);
            newEntities.push(cleanCopy);
        } else if (type === LABEL_DATASET_INGREDIENTS_A.abbr) {
            // console.log(`Ingredient`)
            const order = delimitedArray[0].trim();
            const shortDesc = delimitedArray[1].trim();
            const qty = delimitedArray[2].trim();
            const uom = delimitedArray[3].trim();
            const unk = delimitedArray[4].trim();
            const dvAmt = delimitedArray[5].trim();
            const asterisk = delimitedArray[6].trim();
            const foot = delimitedArray[7].trim();

            cleanCopy.ORDER = order;
            cleanCopy.DESC = shortDesc;
            cleanCopy.QTY = qty;
            cleanCopy.UOM = uom;
            cleanCopy.DV = dvAmt;
            cleanCopy.SYMBOL = asterisk;
            cleanCopy.FOOTNOTE = foot;
            // cleanCopy.unk= unk

            if (unk) {
                console.error(`unk`, unk);
            }

            newEntities.push(cleanCopy);
        }

        if (type === LABEL_DATASET_OTHER_INGREDS_A.abbr) {
            // console.log('Other');
            const other = delimitedArray[0].trim();
            cleanCopy.DESC = other;
            newEntities.push(cleanCopy);
        }
    });

    return newEntities;
}

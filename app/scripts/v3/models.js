/** @typedef {import('./types.js').V3Column} V3Column */
/** @typedef {import('./types.js').V3TableDef} V3TableDef */

/** @type {Record<string, V3Column>} */
const modelsColumnBase = {
  paste: { id: 'ROW_PASTE', label: '', isControl: true },
  copy: { id: 'ROW_COPY', label: '', isControl: true },
  productId: { id: 'PRODUCT_ID', label: 'Product ID', isFixed: true },
  order: { id: 'ORDER', label: 'Order' },
  description: { id: 'DESCRIPTION', label: 'Description' },
  shortDescription: { id: 'SHORT_DESCRIPTION', label: 'Short Description' },
  longDescription: { id: 'DESCRIPTION', label: 'Long Description' },
  quantity: { id: 'QTY', label: 'Qty' },
  uom: { id: 'UOM', label: 'UOM' },
  dv: { id: 'DV', label: 'DV' },
  pct: { id: 'PCT', label: 'Pct' },
  symbol: { id: 'SYMBOL', label: 'Sym' },
  definition: { id: 'definition', label: 'Definition' },
};

/**
 * @typedef {Object} ModelsColumnOptions
 * @property {boolean} [includePaste]
 * @property {boolean} [includeCopy]
 */ //TODO: custom type

/**
 * @param {ModelsColumnOptions} [options]
 * @returns {V3Column[]}
 */
function modelsIngredientColumns(options) {
  const config = options || {};
  const columns = [];
  if (config.includePaste) {
    columns.push(modelsColumnBase.paste);
  }
  columns.push(
    modelsColumnBase.productId,
    modelsColumnBase.order,
    modelsColumnBase.longDescription,
    modelsColumnBase.quantity,
    modelsColumnBase.uom,
    modelsColumnBase.symbol,
    modelsColumnBase.definition
  );
  if (config.includeCopy) {
    columns.push(modelsColumnBase.copy);
  }
  return columns;
}

/**
 * @param {ModelsColumnOptions} [options]
 * @returns {V3Column[]}
 */
function modelsNutrientColumns(options) {
  const config = options || {};
  const columns = [];
  if (config.includePaste) {
    columns.push(modelsColumnBase.paste);
  }
  columns.push(
    modelsColumnBase.productId,
    modelsColumnBase.order,
    modelsColumnBase.shortDescription,
    modelsColumnBase.longDescription,
    modelsColumnBase.quantity,
    modelsColumnBase.uom,
    modelsColumnBase.dv,
    modelsColumnBase.pct,
    modelsColumnBase.symbol,
    modelsColumnBase.definition
  );
  return columns;
}

/**
 * @param {ModelsColumnOptions} [options]
 * @returns {V3Column[]}
 */
function modelsOtherColumns(options) {
  return [
    modelsColumnBase.productId,
    modelsColumnBase.description,
  ];
}

/** @type {Record<string, V3TableDef[]>} */
const modelsTablesByCountry = {
  US: [
    {
      key: 'US_NUTRIENTS',
      name: 'Nutrients',
      tableId: 'PLM1_LDS_NUTRIENT',
      rowType: 'Nutrients',
      pasteMode: 'table',
      columns: modelsNutrientColumns(),
    },
    {
      key: 'US_INGREDIENTS',
      name: 'Ingredients',
      tableId: 'PLM1_RAW_MAT_QTY_DRAFT',
      rowType: 'Ingredients',
      pasteMode: 'table',
      columns: modelsIngredientColumns(),
    },
    {
      key: 'US_OTHER',
      name: 'Other Ingredients',
      tableId: 'PLM1_INGREDIENT_DRAFT_TEXT',
      rowType: 'Other',
      pasteMode: 'table',
      columns: modelsOtherColumns(),
    },
  ],
  CA: [
    {
      key: 'CA_INGREDIENTS',
      name: 'Ingredients',
      tableId: 'Ingredients - Long',
      rowType: 'Ingredients',
      pasteMode: 'row',
      columns: modelsIngredientColumns({
        includePaste: true,
        includeCopy: true,
      }),
    },
    {
      key: 'CA_OTHER',
      name: 'Other Ingredients',
      tableId: 'LABEL_DATASET_OTHER_INGREDS_A',
      rowType: 'Other',
      pasteMode: 'row',
      columns: modelsOtherColumns(),
    },
  ],
};

/**
 * @param {string} countryCode
 * @returns {V3TableDef[]}
 */
export function modelsGetTablesForCountry(countryCode) {
  return modelsTablesByCountry[countryCode] || [];
}

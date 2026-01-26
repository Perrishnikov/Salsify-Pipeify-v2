import {
  parsingNormalizeValue,
  parsingSplitCells,
  parsingSplitRows,
} from './parsing.js';

/** @typedef {import('./types.js').V3Row} V3Row */

/**
 * @typedef {Object} PipeSchemaField
 * @property {string} id
 * @property {string} [uiColumnId]
 */ //TODO: custom type

/**
 * @typedef {Object} PipeSchema
 * @property {string} id
 * @property {string} rowType
 * @property {string} rowDelimiter
 * @property {string} cellDelimiter
 * @property {{min: number, max: number}} pipeCountRange
 * @property {PipeSchemaField[]} fields
 */ //TODO: custom type

/**
 * @typedef {Record<string, string>} PipeRowData
 */ //TODO: custom type

/** @type {PipeSchema} */
const pipeSchemaIngredientCA = {
  id: 'ingredient-ca',
  rowType: 'Ingredients',
  rowDelimiter: '~',
  cellDelimiter: '|',
  pipeCountRange: { min: 6, max: 8 },
  fields: [
    { id: 'ORDER', uiColumnId: 'ORDER' },
    { id: 'DESCRIPTION', uiColumnId: 'DESCRIPTION' },
    { id: 'QTY', uiColumnId: 'QTY' },
    { id: 'UOM', uiColumnId: 'UOM' },
    { id: 'UNKNOWN_4' },
    { id: 'DV_AMT' },
    { id: 'SYMBOL', uiColumnId: 'SYMBOL' },
    { id: 'FOOT', uiColumnId: 'definition' },
    { id: 'UNKNOWN_8' },
  ],
};

/** @type {PipeSchema} */
const pipeSchemaIngredientUS = {
  id: 'ingredient-us',
  rowType: 'Ingredients',
  rowDelimiter: '~',
  cellDelimiter: '|',
  pipeCountRange: { min: 6, max: 6 },
  fields: [
    { id: 'ORDER', uiColumnId: 'ORDER' },
    { id: 'DESCRIPTION', uiColumnId: 'DESCRIPTION' },
    { id: 'QTY', uiColumnId: 'QTY' },
    { id: 'UOM', uiColumnId: 'UOM' },
    { id: 'SYMBOL', uiColumnId: 'SYMBOL' },
    { id: 'FOOT', uiColumnId: 'definition' },
    { id: 'UNKNOWN_6' },
  ],
};

/** @type {PipeSchema} */
const pipeSchemaNutrientUS = {
  id: 'nutrient-us',
  rowType: 'Nutrients',
  rowDelimiter: '~',
  cellDelimiter: '|',
  pipeCountRange: { min: 7, max: 9 },
  fields: [
    { id: 'ORDER', uiColumnId: 'ORDER' },
    { id: 'SHORT_DESCRIPTION', uiColumnId: 'SHORT_DESCRIPTION' },
    { id: 'DESCRIPTION', uiColumnId: 'DESCRIPTION' },
    { id: 'QTY', uiColumnId: 'QTY' },
    { id: 'UOM', uiColumnId: 'UOM' },
    { id: 'DV', uiColumnId: 'DV' },
    { id: 'PCT', uiColumnId: 'PCT' },
    { id: 'SYMBOL', uiColumnId: 'SYMBOL' },
    { id: 'FOOT', uiColumnId: 'definition' },
    { id: 'UNKNOWN_9' },
  ],
};

/** @type {PipeSchema} */
const pipeSchemaOther = {
  id: 'other',
  rowType: 'Other',
  rowDelimiter: '~',
  cellDelimiter: '|',
  pipeCountRange: { min: 0, max: 0 },
  fields: [{ id: 'DESCRIPTION', uiColumnId: 'DESCRIPTION' }],
};

/**
 * @param {string} rowType
 * @returns {PipeSchema|null}
 */
export function pipeSchemaGetByRowType(rowType) {
  if (rowType === pipeSchemaIngredientCA.rowType) {
    return pipeSchemaIngredientCA;
  }
  if (rowType === pipeSchemaNutrientUS.rowType) {
    return pipeSchemaNutrientUS;
  }
  if (rowType === pipeSchemaOther.rowType) {
    return pipeSchemaOther;
  }
  return null;
}

/**
 * @param {string} tableKey
 * @returns {PipeSchema|null}
 */
export function pipeSchemaGetByTableKey(tableKey) {
  if (tableKey === 'CA_INGREDIENTS') {
    return pipeSchemaIngredientCA;
  }
  if (tableKey === 'US_INGREDIENTS') {
    return pipeSchemaIngredientUS;
  }
  if (tableKey === 'US_NUTRIENTS') {
    return pipeSchemaNutrientUS;
  }
  if (tableKey === 'CA_OTHER' || tableKey === 'US_OTHER') {
    return pipeSchemaOther;
  }
  return null;
}

/**
 * @param {PipeSchema} schema
 * @returns {PipeRowData}
 */
export function pipeSchemaCreateEmptyRowData(schema) {
  const data = {};
  if (!schema || !schema.fields) {
    return data;
  }
  schema.fields.forEach(function (field) {
    data[field.id] = '';
  });
  return data;
}
/**
 * @param {string} text
 * @param {PipeSchema} schema
 * @returns {PipeRowData}
 */
export function pipeSchemaParseRow(text, schema) {
  const data = pipeSchemaCreateEmptyRowData(schema);
  if (!schema) {
    return data;
  }
  const cells = parsingSplitCells(text || '', schema.cellDelimiter);
  schema.fields.forEach(function (field, index) {
    data[field.id] = parsingNormalizeValue(cells[index]);
  });
  return data;
}

/**
 * @param {string} text
 * @param {PipeSchema} schema
 * @param {{rowDelimiter?: string}} [options]
 * @returns {PipeRowData[]}
 */
export function pipeSchemaParseRows(text, schema, options) {
  if (!schema) {
    return [];
  }
  const config = options || {};
  const rowDelimiter =
    config.rowDelimiter !== undefined
      ? config.rowDelimiter
      : schema.rowDelimiter;
  if (!rowDelimiter) {
    return [pipeSchemaParseRow(text, schema)];
  }
  const rows = parsingSplitRows(text, rowDelimiter);
  return rows.map(function (rowText) {
    return pipeSchemaParseRow(rowText, schema);
  });
}

/**
 * @param {PipeRowData} rowData
 * @returns {boolean}
 */
export function pipeSchemaRowHasValues(rowData) {
  if (!rowData) {
    return false;
  }
  return Object.keys(rowData).some(function (key) {
    return rowData[key] !== '';
  });
}

/**
 * @param {V3Row} row
 * @param {PipeSchema} schema
 * @returns {void}
 */
export function pipeSchemaApplyRowDataToCells(row, schema) {
  if (!row || !row.cells || !schema) {
    return;
  }
  const data = row.pipeData || {};
  schema.fields.forEach(function (field) {
    if (!field.uiColumnId) {
      return;
    }
    row.cells[field.uiColumnId] = parsingNormalizeValue(
      data[field.id],
    );
  });
}

/**
 * @param {V3Row} row
 * @param {PipeSchema} schema
 * @returns {PipeRowData}
 */
export function pipeSchemaBuildRowDataFromRow(row, schema) {
  const data = pipeSchemaCreateEmptyRowData(schema);
  if (!row || !schema) {
    return data;
  }
  const base = row.pipeData || {};
  schema.fields.forEach(function (field) {
    if (base[field.id] !== undefined) {
      data[field.id] = parsingNormalizeValue(base[field.id]);
    }
  });
  schema.fields.forEach(function (field) {
    if (!field.uiColumnId || !row.cells) {
      return;
    }
    if (row.cells[field.uiColumnId] !== undefined) {
      data[field.id] = parsingNormalizeValue(
        row.cells[field.uiColumnId],
      );
    }
  });
  return data;
}

/**
 * @param {V3Row[]} rows
 * @param {PipeSchema} schema
 * @param {{includeEmpty?: boolean}} [options]
 * @returns {PipeRowData[]}
 */
export function pipeSchemaBuildRowDataList(rows, schema, options) {
  if (!rows || !schema) {
    return [];
  }
  const config = options || {};
  const includeEmpty = Boolean(config.includeEmpty);
  const list = [];
  rows.forEach(function (row) {
    const data = pipeSchemaBuildRowDataFromRow(row, schema);
    if (!includeEmpty && !pipeSchemaRowHasValues(data)) {
      return;
    }
    list.push(data);
  });
  return list;
}

/**
 * @param {V3Row} row
 * @param {PipeSchema} schema
 * @param {string} colId
 * @param {string} value
 * @returns {void}
 */
export function pipeSchemaUpdateRowDataForCell(
  row,
  schema,
  colId,
  value,
) {
  if (!row || !schema || !colId) {
    return;
  }
  const field = schema.fields.find(function (entry) {
    return entry.uiColumnId === colId;
  });
  if (!field) {
    return;
  }
  if (!row.pipeData) {
    row.pipeData = pipeSchemaCreateEmptyRowData(schema);
  }
  row.pipeData[field.id] = parsingNormalizeValue(value);
}

/**
 * @param {PipeRowData} rowData
 * @param {PipeSchema} schema
 * @returns {string}
 */
export function pipeSchemaSerializeRow(rowData, schema) {
  if (!schema) {
    return '';
  }
  const cells = schema.fields.map(function (field) {
    return parsingNormalizeValue(rowData ? rowData[field.id] : '');
  });
  return cells.join(schema.cellDelimiter);
}

/**
 * @param {PipeRowData[]} rows
 * @param {PipeSchema} schema
 * @param {{rowDelimiter?: string}} [options]
 * @returns {string}
 */
export function pipeSchemaSerializeRows(rows, schema, options) {
  if (!rows || !schema) {
    return '';
  }
  const config = options || {};
  const rowDelimiter =
    config.rowDelimiter !== undefined
      ? config.rowDelimiter
      : schema.rowDelimiter;
  const serializedRows = rows.map(function (rowData) {
    return pipeSchemaSerializeRow(rowData, schema);
  });
  if (!rowDelimiter) {
    return serializedRows.join('');
  }
  return serializedRows.join(rowDelimiter);
}

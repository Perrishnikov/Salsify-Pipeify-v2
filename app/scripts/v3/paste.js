/**
 * @typedef {Object} PasteRowInfo
 * @property {string} text
 * @property {boolean} isEmpty
 * @property {number} pipeCount
 */ //TODO: custom type

/**
 * @typedef {Object} PasteClassification
 * @property {string} normalizedText
 * @property {string[]} matches
 * @property {string[]} rows
 * @property {number[]} pipeCounts
 * @property {PasteRowInfo[]} rowInfo
 */ //TODO: custom type

import { pipeSchemaGetByTableKey } from './pipe-schema.js';

const pasteRowDelimiter = '~';
const pasteCellDelimiter = '|';
const pasteIngredientSchemaCA = pipeSchemaGetByTableKey('CA_INGREDIENTS');
const pasteIngredientSchemaUS = pipeSchemaGetByTableKey('US_INGREDIENTS');
const pasteIngredientPipeRangeCA =
  pasteIngredientSchemaCA && pasteIngredientSchemaCA.pipeCountRange
    ? pasteIngredientSchemaCA.pipeCountRange
    : { min: 6, max: 8 };
const pasteIngredientPipeRangeUS =
  pasteIngredientSchemaUS && pasteIngredientSchemaUS.pipeCountRange
    ? pasteIngredientSchemaUS.pipeCountRange
    : { min: 6, max: 6 };
const pasteIngredientMinPipesCA = pasteIngredientPipeRangeCA.min;
const pasteIngredientMaxPipesCA = pasteIngredientPipeRangeCA.max;
const pasteIngredientMinPipesUS = pasteIngredientPipeRangeUS.min;
const pasteIngredientMaxPipesUS = pasteIngredientPipeRangeUS.max;
const pasteNutrientSchemaUS = pipeSchemaGetByTableKey('US_NUTRIENTS');
const pasteNutrientPipeRangeUS =
  pasteNutrientSchemaUS && pasteNutrientSchemaUS.pipeCountRange
    ? pasteNutrientSchemaUS.pipeCountRange
    : { min: 7, max: 9 };
const pasteNutrientMinPipesUS = pasteNutrientPipeRangeUS.min;
const pasteNutrientMaxPipesUS = pasteNutrientPipeRangeUS.max;

/**
 * @param {string} value
 * @returns {number}
 */
function pasteCountPipes(value) {
  if (!value) {
    return 0;
  }
  let count = 0;
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === pasteCellDelimiter) {
      count += 1;
    }
  }
  return count;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function pasteIsRowEmpty(value) {
  if (!value) {
    return true;
  }
  return value.trim().length === 0;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
function pasteIsPipeCountInRange(value, min, max) {
  return value >= min && value <= max;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function pasteNormalizeClipboardText(text) {
  if (text === undefined || text === null) {
    return '';
  }
  let normalized = String(text);
  normalized = normalized.replace(/\r\n?/g, '\n');
  normalized = normalized.replace(/^\uFEFF/, '');
  normalized = normalized.trim();
  normalized = normalized.replace(/\u00A0/g, ' ');
  return normalized;
}

/**
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function pasteFormatClipboardPreview(text, maxLength) {
  const normalized = pasteNormalizeClipboardText(text);
  const escaped = normalized
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"');
  if (!maxLength || escaped.length <= maxLength) {
    return escaped;
  }
  if (maxLength <= 3) {
    return escaped.slice(0, maxLength);
  }
  return escaped.slice(0, maxLength - 3) + '...';
}

/**
 * @param {string} text
 * @returns {PasteClassification}
 */
export function pasteClassifyClipboard(text) {
  const normalized = pasteNormalizeClipboardText(text);
    if (!normalized) {
        return {
            normalizedText: '',
            matches: [],
            rows: [],
            pipeCounts: [],
            rowInfo: [],
        };
    }

  const rows = normalized.split(pasteRowDelimiter);
  const rowInfo = rows.map(function (row) {
    return {
      text: row,
      isEmpty: pasteIsRowEmpty(row),
      pipeCount: pasteCountPipes(row),
    };
  });
  const nonEmptyRows = rowInfo.filter(function (row) {
    return !row.isEmpty;
  });
  const pipeCounts = nonEmptyRows.map(function (row) {
    return row.pipeCount;
  });
  const matches = [];
  const hasRowDelimiter =
    normalized.indexOf(pasteRowDelimiter) !== -1;
  const singleRowEligible =
    nonEmptyRows.length === 1 &&
    rows.length <= 2 &&
    !rowInfo[0].isEmpty &&
    (rows.length === 1 || rowInfo[1].isEmpty);

  if (singleRowEligible) {
    if (
      pasteIsPipeCountInRange(
        pipeCounts[0],
        pasteIngredientMinPipesCA,
        pasteIngredientMaxPipesCA
      )
    ) {
      matches.push('ca-ingredient-row');
    }
    if (pipeCounts[0] === 0) {
      matches.push('other');
    }
  }

  if (hasRowDelimiter && nonEmptyRows.length > 0) {
    if (
      pipeCounts.every(function (count) {
        return pasteIsPipeCountInRange(
          count,
          pasteIngredientMinPipesUS,
          pasteIngredientMaxPipesUS
        );
      })
    ) {
      matches.push('us-ingredient-table');
    }
    if (
      pipeCounts.every(function (count) {
        return pasteIsPipeCountInRange(
          count,
          pasteNutrientMinPipesUS,
          pasteNutrientMaxPipesUS
        );
      })
    ) {
      matches.push('us-nutrient-table');
    }
  }

  return {
    normalizedText: normalized,
    matches: matches,
    rows: rows,
    pipeCounts: pipeCounts,
    rowInfo: rowInfo,
  };
}

import { rowsBuildIngredientRows, rowsBuildNutrientRows, rowsBuildOtherRows } from './rows.js';
import { pasteClassifyClipboard, pasteFormatClipboardPreview } from './paste.js';
import { stateResetTables } from './state.js';

/** @typedef {import('./types.js').V3Actions} V3Actions */
/** @typedef {import('./types.js').V3State} V3State */
/** @typedef {import('./types.js').V3Ui} V3Ui */

/**
 * @typedef {Object} ActionsDependencies
 * @property {V3State} state
 * @property {V3Ui} ui
 * @property {{
 *   mapImportToTables: (file: File, countryCode: string, tableDefs: import('./types.js').V3TableDef[]) => Promise<import('./types.js').V3ImportResult>,
 *   mapTablesToExport: (tableData: Object, countryCode: string, option: string) => Object
 * }} mapping
 */

const actionsPastePreviewMaxLength = 160;

const actionsPasteLabelByType = {
  'ca-ingredient-row': 'CA Ingredient row',
  'us-ingredient-table': 'US Ingredients table',
  'us-nutrient-table': 'US Nutrients table',
  other: 'Other Ingredients',
};

const actionsPasteTargetByTableKey = {
  CA_INGREDIENTS: {
    type: 'ca-ingredient-row',
    label: 'CA Ingredient row',
  },
  CA_OTHER: {
    type: 'other',
    label: 'Other Ingredients row',
  },
  US_INGREDIENTS: {
    type: 'us-ingredient-table',
    label: 'US Ingredients table',
  },
  US_NUTRIENTS: {
    type: 'us-nutrient-table',
    label: 'US Nutrients table',
  },
  US_OTHER: {
    type: 'other',
    label: 'Other Ingredients table',
  },
};

/**
 * @param {import('./types.js').V3TableDef[]} tableDefs
 * @param {string} tableKey
 * @returns {import('./types.js').V3TableDef|null}
 */
function actionsGetTableDef(tableDefs, tableKey) {
  for (let i = 0; i < tableDefs.length; i += 1) {
    if (tableDefs[i].key === tableKey) {
      return tableDefs[i];
    }
  }
  return null;
}

/**
 * @param {V3State} state
 * @param {string} tableKey
 * @returns {string}
 */
function actionsGetTableProductId(state, tableKey) {
  const rows = state.tableData[tableKey] || [];
  for (let i = 0; i < rows.length; i += 1) {
    const cells = rows[i] && rows[i].cells ? rows[i].cells : null;
    if (cells && cells.PRODUCT_ID) {
      return cells.PRODUCT_ID;
    }
  }
  return '';
}

/**
 * @param {string} tableKey
 * @returns {{type: string, label: string}|null}
 */
function actionsGetPasteTarget(tableKey) {
  if (!tableKey) {
    return null;
  }
  return actionsPasteTargetByTableKey[tableKey] || null;
}

/**
 * @param {string} text
 * @returns {string}
 */
function actionsGetClipboardPreview(text) {
  const preview = pasteFormatClipboardPreview(
    text,
    actionsPastePreviewMaxLength
  );
  return `"${preview}"`;
}

/**
 * @param {import('./types.js').V3Row} targetRow
 * @param {import('./types.js').V3Row} sourceRow
 * @param {boolean} preserveProductId
 * @returns {void}
 */
function actionsApplyRowCells(targetRow, sourceRow, preserveProductId) {
  if (!targetRow || !targetRow.cells || !sourceRow || !sourceRow.cells) {
    return;
  }
  Object.keys(targetRow.cells).forEach(function (key) {
    if (preserveProductId && key === 'PRODUCT_ID') {
      return;
    }
    if (sourceRow.cells[key] !== undefined) {
      targetRow.cells[key] = sourceRow.cells[key];
      return;
    }
    targetRow.cells[key] = '';
  });
}

/**
 * @param {string} text
 * @returns {string}
 */
function actionsStripTrailingRowDelimiter(text) {
  if (!text) {
    return '';
  }
  if (text.endsWith('~')) {
    return text.slice(0, -1);
  }
  return text;
}

/**
 * @param {string} text
 * @param {{type: string, label: string}} target
 * @param {V3Ui} ui
 * @returns {{normalizedText: string}|null}
 */
function actionsValidatePaste(text, target, ui) {
  const classification = pasteClassifyClipboard(text);
  const normalizedText = classification.normalizedText;
  if (!normalizedText) {
    ui.renderStatus('Clipboard is empty.', 'warning');
    return null;
  }

  if (!classification.matches.length) {
    const preview = actionsGetClipboardPreview(normalizedText);
    ui.renderStatus(
      'Unable to classify clipboard text. ' + preview,
      'danger'
    );
    return null;
  }

  if (classification.matches.indexOf(target.type) === -1) {
    const detected =
      actionsPasteLabelByType[classification.matches[0]] || 'Unknown';
    const preview = actionsGetClipboardPreview(normalizedText);
    ui.renderStatus(
      'Clipboard looks like ' + detected + ', not ' + target.label + '. ' +
        preview,
      'danger'
    );
    return null;
  }

  return { normalizedText: normalizedText };
}

/**
 * @param {ActionsDependencies} deps
 * @returns {V3Actions}
 */
export function actionsCreateActions(deps) {
  const state = deps.state;
  const ui = deps.ui;
  const mapping = deps.mapping;

  /**
   * @param {File} file
   * @returns {Promise<import('./types.js').V3ImportResult|null>}
   */
  async function importSpreadsheet(file) {
    if (!file) {
      ui.renderStatus('No file selected for import.', 'warning');
      return null;
    }
    let result;
    try {
      result = await mapping.mapImportToTables(
        file,
        state.countryCode,
        state.tableDefs
      );
    } catch (error) {
      ui.renderStatus('Import failed while reading the file.', 'danger');
      return null;
    }
    if (!result || !result.ok) {
      const message = result ? result.errors.join(' ') : 'Import failed.';
      ui.renderStatus(message, 'danger');
      return result || null;
    }
    state.tableData = result.tableData;
    state.lastAction = 'import';
    ui.renderStatus('Imported file: ' + file.name, 'info');
    console.log('[v3] importSpreadsheet', file.name, state.countryCode);
    return result;
  }

  /**
   * @param {string} text
   * @param {string} tableKey
   * @param {string} rowId
   * @returns {boolean}
   */
  function pasteRowCA(text, tableKey, rowId) {
    const target = actionsGetPasteTarget(tableKey);
    if (!target) {
      ui.renderStatus('Select a row to paste into.', 'warning');
      return false;
    }
    if (!rowId) {
      ui.renderStatus('Select a row to paste into.', 'warning');
      return false;
    }
    const validation = actionsValidatePaste(text, target, ui);
    if (!validation) {
      return false;
    }
    const normalizedText = validation.normalizedText;

    const tableDef = actionsGetTableDef(state.tableDefs, tableKey);
    if (!tableDef) {
      ui.renderStatus('Missing table definition for paste target.', 'danger');
      return false;
    }

    const tableRows = state.tableData[tableKey];
    if (!tableRows) {
      ui.renderStatus('Missing table data for paste target.', 'danger');
      return false;
    }

    const targetRow = tableRows.find(function (row) {
      return row && row.id === rowId;
    });
    if (!targetRow) {
      ui.renderStatus('Select a row to paste into.', 'warning');
      return false;
    }

    const productId = actionsGetTableProductId(state, tableKey);
    const rowText = actionsStripTrailingRowDelimiter(normalizedText);
    let sourceRows;
    if (tableKey === 'CA_INGREDIENTS') {
      sourceRows = rowsBuildIngredientRows(tableDef, productId, rowText, {
        ensureRow: true,
      });
    } else {
      sourceRows = rowsBuildOtherRows(tableDef, productId, rowText);
    }

    if (!sourceRows || !sourceRows.length) {
      ui.renderStatus('Unable to parse pasted row.', 'danger');
      return false;
    }

    actionsApplyRowCells(targetRow, sourceRows[0], true);
    state.lastAction = 'paste-row';
    ui.renderStatus('Row paste applied.', 'info');
    return true;
  }

  /**
   * @param {string} text
   * @param {string} tableKey
   * @returns {boolean}
   */
  function pasteTableUS(text, tableKey) {
    const target = actionsGetPasteTarget(tableKey);
    if (!target) {
      ui.renderStatus('Select a table to paste into.', 'warning');
      return false;
    }
    const validation = actionsValidatePaste(text, target, ui);
    if (!validation) {
      return false;
    }
    const normalizedText = validation.normalizedText;

    const tableDef = actionsGetTableDef(state.tableDefs, tableKey);
    if (!tableDef) {
      ui.renderStatus('Missing table definition for paste target.', 'danger');
      return false;
    }

    const productId = actionsGetTableProductId(state, tableKey);
    let nextRows = [];
    if (tableKey === 'US_INGREDIENTS') {
      nextRows = rowsBuildIngredientRows(
        tableDef,
        productId,
        normalizedText,
        { retainBlankRows: true }
      );
    } else if (tableKey === 'US_NUTRIENTS') {
      nextRows = rowsBuildNutrientRows(
        tableDef,
        productId,
        normalizedText,
        { retainBlankRows: true }
      );
    } else {
      const otherText = actionsStripTrailingRowDelimiter(normalizedText);
      nextRows = rowsBuildOtherRows(tableDef, productId, otherText);
    }

    state.tableData[tableKey] = nextRows;
    state.lastAction = 'paste-table';
    ui.renderStatus('Table paste applied.', 'info');
    return true;
  }

  /**
   * @param {string} option
   */
  function pipeifyUS(option) {
    mapping.mapTablesToExport(
      state.tableData,
      'US',
      option || 'keep'
    );
    state.lastAction = 'pipeify-us';
    ui.renderStatus('Download set ready (stub) for US.', 'info');
    console.log('[v3] pipeifyUS stub', option);
  }

  /**
   * @param {string} option
   */
  function pipeifyCA(option) {
    mapping.mapTablesToExport(
      state.tableData,
      'CA',
      option || 'keep'
    );
    state.lastAction = 'pipeify-ca';
    ui.renderStatus('Download set ready (stub) for CA.', 'info');
    console.log('[v3] pipeifyCA stub', option);
  }

  /**
   * @returns {void}
   */
  function changeProductId() {
    state.lastAction = 'change-product-id';
    ui.renderStatus('Change Product ID stub triggered.', 'info');
    console.log('[v3] changeProductId stub');
  }

  /**
   * @returns {void}
   */
  function clearAllTableData() {
    stateResetTables(state);
    state.lastAction = 'clear';
    ui.renderStatus('Cleared tables (stub).', 'info');
    console.log('[v3] clearAllTableData stub');
  }

  return {
    importSpreadsheet: importSpreadsheet,
    pasteRowCA: pasteRowCA,
    pasteTableUS: pasteTableUS,
    pipeifyUS: pipeifyUS,
    pipeifyCA: pipeifyCA,
    changeProductId: changeProductId,
    clearAllTableData: clearAllTableData,
  };
}

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
   */
  function pasteRowCA(text) {
    if (!text) {
      return;
    }
    state.lastAction = 'paste-row';
    ui.renderStatus('Row paste received (stub).', 'info');
    console.log('[v3] pasteRowCA stub', text);
  }

  /**
   * @param {string} text
   */
  function pasteTableUS(text) {
    if (!text) {
      return;
    }
    state.lastAction = 'paste-table';
    ui.renderStatus('Table paste received (stub).', 'info');
    console.log('[v3] pasteTableUS stub', text);
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

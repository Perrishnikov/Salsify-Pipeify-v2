import { actionsCreateActions } from './actions.js';
import {
    mappingMapImportToTables,
    mappingMapTablesToExport,
} from './mapping.js';
import { modelsGetTablesForCountry } from './models.js';
import { livePreviewRender } from './live-preview.js';
import {
    stateCreateState,
    stateGetTableRows,
    stateUpdateCell,
} from './state.js';
import { tableRenderRenderTable } from './table-render.js';

/**
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function initGetById(id) {
    return document.getElementById(id);
}

/**
 * @param {string} countryCode
 * @returns {void}
 */
function initSetTitle(countryCode) {
    const titleEl = initGetById('page-title');
    if (!titleEl) {
        return;
    }
    titleEl.textContent = 'Salsify: Pipeify v3 ' + countryCode;
}

/**
 * @param {string} message
 * @param {string} tone
 * @returns {void}
 */
function initRenderStatus(message, tone) {
    const container = initGetById('page-errors');
    if (!container) {
        return;
    }
    container.innerHTML = '';
    if (!message) {
        return;
    }
    const toneMap = {
        error: 'danger',
        warn: 'warning',
        warning: 'warning',
        info: 'info',
        success: 'success',
        danger: 'danger',
    };
    const alert = document.createElement('div');
    const alertTone = toneMap[tone] || tone || 'info';
    alert.className = 'alert alert-' + alertTone;
    alert.textContent = message;
    container.appendChild(alert);
}

/**
 * @param {HTMLElement} dropArea
 * @returns {HTMLElement|null}
 */
function initGetDropLabel(dropArea) {
    return dropArea.querySelector('[data-drop-label]');
}

/**
 * @param {HTMLElement} dropArea
 * @param {string} text
 * @returns {void}
 */
function initUpdateDropAreaText(dropArea, text) {
    const heading = initGetDropLabel(dropArea);
    if (!heading) {
        return;
    }
    heading.textContent = text;
}

/**
 * @param {import('./types.js').V3State} state
 * @returns {void}
 */
function initRenderTableShells(state) {
    const container = initGetById('tables-container');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    state.tableDefs.forEach(function (tableDef) {
        const section = document.createElement('div');
        section.className = 'mb-4';

        const headerRow = document.createElement('div');
        headerRow.className =
            'd-flex justify-content-between align-items-center mb-2';

        const title = document.createElement('h5');
        title.textContent = tableDef.name;
        headerRow.appendChild(title);

        if (tableDef.pasteMode === 'table') {
            const pasteButton = document.createElement('button');
            pasteButton.type = 'button';
            pasteButton.className = 'btn btn-outline-secondary btn-sm';
            pasteButton.textContent = 'Paste Table';
            pasteButton.dataset.pasteAction = 'table';
            pasteButton.dataset.tableKey = tableDef.key;
            headerRow.appendChild(pasteButton);
        }

        section.appendChild(headerRow);

        const rows = stateGetTableRows(state, tableDef.key);
        const table = tableRenderRenderTable(tableDef, rows);
        section.appendChild(table);
        container.appendChild(section);
    });
}

/**
 * @param {string} countryCode
 * @returns {string|null}
 */
function initGetSelectedProductIdOption(countryCode) {
    const selected = document.querySelector(
        '[data-product-id-option]:checked'
    );
    if (!selected) {
        return countryCode === 'CA' ? 'keep' : 'keep';
    }
    return selected.value;
}

/**
 * @param {string} countryCode
 * @param {import('./types.js').V3State} state
 * @param {import('./types.js').V3Actions} actions
 * @param {import('./types.js').V3Ui} ui
 * @returns {void}
 */
function initWireActions(countryCode, state, actions, ui) {
    const dropArea = initGetById('import-drop-area');
    const fileInput = initGetById('file-input');
    const fileName = initGetById('import-file-name');
    const downloadBtn = initGetById('download-set-btn');
    const clearBtn = initGetById('clear-set-btn');
    const changeIdBtn = initGetById('change-product-id-btn');

    if (dropArea && fileInput) {
        const label = initGetDropLabel(dropArea);
        const defaultDropText = label ? label.textContent : '';
        dropArea.dataset.defaultText = defaultDropText;

        dropArea.addEventListener('click', function () {
            fileInput.click();
        });

        dropArea.addEventListener('dragover', function (event) {
            event.preventDefault();
            dropArea.classList.add('dragover');
            initUpdateDropAreaText(dropArea, 'Drop file to import');
        });

        dropArea.addEventListener('dragleave', function () {
            dropArea.classList.remove('dragover');
            initUpdateDropAreaText(
                dropArea,
                dropArea.dataset.defaultText || defaultDropText
            );
        });

        dropArea.addEventListener('drop', function (event) {
            event.preventDefault();
            dropArea.classList.remove('dragover');
            initUpdateDropAreaText(
                dropArea,
                dropArea.dataset.defaultText || defaultDropText
            );
            if (!event.dataTransfer || !event.dataTransfer.files.length) {
                return;
            }
            const file = event.dataTransfer.files[0];
            if (fileName) {
                fileName.textContent = file.name;
            }
            ui.renderStatus('Import ready: ' + file.name, 'info');
            actions.importSpreadsheet(file).then(function (result) {
                if (!result || !result.ok) {
                    return;
                }
                initRenderTableShells(state);
                initUpdateLivePreview(state.countryCode, 'import');
            });
        });

        fileInput.addEventListener('change', function (event) {
            const file = event.target.files && event.target.files[0];
            if (!file) {
                return;
            }
            if (fileName) {
                fileName.textContent = file.name;
            }
            ui.renderStatus('Import ready: ' + file.name, 'info');
            actions.importSpreadsheet(file).then(function (result) {
                if (!result || !result.ok) {
                    return;
                }
                initRenderTableShells(state);
                initUpdateLivePreview(state.countryCode, 'import');
            });
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            const option = initGetSelectedProductIdOption(countryCode);
            if (countryCode === 'US') {
                actions.pipeifyUS(option);
                return;
            }
            actions.pipeifyCA(option);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            actions.clearAllTableData();
            initRenderTableShells(state);
            initUpdateLivePreview(state.countryCode, 'clear');
        });
    }

    if (changeIdBtn) {
        changeIdBtn.addEventListener('click', function () {
            actions.changeProductId();
            initUpdateLivePreview(state.countryCode, 'change-id');
        });
    }

    if (countryCode === 'CA') {
        initWirePasteHandlers(state, actions, 'row');
    } else if (countryCode === 'US') {
        initWirePasteHandlers(state, actions, 'table');
    }

    initWirePasteButtons(state, actions, ui);
    initWireEditableCells(state);
}

/**
 * @param {import('./types.js').V3State} state
 * @param {import('./types.js').V3Actions} actions
 * @param {'row'|'table'} mode
 * @returns {void}
 */
function initWirePasteHandlers(state, actions, mode) {
    const container = initGetById('tables-container');
    if (!container) {
        return;
    }

    if (mode === 'row') {
        container.addEventListener('paste', function (event) {
            const text = event.clipboardData
                ? event.clipboardData.getData('text')
                : '';
            if (!text) {
                return;
            }
            event.preventDefault();
            const target = event.target;
            const tableEl = target ? target.closest('[data-table-key]') : null;
            const rowEl = target ? target.closest('[data-row-id]') : null;
            const tableKey = tableEl ? tableEl.dataset.tableKey || '' : '';
            const rowId = rowEl ? rowEl.dataset.rowId || '' : '';
            const didPaste = actions.pasteRowCA(text, tableKey, rowId);
            if (didPaste) {
                initRenderTableShells(state);
                initUpdateLivePreview(state.countryCode, 'paste-row');
            }
        });
        return;
    }

    container.addEventListener('paste', function (event) {
        const text = event.clipboardData
            ? event.clipboardData.getData('text')
            : '';
        if (!text) {
            return;
        }
        event.preventDefault();
        const target = event.target;
        const tableEl = target ? target.closest('[data-table-key]') : null;
        const tableKey = tableEl ? tableEl.dataset.tableKey || '' : '';
        const didPaste = actions.pasteTableUS(text, tableKey);
        if (didPaste) {
            initRenderTableShells(state);
            initUpdateLivePreview(state.countryCode, 'paste-table');
        }
    });
}

/**
 * @param {import('./types.js').V3State} state
 * @param {import('./types.js').V3Actions} actions
 * @param {import('./types.js').V3Ui} ui
 * @returns {void}
 */
function initWirePasteButtons(state, actions, ui) {
    const container = initGetById('tables-container');
    if (!container) {
        return;
    }

    container.addEventListener('click', function (event) {
        const target = event.target.closest('[data-paste-action]');
        if (!target) {
            return;
        }
        initReadClipboardText()
            .then(function (text) {
                if (!text) {
                    ui.renderStatus('Clipboard is empty.', 'warning');
                    return;
                }
                if (target.dataset.pasteAction === 'row') {
                    const tableKey = target.dataset.tableKey || '';
                    const rowId = target.dataset.rowId || '';
                    const didPaste = actions.pasteRowCA(text, tableKey, rowId);
                    if (didPaste) {
                        initRenderTableShells(state);
                        initUpdateLivePreview(state.countryCode, 'paste-row');
                    }
                    return;
                }
                const tableKey = target.dataset.tableKey || '';
                const didPaste = actions.pasteTableUS(text, tableKey);
                if (didPaste) {
                    initRenderTableShells(state);
                    initUpdateLivePreview(state.countryCode, 'paste-table');
                }
            })
            .catch(function () {
                ui.renderStatus(
                    'Unable to read clipboard. Use keyboard paste.',
                    'warning'
                );
            });
    });
}

/**
 * @returns {Promise<string>}
 */
function initReadClipboardText() {
    if (navigator.clipboard && navigator.clipboard.readText) {
        return navigator.clipboard.readText();
    }
    return Promise.reject(new Error('Clipboard read not supported.'));
}

/**
 * @param {import('./types.js').V3State} state
 * @returns {void}
 */
function initWireEditableCells(state) {
    const container = initGetById('tables-container');
    if (!container) {
        return;
    }

    container.addEventListener(
        'blur',
        function (event) {
            const target = event.target;
            if (!target || !target.classList.contains('cell-value')) {
                return;
            }

            const tableEl = target.closest('[data-table-key]');
            const rowEl = target.closest('[data-row-id]');
            if (!tableEl || !rowEl) {
                return;
            }

            const tableKey = tableEl.dataset.tableKey || '';
            const rowId = rowEl.dataset.rowId || '';
            const colId = target.dataset.colId || '';
            const value = target.textContent || '';

            if (!tableKey || !rowId || !colId) {
                return;
            }

            stateUpdateCell(state, tableKey, rowId, colId, value);
            initUpdateLivePreview(state.countryCode, 'edit');
        },
        true
    );
}

/**
 * @param {string} countryCode
 * @param {string} source
 * @returns {void}
 */
function initUpdateLivePreview(countryCode, source) {
    livePreviewRender(countryCode, source);
}

/**
 * @param {{countryCode: string}} options
 * @returns {import('./types.js').V3State|null}
 */
export function initInitV3Page(options) {
    if (!options || !options.countryCode) {
        return null;
    }

    const tableDefs = modelsGetTablesForCountry(options.countryCode);
    const state = stateCreateState(options.countryCode, tableDefs);
    const ui = {
        renderStatus: initRenderStatus,
    };
    const actions = actionsCreateActions({
        state: state,
        ui: ui,
        mapping: {
            mapImportToTables: mappingMapImportToTables,
            mapTablesToExport: mappingMapTablesToExport,
        },
    });

    initSetTitle(state.countryCode);
    initRenderTableShells(state);
    initWireActions(state.countryCode, state, actions, ui);
    initUpdateLivePreview(state.countryCode, 'init');

    return state;
}

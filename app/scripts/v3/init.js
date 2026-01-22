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
    stateInsertRow,
    stateDeleteRow,
    stateUpdateCell,
} from './state.js';
import {
    tableRenderRenderRowActions,
    tableRenderRenderTable,
} from './table-render.js';

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
        section.classList.add('v3-table-section');
        section.dataset.tableSection = 'true';

        const headerRow = document.createElement('div');
        headerRow.className =
            'd-flex justify-content-between align-items-center mb-2';

        const title = document.createElement('h5');
        title.textContent = tableDef.name;
        headerRow.appendChild(title);

        if (tableDef.pasteMode === 'table' && tableDef.rowType !== 'Other') {
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
        const rowActions = tableRenderRenderRowActions(tableDef, rows);
        if (rowActions) {
            section.appendChild(table);
            section.appendChild(rowActions);
            requestAnimationFrame(function () {
                initSyncRowActionHeights(table, rowActions);
            });
            initBindRowActionResize();
            initObserveRowActionTable(table, rowActions);
        } else {
            section.appendChild(table);
        }
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
    initWireCopyButtons(actions);
    initWireRowActions(state);
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
 * @param {import('./types.js').V3Actions} actions
 * @returns {void}
 */
function initWireCopyButtons(actions) {
    const container = initGetById('tables-container');
    if (!container) {
        return;
    }

    container.addEventListener('click', function (event) {
        const target = event.target.closest('[data-copy-action]');
        if (!target) {
            return;
        }
        const tableKey = target.dataset.tableKey || '';
        const rowId = target.dataset.rowId || '';
        actions.pipeifyRowCA(tableKey, rowId);
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

/** @type {boolean} */
let initRowActionsResizeBound = false;
/** @type {WeakMap<HTMLElement, ResizeObserver>} */
const initRowActionObservers = new WeakMap();
/** @type {boolean} */
let initRowActionsDocumentBound = false;

/**
 * @returns {void}
 */
function initBindRowActionResize() {
    if (initRowActionsResizeBound) {
        return;
    }
    initRowActionsResizeBound = true;
    window.addEventListener('resize', function () {
        initSyncAllRowActionHeights();
    });
}

/**
 * @returns {void}
 */
function initSyncAllRowActionHeights() {
    const tables = document.querySelectorAll('[data-row-actions]');
    tables.forEach(function (actions) {
        const tableKey = actions.dataset.tableKey || '';
        if (!tableKey) {
            return;
        }
        const shell = actions.closest('[data-table-section]');
        const table = shell
            ? shell.querySelector(`table[data-table-key="${tableKey}"]`)
            : null;
        if (!table) {
            return;
        }
        initSyncRowActionHeights(table, actions);
    });
}

/**
 * @param {HTMLTableElement} table
 * @param {HTMLElement} actions
 * @returns {void}
 */
function initObserveRowActionTable(table, actions) {
    if (!table || !actions || typeof ResizeObserver === 'undefined') {
        return;
    }
    if (initRowActionObservers.has(actions)) {
        return;
    }
    const observer = new ResizeObserver(function () {
        initSyncRowActionHeights(table, actions);
    });
    observer.observe(table);
    initRowActionObservers.set(actions, observer);
}

/**
 * @param {HTMLTableElement} table
 * @param {HTMLElement} actions
 * @returns {void}
 */
function initSyncRowActionHeights(table, actions) {
    if (!table || !actions) {
        return;
    }
    const section = actions.closest('[data-table-section]');
    const sectionRect = section
        ? section.getBoundingClientRect()
        : { top: 0 };
    const tableRect = table.getBoundingClientRect();
    actions.style.top = `${tableRect.top - sectionRect.top}px`;
    actions.style.height = `${tableRect.height}px`;
    const bodyRows = Array.from(table.querySelectorAll('[data-row-id]'));
    const rowById = bodyRows.reduce(function (acc, row) {
        const rowId = row.dataset.rowId || '';
        if (rowId) {
            acc[rowId] = row;
        }
        return acc;
    }, {});
    const actionRows = actions.querySelectorAll('[data-row-action-row]');
    actionRows.forEach(function (actionRow, index) {
        const rowId = actionRow.dataset.rowId || '';
        const row = rowById[rowId] || bodyRows[index];
        if (!row) {
            return;
        }
        const rowRect = row.getBoundingClientRect();
        actionRow.style.top = `${rowRect.top - tableRect.top}px`;
        actionRow.style.height = `${rowRect.height}px`;
    });
}

/**
 * @param {import('./types.js').V3State} state
 * @returns {void}
 */
function initWireRowActions(state) {
    const container = initGetById('tables-container');
    if (!container) {
        return;
    }

    /**
     * @returns {void}
     */
    function closeMenus() {
        container
            .querySelectorAll('[data-row-menu-container]')
            .forEach(function (dropdown) {
                if (!dropdown.classList.contains('show')) {
                    return;
                }
                dropdown.classList.remove('show');
                const menu = dropdown.querySelector('[data-row-menu-list]');
                if (menu) {
                    menu.classList.remove('show');
                }
                const toggle = dropdown.querySelector('[data-row-menu]');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
    }

    if (!initRowActionsDocumentBound) {
        initRowActionsDocumentBound = true;
        document.addEventListener('click', function (event) {
            if (event.target.closest('[data-row-menu-container]')) {
                return;
            }
            closeMenus();
        });
    }

    container.addEventListener('click', function (event) {
        const menuToggle = event.target.closest('[data-row-menu]');
        if (menuToggle) {
            const dropdown = menuToggle.closest('[data-row-menu-container]');
            const menu = dropdown
                ? dropdown.querySelector('[data-row-menu-list]')
                : null;
            if (!dropdown || !menu) {
                return;
            }
            const willOpen = !menu.classList.contains('show');
            closeMenus();
            if (willOpen) {
                dropdown.classList.add('show');
                menu.classList.add('show');
                menuToggle.setAttribute('aria-expanded', 'true');
            }
            return;
        }

        const target = event.target.closest('[data-row-action]');
        if (!target) {
            if (!event.target.closest('[data-row-menu-container]')) {
                closeMenus();
            }
            return;
        }

        const action = target.dataset.rowAction || '';
        const tableKey = target.dataset.tableKey || '';
        const rowId = target.dataset.rowId || '';
        if (!action || !tableKey || !rowId) {
            return;
        }

        let didChange = false;
        if (action === 'add-above') {
            didChange = stateInsertRow(state, tableKey, rowId, 'above');
        } else if (action === 'add-below') {
            didChange = stateInsertRow(state, tableKey, rowId, 'below');
        } else if (action === 'delete') {
            didChange = stateDeleteRow(state, tableKey, rowId);
        }

        closeMenus();
        if (didChange) {
            initRenderTableShells(state);
            initUpdateLivePreview(state.countryCode, 'row-action');
        }
    });
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

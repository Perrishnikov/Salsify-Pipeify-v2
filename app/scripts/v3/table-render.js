/** @typedef {import('./types.js').V3Row} V3Row */
/** @typedef {import('./types.js').V3TableDef} V3TableDef */

/**
 * @param {string} tag
 * @param {string} className
 * @param {string} text
 * @returns {HTMLElement}
 */
function tableRenderCreateElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (typeof text === 'string') {
    el.textContent = text;
  }
  return el;
}

/**
 * @param {string} name
 * @param {string} className
 * @returns {HTMLImageElement}
 */
function tableRenderCreateIcon(name, className) {
  const icon = document.createElement('img');
  if (className) {
    icon.className = className;
  }
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');
  icon.src = new URL(
    `../../icons/${name}.svg`,
    import.meta.url,
  ).toString();
  return icon;
}

/**
 * @param {string} label
 * @param {string} buttonClass
 * @param {string} iconName
 * @param {string} iconClass
 * @returns {HTMLButtonElement}
 */
function tableRenderCreateRowControlButton(
  label,
  buttonClass,
  iconName,
  iconClass,
) {
  const button = tableRenderCreateElement(
    'button',
    buttonClass,
    '',
  );
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.appendChild(tableRenderCreateIcon(iconName, iconClass));
  return button;
}

/**
 * @param {string} label
 * @param {string} action
 * @param {string} tableKey
 * @param {string} rowId
 * @returns {HTMLButtonElement}
 */
function tableRenderCreateRowActionItem(
  label,
  action,
  tableKey,
  rowId,
) {
  const button = tableRenderCreateElement(
    'button',
    'dropdown-item',
    label,
  );
  button.type = 'button';
  button.dataset.rowAction = action;
  button.dataset.tableKey = tableKey;
  button.dataset.rowId = rowId;
  return button;
}

/**
 * @param {V3TableDef} tableDef
 * @param {string} rowId
 * @returns {HTMLDivElement}
 */
function tableRenderCreateRowActionsDropdown(tableDef, rowId) {
  const dropdown = tableRenderCreateElement('div', 'dropdown');
  dropdown.dataset.rowMenuContainer = 'true';
  const toggle = tableRenderCreateElement(
    'button',
    'btn btn-light btn-sm v3-row-action-button',
    '',
  );
  toggle.type = 'button';
  toggle.dataset.rowMenu = 'true';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Row Actions');
  toggle.title = 'Row Actions';
  const iconWrap = document.createElement('span');
  iconWrap.className = 'outised-icon';
  iconWrap.appendChild(
    tableRenderCreateIcon('menu', 'v3-row-action-icon'),
  );
  toggle.appendChild(iconWrap);

  const menu = tableRenderCreateElement('div', 'dropdown-menu');
  menu.dataset.rowMenuList = 'true';
  menu.appendChild(
    tableRenderCreateRowActionItem(
      'Add Above',
      'add-above',
      tableDef.key,
      rowId,
    ),
  );
  menu.appendChild(
    tableRenderCreateRowActionItem(
      'Add Below',
      'add-below',
      tableDef.key,
      rowId,
    ),
  );
  menu.appendChild(
    tableRenderCreateRowActionItem(
      'Delete',
      'delete',
      tableDef.key,
      rowId,
    ),
  );

  dropdown.appendChild(toggle);
  dropdown.appendChild(menu);
  return dropdown;
}

/**
 * @param {V3Row} row
 * @param {import('./types.js').V3Column} column
 * @returns {string}
 */
function tableRenderGetCellValue(row, column) {
  if (!row) {
    return '';
  }
  if (row.cells && row.cells[column.id] !== undefined) {
    return row.cells[column.id];
  }
  if (row[column.id] !== undefined) {
    return row[column.id];
  }
  return '';
}

/**
 * @param {V3TableDef} tableDef
 * @returns {HTMLTableRowElement}
 */
function tableRenderHeaderRow(tableDef) {
  const headerRow = document.createElement('tr');
  tableDef.columns.forEach(function (column) {
    const label = column.label || '';
    const th = tableRenderCreateElement('th', '', label);
    th.dataset.colId = column.id;
    if (column.id === 'ROW_PASTE') {
      th.classList.add('v3-col-paste');
    }
    if (column.id === 'ROW_COPY') {
      th.classList.add('v3-col-copy');
    }
    if (column.id === 'PRODUCT_ID') {
      th.classList.add('v3-col-product-id');
    }
    if (column.id === 'ORDER') {
      th.classList.add('v3-col-order');
    }
    headerRow.appendChild(th);
  });
  return headerRow;
}

/**
 * @param {V3TableDef} tableDef
 * @param {V3Row} row
 * @param {number} rowIndex
 * @returns {HTMLTableRowElement}
 */
function tableRenderRow(tableDef, row, rowIndex) {
  const tr = document.createElement('tr');
  if (row && row.id) {
    tr.dataset.rowId = row.id;
  } else if (rowIndex !== undefined) {
    tr.dataset.rowId = 'row-' + rowIndex;
  }
  if (row && row.type) {
    tr.dataset.type = row.type;
  } else if (tableDef && tableDef.rowType) {
    tr.dataset.type = tableDef.rowType;
  }

  tableDef.columns.forEach(function (column) {
    const td = document.createElement('td');
    td.dataset.colId = column.id;
    const cellContainer = tableRenderCreateElement(
      'div',
      'cell-container',
    );
    const value = tableRenderGetCellValue(row, column);

    if (column.isControl) {
      if (column.id === 'ROW_PASTE') {
        td.classList.add('v3-col-paste');
      }
      if (column.id === 'ROW_COPY') {
        td.classList.add('v3-col-copy');
      }
      if (column.id === 'ROW_PASTE' && tableDef.pasteMode === 'row') {
        const rowId = tr.dataset.rowId || '';
        const pasteButton = tableRenderCreateRowControlButton(
          'Row Paste',
          'btn btn-light btn-sm v3-row-paste-button',
          'clipboard-paste',
          'v3-row-paste-icon',
        );
        pasteButton.dataset.pasteAction = 'row';
        pasteButton.dataset.tableKey = tableDef.key;
        pasteButton.dataset.rowId = rowId;
        cellContainer.appendChild(pasteButton);
      }
      if (column.id === 'ROW_COPY') {
        const rowId = tr.dataset.rowId || '';
        const copyButton = tableRenderCreateRowControlButton(
          'Copy Row',
          'btn btn-light btn-sm v3-row-copy-button',
          'copy',
          'v3-row-copy-icon',
        );
        copyButton.dataset.copyAction = 'row';
        copyButton.dataset.tableKey = tableDef.key;
        copyButton.dataset.rowId = rowId;
        cellContainer.appendChild(copyButton);
      }
    } else {
      if (column.id === 'PRODUCT_ID') {
        td.classList.add('v3-col-product-id');
      }
      if (column.id === 'ORDER') {
        td.classList.add('v3-col-order');
      }
      const cellValue = tableRenderCreateElement(
        'div',
        'cell-value',
        String(value),
      );
      cellValue.dataset.colId = column.id;
      if (column.isFixed) {
        cellValue.setAttribute('contenteditable', 'false');
      } else {
        cellValue.setAttribute('contenteditable', 'true');
      }
      cellContainer.appendChild(cellValue);
    }

    td.appendChild(cellContainer);
    tr.appendChild(td);
  });

  return tr;
}

/**
 * @param {V3TableDef} tableDef
 * @param {V3Row[]} rows
 * @returns {HTMLTableElement}
 */
export function tableRenderRenderTable(tableDef, rows) {
  const table = document.createElement('table');
  table.dataset.tableKey = tableDef.key;
  table.dataset.tableId = tableDef.tableId;

  table.appendChild(tableRenderHeaderRow(tableDef));
  rows.forEach(function (row, index) {
    table.appendChild(tableRenderRow(tableDef, row, index + 1));
  });

  return table;
}

/**
 * @param {V3TableDef} tableDef
 * @param {V3Row[]} rows
 * @returns {HTMLDivElement|null}
 */
export function tableRenderRenderRowActions(tableDef, rows) {
  if (!tableDef || tableDef.rowType === 'Other') {
    return null;
  }

  const container = tableRenderCreateElement('div', 'v3-row-actions');
  container.dataset.rowActions = 'true';
  container.dataset.tableKey = tableDef.key;

  rows.forEach(function (row, index) {
    const rowId = row && row.id ? row.id : 'row-' + (index + 1);
    const actionRow = tableRenderCreateElement(
      'div',
      'v3-row-action',
    );
    actionRow.dataset.rowActionRow = 'true';
    actionRow.dataset.rowId = rowId;
    actionRow.appendChild(
      tableRenderCreateRowActionsDropdown(tableDef, rowId),
    );
    container.appendChild(actionRow);
  });

  return container;
}

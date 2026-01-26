/**
 * @param {string} value
 * @returns {string}
 */
export function livePreviewTrim(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value).trim();
}

/**
 * @param {string} value
 * @returns {string}
 */
export function livePreviewTrimEnd(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value).replace(/\s+$/, '');
}

/**
 * @param {string} label
 * @param {number} totalLength
 * @returns {string}
 */
function livePreviewPadHeader(label, totalLength) {
  const base = '____' + label;
  if (base.length >= totalLength) {
    return base;
  }
  return base + '_'.repeat(totalLength - base.length);
}

/**
 * @param {string} value
 * @param {string} removeValue
 * @returns {string}
 */
function livePreviewStripToken(value, removeValue) {
  if (!value) {
    return '';
  }
  return value.replace(new RegExp(removeValue, 'gi'), '');
}

/**
 * @param {string[]} parts
 * @returns {string}
 */
function livePreviewJoinParts(parts) {
    return parts
        .map(function (part) {
            return livePreviewTrim(part);
        })
        .filter(function (part) {
            return part !== '';
        })
        .join(' ');
}

/**
 * @param {string[]} parts
 * @returns {string}
 */
function livePreviewJoinPartsPreserveFirst(parts) {
    return parts
        .map(function (part, index) {
            return index === 0
                ? livePreviewTrimEnd(part)
                : livePreviewTrim(part);
        })
        .filter(function (part) {
            return part !== '';
        })
        .join(' ');
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function livePreviewHasText(text) {
  return livePreviewTrim(text) !== '';
}

/**
 * @param {string} text
 * @returns {string}
 */
function livePreviewIndentLine(text) {
  if (!text) {
    return '';
  }
  // return '( ' + text + ' )';
  return text;
}

/**
 * @param {import('./types.js').V3Row[]} rows
 * @returns {{lines: string[], definitions: string[]}}
 */
function livePreviewBuildNutrientLines(rows) {
  const lines = [];
  const definitions = [];
  (rows || []).forEach(function (row) {
    if (!row || !row.cells) {
      return;
    }
        const shortDesc = livePreviewTrim(row.cells.SHORT_DESCRIPTION);
        const longDesc = livePreviewTrimEnd(row.cells.DESCRIPTION);
        const desc = livePreviewTrimEnd(longDesc || shortDesc);
    if (!desc) {
      return;
    }
    const amount = livePreviewTrim(row.cells.QTY);
    let uom = livePreviewTrim(row.cells.UOM).toLowerCase();
    uom = livePreviewStripToken(uom, 'cal');
    const dv = livePreviewTrim(row.cells.DV);
    const pct = livePreviewTrim(row.cells.PCT);
    const symbol = livePreviewTrim(row.cells.SYMBOL);
    const def = livePreviewTrim(row.cells.definition);

    const dvPercent = dv || pct ? livePreviewTrim(dv + pct) : '';
        let line = livePreviewJoinPartsPreserveFirst([
            desc,
            amount + uom,
            dvPercent,
            symbol,
        ]);

    if (
      desc.indexOf('Added Sugars') !== -1 ||
      desc.indexOf('Folic') !== -1 ||
      desc.indexOf('Quatrefoli') !== -1
    ) {
      line = livePreviewIndentLine(line);
    }

    if (livePreviewHasText(line)) {
      lines.push(line);
    }
    if (livePreviewHasText(def)) {
      definitions.push(def);
    }
  });
  return { lines: lines, definitions: definitions };
}

/**
 * @param {import('./types.js').V3Row[]} rows
 * @returns {{lines: string[], definitions: string[]}}
 */
function livePreviewBuildIngredientLines(rows) {
  const lines = [];
  const definitions = [];
  (rows || []).forEach(function (row) {
    if (!row || !row.cells) {
      return;
    }
    let desc = livePreviewTrimEnd(row.cells.DESCRIPTION);
    if (!desc) {
      return;
    }
    const amount = livePreviewTrim(row.cells.QTY);
    const uom = livePreviewTrim(row.cells.UOM);
    const symbol = livePreviewTrim(row.cells.SYMBOL);
    const def = livePreviewTrim(row.cells.definition);

    const shouldIndentSubOmegas =
      desc.indexOf('Eicosapentaenoic') !== -1 ||
      (desc.indexOf('Docosahexaenoic') !== -1 &&
        desc.indexOf('Algal') === -1) ||
      desc.indexOf('Other Omega-3') !== -1 ||
      desc.indexOf('Caprylic Acid') !== -1 ||
      (desc.indexOf('Capric Acid') !== -1 &&
        desc.indexOf('Medium Chain Triglycerides') === -1);
    if (shouldIndentSubOmegas) {
      desc = livePreviewIndentLine(desc);
    }

    const shouldIndentBacteria =
      desc.indexOf('Blend') !== -1 &&
      (desc.indexOf('Bifidobacterium') !== -1 ||
        desc.indexOf('Lactobacillus') !== -1);
    if (shouldIndentBacteria) {
      desc = livePreviewIndentLine(desc);
    }

    const line = livePreviewJoinPartsPreserveFirst([
      desc,
      amount,
      uom,
      symbol,
    ]);
    if (livePreviewHasText(line)) {
      lines.push(line);
    }
    if (livePreviewHasText(def)) {
      definitions.push(def);
    }
  });
  return { lines: lines, definitions: definitions };
}

/**
 * @param {string[]} definitions
 * @returns {string[]}
 */
function livePreviewUniqueDefinitions(definitions) {
  const seen = new Set();
  const unique = [];
  (definitions || []).forEach(function (entry) {
    const value = livePreviewTrim(entry);
    if (!value || seen.has(value)) {
      return;
    }
    seen.add(value);
    unique.push(value);
  });
  return unique;
}

/**
 * @param {import('./types.js').V3State} state
 * @param {string} countryCode
 * @returns {string[]}
 */
export function livePreviewBuildLines(state, countryCode) {
  const totalLength = 30;
  if (!state || !state.tableData) {
    return ['No preview data available.'];
  }

  if (countryCode === 'CA') {
    const ingredientRows = state.tableData.CA_INGREDIENTS || [];
    const otherRows = state.tableData.CA_OTHER || [];
    const ingredientData =
      livePreviewBuildIngredientLines(ingredientRows);
    const otherValue =
      otherRows && otherRows.length
        ? livePreviewTrim(
            otherRows[0] && otherRows[0].cells
              ? otherRows[0].cells.DESCRIPTION
              : '',
          )
        : '';

    const lines = [];
    if (ingredientData.lines.length) {
      lines.push(
        livePreviewPadHeader(
          'Each Serving Contains Medicinal Ingredients:',
          totalLength,
        ),
      );
      lines.push.apply(lines, ingredientData.lines);
    }
    if (otherValue) {
      lines.push(
        livePreviewPadHeader(
          'Non-medicinal Ingredients:',
          totalLength,
        ),
      );
      lines.push(otherValue);
    }

    return lines.length ? lines : ['No preview data available.'];
  }

  const nutrientRows = state.tableData.US_NUTRIENTS || [];
  const ingredientRows = state.tableData.US_INGREDIENTS || [];
  const otherRows = state.tableData.US_OTHER || [];

  const nutrientData = livePreviewBuildNutrientLines(nutrientRows);
  const ingredientData =
    livePreviewBuildIngredientLines(ingredientRows);
  const otherValue =
    otherRows && otherRows.length
      ? livePreviewTrim(
          otherRows[0] && otherRows[0].cells
            ? otherRows[0].cells.DESCRIPTION
            : '',
        )
      : '';
  const definitions = livePreviewUniqueDefinitions(
    nutrientData.definitions.concat(ingredientData.definitions),
  );

  const lines = [];

  if (nutrientData.lines.length) {
    lines.push(livePreviewPadHeader('NUTRIENTS', totalLength));
    lines.push.apply(lines, nutrientData.lines);
  }

  if (ingredientData.lines.length) {
    lines.push(livePreviewPadHeader('INGREDIENTS', totalLength));
    lines.push.apply(lines, ingredientData.lines);
  }

  if (otherValue) {
    lines.push(
      livePreviewPadHeader('OTHER INGREDIENTS', totalLength),
    );
    lines.push(otherValue);
  }

  if (definitions.length) {
    lines.push('_'.repeat(totalLength));
    lines.push.apply(lines, definitions);
  }

  return lines.length ? lines : ['No preview data available.'];
}

/**
 * @param {HTMLElement} container
 * @param {string[]} lines
 * @returns {void}
 */
export function livePreviewRenderLines(container, lines) {
  if (!container) {
    return;
  }
  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'v3-preview-lines';
  (lines || []).forEach(function (line) {
    const row = document.createElement('div');
    row.className = 'v3-preview-line';
    if (livePreviewTrim(line).startsWith('_')) {
      row.classList.add('v3-preview-line-header');
    }
    row.textContent = line;
    list.appendChild(row);
  });
  container.appendChild(list);
}

/**
 * @param {import('./types.js').V3State} state
 * @param {string} context
 * @returns {void}
 */
export function livePreviewRender(state, context) {
  const container = document.getElementById('live-preview');
  if (!container) {
    return;
  }

  let header = container.querySelector('[data-preview-header]');
  let body = container.querySelector('[data-preview-body]');

  if (!header) {
    header = document.createElement('h5');
    header.dataset.previewHeader = 'true';
    container.appendChild(header);
  }

  if (!body) {
    body = document.createElement('div');
    body.dataset.previewBody = 'true';
    body.className = 'mt-2';
    container.appendChild(body);
  }

  header.textContent = 'Live Preview';
  const lines = livePreviewBuildLines(
    state,
    state ? state.countryCode : '',
  );
  livePreviewRenderLines(body, lines);
  if (context) {
    body.dataset.previewContext = context;
  } else {
    delete body.dataset.previewContext;
  }
}

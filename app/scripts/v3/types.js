/**
 * @typedef {Object} V3Column
 * @property {string} id
 * @property {string} label
 * @property {boolean} [isControl]
 * @property {boolean} [isFixed]
 */ //TODO: custom type

/**
 * @typedef {Object} V3TableDef
 * @property {string} key
 * @property {string} name
 * @property {string} tableId
 * @property {string} rowType
 * @property {'row'|'table'} pasteMode
 * @property {V3Column[]} columns
 */ //TODO: custom type

/**
 * @typedef {Object} V3Row
 * @property {string} id
 * @property {string} type
 * @property {Record<string, string>} cells
 * @property {Record<string, string>} [pipeData]
 */ //TODO: custom type

/**
 * @typedef {Object} V3DelimitedParseOptions
 * @property {string} [rowDelimiter]
 * @property {string} [cellDelimiter]
 */ //TODO: custom type

/**
 * @typedef {Object} V3SpreadsheetData
 * @property {string[]} headers
 * @property {string[][]} rows
 */ //TODO: custom type

/**
 * @typedef {Object} V3ImportResult
 * @property {boolean} ok
 * @property {string} fileName
 * @property {string} countryCode
 * @property {string} productId
 * @property {Record<string, V3Row[]>} tableData
 * @property {string[]} errors
 * @property {string[]} warnings
 */ //TODO: custom type

/**
 * @typedef {Object} V3State
 * @property {string} countryCode
 * @property {V3TableDef[]} tableDefs
 * @property {Record<string, V3Row[]>} tableData
 * @property {string} lastAction
 */ //TODO: custom type

/**
 * @typedef {Object} V3Ui
 * @property {(message: string, tone?: string) => void} renderStatus
 */ //TODO: custom type

/**
 * @typedef {Object} V3Actions
 * @property {(file: File) => Promise<V3ImportResult|null>} importSpreadsheet
 * @property {(text: string, tableKey?: string, rowId?: string) => boolean} pasteRowCA
 * @property {(text: string, tableKey?: string) => boolean} pasteTableUS
 * @property {(tableKey: string, rowId: string) => void} pipeifyRowCA
 * @property {(tableKey: string) => void} pipeifyTableUS
 * @property {(option: string) => void} pipeifyUS
 * @property {(option: string) => void} pipeifyCA
 * @property {() => void} changeProductId
 * @property {() => void} clearAllTableData
 */ //TODO: custom type

export const V3_TYPES = {};

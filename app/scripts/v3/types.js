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
 * @property {(file: File) => void} importSpreadsheet
 * @property {(text: string) => void} pasteRowCA
 * @property {(text: string) => void} pasteTableUS
 * @property {(option: string) => void} pipeifyUS
 * @property {(option: string) => void} pipeifyCA
 * @property {() => void} changeProductId
 * @property {() => void} clearAllTableData
 */ //TODO: custom type

export const V3_TYPES = {};

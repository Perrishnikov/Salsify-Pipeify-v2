/**
 * @returns {Promise<any>}
 */
export async function xlsxLoad() {
    if (globalThis && globalThis.XLSX) {
        return globalThis.XLSX;
    }
    const module = await import(
        'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/xlsx.mjs'
    );
    return module.default || module;
}

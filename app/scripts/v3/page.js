import { initInitV3Page } from './init.js';

/**
 * @returns {string}
 */
function pageGetCountryCode() {
    const body = document.body;
    if (!body || !body.dataset.countryCode) {
        return '';
    }
    return body.dataset.countryCode;
}

const countryCode = pageGetCountryCode();
if (countryCode) {
    initInitV3Page({ countryCode: countryCode });
}

/**
 * @param {string} countryCode
 * @param {string} context
 */
export function livePreviewRender(countryCode, context) {
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

    header.textContent = 'Live Preview (stub)';

    const source = context || 'init';
    const prefix = countryCode === 'CA' ? 'CA preview' : 'US preview';
    body.textContent = prefix + ' updated from ' + source + '.';
}

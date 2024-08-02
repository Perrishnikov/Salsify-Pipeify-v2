/**
 * Displays a Bootstrap toast notification.
 *
 * @param {string} message - The message to display in the toast.
 * @param {string} [type='success'] - The type of the toast (e.g., 'success', 'danger', 'warning', 'info', 'light', 'dark').
 * @param {string} [title=''] - An optional title for the toast.
 */
function bootToast(message, type = 'success', title = '') {
    // success danger warning info light dark

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title} </strong> ${message}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

    // Append toast to the container
    document.getElementById('toast-container').appendChild(toast);

    // Initialize and show the toast
    const toastElement = new bootstrap.Toast(toast);
    toastElement.show();
}

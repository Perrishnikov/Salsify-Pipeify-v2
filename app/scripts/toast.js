/**
 * Shows a toast notification with a specified message, type, and duration.
 *
 * @param {string} message - The message to display in the toast.
 * @param {string} type - The type of toast (info, warning, or error).
 * @param {number} [duration=3000] - The duration (in milliseconds) the toast is visible.
 */
function showToast(message, type, duration = 4000) {
    // Convert the type argument to lowercase
    const toastType = type.toLowerCase();

    // Get the toast container element
    const toastContainer = document.getElementById('toast-container');

    // Create a toast element
    const toast = document.createElement('div');
    toast.classList.add('toast', toastType); // Add toast and message type classes
    toast.textContent = message;

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Show the toast after a slight delay to trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove the toast after the specified duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300); // Allow time for the fade-out animation
    }, duration);
}

function bootToast(message, type = 'success', title = 'Notification') {
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
                    <strong>${title}</strong> ${message}
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
// Shared UI utilities (used across pages)

// Toast (already defined in chat.js, but we'll expose globally)
window.showToast = function(message) {
    // Implementation (can be used in any page)
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};
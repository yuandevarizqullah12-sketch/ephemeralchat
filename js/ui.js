// Toast sederhana
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'error' ? 'var(--danger)' : 'var(--accent)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: 'var(--radius-sm)',
        zIndex: 9999,
        boxShadow: 'var(--shadow)',
        fontSize: '0.9rem',
        maxWidth: '90%',
        textAlign: 'center',
        opacity: '0',
        transition: 'opacity 0.3s'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = '1', 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Modal konfirmasi sederhana
function confirmAction(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center;
            z-index: 10000; backdrop-filter: blur(4px);
        `;
        const box = document.createElement('div');
        box.className = 'glass';
        box.style.cssText = `
            padding: 24px; max-width: 400px; width:90%; border-radius: var(--radius);
            text-align: center;
        `;
        box.innerHTML = `
            <p style="margin-bottom:20px;">${message}</p>
            <button id="confirmYes" class="btn-primary btn-small" style="margin-right:8px;">Ya</button>
            <button id="confirmNo" class="btn-secondary btn-small">Batal</button>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        document.getElementById('confirmYes').onclick = () => {
            overlay.remove();
            resolve(true);
        };
        document.getElementById('confirmNo').onclick = () => {
            overlay.remove();
            resolve(false);
        };
    });
}

export { showToast, confirmAction };
// Generate ID unik (untuk Recovery ID)
function generateRecoveryId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) id += '-';
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Generate Device ID (random string)
function generateDeviceId() {
    return 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// Format timestamp ke string lokal
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cek apakah pesan kosong
function isEmptyMessage(text) {
    return text.trim().length === 0;
}

export {
    generateRecoveryId,
    generateDeviceId,
    formatTimestamp,
    escapeHtml,
    isEmptyMessage
};
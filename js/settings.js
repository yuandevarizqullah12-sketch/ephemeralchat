import { storageGet, storageRemove, storageClear } from './storage.js';
import { showToast, confirmAction } from './ui.js';

function initSettings() {
    const user = storageGet('user');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Tampilkan nama
    document.getElementById('displayNameDisplay').textContent = user.displayName || '-';

    // Recovery ID
    const recoveryIdMasked = document.getElementById('recoveryIdMasked');
    const showRecoveryBtn = document.getElementById('showRecoveryBtn');
    const copyRecoveryBtn = document.getElementById('copyRecoverySettingsBtn');

    let recoveryVisible = false;
    let recoveryId = user.recoveryId || '';

    showRecoveryBtn.addEventListener('click', () => {
        recoveryVisible = !recoveryVisible;
        recoveryIdMasked.textContent = recoveryVisible ? recoveryId : '••••••••';
        showRecoveryBtn.textContent = recoveryVisible ? '🙈 Sembunyikan' : '👁️ Tampilkan';
    });

    copyRecoveryBtn.addEventListener('click', () => {
        if (recoveryId) {
            navigator.clipboard.writeText(recoveryId).then(() => {
                showToast('Recovery ID disalin!');
            }).catch(() => {
                alert('Salin manual: ' + recoveryId);
            });
        } else {
            showToast('Tidak ada Recovery ID.', 'error');
        }
    });

    // Clear local data
    document.getElementById('clearLocalDataBtn').addEventListener('click', async () => {
        const confirmed = await confirmAction('Hapus semua data lokal? Anda harus login ulang.');
        if (confirmed) {
            storageClear();
            showToast('Data lokal dihapus.');
            window.location.href = 'index.html';
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const confirmed = await confirmAction('Keluar dari akun? Data lokal akan dihapus.');
        if (confirmed) {
            storageRemove('user');
            showToast('Anda telah keluar.');
            window.location.href = 'index.html';
        }
    });
}

export { initSettings };
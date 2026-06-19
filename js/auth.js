import { storageSet, storageGet } from './storage.js';
import { generateRecoveryId, generateDeviceId } from './utils.js';
import { validateDisplayName } from './validation.js';
import { addDocument, getDocument, queryDocuments, setDoc, doc, db } from './firebase.js';
import { showToast } from './ui.js';

// Cek apakah user sudah terdaftar (di localStorage)
function getLocalUser() {
    const user = storageGet('user');
    if (user && user.uid && user.recoveryId) {
        return user;
    }
    return null;
}

// Simpan user ke LocalStorage dan Firestore
async function registerUser(displayName) {
    const validation = validateDisplayName(displayName);
    if (!validation.valid) {
        showToast(validation.message, 'error');
        return null;
    }

    displayName = displayName.trim();

    // Generate UID (gunakan doc id)
    const uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const recoveryId = generateRecoveryId();
    const deviceId = generateDeviceId();

    // Pastikan recoveryId unik
    let existing = await queryDocuments('users', [{ field: 'recoveryId', operator: '==', value: recoveryId }]);
    let attempts = 0;
    while (existing.length > 0 && attempts < 10) {
        // generate ulang
        const newRecoveryId = generateRecoveryId();
        existing = await queryDocuments('users', [{ field: 'recoveryId', operator: '==', value: newRecoveryId }]);
        if (existing.length === 0) {
            recoveryId = newRecoveryId;
            break;
        }
        attempts++;
    }

    const userData = {
        uid,
        displayName,
        recoveryId,
        deviceId,
        createdAt: new Date()
    };

    try {
        await setDoc(doc(db, 'users', uid), userData);
        // Simpan ke localStorage
        storageSet('user', { uid, displayName, recoveryId, deviceId });
        return userData;
    } catch (e) {
        console.error('Gagal registrasi:', e);
        showToast('Gagal mendaftar. Coba lagi.', 'error');
        return null;
    }
}

// Init landing page
function initAuth() {
    const displayInput = document.getElementById('displayNameInput');
    const agreeCheck = document.getElementById('agreeCheck');
    const startBtn = document.getElementById('startBtn');
    const charCount = document.getElementById('charCount');
    const recoverySection = document.getElementById('recoverySection');
    const recoveryIdDisplay = document.getElementById('recoveryIdDisplay');
    const copyRecoveryBtn = document.getElementById('copyRecoveryBtn');
    const proceedBtn = document.getElementById('proceedToChatBtn');
    const authMessage = document.getElementById('authMessage');

    // Cek user existing
    const existingUser = getLocalUser();
    if (existingUser) {
        // langsung arahkan ke chat
        window.location.href = 'chat.html';
        return;
    }

    // Update char count
    displayInput.addEventListener('input', () => {
        charCount.textContent = displayInput.value.length;
        updateStartButton();
    });

    agreeCheck.addEventListener('change', updateStartButton);
    displayInput.addEventListener('input', updateStartButton);

    function updateStartButton() {
        const name = displayInput.value.trim();
        const agreed = agreeCheck.checked;
        startBtn.disabled = !(agreed && name.length > 0 && name.length <= 30);
    }

    startBtn.addEventListener('click', async () => {
        const displayName = displayInput.value.trim();
        const agreed = agreeCheck.checked;
        if (!agreed) {
            authMessage.textContent = 'Harap setujui Panduan Komunitas.';
            return;
        }
        const validation = validateDisplayName(displayName);
        if (!validation.valid) {
            authMessage.textContent = validation.message;
            return;
        }

        authMessage.textContent = '';
        startBtn.disabled = true;
        startBtn.textContent = 'Memproses...';

        const user = await registerUser(displayName);
        if (user) {
            // Tampilkan recovery ID
            recoverySection.style.display = 'block';
            recoveryIdDisplay.textContent = user.recoveryId;
            startBtn.style.display = 'none';
            // Sembunyikan form
            document.querySelector('.guidelines').style.display = 'none';
            document.querySelector('.privacy-warning').style.display = 'none';
            document.querySelector('.checkbox-group').style.display = 'none';
            document.querySelector('.form-group').style.display = 'none';
            // Sembunyikan tagline? opsional
        } else {
            startBtn.disabled = false;
            startBtn.textContent = 'Lanjutkan →';
        }
    });

    copyRecoveryBtn.addEventListener('click', () => {
        const text = recoveryIdDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Recovery ID disalin!');
        }).catch(() => {
            // fallback
            const range = document.createRange();
            range.selectNode(recoveryIdDisplay);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            showToast('Recovery ID disalin!');
        });
    });

    proceedBtn.addEventListener('click', () => {
        window.location.href = 'chat.html';
    });
}

export { initAuth, getLocalUser, registerUser };
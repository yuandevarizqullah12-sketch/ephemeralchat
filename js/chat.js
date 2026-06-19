import { db, addDocument, listenCollection, serverTimestamp, Timestamp } from './firebase.js';
import { storageGet } from './storage.js';
import { formatTimestamp, escapeHtml, isEmptyMessage } from './utils.js';
import { containsSensitiveData, sanitizeInput } from './security.js';
import { validateMessage } from './validation.js';
import { showToast, confirmAction } from './ui.js';

let currentUser = null;
let lastMessageTime = 0;
let messageListener = null;
let isSending = false;

function initChat() {
    // Ambil user dari localStorage
    const user = storageGet('user');
    if (!user || !user.uid) {
        // Redirect ke index
        window.location.href = 'index.html';
        return;
    }
    currentUser = user;

    // Setup UI
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const messageContainer = document.getElementById('messageContainer');
    const emptyState = document.getElementById('emptyState');
    const spamWarning = document.getElementById('spamWarning');
    const sensitiveWarning = document.getElementById('sensitiveWarning');

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
        sendBtn.disabled = isEmptyMessage(messageInput.value);
    });

    // Send on Enter (Shift+Enter untuk newline)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    // Load messages realtime
    loadMessages();

    // Fungsi kirim
    async function sendMessage() {
        if (isSending) return;
        const text = messageInput.value;
        const validation = validateMessage(text);
        if (!validation.valid) {
            showToast(validation.message, 'error');
            return;
        }

        // Anti-spam: 2 detik
        const now = Date.now();
        if (now - lastMessageTime < 2000) {
            spamWarning.style.display = 'block';
            setTimeout(() => spamWarning.style.display = 'none', 3000);
            return;
        }

        // Filter konten sensitif
        const cleanText = sanitizeInput(text);
        if (containsSensitiveData(cleanText)) {
            sensitiveWarning.innerHTML = `⚠️ Pesan Anda mengandung informasi sensitif (password, OTP, nomor telepon, dll). Yakin ingin mengirim?`;
            sensitiveWarning.style.display = 'block';
            const confirmed = await confirmAction('Pesan terdeteksi mengandung data sensitif. Lanjutkan kirim?');
            sensitiveWarning.style.display = 'none';
            if (!confirmed) {
                return;
            }
        }

        // Kirim
        isSending = true;
        sendBtn.disabled = true;
        try {
            const messageData = {
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                message: cleanText,
                createdAt: serverTimestamp(),
                expireAt: Timestamp.fromDate(new Date(Date.now() + 12 * 60 * 60 * 1000)) // 12 jam
            };
            await addDocument('messages', messageData);
            lastMessageTime = now;
            messageInput.value = '';
            messageInput.style.height = 'auto';
            sendBtn.disabled = true;
            // Scroll ke bawah setelah kirim (akan otomatis oleh listener)
        } catch (e) {
            console.error('Gagal kirim:', e);
            showToast('Gagal mengirim pesan.', 'error');
        } finally {
            isSending = false;
            sendBtn.disabled = isEmptyMessage(messageInput.value);
        }
    }

    function loadMessages() {
        // Listener realtime
        if (messageListener) messageListener();
        messageListener = listenCollection(
            'messages',
            (docs) => {
                renderMessages(docs);
            },
            [], // tanpa filter
            'createdAt',
            'asc'
        );
    }

    function renderMessages(docs) {
        const container = document.getElementById('messageContainer');
        const emptyState = document.getElementById('emptyState');

        if (docs.length === 0) {
            container.innerHTML = `<div class="empty-state" id="emptyState"><span>💬</span><p>Belum ada pesan. Mulai percakapan!</p></div>`;
            return;
        }

        // Hapus empty state jika ada
        const existingEmpty = container.querySelector('.empty-state');
        if (existingEmpty) existingEmpty.remove();

        // Build HTML
        let html = '';
        docs.forEach((doc) => {
            const isOwn = doc.uid === currentUser.uid;
            const time = formatTimestamp(doc.createdAt);
            const displayName = escapeHtml(doc.displayName) || 'Anonim';
            const message = escapeHtml(doc.message);
            html += `
                <div class="message-item ${isOwn ? 'own' : ''}" data-id="${doc.id}">
                    <div class="message-header">
                        <span class="message-name">${displayName}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-text">${message}</div>
                    <div class="message-actions">
                        ${!isOwn ? `<button class="report-btn" data-id="${doc.id}">🚩 Laporkan</button>` : ''}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        // Auto scroll ke bawah
        const chatMain = document.getElementById('chatMain');
        chatMain.scrollTop = chatMain.scrollHeight;

        // Event listener untuk report
        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const messageId = btn.dataset.id;
                const reason = prompt('Alasan melaporkan pesan ini:');
                if (reason && reason.trim().length > 0) {
                    try {
                        await addDocument('reports', {
                            messageId: messageId,
                            reporterUid: currentUser.uid,
                            reason: reason.trim(),
                            createdAt: serverTimestamp()
                        });
                        showToast('Pesan dilaporkan. Terima kasih.');
                    } catch (err) {
                        showToast('Gagal melaporkan.', 'error');
                    }
                }
            });
        });
    }

    // Status online (dot)
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    // Simulasi status
    setInterval(() => {
        statusDot.style.background = '#48bb78';
        statusText.textContent = 'Online';
    }, 5000);
}

export { initChat };
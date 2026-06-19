// Simple symmetric encryption using CryptoJS
// For demo purposes, using a fixed key. In production, derive per-user/room key.
const SECRET_KEY = 'ephemeral-chat-secret-key-v1';

// Encrypt message
function encryptMessage(text) {
    try {
        if (!text) return '';

        return CryptoJS.AES.encrypt(
            String(text),
            SECRET_KEY
        ).toString();
    } catch (e) {
        console.warn('Encryption failed:', e);
        return '';
    }
}

// Decrypt message
function decryptMessage(ciphertext) {
    try {
        if (!ciphertext) return '';

        const bytes = CryptoJS.AES.decrypt(
            ciphertext,
            SECRET_KEY
        );

        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        // fallback kalau gagal decrypt
        return decrypted || '[invalid message]';
    } catch (e) {
        console.warn('Decryption failed:', e);
        return '[decryption error]';
    }
}
// Shared secret key (for demo; in production derive per room or use key exchange)
const SECRET_KEY = 'ephemeralchat-v1-7fX9@secure-key';

function encryptMessage(text) {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decryptMessage(ciphertext) {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.warn('Decryption failed:', e);
        return '[decryption error]';
    }
}
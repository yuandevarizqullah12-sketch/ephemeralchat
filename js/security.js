// Daftar kata sensitif (regex)
const sensitivePatterns = [
    /password/i,
    /otp/i,
    /kode verifikasi/i,
    /\b\d{10,13}\b/, // nomor telepon sederhana
    /email/i,
    /alamat/i,
    /ktp/i,
    /npwp/i,
    /kartu kredit/i,
    /pin/i
];

function containsSensitiveData(text) {
    for (let pattern of sensitivePatterns) {
        if (pattern.test(text)) {
            return true;
        }
    }
    return false;
}

// Sanitasi input
function sanitizeInput(text) {
    return text.trim().replace(/<[^>]*>/g, ''); // hapus tag HTML
}

export { containsSensitiveData, sanitizeInput };
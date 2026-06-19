function validateDisplayName(name) {
    if (!name || name.trim().length === 0) {
        return { valid: false, message: 'Nama tidak boleh kosong.' };
    }
    if (name.trim().length > 30) {
        return { valid: false, message: 'Nama maksimal 30 karakter.' };
    }
    return { valid: true };
}

function validateMessage(text) {
    if (!text || text.trim().length === 0) {
        return { valid: false, message: 'Pesan tidak boleh kosong.' };
    }
    if (text.length > 500) {
        return { valid: false, message: 'Pesan maksimal 500 karakter.' };
    }
    return { valid: true };
}

export { validateDisplayName, validateMessage };
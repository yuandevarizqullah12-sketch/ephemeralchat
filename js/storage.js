// Wrapper untuk LocalStorage
function storageSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Storage set error:', e);
    }
}

function storageGet(key) {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    } catch (e) {
        console.warn('Storage get error:', e);
        return null;
    }
}

function storageRemove(key) {
    localStorage.removeItem(key);
}

function storageClear() {
    localStorage.clear();
}

export { storageSet, storageGet, storageRemove, storageClear };
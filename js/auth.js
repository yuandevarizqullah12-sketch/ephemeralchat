// User functions

function generatePublicId() {
    // Generate a short unique ID (e.g., 6 alphanumeric)
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createUser(displayName) {
    // Check if already exists in localStorage
    const existing = JSON.parse(localStorage.getItem('ephemeral_user') || 'null');
    if (existing && existing.userId) {
        return existing;
    }

    // Generate userId (use Firestore doc with auto-id or custom)
    const userId = db.collection('users').doc().id;
    const publicId = generatePublicId();

    // Check uniqueness of publicId (simple loop, but in production handle retries)
    let unique = false;
    let attempts = 0;
    let finalPublicId = publicId;
    while (!unique && attempts < 5) {
        const snapshot = await db.collection('users').where('publicId', '==', finalPublicId).get();
        if (snapshot.empty) {
            unique = true;
        } else {
            finalPublicId = generatePublicId();
            attempts++;
        }
    }
    if (!unique) {
        throw new Error('Could not generate unique public ID.');
    }

    const userData = {
        name: displayName.trim(),
        publicId: finalPublicId,
        online: true,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userId).set(userData);

    const user = {
        userId,
        name: displayName.trim(),
        publicId: finalPublicId
    };
    localStorage.setItem('ephemeral_user', JSON.stringify(user));
    return user;
}

async function getUserByPublicId(publicId) {
    const snapshot = await db.collection('users').where('publicId', '==', publicId).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { userId: doc.id, ...doc.data() };
}

async function updateUserOnlineStatus(userId, online) {
    await db.collection('users').doc(userId).update({
        online: online,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Listen to user status changes
function listenUserStatus(userId, callback) {
    return db.collection('users').doc(userId).onSnapshot((doc) => {
        if (doc.exists) {
            callback(doc.data());
        }
    });
}
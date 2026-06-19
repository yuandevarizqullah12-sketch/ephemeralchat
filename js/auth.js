// Auth functions

// Generate a random user ID (numeric string)
function generateUserId() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

// Generate a public ID (alphanumeric)
function generatePublicId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new user
async function createUser(username) {
    username = username.trim();
    if (!username) throw new Error('Username required');

    // Check if username already exists (optional)
    const snapshot = await db.collection('users').where('username', '==', username).get();
    if (!snapshot.empty) {
        // Username taken – we could auto-generate a suffix, but we'll just reject
        throw new Error('Username already taken. Please choose another.');
    }

    // Generate unique userId (simple numeric, but ensure uniqueness)
    let userId = generateUserId();
    let attempts = 0;
    let userDoc = await db.collection('users').doc(userId).get();
    while (userDoc.exists && attempts < 10) {
        userId = generateUserId();
        userDoc = await db.collection('users').doc(userId).get();
        attempts++;
    }
    if (userDoc.exists) {
        throw new Error('Could not generate unique user ID.');
    }

    const publicId = generatePublicId();

    const userData = {
        username,
        publicId,
        online: true,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userId).set(userData);

    return {
        userId,
        username,
        publicId
    };
}

// Login user
async function loginUser(username, userId) {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (data.username === username) {
        // Update online status
        await db.collection('users').doc(userId).update({
            online: true,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
        return {
            userId,
            username: data.username,
            publicId: data.publicId || ''
        };
    }
    return null;
}

// Update online status
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

// Get user by public ID (for new chat)
async function getUserByPublicId(publicId) {
    const snapshot = await db.collection('users').where('publicId', '==', publicId).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { userId: doc.id, ...doc.data() };
}

// Get user by userId
async function getUserById(userId) {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) return { userId, ...doc.data() };
    return null;
}
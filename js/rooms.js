// Room utilities

function getRoomId(userId1, userId2) {
    // Deterministic sorted concatenation
    const ids = [userId1, userId2].sort();
    return ids.join('_');
}

async function getOrCreateRoom(userId1, userId2) {
    const roomId = getRoomId(userId1, userId2);
    const roomRef = db.collection('rooms').doc(roomId);
    const doc = await roomRef.get();

    if (doc.exists) {
        return { roomId, ...doc.data() };
    } else {
        // Create new room
        const roomData = {
            members: [userId1, userId2],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            typing: {}
        };
        await roomRef.set(roomData);
        return { roomId, ...roomData };
    }
}

async function getUserRooms(userId) {
    const snapshot = await db.collection('rooms')
        .where('members', 'array-contains', userId)
        .orderBy('lastActivity', 'desc')
        .get();
    return snapshot.docs.map(doc => ({ roomId: doc.id, ...doc.data() }));
}

// Listen to typing indicator
function listenTyping(roomId, callback) {
    return db.collection('rooms').doc(roomId).onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if (data && data.typing) {
                callback(data.typing);
            }
        }
    });
}

// Update typing status
async function setTyping(roomId, userId, isTyping) {
    await db.collection('rooms').doc(roomId).update({
        [`typing.${userId}`]: isTyping
    });
}

// Get last message for room (for preview)
async function getLastMessage(roomId) {
    const snapshot = await db.collection('rooms').doc(roomId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
}
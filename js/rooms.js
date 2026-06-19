// Room utilities

function getRoomId(userId1, userId2) {
    // Deterministic room ID: sort userIds and concatenate
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
            typing: {} // map of userId: boolean
        };
        await roomRef.set(roomData);
        return { roomId, ...roomData };
    }
}

async function getUserRooms(userId) {
    // Get all rooms where userId is in members array
    const snapshot = await db.collection('rooms')
        .where('members', 'array-contains', userId)
        .orderBy('lastActivity', 'desc')
        .get();
    return snapshot.docs.map(doc => ({ roomId: doc.id, ...doc.data() }));
}

// Listen for typing indicator
function listenTyping(roomId, callback) {
    return db.collection('rooms').doc(roomId).onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if (data.typing) {
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
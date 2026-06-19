// Chat module

let currentUser = null;
let currentRoomId = null;
let currentPartnerId = null;
let messagesUnsubscribe = null;
let typingUnsubscribe = null;
let statusUnsubscribe = null;

function initChat(session) {
    currentUser = session;
    document.getElementById('sidebarUserName').textContent = session.username;

    // Load rooms
    loadRooms();

    // New chat button
    document.getElementById('newChatBtn').addEventListener('click', startNewChat);

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        window.location.href = 'settings.html';
    });

    // Logout
    document.getElementById('logoutSidebarBtn').addEventListener('click', () => {
        if (confirm('Logout?')) {
            window.updateUserOnlineStatus(currentUser.userId, false);
            localStorage.removeItem('ephemeral_session');
            window.location.href = 'login.html';
        }
    });

    // Send message
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Typing detection
    let typingTimeout = null;
    messageInput.addEventListener('input', () => {
        if (currentRoomId && currentPartnerId) {
            window.setTyping(currentRoomId, currentUser.userId, true);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                window.setTyping(currentRoomId, currentUser.userId, false);
            }, 1000);
        }
    });

    // Update online status on visibility change
    document.addEventListener('visibilitychange', () => {
        const online = document.visibilityState === 'visible';
        window.updateUserOnlineStatus(currentUser.userId, online);
    });

    // Set initial online status
    window.updateUserOnlineStatus(currentUser.userId, true);

    // Handle back button on mobile (in chat area)
    document.querySelector('.chat-header .back-btn')?.addEventListener('click', () => {
        document.getElementById('chatArea').classList.remove('active');
        document.getElementById('sidebar').style.display = 'flex';
    });
}

async function loadRooms() {
    const rooms = await window.getUserRooms(currentUser.userId);
    const roomsList = document.getElementById('roomsList');
    roomsList.innerHTML = '';

    if (rooms.length === 0) {
        roomsList.innerHTML = '<div class="empty-rooms" style="padding:20px;color:var(--text-secondary);">No chats yet. Start a new chat!</div>';
        return;
    }

    for (const room of rooms) {
        const partnerId = room.members.find(id => id !== currentUser.userId);
        if (!partnerId) continue;
        const partnerData = await window.getUserById(partnerId);
        const partnerName = partnerData ? partnerData.username : 'Unknown';

        const lastMsg = await window.getLastMessage(room.roomId);
        let lastText = '';
        if (lastMsg && lastMsg.text) {
            lastText = window.decryptMessage(lastMsg.text);
        }

        const div = document.createElement('div');
        div.className = 'room-item';
        div.dataset.roomId = room.roomId;
        div.dataset.partnerId = partnerId;
        div.innerHTML = `
            <span class="room-name">${partnerName}</span>
            <span class="room-last-msg">${lastText.substring(0, 30)}</span>
        `;
        div.addEventListener('click', () => {
            selectRoom(room.roomId, partnerId);
        });
        roomsList.appendChild(div);
    }

    // Auto-select first room if any
    if (rooms.length > 0) {
        const firstRoom = rooms[0];
        const partnerId = firstRoom.members.find(id => id !== currentUser.userId);
        if (partnerId) {
            selectRoom(firstRoom.roomId, partnerId);
        }
    }
}

function selectRoom(roomId, partnerId) {
    if (currentRoomId === roomId) {
        // Already selected, just ensure chat is visible on mobile
        showChatArea();
        return;
    }

    // Unsubscribe previous listeners
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (typingUnsubscribe) typingUnsubscribe();
    if (statusUnsubscribe) statusUnsubscribe();

    currentRoomId = roomId;
    currentPartnerId = partnerId;

    // Update header
    window.getUserById(partnerId).then(partner => {
        document.getElementById('chatPartnerName').textContent = partner ? partner.username : 'Unknown';
        // Listen to partner status
        statusUnsubscribe = window.listenUserStatus(partnerId, (data) => {
            const dot = document.getElementById('chatPartnerStatus');
            if (data && data.online) {
                dot.className = 'status-dot online';
            } else {
                dot.className = 'status-dot offline';
            }
        });
    });

    // Highlight room in sidebar
    document.querySelectorAll('.room-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.room-item[data-room-id="${roomId}"]`);
    if (activeItem) activeItem.classList.add('active');

    // Load messages
    loadMessages(roomId);

    // Listen for typing
    typingUnsubscribe = window.listenTyping(roomId, (typingMap) => {
        const indicator = document.getElementById('typingIndicator');
        if (typingMap && typingMap[partnerId] === true) {
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    });

    // Update room lastActivity
    db.collection('rooms').doc(roomId).update({
        lastActivity: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Show chat area (mobile)
    showChatArea();
}

function showChatArea() {
    const chatArea = document.getElementById('chatArea');
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 700) {
        chatArea.classList.add('active');
        sidebar.style.display = 'none';
    } else {
        chatArea.classList.remove('active');
        sidebar.style.display = 'flex';
    }
}

function loadMessages(roomId) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '<div class="empty-chat">Loading messages...</div>';

    messagesUnsubscribe = db.collection('rooms').doc(roomId)
        .collection('messages')
        .orderBy('createdAt', 'asc')
        .onSnapshot((snapshot) => {
            const now = new Date();
            const messages = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Filter expired messages (12h)
                if (data.expiresAt && data.expiresAt.toDate) {
                    const expireDate = data.expiresAt.toDate();
                    if (expireDate < now) {
                        // Optionally delete expired message from Firestore
                        doc.ref.delete().catch(console.warn);
                        return;
                    }
                }
                messages.push({ id: doc.id, ...data });
            });
            renderMessages(messages);
        }, (error) => {
            console.error('Message listener error:', error);
        });
}

function renderMessages(messages) {
    const container = document.getElementById('messagesContainer');
    if (messages.length === 0) {
        container.innerHTML = '<div class="empty-chat">No messages yet. Say hello!</div>';
        return;
    }

    let html = '';
    messages.forEach(msg => {
        const isOwn = msg.senderId === currentUser.userId;
        const time = msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
        let text = msg.text;
        if (text) {
            text = window.decryptMessage(text);
        }
        const bubbleClass = isOwn ? 'own' : 'other';
        html += `
            <div class="message ${bubbleClass}">
                <div class="msg-text">${text}</div>
                <div class="msg-time">${time}</div>
            </div>
        `;
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !currentRoomId) return;

    // Encrypt message
    const encrypted = window.encryptMessage(text);

    const messageData = {
        text: encrypted,
        senderId: currentUser.userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        expiresAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 12 * 60 * 60 * 1000)) // 12h
    };

    try {
        await db.collection('rooms').doc(currentRoomId)
            .collection('messages').add(messageData);
        input.value = '';
        input.style.height = 'auto';
        // Update lastActivity
        await db.collection('rooms').doc(currentRoomId).update({
            lastActivity: firebase.firestore.FieldValue.serverTimestamp()
        });
        // Reset typing
        window.setTyping(currentRoomId, currentUser.userId, false);
    } catch (e) {
        console.error('Send error:', e);
        window.showToast('Failed to send message.');
    }
}

function startNewChat() {
    const publicId = prompt('Enter the Public ID of the person you want to chat with:');
    if (!publicId) return;

    window.getUserByPublicId(publicId.toUpperCase()).then(async (partner) => {
        if (!partner) {
            window.showToast('User not found.');
            return;
        }
        if (partner.userId === currentUser.userId) {
            window.showToast('You cannot chat with yourself.');
            return;
        }
        // Create or get room
        const room = await window.getOrCreateRoom(currentUser.userId, partner.userId);
        // Reload rooms and select this room
        await loadRooms();
        // Select the room
        const roomId = room.roomId;
        const partnerId = partner.userId;
        // Find the room element and click it
        const roomEl = document.querySelector(`.room-item[data-room-id="${roomId}"]`);
        if (roomEl) {
            roomEl.click();
        } else {
            // If not found, reload and try again
            loadRooms();
            setTimeout(() => {
                const el = document.querySelector(`.room-item[data-room-id="${roomId}"]`);
                if (el) el.click();
            }, 500);
        }
    }).catch(err => {
        window.showToast('Error: ' + err.message);
    });
}
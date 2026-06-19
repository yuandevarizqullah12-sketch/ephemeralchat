const firebaseConfig = {
    apiKey: "AIzaSyAOw_G_9kCSJehGUIn3gH_W0NjsSNmjjQ4",
    authDomain: "ephemeralchat-9d957.firebaseapp.com",
    projectId: "ephemeralchat-9d957",
    storageBucket: "ephemeralchat-9d957.firebasestorage.app",
    messagingSenderId: "281166149064",
    appId: "1:281166149064:web:c6fc02cf83223ac62cbcfd"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();

// Persistence (SAFE MODE)
db.enablePersistence()
  .catch((err) => {
    console.warn("Persistence skipped:", err.code);
  });

// global access
window.db = db;
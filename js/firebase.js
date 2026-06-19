// Firebase configuration – replace with your own
const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyReplaceMe",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Enable offline persistence (optional)
db.enablePersistence().catch(err => {
    console.warn('Firestore persistence error:', err);
});
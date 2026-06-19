import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    setDoc,
    deleteDoc,
    updateDoc,
    where,
    Timestamp
} from 'firebase/firestore';
import { config } from './config.js';

// Inisialisasi Firebase
const app = initializeApp(config);
const db = getFirestore(app);

// Helper: tambah dokumen
async function addDocument(collectionName, data) {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef;
    } catch (e) {
        console.error('Error adding document: ', e);
        throw e;
    }
}

// Helper: get dokumen
async function getDocument(collectionName, docId) {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Helper: query dengan kondisi
async function queryDocuments(collectionName, conditions = [], orderByField = null, orderDir = 'asc', limitCount = null) {
    let q = collection(db, collectionName);
    // Terapkan where
    if (conditions.length > 0) {
        conditions.forEach(cond => {
            q = query(q, where(cond.field, cond.operator, cond.value));
        });
    }
    if (orderByField) {
        q = query(q, orderBy(orderByField, orderDir));
    }
    if (limitCount) {
        q = query(q, limit(limitCount));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Realtime listener
function listenCollection(collectionName, callback, conditions = [], orderByField = 'createdAt', orderDir = 'asc') {
    let q = collection(db, collectionName);
    if (conditions.length > 0) {
        conditions.forEach(cond => {
            q = query(q, where(cond.field, cond.operator, cond.value));
        });
    }
    if (orderByField) {
        q = query(q, orderBy(orderByField, orderDir));
    }
    return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(docs);
    }, (error) => {
        console.error('Listener error:', error);
    });
}

export {
    db,
    addDocument,
    getDocument,
    queryDocuments,
    listenCollection,
    serverTimestamp,
    Timestamp,
    doc,
    setDoc,
    deleteDoc,
    updateDoc
};
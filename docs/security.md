# Firestore Security Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: hanya dapat mengakses dokumen sendiri
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    // Messages: siapa saja bisa baca, tulis hanya jika uid cocok
    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.auth.uid == request.resource.data.uid;
      allow update, delete: if false; // tidak boleh diubah/dihapus
    }
    // Reports: hanya dapat membuat report dengan uid pelapor
    match /reports/{reportId} {
      allow create: if request.auth.uid == request.resource.data.reporterUid;
      allow read: if request.auth.uid == resource.data.reporterUid;
    }
  }
}
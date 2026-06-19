# Arsitektur

Aplikasi dibangun dengan pendekatan modular. Setiap modul bertanggung jawab atas satu domain.

## Flow Data
- Firestore sebagai sumber kebenaran.
- LocalStorage untuk menyimpan identitas user.
- Realtime via onSnapshot.

## Keamanan
- Security Rules membatasi akses berdasarkan UID.
- Client-side validation untuk spam dan konten sensitif.

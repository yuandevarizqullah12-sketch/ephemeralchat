<<<<<<< HEAD
# Ephemeral Global Chat

Real-time global chat dengan auto-delete pesan setelah 12 jam. Tanpa login, hanya nama tampilan.

## Teknologi
- HTML5, CSS3, Vanilla JS (ES6+)
- Firebase Firestore (realtime)
- Vercel (hosting + env vars)

## Struktur Folder
Lihat docs/architecture.md

## Cara Instalasi & Deploy
1. Buat project Firebase, aktifkan Firestore.
2. Dapatkan konfigurasi API.
3. Set environment variables di Vercel:
   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_PROJECT_ID
   - FIREBASE_STORAGE_BUCKET
   - FIREBASE_MESSAGING_SENDER_ID
   - FIREBASE_APP_ID
4. Deploy ke Vercel dengan `vercel --prod`.

## Menjalankan Lokal
Gunakan live server atau `python -m http.server`.

## Security Rules
File `firestore.rules` disertakan di docs/security.md

## Fitur
- Auto-delete setelah 12 jam (gunakan cron job atau scheduled function)
- Anti-spam (1 pesan/2 detik)
- Filter konten sensitif (password, OTP, dll)
- Report system
- Recovery ID

## Upgrade ke V2
- Tambahkan reaksi, reply, dan private chat.
=======
# ephemeralchat
Realtime global chat app with ephemeral messages (auto delete after 12 hours) built with HTML, CSS, JS, Firebase, and Vercel.
>>>>>>> e3509aea86b6df6ae6790b10879f140b3625cdbb

# 🛠 MTMS - Backend Technical Guide

Dokumen ini menjelaskan arsitektur, standar penulisan kode, dan konfigurasi teknis untuk backend MTMS.

## 🏗 Arsitektur Sistem
Backend dibangun menggunakan **Node.js** dengan framework **Express.js** dan **Sequelize ORM**.

### Struktur Folder (`Backend/src/`)
- `config/`: Konfigurasi database dan pihak ketiga.
- `controllers/`: Logika bisnis per fitur.
- `middlewares/`: Fungsi perantara (Auth, Validasi, Upload, Error Handling).
- `models/`: Definisi skema database menggunakan Sequelize.
- `routes/`: Definisi endpoint API.
- `utils/`: Fungsi pembantu global (seperti standar respon API).
- `uploads/`: Penyimpanan file fisik (nota/avatar).

---

## 🚀 Setup & Instalasi

### 1. Instalasi Dependensi
```bash
cd Backend
npm install
```

### 2. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya:
- `PORT`: Port server (default: 5000).
- `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`: Kredensial MySQL.
- `JWT_SECRET`: Kunci rahasia untuk token.
- `JWT_EXPIRE`: Masa berlaku token (contoh: `12h`).

### 3. Database
Pastikan MySQL berjalan dan buat database sesuai `DB_NAME`. Jalankan server untuk sync table:
```bash
npm run dev
```

---

## 📋 Standar Penulisan Kode

### 1. Respon API Terstandarisasi
Setiap controller **wajib** menggunakan utilitas `sendResponse.js`.
```javascript
const sendResponse = require('../utils/response');

// Contoh penggunaan:
return sendResponse(res, 200, 'success', 'Data berhasil diambil', data);
```

### 2. Penanganan Error
Gunakan `next(err)` dalam blok `catch` untuk meneruskan error ke Global Error Handler di `app.js`.

---

## 🔐 Keamanan (Security)
- **Helmet**: Keamanan header HTTP.
- **CORS**: Pembatasan akses origin.
- **Rate Limit**: Pembatasan request untuk mencegah brute-force (Global & Login khusus).
- **JWT**: Autentikasi berbasis token di header `Authorization: Bearer <token>`.
- **RBAC**: Middleware `authorize('role')` untuk membatasi akses fitur tertentu.

---

## 📂 File Management
File diunggah menggunakan **Multer**. Path file disimpan di database sebagai URL relatif (contoh: `/uploads/file.jpg`). Akses file fisik dilindungi oleh middleware untuk memastikan hanya user berwenang yang bisa melihat lampiran task.

# 📋 MTMS - Project Guide & Walkthrough

Proyek ini adalah **Work Management System (Task Management)** yang dirancang untuk mengelola tugas, kolaborasi tim, dan sistem persetujuan anggaran berbasis peran (*Role-Based Access Control*).

## 🛠 Tech Stack
- **Backend**: Node.js, Express.js
- **ORM**: Sequelize (MySQL)
- **Database**: MySQL (`mtms_db`)
- **Authentication**: JWT (JSON Web Token)
- **File Upload**: Multer (Local Storage)
- **Security**: Helmet, CORS, Rate Limiting, RBAC Middlewares

---

## 🏗 Arsitektur Proyek
Struktur folder utama di **Backend/src/**:
- **models/**: Definisi skema database (User, Task, TaskActivity, TaskMember, BudgetRequest).
- **controllers/**: Logika bisnis utama untuk tiap fitur.
- **routes/**: Definisi endpoint API.
- **middlewares/**: Middleware untuk Auth (`protect`), akses task (`checkTaskAccess`), dan validasi budget.
- **utils/**: Script bantuan (seperti `seedEmperor`).

---

## 🚀 Fitur yang Sudah Selesai

### 1. Auth & Role System
- Role tersedia: `emperor` (superadmin), `admin`, dan `user`.
- Middleware `protect` untuk mengamankan route.

### 2. Task System
- Create & Manage Task.
- **Task Member**: Menambahkan atau menghapus kolaborator dalam satu task.
- **Timeline Activity**: Setiap aktivitas (komentar, progres, upload file) dicatat secara otomatis dalam timeline.

### 3. Budget Approval System (Inti)
- **Create Request**: User dapat mengajukan dana untuk task tertentu.
- **Approval Flow**: Admin/Emperor dapat menyetujui (`approved`) atau menolak (`rejected`) pengajuan.
- **Actual Cost**: Setelah disetujui, user dapat mengupdate biaya riil dan **wajib** mengunggah foto nota/invoice.
- **Track Record**: Semua perubahan status budget dan pengeluaran rill tercatat di timeline task.

### 4. File Management
- Upload file aman melalui multer.
- Akses file dilindungi oleh otentikasi.

### 5. API Standardization & Security (Stabilization)
- **Standardized Response Envelope**: Semua endpoint API mengembalikan format seragam `{ status, message, data }`.
- **Security Hardening**:
    - **Rate Limiting**: Pencegahan brute-force dan spam request di level API.
    - **JWT Configuration**: Eksperasi token yang dapat dikonfigurasi melalui `.env`.
    - **Global Error Handling**: Penanganan error terpusat untuk menjaga stabilitas server.
    - **404 Route Handler**: Penanganan endpoint yang tidak terdaftar secara elegan.

---

## 📊 Model Database & Relasi
- **Task** belongsTo **User** (Creator & Assignee).
- **Task** hasMany **TaskActivity**.
- **Task** hasMany **TaskMember**.
- **Task** hasMany **BudgetRequest**.
- **BudgetRequest** belongsTo **User** (Requester & Approver).



## 🚧 Status Terakhir
- **API Stabilization Complete**: Seluruh controller (Auth, Task, Dashboard, Emperor, Budget) telah distandarisasi.
- **Auth Fix**: Isu redirect loop pada frontend telah diperbaiki dengan penyesuaian pemetaan data (data mapping).
- **UI/UX Enhancement**: Halaman Login telah diperbarui dengan desain branding yang lebih modern, fitur highlight, dan micro-interaction (focus glow) pada input.
- Server berjalan di port `5000` (`npm run dev`).

## Support & Thankyou
Terimakasih untuk Gemini dan Chat GPT membantu saya belajar membuat app ini
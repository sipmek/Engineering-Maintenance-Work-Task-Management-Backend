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

---

## 📊 Model Database & Relasi
- **Task** belongsTo **User** (Creator & Assignee).
- **Task** hasMany **TaskActivity**.
- **Task** hasMany **TaskMember**.
- **Task** hasMany **BudgetRequest**.
- **BudgetRequest** belongsTo **User** (Requester & Approver).

---

## 📝 Catatan Penting untuk Sesi Baru
Jika Anda memulai sesi baru dengan Antigravity, cukup berikan prompt:
> *"Bantu saya lanjut di proyek MTMS. Baca file `PROJECT_GUIDE.md` untuk ringkasan fitur dan arsitektur terakhir."*

## 🚧 Status Terakhir
- Fitur **Update Actual Cost & Receipt Upload** baru saja diimplementasikan.
- Server berjalan di port `5000` (`npm run dev`).

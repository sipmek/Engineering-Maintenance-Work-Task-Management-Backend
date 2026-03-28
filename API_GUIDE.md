# 📖 MTMS - API Documentation Guide

Dokumen ini berisi daftar endpoint API MTMS beserta format request dan responnya.

## 🌐 Informasi Dasar
- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json` (kecuali upload file: `multipart/form-data`)
- **Authentication**: Header `Authorization: Bearer <JWT_TOKEN>`

## 📥 Format Respon Standar
Semua endpoint akan mengembalikan struktur berikut:
```json
{
  "status": "success | fail | error",
  "message": "Pesan informasi",
  "data": null | object | array
}
```

---

## 🔑 1. Authentication
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Login user & mendapatkan token |
| `POST` | `/auth/register` | Public | Registrasi akun baru (pending approval) |

---

## 📊 2. Dashboard & Stats
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Auth | Mendapatkan ringkasan statistik task & budget |

---

## 📝 3. Task Management
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Auth | List semua task yang dapat diakses |
| `GET` | `/tasks/:id` | Auth | Detail task beserta aktivitasnya |
| `POST` | `/tasks` | Auth | Membuat task baru |
| `PUT` | `/tasks/:id` | Creator/Admin | Update detail/status task |
| `DELETE` | `/tasks/:id` | Creator/Admin | Menghapus task |

### Task Activities (Comments & Files)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/tasks/:taskId/activities` | Auth | Menambah progres/komentar/file |
| `PUT` | `/tasks/:taskId/activities/:activityId` | Owner | Edit isi aktivitas |
| `DELETE` | `/tasks/:taskId/activities/:activityId` | Owner | Hapus aktivitas |

### Task Members
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks/:taskId/members` | Auth | List member dalam satu task |
| `POST` | `/tasks/:taskId/members` | Auth | Menambah user ke dalam task |
| `DELETE` | `/tasks/:taskId/members/:userId` | Auth | Menghapus user dari task |

---

## 💰 4. Budget & Financials
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/budgets` | Admin/Emperor | List semua pengajuan anggaran |
| `POST` | `/tasks/:taskId/budget` | Auth | Mengajukan anggaran untuk task |
| `PATCH` | `/budget/:id/approve` | Admin/Emperor | Menyetujui anggaran |
| `PATCH` | `/budget/:id/reject` | Admin/Emperor | Menolak anggaran |
| `PATCH` | `/budget/:id/actual-cost` | Requester | Update biaya rill & upload nota |

---

## 👑 5. Emperor (User Management)
*Hanya dapat diakses oleh role `emperor`*
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/emperor/users` | Emperor | List semua user di sistem |
| `POST` | `/emperor/users` | Emperor | Membuat user baru (langsung aktif) |
| `PUT` | `/emperor/users/:id` | Emperor | Update data user |
| `PATCH` | `/emperor/users/:id/ban` | Emperor | Menonaktifkan user |
| `PATCH` | `/emperor/users/:id/activate` | Emperor | Mengaktifkan kembali user |
| `PATCH` | `/emperor/users/:id/reset-password` | Emperor | Reset password ke default |
| `PATCH` | `/emperor/users/:id/photo` | Emperor | Update foto avatar user |

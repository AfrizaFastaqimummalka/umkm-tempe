# 🫘 UMKM Tempe — Panduan Setup Lengkap

## Struktur Folder

```
umkm-tempe/
├── backend/
│   ├── apps/
│   │   ├── keuangan/       (models, views, serializers pemasukan & pengeluaran)
│   │   ├── pelanggan/      (models, views, serializers pelanggan)
│   │   ├── laporan/        (logika laporan + excel export)
│   │   └── telegram_bot/   (webhook handler)
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── build.sh
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/     (Layout, ui.jsx)
    │   ├── context/        (AuthContext.jsx)
    │   ├── pages/          (Login, Dashboard, Pemasukan, Pengeluaran, Pelanggan, Laporan)
    │   ├── services/       (api.js)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ✅ LANGKAH 1 — Setup NeonDB

1. Buka https://neon.tech → daftar akun gratis
2. Klik **New Project** → beri nama `umkm-tempe`
3. Setelah project dibuat, buka tab **Connection Details**
4. Pilih framework **Python** → salin **Connection string**
   - Contoh: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`
5. Simpan string ini — akan dipakai di `.env` backend

---

## ✅ LANGKAH 2 — Setup Backend Django

### 2.1 — Install dependencies

```bash
cd backend

# Buat virtual environment
python -m venv venv

# Aktifkan
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 2.2 — Setup file .env

```bash
# Salin template
cp .env.example .env

# Edit file .env:
nano .env   # atau buka dengan text editor
```

Isi nilai-nilai berikut di `.env`:
```
SECRET_KEY=buat-string-random-panjang-min-50-karakter
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
CORS_ALLOWED_ORIGINS=http://localhost:5173
TELEGRAM_BOT_TOKEN=TOKEN_BOT_TELEGRAM_KAMU
TELEGRAM_ALLOWED_CHAT_IDS=CHAT_ID_KAMU
```

### 2.3 — Migrasi database & buat admin

```bash
# Jalankan migrasi (membuat tabel di NeonDB)
python manage.py makemigrations keuangan pelanggan
python manage.py migrate

# Buat user admin (HANYA 1 user, tidak ada register)
python manage.py createsuperuser
# Masukkan: username, email (opsional), password
```

### 2.4 — Jalankan server

```bash
python manage.py runserver
# Server berjalan di: http://localhost:8000
```

### 2.5 — Test API

Buka browser atau Postman:
- Login: `POST http://localhost:8000/api/auth/login/`
  ```json
  { "username": "admin", "password": "password_kamu" }
  ```
- Dashboard: `GET http://localhost:8000/api/dashboard/`
  (tambahkan header `Authorization: Bearer <access_token>`)

---

## ✅ LANGKAH 3 — Setup Frontend React

### 3.1 — Install dependencies

```bash
cd frontend
npm install
```

### 3.2 — Setup .env

```bash
cp .env.example .env
# Isi:
# VITE_API_URL=http://localhost:8000
```

### 3.3 — Jalankan frontend

```bash
npm run dev
# Buka: http://localhost:5173
# Login dengan username/password yang dibuat di step 2.3
```

---

## ✅ LANGKAH 4 — Setup Telegram Bot

### 4.1 — Buat bot di BotFather

1. Buka Telegram → cari `@BotFather`
2. Ketik `/newbot`
3. Ikuti instruksi → beri nama bot (contoh: `UMKMTempe Bot`)
4. Salin **token** yang diberikan (format: `1234567890:ABC...`)
5. Masukkan token ke `.env` backend:
   ```
   TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
   ```

### 4.2 — Dapatkan Chat ID kamu

1. Cari `@userinfobot` di Telegram
2. Ketik `/start`
3. Bot akan membalas dengan info termasuk **Id** kamu
4. Masukkan ke `.env`:
   ```
   TELEGRAM_ALLOWED_CHAT_IDS=123456789
   ```

### 4.3 — Test bot secara lokal (development)

Untuk test secara lokal tanpa deploy, gunakan **ngrok**:

```bash
# Install ngrok dari https://ngrok.com (gratis)
ngrok http 8000
# Salin URL yang diberikan, contoh: https://abc123.ngrok.io
```

### 4.4 — Daftarkan webhook ke Telegram

```bash
# Ganti URL ngrok/production di bawah ini
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://abc123.ngrok.io/api/telegram/webhook/"}'
```

Respon sukses:
```json
{"ok": true, "result": true, "description": "Webhook was set"}
```

### 4.5 — Test command /rekap

Buka chat bot di Telegram, ketik:
- `/start` → melihat daftar perintah
- `/rekap` → rekap bulan ini
- `/rekap harian` → rekap hari ini
- `/rekap tahunan` → rekap tahun ini

---

## ✅ LANGKAH 5 — Deploy ke Production (GRATIS)

### 5.1 — Deploy Backend ke Render

1. Push code backend ke GitHub
2. Buka https://render.com → daftar gratis
3. **New → Web Service** → connect repo GitHub kamu
4. Isi konfigurasi:
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application`
   - **Python Version:** 3.11
5. Tambahkan **Environment Variables** (sama seperti `.env`):
   - `SECRET_KEY`
   - `DEBUG=False`
   - `DATABASE_URL` (dari NeonDB)
   - `ALLOWED_HOSTS=nama-app.onrender.com`
   - `CORS_ALLOWED_ORIGINS=https://nama-frontend.vercel.app`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_ALLOWED_CHAT_IDS`
6. Klik **Deploy**
7. Setelah deploy selesai, catat URL backend (contoh: `https://umkm-tempe-api.onrender.com`)

### 5.2 — Deploy Frontend ke Vercel

1. Push code frontend ke GitHub
2. Buka https://vercel.com → daftar gratis
3. **New Project** → import repo frontend
4. Tambahkan **Environment Variable**:
   - `VITE_API_URL=https://umkm-tempe-api.onrender.com`
5. Klik **Deploy**
6. Catat URL frontend (contoh: `https://umkm-tempe.vercel.app`)

### 5.3 — Update CORS di backend

Di Render, update environment variable:
```
CORS_ALLOWED_ORIGINS=https://umkm-tempe.vercel.app
```

### 5.4 — Daftarkan webhook Telegram ke production URL

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://umkm-tempe-api.onrender.com/api/telegram/webhook/"}'
```

---

## 📋 API Endpoint Reference

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login/` | Login → dapat access + refresh token |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET/POST | `/api/pemasukan/` | List & tambah pemasukan |
| GET/PUT/DELETE | `/api/pemasukan/{id}/` | Detail, edit, hapus pemasukan |
| GET/POST | `/api/pengeluaran/` | List & tambah pengeluaran |
| GET/PUT/DELETE | `/api/pengeluaran/{id}/` | Detail, edit, hapus pengeluaran |
| GET/POST | `/api/pelanggan/` | List & tambah pelanggan |
| GET/PUT/DELETE | `/api/pelanggan/{id}/` | Detail, edit, hapus pelanggan |
| GET | `/api/dashboard/` | Ringkasan keuangan + chart 7 hari |
| GET | `/api/laporan/harian/` | Laporan hari ini / tanggal tertentu |
| GET | `/api/laporan/bulanan/` | Laporan bulan ini / bulan tertentu |
| GET | `/api/laporan/tahunan/` | Laporan tahun ini / tahun tertentu |
| GET | `/api/laporan/export/` | Download file Excel |
| POST | `/api/telegram/webhook/` | Endpoint webhook Telegram Bot |

---

## 🔧 Troubleshooting

**Q: Error "CORS policy" saat React connect ke Django**
→ Pastikan `CORS_ALLOWED_ORIGINS` di `.env` sudah berisi URL frontend yang benar (tanpa trailing slash).

**Q: Database connection error**
→ Pastikan `DATABASE_URL` sudah diisi dengan benar dari NeonDB, termasuk `?sslmode=require` di akhir.

**Q: Telegram bot tidak merespon**
→ Pastikan webhook sudah didaftarkan dengan benar. Cek dengan:
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

**Q: Export Excel error di production**
→ Pastikan `openpyxl` ada di `requirements.txt` dan sudah terinstall di Render.

**Q: Render sleep setelah 15 menit (free tier)**
→ Ini normal untuk Render free tier. Untuk bot Telegram tetap bekerja, upgrade ke paid plan atau gunakan Railway yang punya free tier lebih stabil.

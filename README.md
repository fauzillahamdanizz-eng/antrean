# Sistem Antrean Digital

> Aplikasi antrean digital realtime modern untuk kebutuhan pelayanan, customer service, klinik, loket, atau sistem booking berbasis web.

Project ini dibangun menggunakan arsitektur modern dengan kombinasi **Next.js 15 App Router**, **Supabase Realtime**, dan deployment otomatis menggunakan **Vercel**. Sistem sudah fully connected dan production ready.

Website mendukung sistem antrean realtime multi-loket dengan sinkronisasi langsung antar user dan admin tanpa perlu refresh halaman.

---

# Live Production

## Production URL

```bash
https://antrean-v1.vercel.app/
```

---

# Tujuan Project

Project ini dibuat untuk mempermudah proses antrean secara digital agar:

- Mengurangi antrean fisik
- Monitoring antrean lebih mudah
- Mempercepat pelayanan
- Memberikan pengalaman realtime kepada pengguna
- Mendukung sistem pelayanan modern
- Mengurangi human error dalam pengelolaan antrean

---

# Cara Kerja Sistem

## Flow User

1. User membuka website
2. User mengambil nomor antrean
3. Data tersimpan ke Supabase
4. Nomor antrean muncul realtime
5. User dapat melihat posisi antrean
6. Sistem mengirim notifikasi email
7. Admin memanggil nomor antrean
8. Status antrean otomatis berubah realtime

---

## Flow Admin

1. Admin login ke dashboard
2. Admin melihat antrean aktif
3. Admin memilih loket
4. Admin memanggil nomor antrean
5. Semua user langsung menerima update realtime
6. Sistem mengirim email pemberitahuan
7. Statistik antrean otomatis diperbarui

---

# Fitur Utama

## 👤 User Features

- Ambil nomor antrean secara online
- Melihat posisi antrean realtime
- Notifikasi status antrean
- Estimasi giliran pelayanan
- Dashboard user modern
- Responsive di mobile & desktop

## 🛠️ Admin Features

- Dashboard admin lengkap
- Kelola antrean realtime
- Kelola loket pelayanan
- Monitoring antrean aktif
- Pengumuman untuk pengguna
- Statistik antrean
- Sistem notifikasi email

## ⚡ Realtime System

- Update antrean realtime menggunakan Supabase Realtime
- Sinkronisasi otomatis antar client
- Auto refresh posisi antrean
- Tracking status antrean langsung

## 📧 Email Notification

- Email saat nomor antrean dibuat
- Email saat giliran hampir tiba
- Email saat nomor dipanggil
- Email saat antrean selesai

---

# Tech Stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Backend & Database

- Supabase
- PostgreSQL
- Supabase Realtime
- Row Level Security (RLS)

## Deployment

- Vercel

## Additional Services

- SendGrid Email API

---

# Cara Install Project

## 1. Clone Repository

```bash
git clone https://github.com/fauzillahamdanizz-eng/antrean.git
```

## 2. Masuk ke Folder Project

```bash
cd repository
```

## 3. Install Dependencies

Menggunakan pnpm:

```bash
pnpm install
```

Atau menggunakan npm:

```bash
npm install
```

---

# Setup Environment Variables

Buat file `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_email@example.com
```

---

# Setup Database Supabase

## 1. Buat Project Supabase

Buka:

- https://supabase.com

Lalu buat project baru.

---

## 2. Jalankan SQL Scripts

Masuk ke:

```bash
supabase_scripts/
```

Jalankan file SQL secara berurutan sesuai kebutuhan project.

Jika ingin reset database:

```sql
clean_and_seed_database.sql
```

---

# Menjalankan Project

## Development Mode

```bash
pnpm dev
```

atau:

```bash
npm run dev
```

Akses:

```bash
http://localhost:3000
```

---

# Deploy ke Vercel

## 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/fauzillahamdanizz-eng/antrean.git
git push -u origin main
```

---

## 2. Login ke Vercel

Buka:

- https://vercel.com

Login menggunakan akun GitHub.

---

## 3. Import Repository

- Klik Add New Project
- Pilih repository GitHub
- Import project

---

## 4. Tambahkan Environment Variables di Vercel

Masuk ke:

```bash
Project Settings → Environment Variables
```

Tambahkan:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
```

---

## 5. Deploy

Klik:

```bash
Deploy
```

Vercel akan otomatis build dan deploy aplikasi.

---

# Build Production

```bash
pnpm build
```

atau:

```bash
npm run build
```

Menjalankan production local:

```bash
pnpm start
```

---

# Realtime Features

Project menggunakan:

- Supabase Realtime Channels
- Live queue updates
- Auto sync data
- Instant dashboard updates

Hooks realtime:

```bash
hooks/use-realtime-queues.ts
hooks/use-realtime-lokets.ts
```

---

# Security

- Supabase RLS Policies
- Environment Variables Protection
- Service Role Security
- Realtime Access Control
- Protected Dashboard Layout

---

# Responsive Design

Aplikasi fully responsive:

- Mobile
- Tablet
- Desktop

---

# Scripts Available

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

atau:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

# Troubleshooting

## Build Error

Hapus cache:

```bash
rm -rf .next
```

Lalu install ulang:

```bash
pnpm install
```

---

## Supabase Tidak Connect

Periksa:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- Service Role Key

---

## Email Tidak Terkirim

Periksa:

- SENDGRID_API_KEY
- Verified Sender Email
- SendGrid API Permissions

---

# License

This project is licensed for personal and commercial use.

# Kas Angkatan Frontend (Next.js)

UI pendamping untuk Backend Kas Angkatan API. Aplikasi Next.js ini mempermudah pengujian alur publik (dashboard & list transaksi) maupun alur Admin/Bendahara (registrasi, login, create/update/delete transaksi) tanpa harus menulis request manual di Postman.

## Fitur Utama

- **UI modern berbasis DaisyUI + Tailwind** dengan hero, stats, table, animasi, dan glassmorphism.
- **Konfigurasi API base URL** langsung dari UI.
- **Login Supabase Auth** lewat halaman `/login` saja (tidak ada register publik).
- **Preview token** dan status session aktif.
- **Dashboard publik** untuk saldo, total pemasukan, total pengeluaran.
- **Daftar transaksi** dengan filter tipe dan pagination.
- **CRUD transaksi** yang membutuhkan token admin/bendahara (form hanya muncul setelah login).

## Prasyarat

- Node.js 18.17+ / 20+
- Backend Kas Angkatan API sudah berjalan (lihat repo root untuk cara menjalankannya).

## Konfigurasi Lingkungan

Siapkan file `.env.local` di folder `frontend/`:

```bash
cp .env.example .env.local
```

Kemudian sesuaikan variabel berikut:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Ganti dengan origin backend yang sedang Anda jalankan.

## Menjalankan Secara Lokal

```bash
cd frontend
npm install      # sudah dijalankan otomatis saat bootstrap, jalankan lagi bila perlu
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk mengakses UI.

## Alur Penggunaan

1. **Lihat Dashboard Publik** di halaman utama (`/`). Tanpa login Anda sudah bisa melihat saldo dan histori transaksi.
2. **Login Admin/Bendahara** melalui halaman `/login`. Masukkan kredensial Supabase Auth untuk mendapatkan access token; token akan disimpan di browser (localStorage).
3. Setelah login, kembali ke halaman utama untuk menampilkan form “Tambah/Edit Transaksi”. Form hanya tampil ketika token admin aktif.
4. Gunakan tombol “Refresh Data” untuk menarik ulang saldo/riwayat setelah menambah, mengubah, atau menghapus transaksi.

## Build & Produksi

```bash
npm run build
npm run start   # menjalankan hasil build
```

Deploy ke platform pilihan (Vercel, Netlify, dsb.) dengan memastikan variabel env `NEXT_PUBLIC_API_BASE_URL` tersedia pada environment produksi.

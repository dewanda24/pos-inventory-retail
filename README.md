# POS & Inventory System

Sistem Point of Sale (POS) dan Manajemen Inventaris Retail komprehensif yang dirancang khusus untuk toko retail. Dibangun dengan menggunakan arsitektur modern (React, Vite, Node.js, Express, dan MongoDB).

## Fitur Utama
- **Dashboard Analitik**: Pantau penjualan, pendapatan, dan statistik toko secara real-time.
- **Kasir (POS)**: Antarmuka kasir yang cepat, responsif, mendukung pencarian barcode, manajemen keranjang, dan kalkulasi pajak/diskon.
- **Katalog Pelanggan Publik**: Halaman khusus yang bisa diakses pelanggan secara mandiri via QR Code (tanpa menampilkan harga modal).
- **Manajemen Inventaris**: Pengelolaan stok barang, supplier, dokumen barang masuk, dan *Stock Opname*.
- **Laporan Keuangan**: Buku besar (*Ledger*), pencatatan pengeluaran, dan rekap keuangan lengkap.
- **Sistem Keamanan Berbasis Peran**: Pemisahan akses ketat antara *Owner* dan *Kasir*.

## Persyaratan Sistem
- Node.js (v18 atau lebih baru)
- MongoDB Atlas (Cloud) atau MongoDB Lokal
- Git

## Cara Menjalankan Secara Lokal

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/dewanda24/pos-inventory-retail.git
   cd pos-inventory-retail
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Buat file `.env` di *root directory* dan isi dengan kredensial database Anda:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0...
   JWT_SECRET=supersecretkey
   PORT=5000
   ```

4. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5000`.

## Deployment (Vercel)
Aplikasi ini mendukung *deployment* *Serverless* hibrida ke Vercel:
1. Hubungkan repositori GitHub ini ke proyek baru di Vercel.
2. Tambahkan `MONGODB_URI` dan `JWT_SECRET` di *Environment Variables*.
3. Klik Deploy. Vercel akan otomatis mengenali `api/index.ts` sebagai fungsi *backend* dan melayani aplikasi React secara statis.

## Teknologi
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express
- **Database**: MongoDB (via driver native)
- **Deployment**: Vercel Serverless Functions

---
&copy; 2026 Vape Store Retail. All rights reserved.

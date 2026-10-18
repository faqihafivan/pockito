# Pockito 👛
> **One workspace for your money and your life.**
> Aplikasi web & mobile cerdas pengelola keuangan pribadi (Pocket Budgeting) dan produktivitas harian yang terinspirasi oleh visual bold, optimis, dan ceria khas **Saweria Admin**.

---

## 🌟 Fitur Utama

1. **Kantong Budget Fleksibel (Pockets):**
   - Bagi penghasilan bulanan ke dalam pos kantong dengan persentase fleksibel (50/30/20, Balanced, Mahasiswa, Freelancer).
   - Perhitungan nominal Rupiah berbasis **integer matematika ketat** (bebas error floating-point).
   - Fitur bintang prioritas (⭐) untuk melindungi pos esensial.
2. **Pemisahan Tegas Saldo Riil vs Pagu Anggaran:**
   - Saldo rekening kas/bank riil dihitung murni dari transaksi masuk, keluar, dan transfer antar rekening.
   - Pagu anggaran adalah batas rencana, bukan uang riil yang hilang.
3. **Pencatatan Transaksi Cepat & Transfer:**
   - Catat Pemasukan, Pengeluaran, dan Transfer antar rekening (BCA, GoPay, Dompet Tunai).
   - Input mata uang Rupiah otomatis terformat rapi (`Rp 50.000`).
4. **Daily Productivity Planner & Reminders:**
   - Sinkronisasi tugas harian (Hari Ini, Mendatang, Nanti, Selesai) berdampingan dengan tagihan.
   - Pengingat sesi aktif dan kesiapan push notification.
5. **Target Tabungan Impian (Savings Goals):**
   - Tetapkan target impian (misal: Beli Laptop Baru) dengan progress bar dan tombol setor tabungan.
6. **Laporan & Ekspor:**
   - Grafik perbandingan Pemasukan vs Pengeluaran.
   - Komposisi pengeluaran per kantong.
   - Tabel evaluasi varians (Budget vs Actual).
   - Ekspor riwayat transaksi ke format CSV dalam 1 klik.
7. **Dual-Mode Persistence (Offline Demo / Cloud Supabase):**
   - Berjalan langsung secara offline di browser via penyimpanan lokal terenkripsi jika Supabase belum dikonfigurasi.
   - Siap dihubungkan ke Supabase PostgreSQL dengan Row Level Security (RLS) lengkap.

---

## 🎨 Identitas Visual (Saweria Admin Theme)

- **Primary Amber / Warm Yellow:** `#FAAE2B`
- **Ink Charcoal / Kontras Gelap:** `#18181B`
- **Warm Milk Canvas:** `#FFFDF8`
- **Card Surface:** `#FFFFFF`
- **Soft Neobrutalist Borders & Shadows:** `border-2 border-[#18181B]`, `shadow-[2.5px_2.5px_0px_#18181B]`

---

## 🚀 Panduan Menjalankan Project

### Prasyarat
- Node.js v18+ atau v20+ (Telah diverifikasi pada Node v22.22.0)
- npm v9+

### Instalasi & Menjalankan Dev Server
```bash
# 1. Masuk ke direktori
cd "e:\projek 8 m\pockito"

# 2. Install dependensi
npm run dev
```
Buka browser di `http://localhost:5173`.

### Menjalankan Unit Test (100% Green Tested)
```bash
npm run test
```

### Build Production
```bash
npm run build
```

---

## 🗄️ Menghubungkan ke Supabase Cloud (Opsional)

Jika ingin mengaktifkan sinkronisasi database cloud PostgreSQL:
1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** di dashboard Supabase Anda.
3. Jalankan script migrasi yang telah disediakan di file:
   `supabase/migrations/20261018000001_pockito_schema.sql`
4. Buat file `.env` di root project berdasarkan `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://xyzcompany.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   ```
5. Restart dev server. Pockito otomatis beralih dari mode offline ke cloud mode.

---

## 📱 Packaging ke Android (Capacitor)

Pockito dirancang responsive dan siap dipaketkan ke Android APK / Google Play Store:
```bash
# 1. Install Capacitor CLI & Android
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Inisialisasi Capacitor
npx cap init Pockito com.pockito.app --web-dir dist

# 3. Build web asset
npm run build

# 4. Tambahkan platform Android
npx cap add android

# 5. Buka di Android Studio
npx cap open android
```

---

## 📄 Lisensi
Hak Cipta © 2026 Pockito. Dibuat untuk ekosistem produktivitas modern.

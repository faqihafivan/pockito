# POCKITO — AUDIT SISTEM, ROADMAP, TEST PLAN, DAN ATURAN BISNIS KEUANGAN

> **Jenis dokumen:** Audit teknis berbasis source code ZIP yang diberikan  
> **Versi aplikasi yang terlihat:** `1.0.0` (`package.json`)  
> **Tanggal audit:** 31 Oktober 2026  
> **Status:** Audit statis; belum menjalankan aplikasi di perangkat pengguna, belum menguji Supabase project yang aktif, dan belum melakukan penetration test.  
> **Tujuan:** Menjadi dokumen kerja utama untuk memperbaiki Pockito secara bertahap, dengan prioritas pada keamanan akun, integritas data keuangan, dan keandalan fitur.

---

## 0. Ringkasan eksekutif

Pockito sudah memiliki fondasi produk yang cukup luas: dashboard, kantong anggaran, transaksi, rekening, target tabungan, tagihan rutin, hutang/piutang, planner, laporan, backup/restore, mode privasi, dan kalkulasi dana darurat. Pemisahan kalkulasi ke `src/domain/finance/financialEngine.ts` juga merupakan arah arsitektur yang baik.

Namun, berdasarkan pemeriksaan source code, **Pockito belum layak dianggap aman dan andal untuk data keuangan pribadi sungguhan sebelum masalah P0 dan P1 di bawah diselesaikan**. Temuan paling penting bukan sekadar tampilan mobile, tetapi jalur autentikasi, pemisahan data antar pengguna, penyimpanan cloud, dan konsistensi ledger keuangan.

### Temuan paling kritis

1. **[P0] Demo/login dapat menganggap pengguna berhasil masuk tanpa autentikasi cloud yang valid.** `AuthContext.login()` hanya menjalankan `signInWithPassword()` jika password diberikan. Tombol demo memanggil `login('faqih@pockito.app')` tanpa password, kemudian membuka dashboard.
2. **[P0] Data lokal tidak dipisahkan berdasarkan pengguna.** `localStorage` menggunakan kunci tetap seperti `pockito_transactions_v1`, bukan namespace per user. `getProfile()` juga kembali ke profil lokal/default jika profil cloud tidak tersedia. Ini berisiko menampilkan data lama atau data pengguna lain di browser yang sama.
3. **[P0] Operasi cloud dapat gagal diam-diam lalu jatuh kembali ke localStorage.** Banyak method `DataService` mengabaikan `error` dari Supabase pada update/delete dan menggunakan data lokal sebagai fallback. UI dapat terlihat sukses sementara data cloud tidak tersimpan.
4. **[P0] Skema database dan ID yang dibuat aplikasi tampak tidak konsisten.** Migrasi utama menggunakan kolom UUID, sedangkan service membuat ID seperti `acc-xxxxx`, `pocket-xxxxx`, `tx-xxxxx`, `goal-xxxxx`, `sub-xxxxx`, dan `debt-xxxxx`. Migrasi kedua mendefinisikan foreign key `TEXT` ke ID tabel yang didefinisikan sebagai `UUID`, yang perlu diperbaiki dan diverifikasi di PostgreSQL.
5. **[P1] Pembayaran tagihan rutin hanya menyimpan `last_paid_period`, bukan riwayat pembayaran yang eksplisit.** `paySubscription()` mencatat transaksi dengan tanggal saat ini, sehingga tidak cukup untuk membedakan periode tagihan, tanggal jatuh tempo, tanggal pembayaran sebenarnya, dan tanggal pencatatan.
6. **[P1] Perhitungan dana darurat dapat melebihkan kas siap pakai.** Kalkulasi lebih dulu memakai `overview.totalRecordedBalance` yang dapat mencakup rekening investasi; saldo pembukaan dipakai sebagai fallback, bukan sumber kas utama yang selalu konsisten. Biaya pokok dihitung dari persentase kantong berbintang, bukan dari pengeluaran esensial aktual.
7. **[P1] Tes yang ada belum membuktikan kesiapan produksi.** Ada unit test untuk financial engine dan data service serta satu tes render halaman awal, tetapi belum terlihat tes integrasi autentikasi, isolasi antar pengguna, sinkronisasi cloud, pembayaran tagihan, atau skenario kegagalan jaringan.

### Keputusan yang disarankan

**Jangan menambah banyak fitur baru terlebih dahulu.** Prioritaskan perbaikan auth + isolasi data + skema Supabase + kegagalan sinkronisasi. Setelah itu rapikan aturan transaksi dan pembayaran, lalu responsivitas, UX, privasi, dan pengembangan lanjutan.

---

## 1. Ruang lingkup dan metode

### 1.1 Yang diperiksa

- Struktur project React, TypeScript, Vite, dan dependensi di `package.json`.
- `src/App.tsx`, `src/context/AuthContext.tsx`, `src/context/DataContext.tsx`.
- `src/services/dataService.ts`, `src/services/supabaseClient.ts`, `src/services/mockData.ts`.
- `src/domain/finance/financialEngine.ts`.
- Komponen dashboard, kantong, navigasi mobile, tagihan rutin, hutang/piutang, dan target tabungan.
- Migrasi SQL di `supabase/migrations/`.
- Tes di `tests/`.
- README dan konfigurasi environment yang disediakan.

### 1.2 Batasan audit

- Ini adalah **audit statis source code**, bukan hasil penetration test atau audit database cloud yang sedang aktif.
- Saya tidak menganggap setiap dugaan sebagai bug yang sudah direproduksi. Temuan diberi label **terkonfirmasi dari kode**, **indikasi kuat**, atau **perlu verifikasi runtime**.
- Responsivitas pada Poco F4 belum dapat dipastikan hanya dari source code. Itu tetap perlu diuji pada perangkat atau viewport yang sesuai.
- Tidak ada kredensial Supabase produksi yang diuji. Jangan memasukkan `service_role` key ke frontend atau membagikannya.
- Tes/build belum dinyatakan lulus dalam dokumen ini karena belum dijalankan pada lingkungan instalasi project yang lengkap.

### 1.3 Tingkat keparahan

- **P0 — Kritis:** dapat menyebabkan akses/data lintas pengguna, kehilangan data, atau sistem cloud tidak dapat dipercaya. Harus diperbaiki sebelum penggunaan data nyata.
- **P1 — Tinggi:** dapat menghasilkan saldo/laporan yang salah atau alur penting yang tidak dapat diandalkan.
- **P2 — Sedang:** masalah UX, aksesibilitas, konsistensi, dan kemudahan pemeliharaan.
- **P3 — Rendah/lanjutan:** peningkatan fitur setelah fondasi stabil.

---

# BAGIAN A — AUDIT SISTEM

## 2. Arsitektur dan kondisi saat ini

### Kekuatan yang sudah ada

- Stack relatif sederhana dan familiar: React 18, TypeScript, Vite, React Router, Tailwind, Supabase JS, Recharts, React Hook Form, Zod, dan Vitest.
- Kalkulasi finansial cukup banyak dipisahkan ke `financialEngine.ts`, sehingga lebih mudah diuji daripada menanam seluruh rumus di komponen UI.
- Sudah ada pemisahan konsep **saldo rekening riil** dan **pagu anggaran** di dokumentasi/engine.
- Ada dukungan transaksi income, expense, dan transfer; backup/restore JSON; serta halaman terpisah untuk budget, transactions, goals, subscriptions, debts, reports, dan settings.
- Migrasi database mengaktifkan Row Level Security (RLS) untuk beberapa tabel dan menghubungkan `profiles.id` dengan `auth.users.id`.
- Ada tes unit yang cukup luas untuk beberapa fungsi kalkulasi finansial.

### Risiko desain yang perlu dibenahi

- `DataService` mencampurkan operasi cloud dan localStorage dalam kelas yang sama. Ketika cloud error, fallback lokal dapat menyamarkan kegagalan sinkronisasi.
- Data lokal menggunakan kunci global, bukan per pengguna.
- Identitas data dibuat dengan format berbeda-beda dan tidak konsisten dengan tipe ID SQL.
- Tanggal transaksi, tanggal jatuh tempo, periode tagihan, dan tanggal pencatatan belum dimodelkan secara eksplisit untuk semua alur.
- Beberapa kalkulasi penting menggunakan asumsi implisit, sehingga angka yang tampak pasti dapat menyesatkan pengguna.
- `README.md` menyatakan penyimpanan lokal terenkripsi, tetapi dari kode `DataService` yang diperiksa, data diserialisasi langsung ke `localStorage` melalui `JSON.stringify`. **Jangan menyebut penyimpanan ini terenkripsi kecuali ada implementasi enkripsi yang benar-benar terbukti.** `localStorage` bukan penyimpanan rahasia yang aman terhadap script berbahaya/XSS atau pengguna perangkat yang sama.

---

## 3. Temuan P0 — Kritis

### P0-01 — Jalur demo/login tidak selalu memerlukan autentikasi yang valid

**Lokasi:** `src/context/AuthContext.tsx`, fungsi `login()`; `src/pages/WelcomePage.tsx` (handler demo).

**Bukti dari kode:**
- `login(email, password?)` menjalankan `supabase.auth.signInWithPassword()` hanya ketika mode cloud aktif **dan** `password` tersedia.
- Jika password tidak diberikan, fungsi tetap mengambil profil lewat `DataService.getProfile()`, lalu menjalankan `setUser({ ...profile, email })`.
- Handler demo memanggil `login('faqih@pockito.app')` tanpa password, kemudian mengarahkan pengguna ke `/app/dashboard`.

**Dampak:**
- Status `user` di React dapat terisi tanpa sesi Supabase yang sah.
- Jika data cloud gagal diakses, aplikasi berpotensi menampilkan data local/default seolah-olah pengguna sudah masuk.
- Identitas demo dan identitas akun sungguhan tidak jelas batasnya.
- Perilaku ini konsisten dengan risiko yang dilaporkan: tombol demo membuka data yang sebelumnya tersimpan di browser.

**Perbaikan wajib:**
1. Pisahkan fungsi autentikasi akun sungguhan dari `enterDemoMode()`.
2. Login cloud harus selalu mensyaratkan autentikasi Supabase yang berhasil.
3. Demo harus memakai dataset demo yang terisolasi dan tidak pernah membaca/menimpa data akun nyata.
4. Jangan menganggap objek `user` lokal sebagai bukti sesi cloud.
5. Tambahkan status eksplisit: `initializing`, `authenticated`, `demo`, `unauthenticated`, `error`.
6. Tambahkan tes: tanpa password/sesi, login cloud harus ditolak; mode demo tidak boleh mengakses data akun sebelumnya.

### P0-02 — LocalStorage tidak diisolasi per pengguna

**Lokasi:** `src/services/dataService.ts`, `STORAGE_KEYS`, `getProfile()`, `getAccounts()`, `getTransactions()`, dan method serupa.

**Bukti dari kode:**
- Kunci seperti `pockito_profile_v1`, `pockito_accounts_v1`, `pockito_transactions_v1`, dan `pockito_debts_v1` berlaku global untuk origin browser.
- Jika data cloud tidak ditemukan atau query gagal, beberapa getter kembali ke localStorage.
- Profil lokal dapat dikembalikan bahkan ketika tidak ada sesi cloud yang sah.

**Dampak:**
- Dua akun yang digunakan di browser/perangkat yang sama dapat berbagi data lokal.
- Logout tidak otomatis membersihkan atau memisahkan data lokal.
- Data lama dapat muncul kembali ketika akun lain masuk atau ketika query cloud gagal.
- Untuk aplikasi keuangan, ini adalah masalah privasi dan integritas yang serius.

**Perbaikan wajib:**
- Untuk mode lokal, gunakan namespace seperti `pockito:<mode>:<userId>:<entity>:v2`.
- Demo harus memiliki namespace tetap tersendiri, misalnya `pockito:demo:v1`, dan tidak boleh menggunakan namespace pengguna.
- Logout harus membersihkan state memori sensitif dan mengembalikan UI ke halaman publik. Data lokal boleh dipertahankan hanya jika jelas milik akun lokal yang sama dan ada pilihan pengguna.
- Jangan fallback ke localStorage secara otomatis ketika query cloud gagal. Tampilkan error/sinyal offline yang jelas.
- Sediakan migrasi satu kali dari key lama, dengan konfirmasi dan pemeriksaan kepemilikan data.

### P0-03 — Error cloud dapat disamarkan sebagai keberhasilan lokal

**Lokasi:** `src/services/dataService.ts`, banyak method `create*`, `update*`, `delete*`, `save*`.

**Bukti dari kode:**
- Sejumlah method memeriksa error pada operasi insert, tetapi jika gagal, melanjutkan menulis ke localStorage.
- Beberapa operasi update/delete memanggil Supabase tanpa memeriksa `error`.
- Getter memakai data lokal sebagai fallback jika query cloud error.

**Dampak:**
- Pengguna dapat melihat data setelah disimpan, tetapi data tidak ada di cloud.
- Setelah pindah perangkat atau browser, data tampak hilang.
- Aplikasi dapat menyajikan data cloud yang berbeda dari data lokal.
- Error skema/permission/RLS tidak terlihat jelas sehingga sulit didiagnosis.

**Perbaikan wajib:**
1. Tetapkan satu sumber data aktif per sesi: `cloud` atau `local/demo`.
2. Jika cloud aktif, error cloud harus menghasilkan error yang terlihat dan tidak diam-diam menulis ke local.
3. Tampilkan status sinkronisasi: tersimpan, menyimpan, offline, gagal.
4. Semua mutation harus memeriksa dan menangani `{ data, error }`.
5. Gunakan retry terbatas hanya untuk error jaringan yang layak dicoba ulang.
6. Jika ingin mendukung offline-first, buat antrean operasi yang eksplisit dengan status sinkronisasi dan strategi konflik; jangan menyamarkan fallback sebagai keberhasilan.

### P0-04 — Ketidaksesuaian tipe ID antara aplikasi dan skema SQL

**Lokasi:** `src/services/dataService.ts`; `supabase/migrations/20261018000001_pockito_schema.sql`; `supabase/migrations/20261027000002_subscriptions_and_debts.sql`.

**Bukti dari kode/skema:**
- Migrasi utama menggunakan UUID untuk ID tabel seperti `accounts`, `pockets`, `transactions`, dan `savings_goals`.
- Service membuat ID string seperti `acc-...`, `pocket-...`, `tx-...`, `goal-...`, `sub-...`, dan `debt-...`.
- Migrasi kedua mendefinisikan `category_pocket_id TEXT REFERENCES public.pockets(id)` dan `account_id TEXT REFERENCES public.accounts(id)`, sedangkan ID yang dirujuk didefinisikan sebagai UUID pada migrasi utama.

**Dampak:**
- Insert/update/foreign key dapat gagal karena tipe ID tidak sesuai.
- Karena error cloud dapat jatuh kembali ke localStorage, kegagalan skema mungkin terlihat seperti data tersimpan normal.
- Relasi transaksi dengan rekening/kantong/tagihan/hutang dapat rusak.

**Perbaikan wajib:**
- Pilih satu standar ID untuk data cloud: UUID dari database (disarankan) atau konsisten menggunakan tipe teks pada seluruh skema. Jangan mencampur keduanya.
- Untuk cloud, jangan membuat ID `acc-...` untuk kolom UUID. Biarkan database menghasilkan UUID atau gunakan UUID valid.
- Pastikan foreign key mempunyai tipe yang kompatibel.
- Tambahkan pemeriksaan integrasi yang membuat satu data dari setiap entitas dan memverifikasi relasinya.
- Buat migrasi perbaikan baru; jangan mengubah migrasi yang sudah dipakai di production tanpa rencana migrasi yang aman.

### P0-05 — Field `user_id` dan relasi cloud perlu diverifikasi di seluruh mutation

**Lokasi:** `src/services/dataService.ts` dan pemanggil mutation di `src/context/DataContext.tsx`.

**Bukti yang perlu ditangani:**
- Skema cloud mengharuskan `user_id` pada banyak tabel.
- Sebagian mutation menerima objek dari konteks yang kemungkinan sudah menyertakan `user_id`, tetapi ini bergantung pada seluruh pemanggil dan belum dipaksakan di service.
- Beberapa objek menggunakan fallback ID `user-1`; ID tersebut tidak cocok dengan UUID `auth.users.id` pada mode cloud.

**Dampak:**
- Insert dapat ditolak oleh constraint/RLS atau menghasilkan data yang tidak terhubung ke pemilik yang benar.
- Kode pemanggil yang lupa menyertakan `user_id` berisiko membuat operasi gagal.

**Perbaikan wajib:**
- Service cloud harus mengambil `user.id` dari sesi Supabase aktif dan memasukkan `user_id` secara internal; jangan mempercayai `user_id` dari form/UI.
- Tolak mutation cloud tanpa sesi sah.
- Hilangkan fallback `user-1` dari jalur cloud.
- Tambahkan test untuk RLS: user A tidak boleh membaca, mengubah, atau menghapus data user B.

### P0-06 — Migrasi tagihan/hutang berisiko gagal akibat foreign key bertipe berbeda

**Lokasi:** `supabase/migrations/20261027000002_subscriptions_and_debts.sql`.

**Bukti:** kolom `category_pocket_id` dan `account_id` didefinisikan `TEXT` tetapi mereferensikan `pockets(id)` dan `accounts(id)` yang didefinisikan `UUID` pada migrasi utama. Hal serupa terjadi pada foreign key rekening/kantong di tabel `debts`.

**Dampak:** migrasi dapat gagal diterapkan pada PostgreSQL karena tipe kolom foreign key tidak kompatibel. Ini perlu diuji pada database PostgreSQL bersih, bukan hanya diasumsikan berjalan dari file SQL.

**Perbaikan wajib:**
- Samakan tipe kolom relasi dengan tipe PK yang dirujuk.
- Jalankan semua migrasi berurutan pada project Supabase staging yang kosong.
- Jadikan hasil migrasi bersih sebagai syarat release.

### P0-07 — Penghapusan semua data berpotensi tidak menghapus tabel target yang benar

**Lokasi:** `src/services/dataService.ts`, `deleteAllUserData()`.

**Bukti:** skema utama memakai tabel `savings_goals`, tetapi fungsi penghapusan memanggil tabel `goals`.

**Dampak:** penghapusan dapat gagal pada bagian target tabungan atau menyisakan data yang seharusnya dihapus. Fungsi ini juga menjalankan banyak penghapusan terpisah, sehingga kegagalan di tengah jalan dapat meninggalkan keadaan parsial.

**Perbaikan wajib:**
- Gunakan nama tabel yang benar (`savings_goals`) dan pastikan error setiap operasi ditangani.
- Pertimbangkan satu fungsi database terkontrol/transactional untuk penghapusan akun/data, dengan konfirmasi eksplisit.
- Jelaskan apakah tindakan menghapus data lokal, data cloud, atau keduanya.
- Tes hasil akhir pada semua tabel, bukan hanya pesan sukses UI.

---

## 4. Temuan P1 — Integritas keuangan dan alur penting

### P1-01 — Saldo rekening perlu memakai satu sumber kebenaran

**Lokasi:** `src/domain/finance/financialEngine.ts`, `calculateNetBalance()` dan `calculateFinancialOverview()`.

**Hal yang sudah benar:** saldo dihitung dari saldo pembukaan ditambah pemasukan, dikurangi pengeluaran, serta transfer masuk/keluar. Transfer tidak semestinya dihitung sebagai pemasukan/pengeluaran total pengguna.

**Risiko yang perlu dites:**
- Transfer harus selalu mengurangi rekening sumber dan menambah rekening tujuan dengan jumlah yang sama.
- Rekening arsip dikeluarkan dari total saldo, tetapi saldo rekening arsip masih dihitung dalam map internal; pastikan seluruh UI menggunakan aturan yang sama.
- Pengeluaran tanpa `pocket_id` tetap masuk ke total pengeluaran bulanan, tetapi tidak mengurangi sisa kantong tertentu. Ini dapat membuat angka “sisa anggaran” berbeda dari penjumlahan sisa semua kantong.
- Pastikan transaksi dengan tanggal/format yang berbeda tidak hilang dari filter periode `tx.date.startsWith(period)`.

**Perbaikan:**
- Tetapkan fungsi saldo resmi yang digunakan seluruh dashboard/laporan.
- Validasi bahwa nilai transaksi positif; arah transaksi ditentukan oleh `type`, bukan tanda negatif pada `amount`.
- Tampilkan transaksi yang belum dikategorikan sebagai “Belum masuk kantong”.
- Buat invariant test untuk transfer, saldo negatif, akun arsip, dan transaksi lintas periode.

### P1-02 — Pembayaran tagihan rutin belum menyimpan riwayat status pembayaran yang cukup

**Lokasi:** `src/context/DataContext.tsx`, `paySubscription()`; tabel `subscriptions`.

**Bukti:** `paySubscription()` membuat transaksi dengan `date: new Date().toISOString()` dan memperbarui `last_paid_period`. Skema `subscriptions` menyimpan `due_day` dan `last_paid_period`, bukan daftar pembayaran per periode.

**Dampak:**
- Tidak dapat secara andal membedakan periode yang dibayar, tanggal jatuh tempo, tanggal pembayaran aktual, dan tanggal transaksi dimasukkan.
- Pembayaran terlambat yang dicatat belakangan dapat tampil pada tanggal yang salah untuk laporan.
- Pencegahan pembayaran ganda untuk periode yang sama belum kuat jika hanya mengandalkan satu `last_paid_period`.

**Perbaikan:**
- Pisahkan data definisi tagihan dari riwayat pembayaran. Tambahkan entitas seperti `subscription_payments` dengan `subscription_id`, `period`, `due_date`, `paid_at` (tanggal uang benar-benar dibayar), `recorded_at`, `amount`, `account_id`, `transaction_id`, dan status.
- Terapkan unique constraint untuk kombinasi tagihan dan periode jika satu tagihan hanya boleh dibayar sekali per periode.
- Saat pembayaran dicatat terlambat, pengguna memilih tanggal pembayaran aktual; tanggal pencatatan tetap dibuat otomatis.
- Edit/pembatalan pembayaran harus memperbarui transaksi terkait secara konsisten atau meminta konfirmasi.

### P1-03 — Pembayaran hutang/piutang dapat membuat keadaan parsial

**Lokasi:** `src/context/DataContext.tsx`, `recordDebtPayment()`.

**Bukti:** kode memperbarui `paid_amount` dan `is_settled`, kemudian membuat transaksi jika diminta. Jika pembuatan transaksi gagal setelah hutang diperbarui, status hutang dan ledger dapat tidak sinkron.

**Dampak:**
- Jumlah hutang terlihat sudah berkurang/lunas, tetapi arus kas belum tercatat.
- Piutang yang diterima dapat tidak menambah saldo rekening; pembayaran hutang dapat tidak mengurangi saldo.
- Tidak ada jejak pembayaran per cicilan yang terpisah.

**Perbaikan:**
- Catat pembayaran sebagai entitas/operasi atomik yang terhubung ke transaksi ledger.
- Validasi `paymentAmount > 0` dan `paymentAmount <= amount - paid_amount`, kecuali memang mengizinkan kelebihan bayar dengan aturan eksplisit.
- Pastikan `paid_amount` tidak pernah melebihi `amount` secara tidak sengaja.
- Gunakan transaksi database/RPC untuk menyimpan pembayaran dan transaksi bersama-sama di cloud.
- Simpan tanggal pembayaran aktual dan riwayat cicilan.

### P1-04 — Perhitungan dana darurat belum cukup merepresentasikan kas siap pakai

**Lokasi:** `src/domain/finance/financialEngine.ts`, `calculateEmergencyRunway()`; `src/components/dashboard/EmergencyRunwayCard.tsx`.

**Bukti dari rumus:**
- `totalLiquidCash` menghitung saldo pembukaan rekening aktif selain `investment`.
- Namun `effectiveCash` memakai `overview.totalRecordedBalance` jika nilainya lebih besar dari nol. Total saldo ini berasal dari `calculateNetBalance()` dan dapat mencakup rekening investasi yang tidak diarsipkan.
- Jika tidak ada kantong berbintang, fungsi mengasumsikan 50% penghasilan sebagai biaya pokok.
- Jika pendapatan tidak tersedia, fungsi memakai fallback Rp3.000.000.
- Biaya esensial dihitung dari persentase alokasi kantong berbintang, bukan pengeluaran kebutuhan pokok aktual.

**Dampak:**
- Runway dapat tampak lebih tinggi jika saldo investasi ikut dianggap sebagai kas yang langsung dapat dipakai.
- Angka biaya pokok dapat terlalu tinggi/rendah dibanding biaya hidup nyata.
- Label status kritis/aman dapat memberikan kesan presisi yang tidak didukung data.

**Perbaikan:**
1. Hitung kas siap pakai dari saldo terkini rekening yang likuid saja (kas, bank, e-wallet yang ditandai likuid); keluarkan investasi dan rekening arsip.
2. Jangan memakai saldo pembukaan sebagai fallback jika saldo terkini tidak dapat dihitung. Tampilkan “data belum cukup” atau minta pengguna melengkapi rekening/transaksi.
3. Berikan pilihan sumber biaya pokok: rata-rata pengeluaran kategori esensial selama 3–6 bulan, atau estimasi manual pengguna.
4. Jika memakai kantong berbintang sebagai pendekatan, labeli jelas sebagai **estimasi berdasarkan alokasi anggaran**, bukan biaya hidup aktual.
5. Hilangkan angka fallback Rp3.000.000 yang diam-diam; minta pengguna mengisi estimasi atau tampilkan status “belum dihitung”.
6. Tampilkan formula dan tanggal data yang dipakai melalui tooltip/info.

**Definisi yang disarankan:** `runway = kas_likuid_siap_pakai / rata_rata_pengeluaran_esensial_bulanan`. Contoh: kas likuid Rp12.000.000 / pengeluaran esensial Rp3.000.000 per bulan = 4 bulan.

### P1-05 — Pembagian persentase kantong perlu aturan konsisten

**Lokasi:** `financialEngine.ts`, `calculatePocketAllocations()` dan `calculateFinancialOverview()`; halaman budget/kantong.

**Risiko:**
- Sistem menghitung `isOverallocated` saat total persentase >100%, tetapi perlu dipastikan semua alur penyimpanan juga mencegah atau mengonfirmasi keadaan tersebut.
- Jika total <100%, sisa persentase dihitung sebagai dana belum dialokasikan. UI harus menjelaskan bahwa itu bukan pengeluaran atau uang yang hilang.
- Perubahan slider secara tidak sengaja saat scrolling adalah masalah UX yang dilaporkan pengguna, belum direproduksi lewat source saja.

**Perbaikan:**
- Tambahkan ringkasan total persentase, dana dialokasikan, dan dana belum dialokasikan secara real-time.
- Cegah penyimpanan jika >100%, kecuali pengguna secara eksplisit mengonfirmasi aturan lain.
- Tambahkan tombol lock/unlock untuk mode geser; saat lock aktif, interaksi scroll tidak boleh mengubah nilai.
- Sediakan input angka alternatif yang lebih presisi dan tombol reset/undo.
- Jika ada kantong bintang prioritas, jelaskan bahwa bintang dipakai untuk estimasi biaya esensial; jangan menjadikan bintang sebagai pengganti kategori pengeluaran aktual.

### P1-06 — Filter periode dan tanggal perlu dinormalisasi

**Lokasi:** `financialEngine.ts`, filter `tx.date.startsWith(period)`; `DataContext.tsx`, `paySubscription()` dan `recordDebtPayment()`.

**Risiko:**
- Transaksi dibuat menggunakan ISO timestamp di sebagian alur, tetapi tanggal lokal `YYYY-MM-DD` di alur lain.
- Memfilter periode berdasarkan awalan string dapat berfungsi untuk ISO standar, tetapi tidak aman jika format tanggal berubah atau ada konversi zona waktu yang menggeser tanggal.
- Pengguna berada di Indonesia; zona waktu dan batas pergantian bulan harus konsisten.

**Perbaikan:**
- Gunakan `transaction_date` bertipe `DATE` untuk tanggal bisnis transaksi, `created_at` sebagai timestamp pencatatan, dan `paid_at` untuk pembayaran aktual bila relevan.
- Simpan timestamp teknis dalam UTC, tetapi hitung periode kalender berdasarkan zona waktu profil.
- Validasi format tanggal di satu layer/domain function.
- Tambahkan tes transaksi pada tanggal terakhir bulan, tanggal pertama bulan, dan zona waktu Asia/Jakarta.

### P1-07 — Penghapusan kantong dapat mengubah keterkaitan transaksi

**Lokasi:** `dataService.ts`, `deletePocket()`; migrasi utama FK `transactions.pocket_id ... ON DELETE SET NULL`.

**Risiko:** transaksi lama dapat kehilangan hubungan ke kantong saat kantong dihapus. Nilai uang tidak hilang dari ledger, tetapi laporan per kantong dan histori anggaran bisa berubah.

**Perbaikan:**
- Saat menghapus kantong yang sudah dipakai, tampilkan jumlah transaksi terdampak dan minta pengguna memilih: pindahkan transaksi ke kantong lain, arsipkan kantong, atau lepaskan kategori.
- Lebih aman menyediakan **arsip kantong** daripada hard delete.
- Jangan menghapus data historis tanpa konfirmasi dan ringkasan dampak.

### P1-08 — Backup/restore belum cukup aman untuk pemulihan data produksi

**Lokasi:** `dataService.ts`, `exportFullBackup()` dan `importFullBackup()`.

**Temuan:**
- Import memeriksa bahwa JSON valid dan nama aplikasi cocok, tetapi validasi struktur tiap entitas terbatas.
- Import langsung mengganti key localStorage yang disediakan tanpa validasi skema mendalam atau pratinjau.
- Ekspor mengumpulkan data dari localStorage; jika mode cloud aktif, belum tentu seluruh data cloud terbaru tercakup di backup.

**Perbaikan:**
- Validasi backup dengan schema version dan Zod per entitas.
- Tampilkan pratinjau jumlah rekening, transaksi, tagihan, hutang, dan target sebelum restore.
- Buat backup lokal otomatis sebelum menimpa data.
- Pisahkan alur backup cloud dan backup local; ekspor harus membaca sumber data aktif yang benar.
- Tambahkan checksum/metadata versi, tetapi jangan menyimpan password/token dalam backup.
- Sediakan opsi restore sebagai merge atau replace dengan penjelasan yang jelas.

---

## 5. Temuan P2 — UX, responsivitas, dan aksesibilitas

### P2-01 — Responsivitas mobile belum dapat dianggap lolos hanya dari breakpoint Tailwind

**Lokasi terkait:** `src/components/layout/MobileNav.tsx`, halaman dashboard/budget, modal transaksi, tabel laporan, dan komponen kartu.

**Laporan pengguna:** tampilan belum responsif di Poco F4. Ini adalah laporan pengguna yang valid, tetapi titik overflow spesifik harus direproduksi.

**Perbaikan dan verifikasi:**
- Uji lebar viewport 320, 360, 375, 393, 412, dan 440 px; termasuk portrait/landscape.
- Periksa `min-width` tersembunyi, grid yang terlalu lebar, label panjang, input nominal, tombol modal, tabel, dan bottom navigation.
- Pastikan body tidak mengalami horizontal scroll; jika tabel memang lebar, gunakan layout kartu mobile atau scroll container lokal.
- Modal harus dapat discroll di layar pendek dan tidak tertutup keyboard virtual.
- Tambahkan safe-area inset pada bottom navigation untuk perangkat dengan gesture navigation.
- Uji Poco F4 fisik setelah perbaikan, terutama keyboard Android, bottom navigation, dan slider.

### P2-02 — Hide nominal perlu aturan privasi yang konsisten

**Lokasi:** `DataContext.tsx` fungsi `formatMoney()`; `financialEngine.ts`, `formatIDRPrivacy()`.

**Temuan:** mode privasi mem-mask nilai yang melewati `formatMoney()`/`formatIDRPrivacy()`. Nilai yang dirender langsung oleh komponen dengan format lain berpotensi tidak ikut tersamarkan. Sebaliknya, pengguna melaporkan angka lain ikut tersembunyi; hal tersebut perlu dicocokkan dengan komponen aktual dan runtime.

**Aturan yang disarankan:**
- Samarkan hanya nilai uang dan saldo yang sensitif.
- Tetap tampilkan tanggal, jumlah transaksi, persentase, nomor hari, jumlah item, dan metrik nonuang.
- Jadikan satu formatter uang terpusat; larang komponen memformat nominal sendiri.
- Tambahkan tes snapshot/komponen untuk privacy mode aktif dan nonaktif.
- Tombol privasi harus punya label aksesibel dan status yang jelas.
- Catatan: menyamarkan nominal di UI bukan enkripsi data di penyimpanan.

### P2-03 — Manajemen fitur utama harus mudah ditemukan

**Laporan pengguna:** target tabungan, tagihan rutin, dan hutang/piutang terasa harus dicari di bagian bawah dashboard.

**Perbaikan:**
- Dashboard cukup menampilkan ringkasan, status, dan tombol aksi cepat.
- Pertahankan halaman khusus yang dapat dijangkau konsisten dari navigasi: `/app/goals`, `/app/subscriptions`, dan `/app/debts`.
- Sediakan tombol jelas “Kelola semua” dan “Tambah” pada setiap kartu ringkasan.
- Pastikan halaman tersebut dapat diakses dari sidebar, mobile navigation, atau menu “Lainnya”; jangan bergantung pada scroll dashboard.
- Tambahkan breadcrumb/judul halaman yang konsisten dan empty state yang mengarahkan pengguna ke aksi pertama.

### P2-04 — Slider anggaran rawan perubahan tak sengaja

**Perbaikan:**
- Tambahkan mode edit yang eksplisit: tombol “Ubah alokasi” → slider/input aktif → “Simpan perubahan”/“Batal”.
- Lock mencegah slider berubah ketika pengguna scroll; jangan mengandalkan gesture ambigu.
- Berikan tombol `+1%`, `-1%`, input persentase, dan undo.
- Pada mobile, slider perlu target sentuh yang cukup besar dan tidak mengganggu scroll halaman.
- Perubahan belum disimpan harus memiliki indikator yang jelas.

### P2-05 — Navigasi mobile dan modal perlu aksesibilitas

**Perbaikan:**
- Semua tombol icon-only punya `aria-label`.
- Pastikan fokus masuk ke modal saat dibuka dan kembali ke pemicu saat ditutup.
- Tombol tab/navigasi punya state aktif yang terbaca screen reader.
- Pastikan kontras teks kecil, ukuran tap target, urutan tab, dan penggunaan keyboard.
- Hormati `prefers-reduced-motion` untuk animasi marquee/transisi.

### P2-06 — Status loading dan error perlu terlihat

**Perbaikan:**
- Bedakan loading awal, kosong karena belum ada data, offline, error query, dan sesi habis.
- Jangan menampilkan saldo nol sebagai pengganti error database.
- Tambahkan tombol coba lagi dan pesan yang tidak membocorkan detail teknis sensitif.
- Error boundary sudah ada; pastikan ada logging yang aman dan fallback yang membantu.

---

## 6. Temuan P3 — Pengembangan setelah fondasi stabil

- Impor transaksi dari CSV/Excel dengan pemetaan kolom, pratinjau, deteksi duplikat, dan rollback.
- Kategori transaksi dan pencarian/filter lanjutan.
- Rekonsiliasi saldo dengan rekening bank/e-wallet secara manual.
- Riwayat perubahan untuk transaksi, anggaran, tagihan, dan hutang.
- Pengingat tagihan lokal/push yang memiliki izin dan batasan platform yang jelas.
- Ekspor laporan bulanan yang konsisten dengan data sumber.
- Onboarding yang mengumpulkan saldo awal, penghasilan, rekening, dan biaya esensial tanpa memaksa asumsi.
- Dukungan PWA/offline yang menampilkan status sinkronisasi; service worker harus memiliki strategi cache yang tidak menampilkan data pribadi setelah logout.
- Dokumentasi release, migrasi database, kebijakan backup, dan prosedur pemulihan insiden.

---

# BAGIAN B — ATURAN BISNIS KEUANGAN

## 7. Prinsip ledger (buku transaksi)

### 7.1 Aturan dasar

1. Semua nominal disimpan sebagai bilangan bulat rupiah (`BIGINT` pada database).
2. `amount` disimpan sebagai angka positif; arah uang ditentukan oleh `type`.
3. Tipe transaksi yang sah:
   - `income`: menambah saldo rekening.
   - `expense`: mengurangi saldo rekening.
   - `transfer`: mengurangi rekening sumber dan menambah rekening tujuan.
4. Transfer internal bukan pemasukan atau pengeluaran baru pada laporan total pengguna.
5. Setiap transaksi harus memiliki rekening sumber yang valid.
6. Transfer harus memiliki rekening tujuan yang valid dan berbeda dari rekening sumber.
7. Penghapusan/edit transaksi harus menghitung ulang saldo dan laporan dari ledger, bukan menyimpan saldo hasil hitung sebagai angka independen.
8. Jika transaksi dihapus, riwayat perubahan sebaiknya tetap dapat diaudit.

### 7.2 Rumus saldo rekening

`saldo_terkini = saldo_pembukaan + total_pemasukan - total_pengeluaran + transfer_masuk - transfer_keluar`

- Rekening arsip tidak ditampilkan sebagai rekening aktif dan tidak masuk total saldo aktif.
- Rekening investasi harus dipisahkan dari kas likuid.
- Saldo rekening boleh negatif jika produk mengizinkan overdraft, tetapi UI harus menandainya. Jika tidak diizinkan, validasi harus dilakukan saat menyimpan transaksi.
- Jangan menjumlahkan saldo rekening dan nilai target tabungan secara bersamaan jika target tabungan hanya merupakan tujuan/alokasi dari uang yang sama.

### 7.3 Tanggal transaksi

Simpan minimal:
- `transaction_date`: tanggal bisnis transaksi (tanggal uang masuk/keluar).
- `created_at`: waktu transaksi dicatat ke sistem.
- `updated_at`: waktu catatan terakhir diubah.

Untuk pembayaran tagihan/hutang, simpan juga tanggal pembayaran aktual dan periode terkait. Tanggal pencatatan tidak boleh otomatis menggantikan tanggal uang benar-benar berpindah.

## 8. Aturan kantong dan anggaran

1. Persentase alokasi harus berada pada rentang 0–100 per kantong.
2. Total alokasi idealnya tidak melebihi 100%.
3. Jika total kurang dari 100%, selisih ditampilkan sebagai “Belum dialokasikan”, bukan dianggap hilang atau sudah dibelanjakan.
4. Pagu kantong = penghasilan bulanan yang menjadi dasar anggaran × persentase alokasi.
5. Pengeluaran kantong = jumlah transaksi `expense` pada periode yang sama dan terhubung ke kantong itu.
6. Sisa kantong = pagu - pengeluaran; nilainya boleh negatif untuk menandakan overbudget.
7. Transaksi tanpa kantong harus tetap masuk ke total pengeluaran dan ditandai “Belum dikategorikan”.
8. Perubahan persentase anggaran tidak boleh mengubah saldo rekening atau menulis transaksi.
9. Perubahan penghasilan bulanan harus memperbarui pagu secara transparan, tetapi tidak boleh mengubah histori transaksi.
10. Bintang prioritas adalah metadata untuk membantu estimasi kebutuhan esensial; bukan bukti bahwa semua pengeluaran pada kantong itu adalah kebutuhan pokok.

## 9. Aturan pemasukan dan pengeluaran

- Pemasukan yang dicatat harus mewakili uang yang benar-benar masuk; rencana gaji/pendapatan masa depan tidak boleh menambah saldo riil sebelum diterima.
- Pengeluaran yang dicatat harus mewakili uang yang benar-benar keluar.
- Pencatatan transaksi berulang harus punya mekanisme pencegahan duplikat.
- Deskripsi transaksi wajib cukup jelas; kategori/kantong boleh opsional tetapi harus dapat difilter.
- Nominal nol tidak boleh disimpan sebagai transaksi ledger.
- Edit tanggal transaksi harus memperbarui laporan periode terkait.
- Laporan pemasukan/pengeluaran hanya menghitung `income`/`expense`; `transfer` tidak masuk kedua total tersebut.

## 10. Aturan tagihan rutin

Pisahkan **template tagihan** dan **riwayat pembayaran**.

### Template tagihan
Menyimpan nama, nominal yang diharapkan, siklus, tanggal jatuh tempo, kategori/kantong default, rekening default, status aktif, dan catatan.

### Riwayat pembayaran
Satu record per pembayaran/periode, minimal:
- ID pembayaran
- ID template tagihan
- periode tagihan (`YYYY-MM` atau rentang tanggal)
- tanggal jatuh tempo
- tanggal pembayaran aktual
- tanggal pencatatan
- nominal yang dibayar
- rekening
- ID transaksi ledger terkait
- status (belum dibayar, dibayar, terlambat, dibatalkan)

### Aturan
1. Pembayaran yang dicatat terlambat harus dapat mencatat tanggal pembayaran aktual.
2. Periode tagihan tidak boleh disimpulkan hanya dari tanggal saat pengguna memasukkan data.
3. Sistem harus mencegah pembayaran ganda untuk periode yang sama, kecuali pengguna memilih pembayaran parsial/lebih dari satu kali.
4. Pembayaran membuat transaksi expense satu kali dan terhubung dengan record pembayaran.
5. Membatalkan pembayaran harus memiliki aturan pembalik transaksi atau pembatalan yang diaudit; jangan sekadar menghapus flag.
6. Untuk siklus bulanan dengan jatuh tempo tanggal 29–31, tetapkan aturan eksplisit pada bulan yang tidak memiliki tanggal tersebut (misalnya jatuh tempo hari terakhir bulan).

## 11. Aturan hutang dan piutang

- `payable`: pengguna berutang; pembayaran cicilan mengurangi sisa kewajiban dan menurunkan saldo rekening.
- `receivable`: orang lain berutang kepada pengguna; penerimaan pembayaran mengurangi sisa piutang dan menambah saldo rekening.
- `sisa = total_awal - total_pembayaran_valid`.
- `paid_amount` tidak boleh negatif atau melebihi total awal kecuali overpayment sengaja didukung.
- Setiap cicilan memiliki record sendiri dan terhubung ke satu transaksi ledger.
- Status lunas dihitung dari sisa yang valid, bukan hanya checkbox manual.
- Jika pembayaran dicatat tanpa rekening/arus kas, UI harus menjelaskan bahwa itu hanya pembaruan catatan, bukan transaksi saldo.
- Edit/hapus cicilan harus memperbarui saldo dan total pembayaran secara atomik.

## 12. Aturan target tabungan

- Target tabungan adalah tujuan, bukan otomatis rekening terpisah.
- `target_amount` harus lebih besar dari nol; `current_amount` tidak boleh negatif.
- Persentase progres = `current_amount / target_amount × 100`, dibatasi 0–100% untuk visual.
- Jika pengguna “menyetor” ke target dari rekening, tentukan model dengan jelas:
  - **Model sederhana:** target hanya melacak progres, setoran tidak mengubah saldo rekening kecuali dibuat transaksi.
  - **Model ledger terhubung:** setoran merupakan transfer dari rekening operasional ke rekening tabungan/akun tujuan.
- Jangan menurunkan saldo rekening hanya karena pengguna mengubah nilai progres target tanpa transaksi terkait.
- Ketika target dihapus, transaksi dan histori setoran tidak boleh hilang tanpa konfirmasi.

## 13. Aturan dana darurat

### Definisi utama
`ketahanan_dana_darurat_bulan = kas_likuid_siap_pakai / rata_rata_pengeluaran_esensial_bulanan`

### Kas likuid siap pakai
Masukkan rekening aktif yang benar-benar bisa digunakan untuk kebutuhan harian, misalnya kas, rekening bank, dan e-wallet yang dipilih pengguna. Keluarkan investasi, aset tidak likuid, rekening arsip, dan dana yang tidak dapat diakses segera.

### Pengeluaran esensial
Utamakan rata-rata pengeluaran aktual pada kategori esensial selama 3–6 bulan. Jika histori belum cukup, minta pengguna memasukkan estimasi bulanan secara manual. Alokasi kantong berbintang boleh menjadi estimasi sementara, tetapi labeli sebagai estimasi.

### Status dan transparansi
- Kurang dari 1 bulan: kritis.
- 1 sampai kurang dari 3 bulan: perlu perhatian.
- 3 sampai kurang dari 6 bulan: cukup, tetapi belum mencapai target umum.
- 6 bulan atau lebih: target tercapai; jangan menyebut “pasti aman”.

Ambang tersebut adalah panduan umum, bukan jaminan. Kebutuhan dana darurat bergantung pada stabilitas penghasilan, tanggungan, kondisi keluarga, dan risiko pengguna.

### Contoh
Jika kas likuid yang siap dipakai Rp12.000.000 dan biaya pokok Rp3.000.000 per bulan, runway = 4 bulan. Jika Rp12.000.000 tersebut termasuk investasi yang sulit dicairkan, nilai investasi tidak boleh otomatis dianggap kas siap pakai.

## 14. Aturan mode privasi

- Masking nominal adalah fitur tampilan, bukan enkripsi database.
- Sembunyikan nilai uang/saldo/pagu/pengeluaran/progres tabungan dalam rupiah jika termasuk data sensitif.
- Jangan sembunyikan tanggal, persentase, jumlah item, nomor periode, jumlah transaksi, dan teks nonfinansial kecuali pengguna memilih mode privasi menyeluruh.
- Semua nominal harus lewat satu komponen/formatter yang mendukung mode privasi.
- Jangan memformat nominal langsung dengan formatter berbeda di komponen yang melewati masking.
- Mode privasi sebaiknya per perangkat/per sesi sesuai kebutuhan; jangan menganggapnya sebagai kontrol keamanan akun.

## 15. Aturan autentikasi, demo, dan penyimpanan

### Cloud mode
- Sesi sah harus berasal dari Supabase Auth.
- Semua data harus terikat ke `auth.uid()`; `user_id` ditentukan di service dari sesi, bukan dipercayai dari UI.
- RLS wajib aktif dan dites pada seluruh tabel milik pengguna.
- Error query/mutation cloud harus terlihat dan tidak dianggap sukses.
- Tidak boleh ada fallback diam-diam dari cloud ke localStorage.

### Demo mode
- Gunakan data demo terpisah, tidak terkait akun sungguhan.
- Perubahan demo tidak boleh menimpa localStorage akun atau cloud.
- Tombol “Mulai demo” harus menampilkan label DEMO dan aksi reset demo.
- Keluar dari demo harus membersihkan state demo dari memori.

### Local mode
- Tampilkan peringatan bahwa data tersimpan hanya di browser/perangkat tersebut.
- Gunakan namespace per profil lokal.
- Jelaskan risiko kehilangan data ketika browser dibersihkan atau perangkat rusak.
- Sediakan ekspor backup yang teruji.
- Jangan menyatakan localStorage terenkripsi tanpa implementasi dan verifikasi yang sesuai.

---

# BAGIAN C — ROADMAP PENGEMBANGAN

## 16. Prinsip urutan pengerjaan

Urutan di bawah sengaja memprioritaskan keselamatan data sebelum kosmetik. Jangan menggabungkan terlalu banyak perubahan sekaligus; setiap fase harus memiliki tes penerimaan dan commit yang terpisah.

## Fase 0 — Pengamanan dan diagnosis (P0, wajib lebih dulu)

**Tujuan:** memastikan demo, akun, dan data cloud tidak bercampur.

1. Buat branch `fix/auth-data-isolation`.
2. Pisahkan `login()` akun nyata dari `enterDemoMode()`.
3. Terapkan status sesi yang eksplisit dan tunggu inisialisasi auth selesai sebelum menampilkan protected route.
4. Hilangkan login cloud tanpa password/sesi sah.
5. Isolasi namespace localStorage untuk demo dan pengguna lokal.
6. Hilangkan fallback cloud → localStorage saat query/mutation error.
7. Pastikan logout membersihkan state React dan mengembalikan pengguna ke route publik.
8. Audit RLS semua tabel dan hilangkan fallback `user-1` pada mode cloud.
9. Tambahkan tes auth dan isolasi data.

**Kriteria selesai:**
- Demo selalu memakai data demo.
- Akun A tidak pernah melihat data lokal akun B.
- Tanpa sesi valid, protected route tidak bisa menampilkan data akun.
- Kegagalan cloud muncul sebagai error yang jelas, bukan data lokal palsu.
- Logout lalu login ulang tidak menampilkan data milik akun lain.

## Fase 1 — Konsistensi skema dan penyimpanan cloud (P0, wajib)

1. Tetapkan standar ID UUID untuk seluruh tabel cloud.
2. Perbaiki migration foreign key di tabel subscriptions/debts.
3. Periksa bahwa semua insert mengirim field yang diperlukan dan tipe data cocok.
4. Perbaiki nama tabel pada `deleteAllUserData()` (`savings_goals`, bukan `goals`).
5. Tambahkan validasi dan error handling pada setiap operasi Supabase.
6. Jalankan semua migrasi dari database staging kosong.
7. Uji create/read/update/delete untuk profile, account, pocket, transaction, goal, task, subscription, dan debt.
8. Uji RLS dengan dua pengguna yang berbeda.

**Kriteria selesai:**
- Semua migrasi berjalan bersih.
- Tidak ada error tipe UUID/TEXT.
- Data cloud tetap ada setelah reload dan login dari browser lain.
- Error jaringan/permission tidak menghasilkan pesan sukses palsu.
- User A tidak dapat mengakses data User B.

## Fase 2 — Ledger, tagihan, dan hutang/piutang (P1)

1. Tegaskan satu sumber kebenaran saldo: ledger transaksi.
2. Pisahkan template tagihan dan riwayat pembayaran per periode.
3. Simpan due date, paid date, recorded date, period, amount, dan transaction ID.
4. Cegah pembayaran ganda untuk periode yang sama.
5. Buat pencatatan cicilan hutang/piutang yang terhubung dengan transaksi.
6. Simpan pembayaran dan transaksi secara atomik di cloud.
7. Pastikan transfer tidak memengaruhi total income/expense.
8. Perjelas transaksi tanpa kategori dan penghapusan/arsip kantong.
9. Tambahkan tes invariant saldo, transaksi, pembayaran, dan laporan.

**Kriteria selesai:**
- Satu pembayaran tagihan menghasilkan tepat satu transaksi yang benar.
- Pembayaran terlambat dapat menyimpan tanggal aktual dan periode yang tepat.
- Hutang/piutang dan saldo rekening tidak dapat berbeda akibat operasi setengah berhasil.
- Transfer antarrekening mempertahankan total saldo keseluruhan.

## Fase 3 — Perbaikan dana darurat dan laporan (P1)

1. Hitung kas likuid dari rekening aktif yang benar-benar likuid.
2. Keluarkan investasi dan rekening arsip dari runway.
3. Hilangkan fallback pendapatan Rp3.000.000 yang tidak eksplisit.
4. Gunakan pengeluaran esensial aktual atau input manual.
5. Tampilkan formula, sumber data, periode observasi, dan status “estimasi”.
6. Validasi periode dan timezone.
7. Samakan angka dashboard dengan angka laporan dan daftar transaksi.

**Kriteria selesai:**
- Semua angka dapat dijelaskan dengan data transaksi/rekening yang mendasarinya.
- Runway tidak menganggap investasi sebagai kas siap pakai.
- Data tidak cukup menghasilkan status yang jujur, bukan angka buatan.
- Laporan bulanan sesuai dengan filter tanggal yang ditampilkan.

## Fase 4 — UX mobile dan navigasi (P2)

1. Reproduksi masalah Poco F4.
2. Uji layout pada lebar 320–440 px dan orientasi landscape.
3. Perbaiki overflow, modal, keyboard virtual, safe-area, dan bottom navigation.
4. Tambahkan lock/edit mode untuk slider budget.
5. Pindahkan akses manajemen goals/subscriptions/debts ke navigasi dan tombol aksi yang mudah ditemukan.
6. Rapikan mode hide nominal supaya hanya menyembunyikan nilai uang.
7. Audit label aksesibel, fokus modal, tap target, dan reduced motion.

**Kriteria selesai:**
- Tidak ada horizontal overflow yang tidak disengaja.
- Form masih bisa digunakan ketika keyboard Android terbuka.
- Slider tidak berubah ketika pengguna hanya scroll.
- Fitur utama dapat dijangkau tanpa harus menemukan kartu di bagian bawah dashboard.
- Mode privasi konsisten di seluruh halaman.

## Fase 5 — QA, observability, dan release (P1/P2)

1. Jalankan `npm ci`, `npm run test`, dan `npm run build`.
2. Tambahkan integrasi test Supabase staging.
3. Tambahkan smoke test login, demo, transaksi, pembayaran, laporan, backup/restore, dan logout.
4. Catat error secara aman tanpa password/token/nominal sensitif yang tidak perlu.
5. Uji migrasi, backup, dan prosedur pemulihan.
6. Periksa `public/sw.js` agar cache tidak menampilkan data sensitif setelah logout.
7. Dokumentasikan release checklist dan rollback.
8. Baru setelah itu prioritaskan fitur baru seperti impor CSV, analitik lanjutan, atau integrasi lain.

---

# BAGIAN D — TEST PLAN / QA

## 17. Lingkungan uji

Minimal siapkan:
- Browser desktop Chrome/Edge terbaru.
- Android/Poco F4, portrait dan landscape.
- Supabase staging terpisah dari production.
- Dua akun uji: User A dan User B.
- Mode local, mode demo, dan mode cloud.
- Dataset yang diketahui: 2 rekening, 3 kantong, transaksi income/expense/transfer, satu tagihan, satu hutang, satu piutang, dan satu target tabungan.

**Aturan:** jangan gunakan data keuangan nyata selama pengujian awal. Gunakan akun dan nominal dummy.

## 18. Kasus uji P0 — Auth dan isolasi data

| ID | Skenario | Langkah | Hasil yang diharapkan | Prioritas |
|---|---|---|---|---|
| AUTH-01 | Buka app tanpa sesi | Buka `/app/dashboard` di private window | Dialihkan ke login/public route; tidak ada data akun tampil | P0 |
| AUTH-02 | Login cloud tanpa password | Jalankan jalur demo/login tanpa sesi valid | Login cloud ditolak; demo harus masuk jalur terpisah | P0 |
| AUTH-03 | Demo terisolasi | Ubah transaksi di demo, keluar, lalu login User A | Data User A tidak berubah | P0 |
| AUTH-04 | Dua akun satu browser | Login User A, buat transaksi; logout; login User B | User B tidak melihat data A | P0 |
| AUTH-05 | Reload sesi cloud | Login User A lalu reload halaman | Sesi pulih hanya jika Supabase session valid; tidak ada profil lokal yang menggantikan sesi | P0 |
| AUTH-06 | Logout | Logout saat dashboard terbuka | State sensitif dibersihkan; kembali ke route publik | P0 |
| AUTH-07 | RLS silang | Coba query ID data User A dari User B | Tidak ada data User A yang dapat dibaca/diubah/dihapus oleh B | P0 |
| AUTH-08 | Cloud offline | Putus jaringan saat membaca data | Error/offline ditampilkan; local data tidak menyamar sebagai cloud | P0 |
| AUTH-09 | Insert gagal | Paksa error constraint/RLS saat menyimpan | UI tidak menyatakan sukses; error dapat dipahami dan dicoba ulang | P0 |
| AUTH-10 | Delete all | Hapus semua data uji | Semua tabel yang ditargetkan benar-benar kosong; error parsial dilaporkan | P0 |

## 19. Kasus uji skema dan sinkronisasi

| ID | Skenario | Hasil yang diharapkan | Prioritas |
|---|---|---|---|
| DB-01 | Jalankan migrasi dari database kosong | Semua migration sukses tanpa error foreign key | P0 |
| DB-02 | Buat rekening cloud | ID valid sesuai tipe UUID; data bertahan setelah reload | P0 |
| DB-03 | Buat transaksi terkait rekening/kantong | Semua FK valid; data muncul dari cloud | P0 |
| DB-04 | Buat tagihan dan hutang | FK kompatibel; data memiliki user_id yang benar | P0 |
| DB-05 | Update/delete setiap entitas | Error diperiksa; tidak ada local/cloud divergence | P0 |
| DB-06 | Gagal menyimpan karena jaringan | UI menyatakan belum tersimpan dan menawarkan retry | P0 |
| DB-07 | Login dari browser kedua | Data cloud yang sama terlihat, data local browser tidak ikut tercampur | P0 |
| DB-08 | Migrasi data lama | Key lama dipindahkan dengan konfirmasi dan tidak tertukar antar akun | P1 |

## 20. Kasus uji ledger dan aturan keuangan

| ID | Skenario | Langkah / data | Hasil yang diharapkan | Prioritas |
|---|---|---|---|---|
| FIN-01 | Saldo awal | Rekening Rp1.000.000 tanpa transaksi | Saldo Rp1.000.000 | P1 |
| FIN-02 | Pemasukan | Tambah income Rp500.000 | Saldo naik Rp500.000; income bulan naik | P1 |
| FIN-03 | Pengeluaran | Tambah expense Rp100.000 | Saldo turun Rp100.000; expense bulan naik | P1 |
| FIN-04 | Transfer internal | Transfer Rp200.000 dari A ke B | A turun Rp200.000, B naik Rp200.000, total saldo tetap; income/expense tidak berubah | P1 |
| FIN-05 | Transfer ke rekening sama | Pilih rekening sumber dan tujuan yang sama | Ditolak dengan pesan validasi | P1 |
| FIN-06 | Nominal nol/negatif | Input 0 atau nilai negatif | Ditolak atau dinormalisasi sesuai aturan yang eksplisit; tidak tersimpan sebagai transaksi | P1 |
| FIN-07 | Transaksi tanpa kantong | Catat expense tanpa pocket | Total expense dan saldo benar; tampil di kategori “Belum dikategorikan” | P1 |
| FIN-08 | Transaksi lintas bulan | Catat transaksi di hari terakhir dan pertama bulan | Laporan masuk ke periode yang benar | P1 |
| FIN-09 | Edit transaksi | Ubah nominal/tanggal transaksi | Saldo dan semua laporan diperbarui konsisten | P1 |
| FIN-10 | Hapus transaksi | Hapus transaksi yang sudah ada | Saldo dihitung ulang; histori perubahan mengikuti kebijakan | P1 |
| FIN-11 | Akun arsip | Arsipkan rekening yang memiliki saldo | Tidak muncul sebagai rekening aktif; aturan total saldo konsisten | P1 |
| FIN-12 | Overbudget | Pengeluaran lebih besar dari pagu | Sisa negatif dan status overbudget ditampilkan dengan benar | P1 |
| FIN-13 | Alokasi kurang dari 100% | Total kantong 80% | 20% tampil sebagai belum dialokasikan | P1 |
| FIN-14 | Alokasi lebih dari 100% | Total kantong 105% | Simpan ditolak atau butuh konfirmasi sesuai aturan | P1 |

## 21. Kasus uji tagihan, hutang, piutang, dan tabungan

| ID | Skenario | Hasil yang diharapkan | Prioritas |
|---|---|---|---|
| BILL-01 | Bayar tagihan periode berjalan | Satu payment record dan satu transaksi expense terhubung | P1 |
| BILL-02 | Catat pembayaran terlambat | Pilih tanggal pembayaran aktual yang lebih awal daripada tanggal pencatatan | Periode dan tanggal aktual tetap benar; recorded_at berbeda | P1 |
| BILL-03 | Bayar tagihan dua kali | Bayar periode sama dua kali | Ditolak atau diminta konfirmasi sesuai dukungan cicilan; tidak terjadi duplikasi diam-diam | P1 |
| BILL-04 | Tagihan tanggal 31 | Bulan tanpa tanggal 31 | Aturan jatuh tempo terakhir bulan diterapkan konsisten | P1 |
| DEBT-01 | Bayar cicilan hutang | Bayar Rp200.000 dari hutang Rp1.000.000 | Sisa hutang Rp800.000 dan saldo rekening turun Rp200.000 | P1 |
| DEBT-02 | Terima cicilan piutang | Terima Rp200.000 dari piutang Rp1.000.000 | Sisa piutang Rp800.000 dan saldo rekening naik Rp200.000 | P1 |
| DEBT-03 | Pembayaran melebihi sisa | Bayar lebih besar dari saldo hutang/piutang | Ditolak kecuali overpayment sengaja didukung | P1 |
| DEBT-04 | Simpan pembayaran gagal | Paksa transaksi ledger gagal | Tidak boleh ada status hutang yang berubah tanpa payment/ledger yang konsisten | P1 |
| GOAL-01 | Update target saja | Ubah progress tanpa transaksi | Saldo rekening tidak berubah pada model target sederhana | P1 |
| GOAL-02 | Setoran target terhubung | Setor dari rekening ke rekening tabungan | Transfer/ledger tercatat dan saldo total konsisten | P1 |

## 22. Kasus uji dana darurat, privasi, dan UX

| ID | Skenario | Hasil yang diharapkan | Prioritas |
|---|---|---|---|
| RUNWAY-01 | Kas Rp12 juta, biaya pokok Rp3 juta | Runway 4 bulan | P1 |
| RUNWAY-02 | Ada investasi besar | Investasi tidak dihitung sebagai kas siap pakai | P1 |
| RUNWAY-03 | Tidak ada pendapatan/histori | Minta estimasi manual atau tampilkan belum cukup data; tidak memasukkan angka fallback diam-diam | P1 |
| RUNWAY-04 | Tidak ada kantong bintang | Tampilkan metode estimasi yang jelas | P1 |
| PRIV-01 | Hide nominal aktif | Nominal uang disamarkan | P2 |
| PRIV-02 | Hide nominal aktif | Tanggal, persentase, jumlah transaksi, jumlah item tetap terlihat | P2 |
| PRIV-03 | Seluruh halaman | Semua komponen nominal memakai formatter privasi yang sama | P2 |
| MOB-01 | Viewport 320–440 px | Tidak ada horizontal overflow tak disengaja | P2 |
| MOB-02 | Poco F4 portrait | Kartu, input, tombol, dan navigasi dapat digunakan | P2 |
| MOB-03 | Keyboard Android terbuka | Modal/form tetap dapat discroll dan tombol submit terlihat | P2 |
| MOB-04 | Scroll di halaman budget | Slider tidak berubah jika mode edit/lock aktif | P2 |
| MOB-05 | Navigasi goals/bills/debts | Modul dapat dijangkau tanpa scroll jauh di dashboard | P2 |
| MOB-06 | Landscape/layar pendek | Modal dan bottom nav tidak menutupi kontrol penting | P2 |
| A11Y-01 | Navigasi keyboard | Fokus dapat mencapai tombol dan modal memiliki focus management | P2 |
| A11Y-02 | Screen reader | Icon-only buttons memiliki label yang bermakna | P2 |

## 23. Tes otomatis yang wajib ditambahkan

- `AuthContext.test.tsx`: sesi valid, tidak ada sesi, error auth, logout, demo terpisah.
- `dataIsolation.test.ts`: namespace antar user/demo, logout, migrasi key lama.
- `dataService.integration.test.ts`: operasi cloud berhasil/gagal, error tidak disamarkan.
- `rls.integration.test.ts`: User A dan B tidak dapat saling mengakses data.
- `financialLedger.test.ts`: saldo, transfer, pengeluaran tanpa kantong, edit/hapus transaksi.
- `subscriptionPayments.test.ts`: tanggal jatuh tempo, tanggal bayar, periode, anti-duplikasi.
- `debtPayments.test.ts`: pembayaran hutang/piutang atomik dan batas nominal.
- `emergencyRunway.test.ts`: investasi dikecualikan, data tidak cukup, biaya esensial aktual/manual.
- `privacyMode.test.tsx`: hanya nominal uang yang disamarkan.
- `responsive`/browser E2E test untuk alur inti di viewport mobile.

Tes unit yang ada adalah awal yang baik, tetapi tidak menggantikan tes integrasi database dan tes alur pengguna.

---

# BAGIAN E — SARAN IMPLEMENTASI TEKNIS

## 24. Perubahan arsitektur yang direkomendasikan

### 24.1 Pisahkan sumber data

Daripada setiap method menentukan sendiri kapan menggunakan cloud atau localStorage, buat interface yang jelas:

- `CloudDataRepository`: hanya operasi Supabase; error tidak fallback diam-diam.
- `LocalDataRepository`: operasi lokal dengan namespace per profil.
- `DemoDataRepository`: dataset demo yang terisolasi.
- `DataRepository`/provider memilih satu implementasi berdasarkan mode sesi.

**Manfaat:** mencegah campur data, memudahkan testing, dan menjadikan perilaku offline eksplisit.

### 24.2 Buat layanan transaksi atomik

Untuk cloud, operasi yang mengubah beberapa tabel (contoh: pembayaran hutang + transaksi ledger) sebaiknya dijalankan melalui database function/RPC atau mekanisme transaksi server yang menjamin kedua perubahan berhasil bersama-sama.

Jangan mengandalkan dua request independen di browser untuk menjaga integritas keuangan.

### 24.3 Normalisasi model data

Model minimal yang disarankan:
- `profiles`
- `accounts`
- `budgets`
- `pockets`
- `transactions`
- `savings_goals`
- `subscriptions`
- `subscription_payments`
- `debts`
- `debt_payments`
- `tasks`
- `reminders`
- `activity_logs`

Semua tabel milik pengguna harus mempunyai `user_id` atau kepemilikan yang dapat diturunkan secara aman, RLS yang tepat, dan foreign key yang konsisten.

### 24.4 Gunakan validasi di batas sistem

- Validasi form menggunakan Zod.
- Validasi lagi di service/domain sebelum mutation.
- Validasi database dengan `NOT NULL`, `CHECK`, `UNIQUE`, dan foreign key.
- UI validation saja tidak cukup karena request dapat gagal, berubah, atau dikirim langsung ke API.

### 24.5 Tambahkan audit trail

Untuk perubahan transaksi keuangan, simpan minimal siapa yang melakukan perubahan, waktu, entitas, jenis aksi, dan ringkasan perubahan yang tidak membocorkan informasi sensitif secara berlebihan. Jangan menaruh password, access token, atau secret di log.

---

## 25. Checklist sebelum rilis publik

Rilis **belum siap** sampai semua butir P0 lulus.

### Keamanan & akun
- [ ] Login cloud selalu memerlukan sesi Supabase valid.
- [ ] Demo terpisah dari akun nyata dan localStorage akun.
- [ ] Logout membersihkan state sensitif.
- [ ] RLS diuji dengan minimal dua akun.
- [ ] Tidak ada `service_role` key di frontend, repo, atau build.
- [ ] Semua data cloud diikat ke pemilik yang benar.

### Database & sinkronisasi
- [ ] Semua migrasi berjalan dari database kosong.
- [ ] UUID dan foreign key konsisten.
- [ ] Tidak ada fallback cloud error → local sukses palsu.
- [ ] Create/read/update/delete semua entitas dites.
- [ ] Backup/restore diuji pada dataset yang diketahui.

### Integritas keuangan
- [ ] Saldo dihitung dari ledger.
- [ ] Transfer tidak dihitung sebagai income/expense.
- [ ] Pembayaran tagihan memiliki periode dan tanggal aktual.
- [ ] Pembayaran hutang/piutang terhubung ke transaksi.
- [ ] Runway hanya menghitung kas likuid.
- [ ] Dashboard dan laporan menunjukkan angka yang konsisten.

### UX
- [ ] Tidak ada overflow pada Poco F4/viewport mobile.
- [ ] Modal dan keyboard Android tidak saling menutupi.
- [ ] Slider memiliki lock/edit mode.
- [ ] Goals, bills, dan debts mudah ditemukan.
- [ ] Hide nominal hanya menyembunyikan nilai uang.

### QA & operasional
- [ ] `npm ci` berhasil.
- [ ] `npm run test` lulus.
- [ ] `npm run build` lulus.
- [ ] Tes integrasi Supabase staging lulus.
- [ ] Backup, rollback, dan prosedur pemulihan terdokumentasi.
- [ ] Service worker tidak menyajikan data pribadi setelah logout.

---

# BAGIAN F — KESIMPULAN DAN SARAN AKHIR

## 26. Apa yang sebaiknya diperbaiki terlebih dahulu?

**Rekomendasi utama saya: hentikan sementara penambahan fitur baru dan lakukan hardening data selama dua fase pertama.** Ini bukan berarti UI tidak penting; tetapi UI yang cantik tidak cukup jika sesi cloud tidak valid, data antar akun dapat tercampur, atau transaksi gagal disimpan tanpa diketahui pengguna.

Urutan konkret:

1. **Perbaiki auth dan demo terlebih dahulu.** Pisahkan demo dari login sungguhan. Protected route hanya boleh menampilkan data akun setelah status auth selesai diperiksa.
2. **Isolasi localStorage.** Jangan menggunakan satu kumpulan key untuk semua pengguna. Demo, local user, dan cloud user harus mempunyai sumber data yang berbeda.
3. **Hentikan fallback cloud yang diam-diam.** Jika Supabase gagal, tampilkan error. Jangan tampilkan data lokal seolah-olah itu data cloud.
4. **Selaraskan ID dan migrasi database.** Gunakan UUID secara konsisten untuk cloud, betulkan foreign key `subscriptions`/`debts`, dan perbaiki penghapusan `savings_goals`.
5. **Bangun model pembayaran yang benar.** Tagihan rutin dan hutang/piutang perlu riwayat pembayaran yang terhubung ke ledger, dengan tanggal pembayaran aktual dan periode yang eksplisit.
6. **Audit ulang perhitungan dana darurat.** Jangan menghitung investasi sebagai kas siap pakai dan jangan memasukkan asumsi Rp3 juta tanpa penjelasan/persetujuan pengguna.
7. **Baru setelah itu selesaikan UX mobile.** Uji pada Poco F4, benahi modal/keyboard/bottom navigation, lock slider, navigasi modul, dan hide nominal.
8. **Tutup dengan QA dan release gate.** Tes otomatis, tes integrasi Supabase, uji dua akun, dan checklist backup/rollback harus lulus sebelum sistem dipakai untuk data finansial nyata.

## 27. Bentuk Pockito yang seharusnya dicapai

Pockito seharusnya menjadi aplikasi yang:
- Menunjukkan satu sumber angka yang dapat ditelusuri ke transaksi.
- Tidak pernah mencampur data demo, lokal, dan cloud.
- Tidak menyatakan “tersimpan” sebelum penyimpanan berhasil.
- Memisahkan saldo rekening, pagu anggaran, target tabungan, hutang/piutang, dan kas darurat secara konseptual.
- Menyimpan tanggal transaksi, tanggal pembayaran, dan waktu pencatatan secara berbeda bila maknanya berbeda.
- Memiliki alur mobile yang nyaman dan tidak memicu perubahan input tanpa sengaja.
- Menjelaskan asumsi kalkulasi finansial dan mengakui ketika data belum cukup.
- Memiliki tes regresi agar perbaikan berikutnya tidak merusak fitur yang sudah berjalan.

**Kesimpulan akhir:** Pockito mempunyai fondasi fitur dan domain finansial yang menjanjikan, tetapi risiko terbesar saat ini ada pada **kepercayaan terhadap data**: autentikasi, isolasi pengguna, sinkronisasi, skema, dan konsistensi ledger. Selesaikan semua P0 terlebih dahulu, lalu P1, kemudian P2. Dengan urutan itu, pengembangan berikutnya akan lebih aman dan jauh lebih mudah dipelihara.

---

## Lampiran — File yang perlu menjadi fokus developer

| File | Fokus pemeriksaan/perbaikan |
|---|---|
| `src/context/AuthContext.tsx` | Pisahkan demo dan login cloud; status sesi; logout |
| `src/services/dataService.ts` | Isolasi localStorage; penanganan error; ID; nama tabel; operasi cloud |
| `src/context/DataContext.tsx` | Mutasi pembayaran tagihan/hutang; transaksi atomik; fallback user ID |
| `src/services/supabaseClient.ts` | Konfigurasi dan lifecycle sesi Supabase |
| `src/domain/finance/financialEngine.ts` | Saldo, periode, alokasi, privacy formatter, runway |
| `supabase/migrations/20261018000001_pockito_schema.sql` | Tipe ID, relasi, constraints, RLS |
| `supabase/migrations/20261027000002_subscriptions_and_debts.sql` | Tipe foreign key dan model pembayaran |
| `src/components/layout/MobileNav.tsx` | Responsivitas, safe area, navigasi mobile |
| `src/components/pockets/PocketCard.tsx` dan halaman budget | Pengalaman slider/lock, nominal, akses manajemen |
| `src/components/dashboard/EmergencyRunwayCard.tsx` | Penjelasan formula, status estimasi, privacy |
| `tests/domain/financialEngine.test.ts` | Tambahkan skenario runway dan ledger yang kritis |
| `tests/domain/dataService.test.ts` | Tambahkan isolasi user, error cloud, restore yang tervalidasi |
| `tests/components/app.test.tsx` | Tambahkan auth routing dan skenario pengguna |

> Dokumen ini adalah audit awal yang dapat langsung dijadikan backlog kerja. Setiap temuan P0/P1 perlu ditutup dengan perubahan kode, tes yang membuktikan perbaikannya, dan catatan hasil verifikasi sebelum dianggap selesai.

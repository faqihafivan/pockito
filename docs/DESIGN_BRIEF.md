# Pockito — Pre-Code UI/UX Design Brief (Anti-AI-Slop Architecture)
*Dokumen Cetak Biru Arsitektur Desain Antarmuka Pockito*  
*Sesuai Standar: `/anti-slop-workflow` (Modul 2) & `/frontend-design` (Neo-Fintech Obsidian & Deep Teal)*

---

## 1. Design Principles (3 Aturan Utama Desain Pockito)
1. **Neo-Fintech Clarity, Anti-Generic AI Slop:**  
   Mengharamkan warna ungu/indigo klise (`#6366F1`, `#8B5CF6`) dan gradasi neon murah. Mengadopsi estetika Neo-Fintech modern terinspirasi oleh *Linear*, *Stripe*, dan *Shadcn UI* dengan kanvas hangat ultra-bersih (`#FAF8F5` / `#F8FBFB` light, `#09090B` / `#111317` dark) dan aksen Deep Teal (`#0F766E`) serta Emerald (`#059669`).
2. **Optic Radius & Crisp 1px Surface:**  
   Menghindari drop-shadow blur tebal yang kotor. Menggunakan border presisi 1px (`border-zinc-200/80` atau `border-brand-border`), mikro-shadow tajam (`shadow-[0_1px_2px_rgba(0,0,0,0.03)]` atau `shadow-saweria-xs`), serta rumus radius bersarang matematis:
   $$R_{inner} = R_{outer} - \text{Padding}$$
3. **Monospace Tabular Numerics & Zero Layout Shift (CLS):**  
   Seluruh angka nominal Rupiah, saldo, persentase alokasi, tanggal, dan metrik kuantitatif **WAJIB** menggunakan `JetBrains Mono` dengan `tabular-nums font-mono` agar digit angka sejajar lurus secara vertikal dan tidak bergeser saat nilai berubah.

---

## 2. Visual Direction & Anti-Patterns
* **Mood & Feel:** Profesional, ramah anak muda (Gen-Z & Milenial cerdas finansial), presisi akuntansi tanpa kerumitan teknis, modular Bento Grid.
* **Referensi Estetika:** Linear, Vercel Dashboard, Raycast, Stripe Treasury.
* **Strict Anti-Patterns (DILARANG):**
  - ❌ Dilarang menggunakan warna `indigo-*` atau `purple-*` pada tombol primer, badge, atau border fokus.
  - ❌ Dilarang menampilkan teks terpotong (*horizontal/vertical text clipping*) di viewport mobile mau pun laptop.
  - ❌ Dilarang merender kotak putih kaku tanpa isi saat gambar gagal dimuat (*image onError*).
  - ❌ Dilarang membiarkan tampilan tabel atau list kosong melompong tanpa *3-Layer Rich Empty State*.

---

## 3. Design Tokens (Palet Warna, Tipografi, Spacing & Radius)

### A. Color Palette (Formula 60-30-10)
| Peran Token | Nilai Hex Light | Nilai Hex Dark | Deskripsi & Penggunaan |
| :--- | :--- | :--- | :--- |
| **Canvas (60%)** | `#FAF8F5` / `#F8FBFB` | `#09090B` / `#0D1117` | Latar belakang utama aplikasi, hangat dan tidak silau. |
| **Card Surface (30%)** | `#FFFFFF` | `#161B22` / `#131317` | Permukaan kartu Bento, modal, popover, dan panel kontrol. |
| **Primary Accent (10%)** | `#0F766E` (Deep Teal) | `#14B8A6` (Mint Teal) | Tombol CTA utama, status aktif navigasi, dan indikator fokus. |
| **Success / Income** | `#059669` (Emerald-600) | `#34D399` (Emerald-400) | Pemasukan, target tercapai, saldo surplus, badge lunas. |
| **Warning / Budget** | `#D97706` (Amber-600) | `#FBBF24` (Amber-400) | Peringatan sisa pagu tipis (<20%), reminder tagihan H-3. |
| **Expense / Danger** | `#DC2626` (Rose-600) | `#F87171` (Rose-400) | Pengeluaran, kantong defisit/overbudget, aksi hapus permanen. |
| **Border & Divider** | `#E2E8F0` / `#E4E4E7` | `#1E293B` / `#30363D` | Garis tepi 1px presisi tinggi. |

### B. Typography Scale
* **Display / Headline:** `Space Grotesk` (700/800, `tracking-tight`).
* **Body / UI Labels:** `Plus Jakarta Sans` (400/500/600/700).
* **Currency, Time & Quantities:** `JetBrains Mono` (`font-mono tabular-nums`).

### C. Radius & Depth Scale
* **Outer Cards:** `rounded-2xl` (16px) atau `rounded-3xl` (24px).
* **Inner Elements (Buttons, Inputs, Badges):** `rounded-xl` (12px) atau `rounded-lg` (8px).
* **Shadow:** `shadow-saweria-xs` (1px 1px) hingga `shadow-saweria` (2.5px 2.5px) dengan border kontras.

---

## 4. Screen Inventory (10 Layar Inti Pockito)
1. **Welcome / Onboarding (`/welcome`):** Edukasi konsep kantong cerdas 5-slide dengan visual 3D WebP ultra-ringan (<240KB) dan zero-clipping layout.
2. **Dashboard (`/app/dashboard`):** Ringkasan Saldo Riil, 8 shortcut Bento, kartu donat alokasi, status guardrail batas belanja harian, dan transaksi terkini.
3. **Alokasi Kantong (`/app/budget`):** Pengaturan persentase gaji 100%, sistem gembok kantong anti-impulsif, dan auto-balance slider.
4. **Pencatatan Transaksi (`/app/transactions`):** Feed transaksi dengan filter kantong, pencarian real-time, 4-row skeleton shimmer, dan empty state ilustratif.
5. **Target Tabungan (`/app/goals`):** Progres tabungan impian dengan circular progress bar, fitur setor tabungan, dan animasi selebrasi confetti saat target lunas.
6. **Buku Hutang-Piutang (`/app/debts`):** Manajemen talangan uang sosial (Piutang) dan kewajiban cicilan (Hutang) dengan status pelunasan.
7. **Jadwal Tagihan Rutin (`/app/subscriptions`):** Pelacak denda tagihan bulanan (kos, wifi, listrik, air) dengan checklist bayar per periode.
8. **Agenda & To-Do Harian (`/app/planner`):** Manajemen task harian dan estimasi belanja pokok terintegrasi kantong.
9. **Laporan & Evaluasi (`/app/reports`):** Grafik batang pemasukan vs pengeluaran, donat varians rencana vs realisasi, dan cetak slip bulanan (@media print).
10. **Pengaturan & Keamanan (`/app/settings`):** Manajemen profil, switch 5 tema (Teal-Mint, Saweria, Midnight, dsb), ekspor/impor JSON, dan reset data.

---

## 5. Critical User Flow
```
[Buka Aplikasi] 
   └── Baru? ──> [Welcome Tour (WebP 5-Slide)] ──> [Demo Mode Rp 15 Juta / Register Supabase]
   └── Sudah Ada Akun? ──> [Login] ──> [Dashboard Saldo Riil]
                                           ├── [Catat Pemasukan Gaji Bulanan]
                                           ├── [Kunci & Seimbangkan Kantong 100%]
                                           ├── [Catat Pengeluaran Harian ke Kantong]
                                           ├── [Pantau Batas Belanja Harian (Safe Limit)]
                                           └── [Setor Tabungan Impian & Centang Tagihan Bebas Denda]
```

---

## 6. Layout Hierarchy per Screen (Bento Grid Modular)
* **Mobile (360px – 430px):** Single-column stacked stream, sticky bottom navigation dengan 44px touch targets, quick-action float bar pada halaman Budget.
* **Tablet (768px – 1024px):** 2-column asymmetric Bento Grid, visual charts berdampingan dengan daftar breakdown.
* **Desktop (1280px+):** 3-column Bento Matrix dengan sidebar navigasi tetap dan panel metrik terintegrasi.

---

## 7. Component Library & Variants
* **Button:** `primary` (Teal-700 / Zinc-900), `secondary` (White/Zinc border), `danger` (Rose-600), `ghost`.
* **Badge:** Micro-chips dengan status dot (Emerald untuk lunas, Amber untuk pending, Rose untuk defisit).
* **Card:** Surface ber-border 1px (`variant="saweria"` / `variant="flat"`), mendukung light/dark mode.
* **Modal Dialog:** Centered backdrop blur (`backdrop-blur-md bg-black/40`), keyboard ESC dismiss, focus trap.

---

## 8. Mandatory Interactive States (4 Core UI States)
1. **Loading State:** Shimmer skeleton berdenyut (bukan spinner kaku) yang merefleksikan bentuk kartu/tabel sebenarnya.
2. **Rich Empty State (3-Layer):**
   - Layer 1: Ilustrasi SVG tematik mengambang dengan aksen lembut.
   - Layer 2: Copywriting hangat, ramah, dan solutif.
   - Layer 3: Tombol CTA interaktif ("+ Buat Catatan Pertama").
3. **Error State:** Humanized Indonesian error message, rekomendasi perbaikan, serta tombol darurat *"Mode Offline"*.
4. **Success State:** Toast notification transien (3 detik) dengan haptic feedback dan selebrasi confetti untuk pencapaian target.

---

## 9. Responsive Behaviour Matrix
| Breakpoint | Target Layar | Perilaku Layout |
| :--- | :--- | :--- |
| **Mobile (`<640px`)** | iPhone SE, iPhone 15, Android FHD | 1 Kolom, sticky bottom nav 64px, scroll vertikal bebas hambatan. |
| **Tablet (`640px - 1024px`)** | iPad, Galaxy Tab | 2 Kolom Bento Grid, chart di samping metrik ringkas. |
| **Desktop (`>1024px`)** | Laptop 13"-16", Layar Lebar | Max-width 7xl (1280px), header terpadu, 3 kolom metrik. |

---

## 10. Accessibility (A11y) & Production Compliance
* Rasio kontras teks terhadap background wajib memenuhi standar **WCAG AA (minimal 4.5:1)**.
* Semua tombol aksi berikon memiliki atribut `aria-label` eksplisit.
* Target sentuh tombol dan link navigasi memenuhi ukuran standar minimal **44x44px**.
* Dukungan penuh navigasi keyboard (`Tab`, `Shift+Tab`, `Enter`, `Escape`).

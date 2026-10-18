import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Trash2, Eye, Server, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark selection:bg-brand-primary selection:text-brand-dark">
      {/* Header */}
      <header className="border-b-2 border-brand-dark bg-white px-6 sm:px-12 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/pockito.jpg"
            alt="Pockito"
            className="w-10 h-10 rounded-xl object-contain bg-white border-2 border-brand-dark shadow-saweria-sm"
          />
          <span className="text-xl font-black text-brand-dark tracking-tight">
            Pockito<span className="text-brand-primary">.</span>
          </span>
        </Link>

        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Kembali
          </Button>
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 sm:py-14 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-brand-dark shadow-saweria space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-600 text-emerald-800 text-xs font-black">
            <Shield className="w-3.5 h-3.5" />
            <span>Kepatuhan Google Play Store & Privasi Pengguna</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted">
            Terakhir diperbarui: 18 Oktober 2026. Kebijakan ini menjelaskan bagaimana Pockito mengelola, menyimpan, dan melindungi informasi Anda.
          </p>
        </div>

        {/* Section 1: Data Collection */}
        <Card variant="saweria" className="bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/20 border border-brand-dark text-brand-dark">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-brand-dark">1. Data yang Kami Kumpulkan</h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-darkMuted leading-relaxed">
            Pockito adalah aplikasi pencatatan keuangan pribadi dan produktivitas. Kami hanya memproses data yang Anda masukkan secara sukarela untuk mendukung fungsionalitas aplikasi:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-brand-darkMuted space-y-1.5 pl-2">
            <li><strong>Informasi Akun:</strong> Nama lengkap dan alamat email yang Anda gunakan saat mendaftar.</li>
            <li><strong>Data Finansial:</strong> Estimasi pendapatan bulanan, nama kantong anggaran, target tabungan, dan catatan transaksi pengeluaran/pemasukan yang Anda input sendiri.</li>
            <li><strong>Data Produktivitas:</strong> Daftar tugas harian, tanggal jatuh tempo, dan preferensi pengingat.</li>
            <li><strong>Tidak Mengakses Rekening Bank:</strong> Pockito tidak pernah meminta kredensial perbankan, PIN, kata sandi ATM, atau nomor kartu kredit/debit Anda.</li>
          </ul>
        </Card>

        {/* Section 2: Storage & Security */}
        <Card variant="saweria" className="bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 border border-brand-dark text-blue-700">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-brand-dark">2. Penyimpanan & Keamanan Data</h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-darkMuted leading-relaxed">
            Keamanan dan integritas data Anda adalah prioritas utama kami:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-brand-darkMuted space-y-1.5 pl-2">
            <li><strong>Mode Lokal (On-Device):</strong> Secara default, seluruh data keuangan Anda disimpan langsung di memori perangkat lokal Anda menggunakan enkripsi penyimpanan peramban (localStorage).</li>
            <li><strong>Mode Sinkronisasi Awan (Cloud Sync):</strong> Jika Anda menghubungkan akun dengan cloud backend (Supabase), seluruh transmisi data diamankan dengan enkripsi SSL/HTTPS serta dilindungi kebijakan Row Level Security (RLS) di mana hanya Anda yang dapat membaca dan memodifikasi data Anda.</li>
            <li><strong>Nol Penjualan Data:</strong> Kami tidak pernah menjual, menyewakan, atau membagikan data keuangan Anda kepada pihak ketiga, agen pemasaran, atau jaringan periklanan mana pun.</li>
          </ul>
        </Card>

        {/* Section 3: Data Deletion Policy */}
        <Card variant="saweria" className="bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 border border-brand-dark text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-brand-dark">3. Hak Pengguna & Penghapusan Akun/Data</h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-darkMuted leading-relaxed">
            Sesuai dengan ketentuan perlindungan data dan kebijakan Google Play Store, Anda memiliki kendali penuh atas data Anda:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-brand-darkMuted space-y-1.5 pl-2">
            <li><strong>Penghapusan Langsung di Aplikasi:</strong> Anda dapat menghapus seluruh transaksi, kantong anggaran, serta akun Anda kapan saja melalui menu <em>Pengaturan Akun &rarr; Hapus Akun & Seluruh Data</em>.</li>
            <li><strong>Hasil Penghapusan:</strong> Seluruh data di perangkat dan di server (jika tersambung) akan dihapus secara permanen dan tidak dapat dipulihkan kembali.</li>
          </ul>
        </Card>

        {/* Section 4: Device Permissions */}
        <Card variant="saweria" className="bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 border border-brand-dark text-amber-700">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-brand-dark">4. Izin Perangkat (Permissions)</h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-darkMuted leading-relaxed">
            Aplikasi Pockito hanya meminta izin yang mutlak diperlukan untuk fitur intinya:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-brand-darkMuted space-y-1.5 pl-2">
            <li><strong>Notifikasi (Notification):</strong> Digunakan untuk menampilkan pengingat tagihan atau tugas terjadwal yang Anda atur. Anda dapat menonaktifkan izin ini kapan saja di pengaturan Android.</li>
            <li>Pockito <strong>tidak</strong> meminta izin lokasi, kontak, mikrofon, atau kamera.</li>
          </ul>
        </Card>

        {/* Section 5: Contact */}
        <Card variant="saweria" className="bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 border border-brand-dark text-purple-700">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-brand-dark">5. Hubungi Pengembang</h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-darkMuted leading-relaxed">
            Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau pengelolaan data di Pockito, Anda dapat menghubungi kami melalui:
          </p>
          <p className="text-xs sm:text-sm font-bold text-brand-dark">
            Email: <span className="font-mono text-brand-primary">support@pockito.app</span>
          </p>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t-2 border-brand-dark bg-white px-6 py-6 text-center text-xs font-bold text-brand-darkMuted">
        <p>© 2026 Pockito — Workspace Keuangan & Produktivitas Pribadi.</p>
      </footer>
    </div>
  );
};

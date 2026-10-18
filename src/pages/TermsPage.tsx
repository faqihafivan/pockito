import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const TermsPage: React.FC = () => {
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 sm:py-14 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-brand-dark shadow-saweria space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 border border-brand-dark text-brand-dark text-xs font-black">
            <FileText className="w-3.5 h-3.5" />
            <span>Ketentuan Penggunaan Aplikasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            Syarat & Ketentuan Layanan (Terms of Service)
          </h1>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted">
            Dengan menggunakan Pockito, Anda menyetujui ketentuan berikut ini.
          </p>
        </div>

        <Card variant="saweria" className="bg-white space-y-3">
          <h2 className="text-lg font-black text-brand-dark">1. Tujuan Penggunaan</h2>
          <p className="text-xs sm:text-sm text-brand-darkMuted leading-relaxed">
            Pockito disediakan sebagai alat bantu perencanaan, penganggaran kantong, dan produktivitas pribadi. Pockito bukan merupakan lembaga keuangan, perbankan, penasihat investasi, ataupun perantara transaksi uang resmi.
          </p>
        </Card>

        <Card variant="saweria" className="bg-white space-y-3">
          <h2 className="text-lg font-black text-brand-dark">2. Tanggung Jawab Pengguna</h2>
          <p className="text-xs sm:text-sm text-brand-darkMuted leading-relaxed">
            Pengguna bertanggung jawab penuh atas keakuratan data yang dimasukkan ke dalam aplikasi, serta menjaga keamanan perangkat dari akses yang tidak berwenang.
          </p>
        </Card>

        <Card variant="saweria" className="bg-white space-y-3">
          <h2 className="text-lg font-black text-brand-dark">3. Batasan Tanggung Jawab</h2>
          <p className="text-xs sm:text-sm text-brand-darkMuted leading-relaxed">
            Seluruh kalkulasi anggaran dan rekomendasi disajikan berdasarkan formula matematis keuangan standar. Kami tidak bertanggung jawab atas keputusan finansial independen yang diambil oleh pengguna.
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

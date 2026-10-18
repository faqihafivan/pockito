import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  Wallet,
  CheckSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col selection:bg-brand-primary selection:text-brand-dark">
      {/* Top Navbar */}
      <header className="border-b-2 border-brand-dark bg-white px-6 sm:px-12 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img
            src="/pockito.png"
            alt="Pockito"
            className="w-10 h-10 rounded-xl object-contain bg-white border-2 border-brand-dark shadow-saweria-sm"
          />
          <span className="text-xl font-black text-brand-dark tracking-tight">
            Pockito<span className="text-brand-primary">.</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Daftar Gratis
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 sm:px-12 py-12 sm:py-20 max-w-5xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <img
            src="/pockito.png"
            alt="Pockito Mascot"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-contain bg-white border-2 border-brand-dark shadow-saweria-lg animate-bounce duration-1000"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-primary/20 border-2 border-brand-dark text-xs font-black text-brand-dark shadow-saweria-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
          <span>One Workspace for Your Money & Your Life</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-brand-dark tracking-tight leading-[1.1]">
          Kelola Uang & Hari-Harimu <br />
          <span className="bg-brand-primary px-3 py-1 rounded-2xl border-2 border-brand-dark inline-block shadow-saweria mt-2">
            Tanpa Ribet Akuntansi.
          </span>
        </h1>

        <p className="text-base sm:text-xl font-medium text-brand-darkMuted max-w-2xl mx-auto leading-relaxed">
          Pockito membagi gajimu ke dalam kantong-kantong cerdas, mencatat pengeluaran riil, serta menyinkronkan tugas dan tagihan harian dalam satu interface ceria khas Saweria.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Mulai Pakai Pockito Sekarang
            </Button>
          </Link>
          <Link to="/app/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Coba Mode Demo Langsung
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="px-6 sm:px-12 py-12 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="saweria" className="bg-white space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF7A59]/20 border-2 border-brand-dark shadow-saweria-sm flex items-center justify-center text-[#D94824]">
            <Wallet className="w-6 h-6 stroke-[2.3]" />
          </div>
          <h3 className="text-lg font-black text-brand-dark">Kantong Cerdas (Pockets)</h3>
          <p className="text-xs text-brand-darkMuted leading-relaxed">
            Alokasikan gajimu dengan persentase fleksibel. Pockito otomatis menghitung nominal Rupiah bulat tanpa selisih pembulatan.
          </p>
        </Card>

        <Card variant="saweria" className="bg-white space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/25 border-2 border-brand-dark shadow-saweria-sm flex items-center justify-center text-brand-dark">
            <CheckSquare className="w-6 h-6 stroke-[2.3]" />
          </div>
          <h3 className="text-lg font-black text-brand-dark">Planner & Tagihan Harian</h3>
          <p className="text-xs text-brand-darkMuted leading-relaxed">
            Satukan to-do harian dengan jadwal bayar listrik, wifi, dan tabungan agar kamu tidak pernah terkena denda keterlambatan lagi.
          </p>
        </Card>

        <Card variant="saweria" className="bg-white space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 border-2 border-brand-dark shadow-saweria-sm flex items-center justify-center text-[#047857]">
            <ShieldCheck className="w-6 h-6 stroke-[2.3]" />
          </div>
          <h3 className="text-lg font-black text-brand-dark">Integritas Finansial Ketat</h3>
          <p className="text-xs text-brand-darkMuted leading-relaxed">
            Saldo kas riil dipisahkan secara tegas dari batas pagu anggaran. Nol perhitungan floating-point, aman terlindungi Row Level Security.
          </p>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-brand-dark bg-white px-6 py-8 text-center text-xs font-bold text-brand-darkMuted">
        <p>© 2026 Pockito — Personal Finance & Productivity Workspace. Dibuat dengan cinta untuk generasi produktif Indonesia.</p>
      </footer>
    </div>
  );
};

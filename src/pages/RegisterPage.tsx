import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Wallet, Sparkles, PieChart } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Nama lengkap wajib diisi');
      return;
    }
    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await register(fullName.trim(), email.trim(), password);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate('/app/onboarding', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-slate-900 text-brand-dark dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto my-auto">
        <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-center">
          {/* Kolom Kiri: Tablet Visual & Maskot Banner (Tampil di md ke atas) */}
          <div className="hidden md:flex md:col-span-6 lg:col-span-6 flex-col justify-between space-y-6">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <img
                  src="/pockito.png"
                  alt="Pockito"
                  className="w-11 h-11 rounded-2xl object-contain bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm dark:shadow-none"
                />
                <span className="text-2xl font-black text-brand-dark dark:text-slate-100 tracking-tight">
                  Pockito<span className="text-brand-primary">.</span>
                </span>
                <span className="ml-2 text-[10px] font-black uppercase tracking-wider bg-brand-primary/20 dark:bg-brand-primary/10 px-2.5 py-1 rounded-full border border-brand-dark dark:border-slate-700 text-brand-dark dark:text-slate-200">
                  Pendaftaran Cepat
                </span>
              </Link>
            </div>

            {/* Maskot Box dengan Speech Bubble */}
            <div className="bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 rounded-3xl p-6 shadow-saweria-lg dark:shadow-[4px_4px_0px_#0f172a] relative">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-cream dark:bg-slate-900 border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center shrink-0 shadow-saweria-sm dark:shadow-none overflow-hidden p-1">
                  <img
                    src="/pockito.png"
                    alt="Pockito Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <div className="inline-block bg-brand-primary px-2 py-0.5 rounded-md border border-brand-dark dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-brand-dark">
                    Ajakan Pockito
                  </div>
                  <h3 className="text-base font-black text-brand-dark dark:text-slate-100 leading-snug">
                    "Mulai langkah cerdasmu sekarang! 🚀"
                  </h3>
                  <p className="text-xs text-brand-darkMuted dark:text-slate-400 font-medium leading-relaxed">
                    Atur pos gajian tanpa pusing rumus akuntansi, kumpulkan tabungan impian, dan satukan to-do list harianmu dalam 1 workspace ceria.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Value Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 border-2 border-brand-dark dark:border-slate-700 p-3 rounded-2xl shadow-saweria-sm dark:shadow-none">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/30 dark:bg-brand-primary/20 border border-brand-dark dark:border-slate-700 flex items-center justify-center text-brand-dark dark:text-brand-primary shrink-0">
                  <Wallet className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-brand-dark dark:text-slate-100">Bagi Kantong Bebas Sesuai Gaya Hidup</h4>
                  <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 font-medium">Bikin kantong Makanan, Kos, Tabungan, atau Healing sesukamu.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 border-2 border-brand-dark dark:border-slate-700 p-3 rounded-2xl shadow-saweria-sm dark:shadow-none">
                <div className="w-8 h-8 rounded-xl bg-[#C9D9C5] dark:bg-emerald-950/40 border border-brand-dark dark:border-slate-700 flex items-center justify-center text-brand-dark dark:text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-brand-dark dark:text-slate-100">Rekomendasi Alokasi Otomatis</h4>
                  <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 font-medium">Mulai dari template alokasi cerdas yang bisa kamu ubah kapan saja.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 border-2 border-brand-dark dark:border-slate-700 p-3 rounded-2xl shadow-saweria-sm dark:shadow-none">
                <div className="w-8 h-8 rounded-xl bg-[#DCD1F0] dark:bg-indigo-950/40 border border-brand-dark dark:border-slate-700 flex items-center justify-center text-brand-dark dark:text-indigo-400 shrink-0">
                  <PieChart className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-brand-dark dark:text-slate-100">Visual Donut & Laporan Real-Time</h4>
                  <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 font-medium">Pantau arus kas masuk vs keluar dengan grafik warna-warni yang jelas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Formulir Registrasi */}
          <div className="md:col-span-6 lg:col-span-6 w-full max-w-md mx-auto space-y-6">
            {/* Header di Mobile (hidden di md:) */}
            <div className="md:hidden text-center space-y-2">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <img
                  src="/pockito.png"
                  alt="Pockito"
                  className="w-12 h-12 rounded-2xl object-contain bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 shadow-saweria dark:shadow-none"
                />
                <span className="text-2xl font-black text-brand-dark dark:text-slate-100 tracking-tight">
                  Pockito<span className="text-brand-primary">.</span>
                </span>
              </Link>
              <h2 className="text-xl font-black text-brand-dark dark:text-slate-100">Mulai Perjalanan Finansialmu</h2>
              <p className="text-xs font-bold text-brand-darkMuted dark:text-slate-400">
                Daftar gratis dalam 30 detik dan atur kantong masa depanmu
              </p>
            </div>

            {/* Header di Tablet/Desktop */}
            <div className="hidden md:block space-y-1">
              <h2 className="text-2xl font-black text-brand-dark dark:text-slate-100 tracking-tight">Buat Akun Pockito Baru</h2>
              <p className="text-xs font-bold text-brand-darkMuted dark:text-slate-400">
                Gratis selamanya, tanpa perlu kartu kredit atau komitmen rumit.
              </p>
            </div>

            <Card variant="saweria" className="bg-white dark:bg-slate-800 dark:border-slate-700">
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  label="Nama Lengkap / Panggilan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                />

                <Input
                  label="Alamat Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                />

                <Input
                  label="Kata Sandi (Minimal 6 Karakter)"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/50 border-2 border-red-500 rounded-xl text-xs font-bold text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Lanjut ke Setup Awal
                </Button>
              </form>
            </Card>

            <p className="text-center text-xs font-bold text-brand-darkMuted dark:text-slate-400">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-brand-dark dark:text-brand-primary underline font-black hover:text-brand-primaryHover">
                Masuk di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

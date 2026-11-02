import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, Coins, Coffee } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, enterDemoMode } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await login(email.trim(), password);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    await enterDemoMode();
    setIsLoading(false);
    navigate('/app/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-slate-900 text-brand-dark dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto my-auto">
        <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-center">
          {/* Kolom Kiri: Tablet Visual & Maskot Banner (Tampil di md ke atas) */}
          <div className="hidden md:flex md:col-span-6 lg:col-span-6 flex-col justify-between space-y-6">
            {/* Logo Brand */}
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
                  Fintech Workspace
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
                    Pockito Menyapa
                  </div>
                  <h3 className="text-base font-black text-brand-dark dark:text-slate-100 leading-snug">
                    "Hai lagi, sahabat cuan! 👋"
                  </h3>
                  <p className="text-xs text-brand-darkMuted dark:text-slate-400 font-medium leading-relaxed">
                    Mau catat kopi hari ini atau cek pos tabungan impianmu? Masuk dulu yuk, brankas kantongmu sudah siap!
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Value Badges Keunggulan */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 border-2 border-brand-dark dark:border-slate-700 p-3 rounded-2xl shadow-saweria-sm dark:shadow-none">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/30 dark:bg-brand-primary/20 border border-brand-dark dark:border-slate-700 flex items-center justify-center text-brand-dark dark:text-brand-primary shrink-0">
                  <Coins className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-brand-dark dark:text-slate-100">Perhitungan Rupiah 100% Presisi</h4>
                  <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 font-medium">Rumus alokasi bulat tanpa selisih floating point senilai Rp 1 pun.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 border-2 border-brand-dark dark:border-slate-700 p-3 rounded-2xl shadow-saweria-sm dark:shadow-none">
                <div className="w-8 h-8 rounded-xl bg-[#C9D9C5] dark:bg-emerald-950/40 border border-brand-dark dark:border-slate-700 flex items-center justify-center text-brand-dark dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-brand-dark dark:text-slate-100">Privasi Aman & Terlindungi</h4>
                  <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 font-medium">Data keuangan tersimpan aman dengan PostgreSQL Row Level Security.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 border-2 border-brand-dark dark:border-slate-700 p-3 rounded-2xl shadow-saweria-sm dark:shadow-none">
                <div className="w-8 h-8 rounded-xl bg-[#DCD1F0] dark:bg-indigo-950/40 border border-brand-dark dark:border-slate-700 flex items-center justify-center text-brand-dark dark:text-indigo-400 shrink-0">
                  <Coffee className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-brand-dark dark:text-slate-100">Bebas Pusing Akhir Bulan</h4>
                  <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 font-medium">Sinkronisasi tagihan kost, wifi, serta to-do list harian dalam satu layar.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Formulir Login */}
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
              <h2 className="text-xl font-black text-brand-dark dark:text-slate-100">Selamat Datang Kembali!</h2>
              <p className="text-xs font-bold text-brand-darkMuted dark:text-slate-400">
                Masuk untuk mengakses workspace keuangan dan produktivitas Anda
              </p>
            </div>

            {/* Header di Tablet/Desktop */}
            <div className="hidden md:block space-y-1">
              <h2 className="text-2xl font-black text-brand-dark dark:text-slate-100 tracking-tight">Masuk ke Akun Anda</h2>
              <p className="text-xs font-bold text-brand-darkMuted dark:text-slate-400">
                Kelola kantong keuangan dan jadwal harianmu dengan nyaman.
              </p>
            </div>

            {/* Login Card */}
            <Card variant="saweria" className="bg-white dark:bg-slate-800 dark:border-slate-700">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Alamat Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                />

                <Input
                  label="Kata Sandi (Password)"
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
                  Masuk ke Akun
                </Button>
              </form>

              {/* Quick Demo Bypass */}
              <div className="mt-5 pt-5 border-t-2 border-dashed border-brand-border dark:border-slate-700 text-center space-y-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleQuickDemo}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-primary" />}
                >
                  Masuk Mode Demo Langsung (Tanpa Password)
                </Button>
                <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 font-medium">
                  Mode demo menggunakan data simulasi lokal di browsermu
                </p>
              </div>
            </Card>

            {/* Footer links */}
            <div className="text-center text-xs font-bold text-brand-darkMuted dark:text-slate-400 space-y-1">
              <p>
                Belum punya akun?{' '}
                <Link to="/register" className="text-brand-dark dark:text-brand-primary underline font-black hover:text-brand-primaryHover">
                  Daftar Sekarang Gratis
                </Link>
              </p>
              <p>
                <Link to="/forgot-password" className="text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200 underline">
                  Lupa kata sandi?
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

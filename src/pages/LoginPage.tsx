import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

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
    await login('faqih@pockito.app');
    setIsLoading(false);
    navigate('/app/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img
              src="/pockito.png"
              alt="Pockito"
              className="w-12 h-12 rounded-2xl object-contain bg-white border-2 border-brand-dark shadow-saweria"
            />
            <span className="text-2xl font-black text-brand-dark tracking-tight">
              Pockito<span className="text-brand-primary">.</span>
            </span>
          </Link>
          <h2 className="text-xl font-black text-brand-dark">Selamat Datang Kembali!</h2>
          <p className="text-xs font-bold text-brand-darkMuted">
            Masuk untuk mengakses workspace keuangan dan produktivitas Anda
          </p>
        </div>

        {/* Login Card */}
        <Card variant="saweria" className="bg-white">
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
              <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-xs font-bold text-red-600">
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
          <div className="mt-5 pt-5 border-t-2 border-dashed border-brand-border text-center space-y-3">
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
            <p className="text-[11px] text-brand-darkMuted font-medium">
              Mode demo menggunakan data simulasi lokal di browsermu
            </p>
          </div>
        </Card>

        {/* Footer links */}
        <div className="text-center text-xs font-bold text-brand-darkMuted space-y-1">
          <p>
            Belum punya akun?{' '}
            <Link to="/register" className="text-brand-dark underline font-black hover:text-brand-primaryHover">
              Daftar Sekarang Gratis
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="text-brand-darkMuted hover:text-brand-dark underline">
              Lupa kata sandi?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

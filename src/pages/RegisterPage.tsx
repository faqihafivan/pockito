import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-brand-cream flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img
              src="/pockito.jpg"
              alt="Pockito"
              className="w-12 h-12 rounded-2xl object-contain bg-white border-2 border-brand-dark shadow-saweria"
            />
            <span className="text-2xl font-black text-brand-dark tracking-tight">
              Pockito<span className="text-brand-primary">.</span>
            </span>
          </Link>
          <h2 className="text-xl font-black text-brand-dark">Mulai Perjalanan Finansialmu</h2>
          <p className="text-xs font-bold text-brand-darkMuted">
            Daftar gratis dalam 30 detik dan atur kantong masa depanmu
          </p>
        </div>

        <Card variant="saweria" className="bg-white">
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
              Lanjut ke Setup Awal
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs font-bold text-brand-darkMuted">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-brand-dark underline font-black hover:text-brand-primaryHover">
            Masuk di Sini
          </Link>
        </p>
      </div>
    </div>
  );
};

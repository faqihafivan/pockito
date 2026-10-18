import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
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
          <h2 className="text-xl font-black text-brand-dark">Pemulihan Kata Sandi</h2>
          <p className="text-xs font-bold text-brand-darkMuted">
            Kami akan mengirimkan tautan reset kata sandi ke email Anda
          </p>
        </div>

        <Card variant="saweria" className="bg-white">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-600 text-green-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-brand-dark">Tautan Terkirim!</h3>
              <p className="text-xs text-brand-darkMuted leading-relaxed">
                Silakan periksa kotak masuk email <strong>{email}</strong> untuk mengatur ulang kata sandi Anda.
              </p>
              <div className="pt-3">
                <Link to="/login">
                  <Button variant="primary" size="md" className="w-full">
                    Kembali ke Halaman Masuk
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Alamat Email Terdaftar"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Kirim Tautan Pemulihan
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs font-bold text-brand-darkMuted">
          <Link to="/login" className="inline-flex items-center gap-1.5 hover:text-brand-dark">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

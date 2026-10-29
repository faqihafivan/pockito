import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, CheckCircle2, Smartphone, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface PWAInstallButtonProps {
  variant?: 'button' | 'card' | 'badge';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (isInstallable) {
      await installApp();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General prompt guidance
      setShowIOSModal(true);
    }
  };

  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Aplikasi Terpasang</span>
        </span>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'card' ? (
        <div className={`p-4 rounded-3xl bg-brand-cream border-2 border-brand-dark shadow-saweria-sm space-y-3 ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-sm">
              <Smartphone className="w-5 h-5 text-brand-dark" />
            </div>
            <div>
              <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider">
                Pasang di Layar Utama HP
              </h4>
              <p className="text-[11px] font-bold text-brand-darkMuted">
                Akses cepat, tanpa url browser & bisa offline
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleInstallClick}
            className="w-full text-xs font-black"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Install Pockito ke HP
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border-2 border-brand-dark bg-brand-primary text-brand-dark shadow-saweria-sm hover:bg-brand-primaryDark active:translate-x-0.5 active:translate-y-0.5 transition-all ${className}`}
          title="Pasang Pockito di Layar Utama HP"
        >
          <Smartphone className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Pasang di HP</span>
        </button>
      )}

      {/* iOS or Browser Manual Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-brand-dark shadow-saweria p-5 max-w-sm w-full space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg border border-brand-dark hover:bg-brand-cream"
            >
              <X className="w-4 h-4 text-brand-dark" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 border-2 border-brand-dark flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-brand-dark" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-dark">
                  Cara Pasang ke Layar Utama
                </h4>
                <p className="text-[11px] text-brand-darkMuted font-bold">
                  Buka Pockito layaknya aplikasi native
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-cream border-2 border-brand-dark space-y-2 text-xs font-bold text-brand-dark">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  {isIOS
                    ? 'Ketuk tombol Bagikan / Share (ikon kotak panah ke atas di Safari bawah).'
                    : 'Buka menu browser (titik 3 di kanan atas).'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> (Add to Home Screen).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Pockito akan muncul di halaman depan HP kamu dengan ikon aplikasi resmi!
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowIOSModal(false)}
              className="w-full font-black text-xs"
            >
              Mengerti
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

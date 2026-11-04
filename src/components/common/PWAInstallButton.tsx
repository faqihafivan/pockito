import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, CheckCircle2, Smartphone, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface PWAInstallButtonProps {
  variant?: 'button' | 'card' | 'badge';
  className?: string;
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
  label,
}) => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(() => (isIOS ? 'ios' : 'android'));

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (isInstallable) {
      const installed = await installApp();
      if (!installed) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Aplikasi Terpasang</span>
        </span>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'card' ? (
        <div className={`p-4 rounded-3xl bg-brand-cream dark:bg-slate-800/80 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm space-y-3 ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center shrink-0 shadow-saweria-sm">
              <Smartphone className="w-5 h-5 text-brand-dark" />
            </div>
            <div>
              <h4 className="text-xs font-black text-brand-dark dark:text-slate-100 uppercase tracking-wider">
                Download / Pasang di HP
              </h4>
              <p className="text-[11px] font-bold text-brand-darkMuted dark:text-slate-400">
                Support Android & iPhone (iOS) — Buka cepat tanpa browser
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
            {label || 'Download & Pasang Pockito (Android / iOS)'}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black border-2 border-brand-dark dark:border-slate-700 bg-brand-primary hover:bg-brand-primaryDark text-brand-dark shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${className}`}
          title="Pasang Pockito di Layar Utama HP (Android & iOS)"
          aria-label="Download Aplikasi Pockito"
        >
          <Download className="w-4 h-4 stroke-[2.4] shrink-0" />
          <span className="hidden xs:inline">{label || 'Pasang di HP'}</span>
        </button>
      )}

      {/* Android & iOS Install Guide Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-3 border-brand-dark dark:border-slate-700 shadow-saweria-lg p-5 max-w-sm w-full space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl border border-brand-dark dark:border-slate-700 hover:bg-brand-cream dark:hover:bg-slate-800 text-brand-dark dark:text-slate-200"
              title="Tutup panduan"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 dark:bg-brand-primary/10 border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-brand-dark dark:text-brand-primary" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-dark dark:text-slate-100">
                  Pasang Pockito ke HP
                </h4>
                <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 font-bold">
                  Buka langsung dari layar utama tanpa ketik alamat web
                </p>
              </div>
            </div>

            {/* Platform Switcher Tab: Android vs iPhone (iOS) */}
            <div className="flex rounded-xl bg-brand-cream dark:bg-slate-800 p-1 border-2 border-brand-dark dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-brand-primary text-brand-dark shadow-saweria-sm'
                    : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200'
                }`}
              >
                <span>🤖 Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ios'
                    ? 'bg-brand-primary text-brand-dark shadow-saweria-sm'
                    : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200'
                }`}
              >
                <span>🍎 iPhone (iOS)</span>
              </button>
            </div>

            {/* Android Instructions */}
            {activeTab === 'android' && (
              <div className="p-3.5 rounded-2xl bg-brand-cream dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 space-y-2.5 text-xs font-bold text-brand-dark dark:text-slate-200">
                {isInstallable && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      const res = await installApp();
                      if (res) setShowModal(false);
                    }}
                    className="w-full mb-1 font-black"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Pasang Sekarang (1-Klik)
                  </Button>
                )}
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black text-brand-dark flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Buka menu browser Chrome / Edge (ketuk titik tiga <strong>⋮</strong> di kanan atas).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black text-brand-dark flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Pilih <strong>"Pasang aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black text-brand-dark flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Pockito otomatis terpasang dengan ikon resmi di menu aplikasi Android kamu!</span>
                </div>
              </div>
            )}

            {/* iOS / iPhone Instructions */}
            {activeTab === 'ios' && (
              <div className="p-3.5 rounded-2xl bg-brand-cream dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 space-y-2.5 text-xs font-bold text-brand-dark dark:text-slate-200">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black text-brand-dark flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Buka Pockito di browser <strong>Safari</strong> iPhone kamu.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black text-brand-dark flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Ketuk tombol <strong>Bagikan / Share</strong> (ikon kotak panah ke atas 📤 di navigasi bawah).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black text-brand-dark flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama"</strong> (Add to Home Screen ➕).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary border border-brand-dark text-[10px] font-black text-brand-dark flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <span>Ketuk <strong>"Tambah"</strong> di kanan atas. Pockito siap dibuka seperti aplikasi App Store!</span>
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowModal(false)}
              className="w-full font-black text-xs"
            >
              Siap, Mengerti! 👍
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

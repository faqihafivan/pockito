import React, { useState } from 'react';
import {
  Utensils,
  ShieldCheck,
  Zap,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

interface FloatingHeroVisualProps {
  className?: string;
}

export const FloatingHeroVisual: React.FC<FloatingHeroVisualProps> = ({ className = '' }) => {
  // Graceful fallback states: If user has placed PNG in /welcome/, use it; otherwise show pixel-perfect neobrutalist cards
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const handleImageError = (key: string) => {
    setImgError((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div
      className={`relative w-full max-w-lg mx-auto aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center select-none overflow-visible pointer-events-none ${className}`}
    >
      {/* Background Soft Glow Accents */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-teal-300/30 via-emerald-200/25 to-amber-200/20 dark:from-teal-900/30 dark:via-emerald-950/20 dark:to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* Watermark Branding Behind */}
      <span className="absolute text-5xl sm:text-7xl font-black text-brand-dark/5 dark:text-white/5 tracking-widest uppercase select-none pointer-events-none">
        POCKITO
      </span>

      {/* ============================================================
          1. KANTONG CERDAS (Smart Pocket Card) - Top Left, Tilted
          Slot Image: /welcome/pocket-card.png
          ============================================================ */}
      <div className="absolute -top-1 sm:top-2 left-1 sm:left-4 z-20 animate-float-1 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
        {!imgError['pocket-card'] ? (
          <img
            src="/welcome/pocket-card.png"
            alt="Kantong Cerdas Pockito"
            onError={() => handleImageError('pocket-card')}
            className="w-36 sm:w-48 h-auto object-contain drop-shadow-xl"
          />
        ) : null}

        {/* Fallback Live CSS Card if image not yet dropped */}
        {imgError['pocket-card'] && (
          <div className="w-36 sm:w-44 p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm space-y-1.5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-[9px] font-black text-amber-900 dark:text-amber-300 border border-amber-300/60">
                <Utensils className="w-2.5 h-2.5" />
                Makan & Ngopi
              </span>
              <span className="text-[9px] font-extrabold text-brand-darkMuted dark:text-slate-400">30%</span>
            </div>
            <div>
              <span className="text-[8px] font-bold text-brand-darkMuted dark:text-slate-400 block uppercase">
                Sisa Kantong
              </span>
              <div className="text-xs sm:text-sm font-black text-brand-dark dark:text-slate-100 tabular-nums">
                Rp 850.000
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden border border-brand-dark/20">
              <div className="w-[65%] h-full bg-brand-primary rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          2. JATAH BELANJA AMAN (Daily Safe Limit) - Top Right, Pill Badge
          Slot Image: /welcome/daily-limit.png
          ============================================================ */}
      <div className="absolute top-0 sm:top-3 right-1 sm:right-4 z-20 animate-float-2 transform rotate-3 hover:rotate-0 transition-transform duration-300">
        {!imgError['daily-limit'] ? (
          <img
            src="/welcome/daily-limit.png"
            alt="Jatah Belanja Aman Harian"
            onError={() => handleImageError('daily-limit')}
            className="w-36 sm:w-48 h-auto object-contain drop-shadow-xl"
          />
        ) : null}

        {/* Fallback Live CSS Pill */}
        {imgError['daily-limit'] && (
          <div className="p-2 sm:p-2.5 rounded-2xl bg-[#E2F5F0] dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-brand-primary border border-brand-dark flex items-center justify-center text-white shrink-0 shadow-saweria-xs">
              <ShieldCheck className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1">
                <span className="text-[8px] sm:text-[9px] font-bold text-brand-darkMuted dark:text-slate-400 uppercase leading-none">
                  Jatah Aman Hari Ini
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              </div>
              <div className="text-xs sm:text-sm font-black text-brand-dark dark:text-slate-100 tabular-nums leading-tight">
                Rp 125.000<span className="text-[9px] font-bold text-brand-darkMuted">/hr</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          3. TAGIHAN RUTIN BEBAS DENDA (Bill Guard) - Center Right, Ticket
          Slot Image: /welcome/bill-guard.png
          ============================================================ */}
      <div className="absolute top-1/2 -translate-y-4 right-0 sm:right-2 z-10 animate-float-3 transform rotate-2 hover:rotate-0 transition-transform duration-300">
        {!imgError['bill-guard'] ? (
          <img
            src="/welcome/bill-guard.png"
            alt="Tagihan Bebas Denda"
            onError={() => handleImageError('bill-guard')}
            className="w-32 sm:w-44 h-auto object-contain drop-shadow-xl"
          />
        ) : null}

        {/* Fallback Live CSS Ticket */}
        {imgError['bill-guard'] && (
          <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 border border-brand-dark flex items-center justify-center text-brand-dark shrink-0">
              <Zap className="w-3.5 h-3.5 fill-brand-dark" />
            </div>
            <div>
              <div className="text-[10px] font-black text-brand-dark dark:text-slate-100 leading-tight">
                Wifi & Listrik
              </div>
              <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Lunas Bebas Denda!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          4. TARGET TABUNGAN IMPIAN (Goal Progress Ring) - Bottom Left
          Slot Image: /welcome/goal-ring.png
          ============================================================ */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-6 z-20 animate-float-2 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
        {!imgError['goal-ring'] ? (
          <img
            src="/welcome/goal-ring.png"
            alt="Target Tabungan Impian"
            onError={() => handleImageError('goal-ring')}
            className="w-32 sm:w-44 h-auto object-contain drop-shadow-xl"
          />
        ) : null}

        {/* Fallback Live CSS Ring */}
        {imgError['goal-ring'] && (
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full border-2 border-brand-dark flex items-center justify-center bg-teal-50 dark:bg-teal-950/40 text-brand-primary shrink-0">
              <Laptop className="w-4 h-4 stroke-[2.2]" />
              <div className="absolute -bottom-1 -right-1 px-1 rounded bg-brand-primary text-white text-[7px] font-black border border-brand-dark">
                75%
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black text-brand-dark dark:text-slate-100 leading-tight">
                Laptop Baru 💻
              </div>
              <div className="text-[9px] font-bold text-brand-darkMuted dark:text-slate-400 tabular-nums">
                Rp 4,5jt / 6jt
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          5. KOIN EMAS & BINTANG SAWERIA - Floating Decorative Accents
          Slot Image: /welcome/coins-star.png
          ============================================================ */}
      <div className="absolute top-1/3 left-1/4 z-10 animate-float-1 pointer-events-none">
        {!imgError['coins-star'] ? (
          <img
            src="/welcome/coins-star.png"
            alt="Koin Emas Pockito"
            onError={() => handleImageError('coins-star')}
            className="w-16 sm:w-24 h-auto object-contain drop-shadow-md"
          />
        ) : null}

        {/* Fallback Floating Badge */}
        {imgError['coins-star'] && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-2 border-brand-dark shadow-saweria-xs flex items-center justify-center text-amber-950 font-black text-xs animate-bounce duration-1000">
            ⭐
          </div>
        )}
      </div>

      {/* Subtle Mini Floating Coin Bottom Right */}
      <div className="absolute bottom-6 right-1/4 z-10 animate-float-3 pointer-events-none">
        <div className="w-6 h-6 rounded-full bg-amber-400 border border-brand-dark shadow-saweria-xs flex items-center justify-center text-[10px] font-black text-amber-950">
          🪙
        </div>
      </div>
    </div>
  );
};

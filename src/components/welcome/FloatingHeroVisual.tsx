import React, { useState } from 'react';
import {
  Utensils,
  ShieldCheck,
  Zap,
  Laptop,
} from 'lucide-react';

interface FloatingHeroVisualProps {
  className?: string;
}

export const FloatingHeroVisual: React.FC<FloatingHeroVisualProps> = ({ className = '' }) => {
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const handleImageError = (key: string) => {
    setImgError((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div
      className={`relative w-full max-w-lg mx-auto aspect-[4/3.8] sm:aspect-[16/12] flex items-center justify-center select-none overflow-visible pointer-events-none ${className}`}
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-teal-200/40 via-emerald-100/35 to-amber-100/30 dark:from-teal-950/40 dark:via-slate-900/30 dark:to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* Watermark Brand Title Behind */}
      <span className="absolute top-1/2 -translate-y-1/2 text-5xl sm:text-7xl font-black text-brand-dark/[0.04] dark:text-white/[0.04] tracking-widest uppercase select-none pointer-events-none">
        POCKITO
      </span>

      {/* ============================================================
          1. KOIN EMAS & BINTANG MASKOT (Top-Left Accent)
          File: /welcome/coins-star.jpg
          ============================================================ */}
      <div className="absolute top-1 sm:top-2 left-2 sm:left-4 z-10 animate-float-2 transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
        {!imgError['coins-star'] ? (
          <img
            src="/welcome/coins-star.jpg"
            alt="Koin Emas 500 Rupiah & Bintang Pockito"
            onError={() => handleImageError('coins-star')}
            className="w-20 sm:w-28 md:w-32 h-auto object-contain mix-blend-multiply drop-shadow-md select-none"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-2 border-brand-dark shadow-saweria-xs flex items-center justify-center text-amber-950 font-black text-sm">
            ⭐
          </div>
        )}
      </div>

      {/* ============================================================
          2. KANTONG CERDAS MAKAN & NGOPI (Top-Right / Center Hero Card)
          File: /welcome/pocket-card.jpg
          ============================================================ */}
      <div className="absolute top-0 sm:top-2 right-2 sm:right-6 z-20 animate-float-1 transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300">
        {!imgError['pocket-card'] ? (
          <img
            src="/welcome/pocket-card.jpg"
            alt="Kartu Kantong Cerdas Makan & Ngopi"
            onError={() => handleImageError('pocket-card')}
            className="w-44 sm:w-56 md:w-64 h-auto object-contain mix-blend-multiply drop-shadow-2xl select-none"
          />
        ) : (
          <div className="w-40 sm:w-48 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-brand-dark shadow-saweria space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-[10px] font-black text-amber-900 border border-amber-300">
                <Utensils className="w-3 h-3" />
                Makan & Ngopi
              </span>
              <span className="text-[10px] font-extrabold text-brand-darkMuted">30%</span>
            </div>
            <div>
              <span className="text-[8px] font-bold text-brand-darkMuted uppercase">Sisa Kantong</span>
              <div className="text-sm font-black text-brand-dark">Rp 850.000</div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          3. TARGET TABUNGAN LAPTOP (Mid-Left Progress Ring)
          File: /welcome/goal-ring.jpg
          ============================================================ */}
      <div className="absolute top-[38%] left-1 sm:left-3 z-20 animate-float-3 transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
        {!imgError['goal-ring'] ? (
          <img
            src="/welcome/goal-ring.jpg"
            alt="Target Tabungan Laptop Baru"
            onError={() => handleImageError('goal-ring')}
            className="w-32 sm:w-40 md:w-44 h-auto object-contain mix-blend-multiply drop-shadow-xl select-none"
          />
        ) : (
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-brand-dark shadow-saweria flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-50 border border-brand-dark flex items-center justify-center text-brand-primary">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-black text-brand-dark">Laptop Baru 💻</div>
              <div className="text-[9px] font-bold text-brand-darkMuted">75% Terkumpul</div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          4. TAGIHAN RUTIN BEBAS DENDA (Mid-Right Receipt Ticket)
          File: /welcome/bill-guard.jpg
          ============================================================ */}
      <div className="absolute top-[42%] right-1 sm:right-3 z-10 animate-float-2 transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300">
        {!imgError['bill-guard'] ? (
          <img
            src="/welcome/bill-guard.jpg"
            alt="Tagihan Wifi & Listrik Bebas Denda"
            onError={() => handleImageError('bill-guard')}
            className="w-36 sm:w-48 md:w-52 h-auto object-contain mix-blend-multiply drop-shadow-xl select-none"
          />
        ) : (
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-brand-dark shadow-saweria flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 border border-brand-dark flex items-center justify-center text-brand-dark">
              <Zap className="w-3.5 h-3.5 fill-brand-dark" />
            </div>
            <div>
              <div className="text-[10px] font-black text-brand-dark">Wifi & Listrik</div>
              <span className="text-[8px] font-black text-emerald-700">Lunas Bebas Denda! ✅</span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          5. JATAH BELANJA AMAN HARI INI (Bottom Center Guardrail Pill)
          File: /welcome/daily-limit.jpg
          ============================================================ */}
      <div className="absolute bottom-0 sm:bottom-1 left-1/2 -translate-x-1/2 z-30 animate-float-1 transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300">
        {!imgError['daily-limit'] ? (
          <img
            src="/welcome/daily-limit.jpg"
            alt="Jatah Belanja Aman Hari Ini Rp 125.000/hari"
            onError={() => handleImageError('daily-limit')}
            className="w-48 sm:w-60 md:w-68 h-auto object-contain mix-blend-multiply drop-shadow-2xl select-none"
          />
        ) : (
          <div className="p-2.5 rounded-2xl bg-[#E2F5F0] border-2 border-brand-dark shadow-saweria flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-primary border border-brand-dark flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-brand-darkMuted uppercase">Jatah Aman Hari Ini</div>
              <div className="text-sm font-black text-brand-dark">Rp 125.000/hari 🟢</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

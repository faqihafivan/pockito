import React, { useState } from 'react';
import {
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
      className={`relative w-full max-w-sm sm:max-w-md mx-auto aspect-[4/4.2] sm:aspect-[4/4.4] flex items-center justify-center select-none overflow-visible pointer-events-none ${className}`}
    >
      {/* Soft Ambient Radial Blur Behind Stage */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-sky-200/40 via-blue-100/30 to-teal-100/30 blur-3xl" />
      </div>

      {/* ============================================================
          1. TOP-LEFT: Floating 3D Coins & Star
          Matching Image 2 top-left floating coin
          ============================================================ */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-5 z-10 animate-float-2 transform -rotate-12 hover:rotate-0 transition-transform duration-300">
        {!imgError['coins-star'] ? (
          <img
            src="/welcome/coins-star.png"
            alt="Koin Emas 500 Rupiah & Bintang"
            onError={() => handleImageError('coins-star')}
            className="w-16 sm:w-22 md:w-26 h-auto object-contain drop-shadow-md select-none"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-amber-400 border border-brand-dark shadow-saweria-xs flex items-center justify-center text-sm">
            ⭐
          </div>
        )}
      </div>

      {/* ============================================================
          2. TOP-RIGHT: Main 3D Card (Smart Pocket)
          Matching Image 2 main black card tilted right (rotate 6deg)
          ============================================================ */}
      <div className="absolute top-1 sm:top-3 right-0 sm:right-2 z-20 animate-float-1 transform rotate-6 hover:rotate-0 transition-transform duration-300">
        {!imgError['pocket-card'] ? (
          <img
            src="/welcome/pocket-card.png"
            alt="Kartu Kantong Cerdas Makan & Ngopi"
            onError={() => handleImageError('pocket-card')}
            className="w-48 sm:w-60 md:w-64 h-auto object-contain drop-shadow-2xl select-none"
          />
        ) : (
          <div className="w-44 p-3 rounded-2xl bg-white border-2 border-brand-dark shadow-saweria space-y-1">
            <span className="text-[10px] font-black text-amber-900">Makan & Ngopi</span>
            <div className="text-sm font-black text-brand-dark">Rp 850.000</div>
          </div>
        )}
      </div>

      {/* ============================================================
          3. MID-LEFT: Goal Progress Ring
          Matching Image 2 circular badge ($400 Saved)
          ============================================================ */}
      <div className="absolute top-[34%] left-0 sm:left-2 z-20 animate-float-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
        {!imgError['goal-ring'] ? (
          <img
            src="/welcome/goal-ring.png"
            alt="Target Tabungan Laptop Baru"
            onError={() => handleImageError('goal-ring')}
            className="w-28 sm:w-36 md:w-40 h-auto object-contain drop-shadow-xl select-none"
          />
        ) : (
          <div className="p-2 rounded-2xl bg-white border-2 border-brand-dark shadow-saweria flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-brand-primary" />
            <span className="text-[10px] font-black">75% Terkumpul</span>
          </div>
        )}
      </div>

      {/* ============================================================
          4. MID-RIGHT: Bill Guard Ticket Card
          Matching Image 2 weekly bar chart card (tilted)
          ============================================================ */}
      <div className="absolute top-[38%] -right-1 sm:right-1 z-10 animate-float-2 transform rotate-6 hover:rotate-0 transition-transform duration-300">
        {!imgError['bill-guard'] ? (
          <img
            src="/welcome/bill-guard.png"
            alt="Tagihan Wifi & Listrik Bebas Denda"
            onError={() => handleImageError('bill-guard')}
            className="w-40 sm:w-48 md:w-52 h-auto object-contain drop-shadow-xl select-none"
          />
        ) : (
          <div className="p-2.5 rounded-xl bg-white border-2 border-brand-dark shadow-saweria flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 fill-brand-dark" />
            <span className="text-[10px] font-black">Lunas Bebas Denda!</span>
          </div>
        )}
      </div>

      {/* ============================================================
          5. BOTTOM-LEFT: Daily Safe Limit Capsule Pill
          Matching Image 2 bottom-left overview pill
          ============================================================ */}
      <div className="absolute bottom-2 sm:bottom-4 left-1 sm:left-3 z-30 animate-float-1 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
        {!imgError['daily-limit'] ? (
          <img
            src="/welcome/daily-limit.png"
            alt="Jatah Belanja Aman Hari Ini Rp 125.000/hari"
            onError={() => handleImageError('daily-limit')}
            className="w-44 sm:w-54 md:w-58 h-auto object-contain drop-shadow-2xl select-none"
          />
        ) : (
          <div className="p-2.5 rounded-2xl bg-white border-2 border-brand-dark shadow-saweria flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-black">Rp 125.000/hari</span>
          </div>
        )}
      </div>

      {/* Subtle Mini Floating Coin Bottom Right matching Image 2 */}
      <div className="absolute bottom-4 right-6 z-10 animate-float-3 pointer-events-none transform rotate-12">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 border-2 border-amber-600/30 shadow-md flex items-center justify-center text-[10px] font-black text-amber-950">
          🪙
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface FloatingHeroVisualProps {
  className?: string;
}

export const FloatingHeroVisual: React.FC<FloatingHeroVisualProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full max-w-[240px] sm:max-w-[270px] md:max-w-[290px] mx-auto aspect-[4/3.4] flex items-center justify-center select-none overflow-visible pointer-events-none ${className}`}
    >
      {/* Soft Ambient Radial Blur Behind Stage */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-sky-200/40 via-blue-100/30 to-teal-100/30 blur-2xl" />
      </div>

      {/* ============================================================
          1. TOP-LEFT: Floating 3D Coins & Star
          ============================================================ */}
      <div className="absolute -top-1 sm:top-0 left-0 sm:left-2 z-10 animate-float-2 transform -rotate-12 pointer-events-none">
        <picture>
          <source srcSet="/welcome/coins-star.webp" type="image/webp" />
          <img
            src="/welcome/coins-star.png"
            alt="Koin Emas"
            width={72}
            height={72}
            className="w-14 sm:w-16 md:w-18 h-auto object-contain drop-shadow-md select-none"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>

      {/* ============================================================
          2. TOP-RIGHT: Main 3D Card (Smart Pocket)
          ============================================================ */}
      <div className="absolute top-0 right-0 sm:right-2 z-20 animate-float-1 transform rotate-6 pointer-events-none">
        <picture>
          <source srcSet="/welcome/pocket-card.webp" type="image/webp" />
          <img
            src="/welcome/pocket-card.png"
            alt="Kartu Kantong Cerdas Makan & Ngopi"
            width={220}
            height={220}
            className="w-40 sm:w-48 md:w-52 h-auto object-contain drop-shadow-2xl select-none"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>

      {/* ============================================================
          3. MID-LEFT: Goal Progress Ring
          ============================================================ */}
      <div className="absolute top-[32%] -left-1 sm:left-1 z-20 animate-float-3 transform -rotate-6 pointer-events-none">
        <picture>
          <source srcSet="/welcome/goal-ring.webp" type="image/webp" />
          <img
            src="/welcome/goal-ring.png"
            alt="Target Tabungan"
            width={120}
            height={120}
            className="w-22 sm:w-26 md:w-28 h-auto object-contain drop-shadow-lg select-none"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>

      {/* ============================================================
          4. MID-RIGHT: Bill Guard Ticket Card
          ============================================================ */}
      <div className="absolute top-[36%] -right-1 sm:right-1 z-10 animate-float-2 transform rotate-6 pointer-events-none">
        <picture>
          <source srcSet="/welcome/bill-guard.webp" type="image/webp" />
          <img
            src="/welcome/bill-guard.png"
            alt="Tagihan Bebas Denda"
            width={160}
            height={160}
            className="w-32 sm:w-38 md:w-42 h-auto object-contain drop-shadow-lg select-none"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>

      {/* ============================================================
          5. BOTTOM-LEFT: Daily Safe Limit Capsule Pill
          ============================================================ */}
      <div className="absolute bottom-0 left-1 sm:left-3 z-30 animate-float-1 transform -rotate-3 pointer-events-none">
        <picture>
          <source srcSet="/welcome/daily-limit.webp" type="image/webp" />
          <img
            src="/welcome/daily-limit.png"
            alt="Jatah Belanja Aman Hari Ini"
            width={180}
            height={180}
            className="w-36 sm:w-44 md:w-48 h-auto object-contain drop-shadow-2xl select-none"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>

      {/* Subtle Mini Floating Coin Bottom Right */}
      <div className="absolute bottom-2 right-4 z-10 animate-float-3 pointer-events-none transform rotate-12">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 border border-amber-600/30 shadow-sm flex items-center justify-center text-[9px] font-black text-amber-950">
          🪙
        </div>
      </div>
    </div>
  );
};

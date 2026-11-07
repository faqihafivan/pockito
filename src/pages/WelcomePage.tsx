import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FloatingHeroVisual } from '../components/welcome/FloatingHeroVisual';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  Palette,
} from 'lucide-react';

interface SlideData {
  id: number;
  highlight: string;
  title: string;
  subtitle: string;
  mascotDialogue: string;
  type: 'floating-hero' | 'image' | 'feature-summary';
  image?: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    type: 'floating-hero',
    highlight: 'Budgeting Kantong Cerdas',
    title: 'Track Your Spending Like Never Before',
    subtitle:
      'Alokasikan gaji ke kantong Makanan, Kos, Bills, hingga Ngopi secara otomatis. Saldo Riil dihitung bulat dan anti tekor di akhir bulan.',
    mascotDialogue:
      'Gajimu gak bakal menguap entah ke mana lagi! Alokasikan ke pos penting duluan yuk.',
  },
  {
    id: 2,
    type: 'image',
    image: '/slide1.jpg?v=2',
    highlight: 'Kunci Kantong Anti-Impulsif',
    title: 'Kunci Tabungan dari Godaan Impulsif',
    subtitle:
      'Punya dana darurat atau tabungan impian? Pasang gembok pengaman! Gembok ini mengunci kantong agar kamu tidak sembarangan mencairkan uang sebelum waktunya.',
    mascotDialogue:
      'Gembok ini bikin kamu mikir dua kali sebelum checkout belanjaan yang gak penting!',
  },
  {
    id: 3,
    type: 'image',
    image: '/slide2.jpg?v=2',
    highlight: 'Planner & Tagihan Bebas Denda',
    title: 'Tak Ada Lagi Tagihan yang Terlewat',
    subtitle:
      'Satukan jadwal bayar kos, listrik, dan wifi dengan to-do list harian. Lengkap dengan estimasi belanja pokok: centang belanjaan, saldo langsung terpotong!',
    mascotDialogue:
      'Bebas denda keterlambatan! Semua tanggal bayar kos, listrik, dan wifi tercatat rapi.',
  },
  {
    id: 4,
    type: 'image',
    image: '/slide3.jpg?v=2',
    highlight: 'Target Tabungan Ceria',
    title: 'Kumpulkan Impian Langkah demi Langkah',
    subtitle:
      'Pantau progres tabungan beli laptop baru, liburan impian, hingga dana darurat dengan circular progress ring dan perayaan selebrasi saat target lunas.',
    mascotDialogue:
      'Nabung gak harus tersiksa kok! Yang penting mulai konsisten dari nominal terkecilmu.',
  },
  {
    id: 5,
    type: 'feature-summary',
    highlight: 'Siap Digunakan',
    title: 'Mulai Atur Keuanganmu Sekarang',
    subtitle:
      'Coba langsung simulasi demo tanpa daftar dengan dana Rp 15 juta, atau masuk ke akunmu untuk sinkronisasi cloud yang 100% aman.',
    mascotDialogue:
      'Yuk buktikan sendiri cara kerjanya, 100% gratis dan langsung siap dipakai!',
  },
];

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { enterDemoMode } = useAuth();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const totalSlides = SLIDES.length;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === totalSlides - 1;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigate('/login');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  const handleGuestDemo = async () => {
    setIsDemoLoading(true);
    await enterDemoMode();
    setIsDemoLoading(false);
    navigate('/app/dashboard');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  return (
    <div
      className="h-[100dvh] max-h-screen w-full bg-gradient-to-b from-[#EBF3FC] via-[#E2EEFB] to-[#D5E5F7] text-slate-900 flex flex-col justify-between select-none relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle Background Watermark */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden z-0">
        <span className="text-[14vw] sm:text-8xl font-black text-sky-900/[0.035] tracking-widest uppercase leading-none transform -translate-y-2">
          FINANCE
        </span>
      </div>

      {/* ============================================================
          TOP HEADER: Clean bar with Logo, Slide Count, & Skip/Login
          ============================================================ */}
      <header className="px-5 sm:px-8 pt-3 pb-1 flex items-center justify-between z-30 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2">
          <img
            src="/pockito.png"
            alt="Pockito"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain bg-white/90 border border-slate-300/80 shadow-xs"
          />
          <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
            Pockito<span className="text-teal-600">.</span>
          </span>
        </div>

        {/* Step Indicator Pill & Skip Button */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-slate-500 bg-white/60 px-2.5 py-1.5 rounded-full border border-slate-200/80">
            {currentSlide + 1} / {totalSlides}
          </span>

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-1.5 min-h-[36px] rounded-full bg-white/70 hover:bg-white border border-slate-200/80 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Lewati
          </button>
        </div>
      </header>

      {/* ============================================================
          SLIDE TRACK CAROUSEL (Horizontally Sliding Viewport)
          ============================================================ */}
      <div className="flex-1 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto overflow-hidden relative z-10 flex flex-col justify-center">
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((item) => (
            <div
              key={item.id}
              className="w-full shrink-0 h-full flex flex-col justify-between px-5 sm:px-6 py-2"
            >
              {/* TOP VISUAL STAGE OF THE SLIDE */}
              <div className="flex-1 flex items-center justify-center min-h-[220px] sm:min-h-[260px] relative">
                {/* 1. SLIDE 1: 3D Floating Cards Hero Stage */}
                {item.type === 'floating-hero' && (
                  <div className="w-full max-w-xs scale-90 sm:scale-100 origin-center">
                    <FloatingHeroVisual />
                  </div>
                )}

                {/* 2. SLIDES 2, 3, 4: Beautiful Rounded Tour Slide Image */}
                {item.type === 'image' && item.image && (
                  <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-xl bg-white animate-in fade-in duration-300">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm border border-slate-700 px-3 py-1 rounded-full text-[10px] font-black text-slate-900 shadow-xs flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>{item.highlight}</span>
                    </div>
                  </div>
                )}

                {/* 3. SLIDE 5: Feature Summary Grid (Final Onboarding Card) */}
                {item.type === 'feature-summary' && (
                  <div className="w-full max-w-[310px] sm:max-w-[340px] p-4 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-slate-800 shadow-xl space-y-2.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                      <img
                        src="/pockito.png"
                        alt="Pockito"
                        className="w-9 h-9 rounded-xl object-contain bg-white border border-slate-300 shadow-xs"
                      />
                      <div>
                        <div className="text-xs font-black text-slate-900">Pockito Workspace</div>
                        <div className="text-[10px] font-semibold text-teal-700">100% Siap Membantumu</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <div className="text-[11px] font-black text-slate-900">Kantong Cerdas</div>
                        <div className="text-[9px] text-slate-500">Alokasi gaji otomatis</div>
                      </div>

                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 space-y-0.5">
                        <Lock className="w-4 h-4 text-amber-600" />
                        <div className="text-[11px] font-black text-slate-900">Gembok Kantong</div>
                        <div className="text-[9px] text-slate-500">Anti jajan impulsif</div>
                      </div>

                      <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 space-y-0.5">
                        <CalendarCheck className="w-4 h-4 text-sky-600" />
                        <div className="text-[11px] font-black text-slate-900">Guard Tagihan</div>
                        <div className="text-[9px] text-slate-500">Bebas denda telat</div>
                      </div>

                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 space-y-0.5">
                        <Palette className="w-4 h-4 text-rose-600" />
                        <div className="text-[11px] font-black text-slate-900">5 Tema Estetik</div>
                        <div className="text-[9px] text-slate-500">Dark mode penuh</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] font-bold text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Data aman berkat Row Level Security</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM TEXT & DESCRIPTION OF THE SLIDE */}
              <div className="space-y-3 pt-1 text-center">
                {/* Badge Tag */}
                <div>
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-teal-500/15 text-teal-900 border border-teal-600/30">
                    {item.highlight}
                  </span>
                </div>

                {/* Headline & Subtitle */}
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {item.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                    {item.subtitle}
                  </p>
                </div>

                {/* Compact Mascot Speech Bubble */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-300/80 p-2.5 rounded-2xl shadow-xs text-left flex items-center gap-2.5 max-w-xs sm:max-w-sm mx-auto">
                  <img
                    src="/pockito.png"
                    alt="Maskot"
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 shrink-0 object-contain shadow-xs"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">
                      "{item.mascotDialogue}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          BOTTOM CONTROLS & ACTION BUTTONS (Clean, Modern, Accessible)
          ============================================================ */}
      <footer className="px-5 sm:px-8 pb-5 pt-1 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full z-20 space-y-3">
        {/* Animated Dots Indicator with Accessible 44px Prev/Next chevron taps */}
        <div className="flex items-center justify-between px-1">
          {/* Prev Arrow - 44x44px Touch Target for Mobile Thumb */}
          <button
            type="button"
            onClick={prevSlide}
            disabled={isFirstSlide}
            className={`w-11 h-11 rounded-full border border-slate-300 bg-white/90 flex items-center justify-center text-slate-800 shadow-xs transition-all ${
              isFirstSlide ? 'opacity-0 pointer-events-none' : 'hover:bg-white active:scale-90 cursor-pointer hover:shadow-sm'
            }`}
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Dots Indicator with Accessible Tap Target */}
          <div className="flex items-center gap-1">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className="py-2.5 px-1 cursor-pointer flex items-center justify-center"
                aria-label={`Ke slide ${idx + 1}`}
              >
                <span
                  className={`transition-all duration-300 rounded-full border border-slate-400 block ${
                    currentSlide === idx
                      ? 'w-7 h-2.5 bg-slate-900 border-slate-900 shadow-xs'
                      : 'w-2.5 h-2.5 bg-slate-300 opacity-70 hover:opacity-100'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Next Arrow - 44x44px Touch Target for Mobile Thumb */}
          <button
            type="button"
            onClick={nextSlide}
            disabled={isLastSlide}
            className={`w-11 h-11 rounded-full border border-slate-300 bg-white/90 flex items-center justify-center text-slate-800 shadow-xs transition-all ${
              isLastSlide ? 'opacity-0 pointer-events-none' : 'hover:bg-white active:scale-90 cursor-pointer hover:shadow-sm'
            }`}
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Action Buttons: Adaptive based on current slide */}
        <div className="space-y-2">
          {!isLastSlide ? (
            /* SLIDES 1 - 4: Lanjut Button + Quick Demo link */
            <>
              <button
                type="button"
                onClick={nextSlide}
                className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-3 pt-0.5 text-xs font-semibold text-slate-500">
                <button
                  type="button"
                  onClick={handleGuestDemo}
                  disabled={isDemoLoading}
                  className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isDemoLoading ? 'Membuka...' : 'Langsung Coba Mode Demo'}</span>
                </button>
                <span>•</span>
                <Link
                  to="/login"
                  className="hover:text-slate-900 underline transition-colors cursor-pointer"
                >
                  Masuk ke Akun
                </Link>
              </div>
            </>
          ) : (
            /* SLIDE 5 (FINAL): Coba Demo & Masuk ke Akun Buttons */
            <>
              <button
                type="button"
                onClick={handleGuestDemo}
                disabled={isDemoLoading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-800 hover:to-black text-white font-black text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>{isDemoLoading ? 'Menyiapkan Demo...' : 'Coba Mode Demo (Tanpa Daftar)'}</span>
              </button>

              <Link
                to="/login"
                className="w-full py-3 rounded-full bg-white/80 hover:bg-white text-slate-800 font-bold text-xs border border-slate-300/80 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Sudah Punya Akun? Masuk di Sini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};

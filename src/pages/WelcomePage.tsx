import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { FloatingHeroVisual } from '../components/welcome/FloatingHeroVisual';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SlideData {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  highlight: string;
  mascotDialogue: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: '/slide1.jpg?v=2',
    title: 'Bagi Gajimu Tanpa Pusing Akuntansi',
    subtitle:
      'Alokasikan penghasilan ke kantong Makanan, Kos, hingga Ngopi dengan persentase fleksibel dan perhitungan Rupiah bulat yang presisi.',
    highlight: 'Budgeting Kantong Cerdas',
    mascotDialogue:
      'Tenang, gajimu gak bakal menguap entah ke mana lagi! Alokasikan ke pos-pos penting duluan yuk.',
  },
  {
    id: 2,
    image: '/slide2.jpg?v=2',
    title: 'Tak Ada Lagi Tagihan yang Terlewat',
    subtitle:
      'Satukan to-do list harian dengan jadwal bayar tagihan listrik, air, dan internet. Tak perlu lagi khawatir denda keterlambatan.',
    highlight: 'Planner & Tagihan Harian',
    mascotDialogue:
      'Bebas denda! Semua tanggal bayar kos, listrik, sampai tagihan wifi bakal tercatat rapi dan tepat waktu.',
  },
  {
    id: 3,
    image: '/slide3.jpg?v=2',
    title: 'Kumpulkan Impian Langkah demi Langkah',
    subtitle:
      'Pantau progres tabungan beli laptop baru, liburan impian, hingga dana darurat dengan dorongan positif dan selebrasi.',
    highlight: 'Target Tabungan Ceria',
    mascotDialogue:
      'Nabung gak harus tersiksa kok! Yang penting mulai konsisten dari nominal terkecilmu setiap hari.',
  },
];

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { enterDemoMode } = useAuth();

  // Mode: 'hero' (Matching Image 2 Reference) vs 'tour' (3-slide walkthrough)
  const [viewMode, setViewMode] = useState<'hero' | 'tour'>('hero');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      try {
        localStorage.setItem('pockito_has_seen_tour', 'true');
      } catch {
        // ignore
      }
      navigate('/login');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleGetStarted = () => {
    try {
      localStorage.setItem('pockito_has_seen_tour', 'true');
    } catch {
      // ignore
    }
    navigate('/register');
  };

  const handleGuestDemo = async () => {
    await enterDemoMode();
    navigate('/app/dashboard');
  };

  // Keyboard navigation on tour
  useEffect(() => {
    if (viewMode !== 'tour') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentSlide]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || viewMode !== 'tour') return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#EBF3FC] via-[#E2EEFB] to-[#D5E5F7] text-slate-900 flex flex-col justify-between select-none relative overflow-x-hidden transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ============================================================
          TOP WATERMARK: Subtle "FINANCE" text matching Image 2
          ============================================================ */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden z-0">
        <span className="text-[12vw] sm:text-7xl md:text-8xl font-black text-sky-900/[0.04] tracking-widest uppercase leading-none transform -translate-y-2">
          FINANCE
        </span>
      </div>

      {/* ============================================================
          MINIMALIST TOP BAR: Clean, unobtrusive header
          ============================================================ */}
      <header className="px-5 sm:px-8 pt-4 pb-1 flex items-center justify-between z-20 max-w-sm sm:max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <img
            src="/pockito.png"
            alt="Pockito"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain bg-white/80 border border-slate-300/60 shadow-xs"
          />
          <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
            Pockito<span className="text-teal-600">.</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'tour' ? (
            <button
              onClick={() => setViewMode('hero')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              Kembali
            </button>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-full bg-white/60 hover:bg-white border border-slate-200/80 transition-all cursor-pointer shadow-xs"
            >
              Masuk
            </Link>
          )}
        </div>
      </header>

      {/* ============================================================
          VIEW 1: MODERN FLOATING-FINTECH ONBOARDING HERO
          Pixel-Perfect to Image 2 Reference
          ============================================================ */}
      {viewMode === 'hero' && (
        <main className="flex-1 flex flex-col justify-between px-5 sm:px-8 pt-1 pb-6 max-w-sm sm:max-w-md mx-auto w-full z-10 animate-in fade-in duration-300">
          {/* Top 60%: Floating 3D Cards Visual Stage */}
          <div className="flex-1 flex items-center justify-center my-auto py-1">
            <FloatingHeroVisual />
          </div>

          {/* Bottom 40%: Clean Display Typography & Single Dominant Pill CTA Button */}
          <div className="space-y-4 pt-1 pb-2 text-center">
            {/* Display Headline */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-[1.18]">
                Track Your Spending <br />
                Like Never Before
              </h1>

              {/* Minimal Subtitle matching Image 2 */}
              <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                your money counting starts from here
              </p>
            </div>

            {/* Single Solid Black Pill Button matching Image 2 */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleGetStarted}
                className="w-full py-3.5 sm:py-4 rounded-full bg-[#0F172A] hover:bg-black text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
              >
                Get Started
              </button>

              {/* Minimalist Sub-links */}
              <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-500">
                <button
                  type="button"
                  onClick={() => setViewMode('tour')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Lihat Tour (3 Slide)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleGuestDemo}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Mode Demo
                </button>
                <span>•</span>
                <Link
                  to="/login"
                  className="hover:text-slate-900 underline transition-colors cursor-pointer"
                >
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================
          VIEW 2: TOUR PLAY CAROUSEL (3 Slide Walkthrough)
          ============================================================ */}
      {viewMode === 'tour' && (
        <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-2 md:py-8 max-w-5xl mx-auto w-full z-10 animate-in fade-in duration-300">
          <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-center">
            {/* Left Column: Visual Slide Image */}
            <div className="md:col-span-6 lg:col-span-6 flex flex-col items-center">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-none aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-xl bg-white mb-4 md:mb-0 transition-all duration-300">
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300"
                />

                {/* Badge Tag on top of image */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-700 px-3 py-1 rounded-full text-[10px] font-black text-slate-900 shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>{slide.highlight}</span>
                </div>

                {/* Slide Navigation Arrows */}
                {currentSlide > 0 && (
                  <button
                    onClick={prevSlide}
                    className="flex absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-600 items-center justify-center text-slate-900 shadow-md hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                    aria-label="Slide sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                )}

                {currentSlide < SLIDES.length - 1 && (
                  <button
                    onClick={nextSlide}
                    className="flex absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-600 items-center justify-center text-slate-900 shadow-md hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                    aria-label="Slide berikutnya"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Narration, Speech Bubble & Tablet Actions */}
            <div className="md:col-span-6 lg:col-span-6 flex flex-col justify-center text-center md:text-left space-y-4 md:space-y-5 px-2">
              <div className="hidden md:inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-teal-500/10 border border-teal-600/30 text-xs font-black text-teal-900 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Langkah {currentSlide + 1} dari 3: {slide.highlight}</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm md:max-w-none mx-auto md:mx-0">
                  {slide.subtitle}
                </p>
              </div>

              {/* Mascot Bubble */}
              <div className="relative bg-white border border-slate-300 p-3.5 rounded-2xl shadow-sm text-left flex items-start gap-3 mt-1">
                <img
                  src="/pockito.png"
                  alt="Pockito Maskot"
                  className="w-10 h-10 rounded-xl bg-white border border-slate-300 shrink-0 object-contain shadow-xs"
                />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Pockito Berkata:
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    "{slide.mascotDialogue}"
                  </p>
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`transition-all duration-300 rounded-full border border-slate-400 cursor-pointer ${
                      currentSlide === idx
                        ? 'w-7 h-2.5 bg-teal-600 shadow-xs'
                        : 'w-2.5 h-2.5 bg-slate-300 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Ke slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Actions for Desktop/Tablet */}
              <div className="hidden md:flex flex-col space-y-2.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-sm font-black rounded-full"
                  onClick={nextSlide}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isLastSlide ? 'Mulai Sekarang — Masuk' : 'Lanjut ke Slide Berikutnya'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  className="w-full text-xs rounded-full"
                  onClick={handleGuestDemo}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
                >
                  Coba Mode Tamu / Demo Langsung
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Actions for Mobile on Tour Mode */}
          <footer className="md:hidden px-2 pb-4 pt-3 max-w-md mx-auto w-full space-y-2.5 z-20">
            <Button
              variant="primary"
              size="lg"
              className="w-full text-sm font-black rounded-full"
              onClick={nextSlide}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLastSlide ? 'Selesai — Masuk' : 'Lanjut'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              className="w-full text-xs rounded-full"
              onClick={handleGuestDemo}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
            >
              Coba Mode Tamu / Demo Langsung
            </Button>
          </footer>
        </main>
      )}

      {/* Bottom spacer for safe area on mobile */}
      <div className="h-1" />
    </div>
  );
};

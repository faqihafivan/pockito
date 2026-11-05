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
  Smartphone,
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

  // Mode: 'hero' (Layar visual elemen melayang seperti acuan gambar) vs 'tour' (3-slide walkthrough)
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

  const handleSkipTour = () => {
    try {
      localStorage.setItem('pockito_has_seen_tour', 'true');
    } catch {
      // ignore
    }
    navigate('/login');
  };

  const handleGetStarted = () => {
    try {
      localStorage.setItem('pockito_has_seen_tour', 'true');
    } catch {
      // ignore
    }
    navigate('/register');
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

  const handleGuestDemo = async () => {
    await enterDemoMode();
    navigate('/app/dashboard');
  };

  return (
    <div
      className="min-h-screen bg-brand-cream dark:bg-slate-900 text-brand-dark dark:text-slate-100 flex flex-col justify-between select-none relative overflow-x-hidden transition-colors duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ============================================================
          TOP NAVBAR: Brand Header & Skip / Login Action
          ============================================================ */}
      <header className="px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between z-20 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <img
            src="/pockito.png"
            alt="Pockito"
            className="w-9 h-9 rounded-xl object-contain bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm dark:shadow-none"
          />
          <span className="font-black text-lg text-brand-dark dark:text-slate-100 tracking-tight">
            Pockito<span className="text-brand-primary">.</span>
          </span>
          <span className="hidden sm:inline-block ml-1.5 text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-brand-dark dark:border-slate-700 text-brand-darkMuted dark:text-slate-300">
            {viewMode === 'hero' ? 'Workspace Keuangan' : 'Tour Aplikasi'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'tour' ? (
            <button
              onClick={() => setViewMode('hero')}
              className="text-xs font-bold text-brand-darkMuted hover:text-brand-dark dark:text-slate-400 dark:hover:text-slate-100 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-brand-dark transition-all cursor-pointer"
            >
              Kembali
            </button>
          ) : (
            <button
              onClick={handleSkipTour}
              className="text-xs font-bold text-brand-darkMuted hover:text-brand-dark dark:text-slate-400 dark:hover:text-slate-100 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-brand-dark transition-all cursor-pointer"
            >
              Lewati
            </button>
          )}

          <Link
            to="/login"
            className="text-xs font-extrabold text-brand-dark dark:text-slate-200 hover:text-brand-primary px-3 py-1.5 rounded-xl border-2 border-brand-dark/20 hover:border-brand-dark dark:border-slate-700 bg-white/70 dark:bg-slate-800 transition-all cursor-pointer shadow-saweria-xs"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* ============================================================
          VIEW 1: MODERN FLOATING-FINTECH ONBOARDING HERO (Seperti Gambar Acuan)
          ============================================================ */}
      {viewMode === 'hero' && (
        <main className="flex-1 flex flex-col justify-between px-4 sm:px-8 py-3 max-w-lg mx-auto w-full z-10 animate-in fade-in duration-300">
          {/* Top Section: Visual Playground Kartu Melayang */}
          <div className="flex-1 flex items-center justify-center my-auto py-2">
            <FloatingHeroVisual />
          </div>

          {/* Bottom Section: Headline, Subtitle & Action CTAs */}
          <div className="space-y-4 pt-2 pb-4 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/15 dark:bg-brand-primary/20 border-2 border-brand-dark dark:border-slate-700 text-[11px] font-black text-brand-dark dark:text-slate-200 shadow-saweria-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>Satu Workspace untuk Uang & Hari-Harimu</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl font-black text-brand-dark dark:text-slate-100 tracking-tight leading-snug">
              Pantau & Atur Finansialmu <br />
              <span className="bg-brand-primary text-white px-2.5 py-0.5 rounded-xl border-2 border-brand-dark inline-block shadow-saweria-xs mt-1">
                Lebih Rapi dari Sebelumnya.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-medium text-brand-darkMuted dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Bagi gajimu ke kantong cerdas, kunci jatah aman harian, dan pantau tabungan impianmu tanpa ribet akuntansi.
            </p>

            {/* Primary Action Button (Get Started) */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-sm font-black shadow-saweria active:translate-x-0.5 active:translate-y-0.5"
                onClick={handleGetStarted}
                rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.5]" />}
              >
                Mulai Sekarang — Daftar Gratis
              </Button>

              {/* Secondary Navigation Options */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setViewMode('tour')}
                  leftIcon={<Smartphone className="w-3.5 h-3.5 text-brand-primary" />}
                >
                  Lihat Tour (3 Slide)
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleGuestDemo}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                >
                  Coba Demo Tamu
                </Button>
              </div>
            </div>

            {/* Already have an account link */}
            <p className="text-xs font-bold text-brand-darkMuted dark:text-slate-400 pt-1">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="text-brand-dark dark:text-brand-primary underline font-black hover:text-brand-primaryHover"
              >
                Masuk di sini
              </Link>
            </p>
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
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-none aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden border-2 border-brand-dark dark:border-slate-700 shadow-saweria-lg dark:shadow-[4px_4px_0px_#0f172a] bg-white dark:bg-slate-800 mb-4 md:mb-0 transition-all duration-300">
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300"
                />

                {/* Badge Tag on top of image */}
                <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-850/95 backdrop-blur-sm border-2 border-brand-dark dark:border-slate-700 px-3 py-1 rounded-full text-[10px] font-black text-brand-dark dark:text-slate-100 shadow-saweria-sm dark:shadow-none flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-brand-primary" />
                  <span>{slide.highlight}</span>
                </div>

                {/* Slide Navigation Arrows on Image */}
                {currentSlide > 0 && (
                  <button
                    onClick={prevSlide}
                    className="flex absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-600 items-center justify-center text-brand-dark dark:text-slate-100 shadow-saweria-sm dark:shadow-none hover:bg-brand-cream dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                    aria-label="Slide sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                )}

                {currentSlide < SLIDES.length - 1 && (
                  <button
                    onClick={nextSlide}
                    className="flex absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-600 items-center justify-center text-brand-dark dark:text-slate-100 shadow-saweria-sm dark:shadow-none hover:bg-brand-cream dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                    aria-label="Slide berikutnya"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Narration, Speech Bubble & Tablet Actions */}
            <div className="md:col-span-6 lg:col-span-6 flex flex-col justify-center text-center md:text-left space-y-4 md:space-y-5 px-2">
              {/* Category Tag */}
              <div className="hidden md:inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-brand-primary/20 dark:bg-brand-primary/10 border-2 border-brand-dark dark:border-slate-700 text-xs font-black text-brand-dark dark:text-slate-200 shadow-saweria-sm dark:shadow-none">
                <Sparkles className="w-3.5 h-3.5 text-brand-dark dark:text-brand-primary" />
                <span>Langkah {currentSlide + 1} dari 3: {slide.highlight}</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-dark dark:text-slate-100 tracking-tight leading-snug">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm text-brand-darkMuted dark:text-slate-400 font-medium leading-relaxed max-w-sm md:max-w-none mx-auto md:mx-0">
                  {slide.subtitle}
                </p>
              </div>

              {/* Mascot Dialogue Bubble */}
              <div className="relative bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 p-3.5 rounded-2xl shadow-saweria dark:shadow-[4px_4px_0px_#0f172a] text-left flex items-start gap-3 mt-1">
                <img
                  src="/pockito.png"
                  alt="Pockito Maskot"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-brand-dark dark:border-slate-700 shrink-0 object-contain shadow-saweria-xs"
                />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-dark/60 dark:text-slate-400 block">
                    Pockito Berkata:
                  </span>
                  <p className="text-xs font-bold text-brand-dark dark:text-slate-100 leading-snug">
                    "{slide.mascotDialogue}"
                  </p>
                </div>
              </div>

              {/* Dots Pagination Indicator */}
              <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`transition-all duration-300 rounded-full border border-brand-dark dark:border-slate-600 cursor-pointer ${
                      currentSlide === idx
                        ? 'w-7 h-2.5 bg-brand-primary shadow-saweria-sm dark:shadow-none'
                        : 'w-2.5 h-2.5 bg-brand-dark/20 dark:bg-slate-700 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Ke slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Action Buttons for Tablet / Desktop */}
              <div className="hidden md:flex flex-col space-y-2.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-sm font-black"
                  onClick={nextSlide}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isLastSlide ? 'Mulai Sekarang — Masuk' : 'Lanjut ke Slide Berikutnya'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  className="w-full text-xs"
                  onClick={handleGuestDemo}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-primary" />}
                >
                  Coba Mode Tamu / Demo Langsung
                </Button>

                <div className="text-center md:text-left pt-1">
                  <p className="text-xs font-bold text-brand-darkMuted dark:text-slate-400">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-brand-dark dark:text-brand-primary underline font-black hover:text-brand-primaryHover">
                      Masuk di sini
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions for Mobile on Tour Mode */}
          <footer className="md:hidden px-2 pb-4 pt-3 max-w-md mx-auto w-full space-y-2.5 z-20">
            <Button
              variant="primary"
              size="lg"
              className="w-full text-sm font-black"
              onClick={nextSlide}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLastSlide ? 'Selesai — Masuk' : 'Lanjut'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              className="w-full text-xs"
              onClick={handleGuestDemo}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-primary" />}
            >
              Coba Mode Tamu / Demo Langsung
            </Button>
          </footer>
        </main>
      )}

      {/* Bottom spacer for safe area on mobile */}
      <div className="h-2" />
    </div>
  );
};

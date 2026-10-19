import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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
    image: '/slide1.jpg',
    title: 'Bagi Gajimu Tanpa Pusing Akuntansi',
    subtitle:
      'Alokasikan penghasilan ke kantong Makanan, Kos, hingga Ngopi dengan persentase fleksibel dan perhitungan Rupiah bulat yang presisi.',
    highlight: 'Budgeting Kantong Cerdas',
    mascotDialogue:
      'Tenang, gajimu gak bakal menguap entah ke mana lagi! Alokasikan ke pos-pos penting duluan yuk.',
  },
  {
    id: 2,
    image: '/slide2.jpg',
    title: 'Tak Ada Lagi Tagihan yang Terlewat',
    subtitle:
      'Satukan to-do list harian dengan jadwal bayar tagihan listrik, air, dan internet. Tak perlu lagi khawatir denda keterlambatan.',
    highlight: 'Planner & Tagihan Harian',
    mascotDialogue:
      'Bebas denda! Semua tanggal bayar kos, listrik, sampai tagihan wifi bakal tercatat rapi dan tepat waktu.',
  },
  {
    id: 3,
    image: '/slide3.jpg',
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
  const { login } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigate('/register');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
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
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide(); // Swiped left -> next
    } else if (distance < -minSwipeDistance) {
      prevSlide(); // Swiped right -> prev
    }
  };

  const handleGuestDemo = async () => {
    await login('faqih@pockito.app');
    navigate('/app/dashboard');
  };

  return (
    <div
      className="min-h-screen bg-brand-cream text-brand-dark flex flex-col justify-between select-none relative overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar: Brand & Skip Button */}
      <header className="px-6 py-4 flex items-center justify-between z-20 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <img
            src="/pockito.png"
            alt="Pockito"
            className="w-9 h-9 rounded-xl object-contain bg-white border-2 border-brand-dark shadow-saweria-sm"
          />
          <span className="font-black text-lg text-brand-dark tracking-tight">
            Pockito<span className="text-brand-primary">.</span>
          </span>
          <span className="hidden sm:inline-block ml-2 text-[10px] font-black uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-brand-dark text-brand-darkMuted">
            Tour Aplikasi
          </span>
        </div>

        <button
          onClick={() => navigate('/register')}
          className="text-xs font-bold text-brand-darkMuted hover:text-brand-dark px-3 py-1.5 rounded-xl border border-transparent hover:border-brand-dark transition-all"
        >
          Lewati Tour
        </button>
      </header>

      {/* Main Slide Carousel Area (Responsive: 1-col on mobile, 2-col split on tablet/desktop) */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-2 md:py-8 max-w-5xl mx-auto w-full z-10">
        <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-center">
          {/* Kolom Kiri: Visual Slide Showcase */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-none aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden border-2 border-brand-dark shadow-saweria-lg bg-white mb-4 md:mb-0 transition-all duration-300">
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300"
              />

              {/* Badge Tag on top of image */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border-2 border-brand-dark px-3 py-1 rounded-full text-[10px] font-black text-brand-dark shadow-saweria-sm flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-primary" />
                <span>{slide.highlight}</span>
              </div>

              {/* Slide Navigation Arrows on Image */}
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="flex absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border-2 border-brand-dark items-center justify-center text-brand-dark shadow-saweria-sm hover:bg-white active:scale-95 transition-all"
                  aria-label="Slide sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

              {currentSlide < SLIDES.length - 1 && (
                <button
                  onClick={nextSlide}
                  className="flex absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border-2 border-brand-dark items-center justify-center text-brand-dark shadow-saweria-sm hover:bg-white active:scale-95 transition-all"
                  aria-label="Slide berikutnya"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Narasi, Speech Bubble Maskot & Aksi Tablet */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col justify-center text-center md:text-left space-y-4 md:space-y-5 px-2">
            {/* Tag Kategori (Tablet View) */}
            <div className="hidden md:inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-brand-primary/20 border-2 border-brand-dark text-xs font-black text-brand-dark shadow-saweria-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
              <span>Langkah {currentSlide + 1} dari 3: {slide.highlight}</span>
            </div>

            {/* Slide Title & Subtitle */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-dark tracking-tight leading-snug">
                {slide.title}
              </h2>
              <p className="text-xs sm:text-sm text-brand-darkMuted font-medium leading-relaxed max-w-sm md:max-w-none mx-auto md:mx-0">
                {slide.subtitle}
              </p>
            </div>

            {/* Balon Dialog Maskot Pockito (Speech Bubble) */}
            <div className="relative bg-white border-2 border-brand-dark p-3.5 rounded-2xl shadow-saweria text-left flex items-start gap-3 mt-1">
              <img
                src="/pockito.png"
                alt="Pockito Maskot"
                className="w-10 h-10 rounded-xl bg-white border-2 border-brand-dark shrink-0 object-contain shadow-saweria-xs"
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-dark/60 block">
                  Pockito Berkata:
                </span>
                <p className="text-xs font-bold text-brand-dark leading-snug">
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
                  className={`transition-all duration-300 rounded-full border border-brand-dark ${
                    currentSlide === idx
                      ? 'w-7 h-2.5 bg-brand-primary shadow-saweria-sm'
                      : 'w-2.5 h-2.5 bg-white opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Ke slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons for Tablet / Desktop (Hidden on mobile footer) */}
            <div className="hidden md:flex flex-col space-y-2.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-sm font-black"
                onClick={nextSlide}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isLastSlide ? 'Mulai Sekarang Gratis' : 'Lanjut ke Slide Berikutnya'}
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
                <p className="text-xs font-bold text-brand-darkMuted">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="text-brand-dark underline font-black hover:text-brand-primaryHover">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Actions Area (Mobile Only: hidden on md:) */}
      <footer className="md:hidden px-6 pb-6 pt-2 max-w-md mx-auto w-full space-y-3 z-20">
        <Button
          variant="primary"
          size="lg"
          className="w-full text-sm font-black"
          onClick={nextSlide}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isLastSlide ? 'Mulai Sekarang Gratis' : 'Lanjut'}
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

        <div className="text-center pt-1">
          <p className="text-xs font-bold text-brand-darkMuted">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-brand-dark underline font-black hover:text-brand-primaryHover">
              Masuk di sini
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

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
  Wallet,
  Lock,
  CalendarCheck,
  Target,
  Palette,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  PlayCircle,
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

interface FeatureItem {
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  highlights: string[];
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    badge: 'Budgeting Presisi',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    title: 'Metode Kantong Cerdas (Smart Pockets)',
    description:
      'Bagi gajimu ke pos-pos pengeluaran (Makan, Kos, Belanja, Ngopi) dengan persentase otomatis. Saldo Riil dihitung bulat hingga rupiah terakhir tanpa bikin pusing.',
    highlights: [
      'Alokasi persentase gaji otomatis & fleksibel',
      'Saldo Riil terpisah anti tekor tengah bulan',
      'Indikator visual sisa budget di setiap kantong',
    ],
  },
  {
    icon: <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    badge: 'Anti Impulsif',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    title: 'Gembok Pengaman Kantong (Pocket Lock)',
    description:
      'Punya tabungan impian atau dana darurat yang rawan dijajanin? Kunci kantongmu dengan gembok pengaman! Butuh konfirmasi sadar diri untuk membukanya kembali.',
    highlights: [
      'Gembok interaktif berfungsi di semua tema',
      'Mencegah belanja impulsif sebelum target tercapai',
      'Proteksi saldo prioritas jangka panjang',
    ],
  },
  {
    icon: <CalendarCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
    badge: 'Bebas Denda',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    title: 'Planner Harian & Guard Tagihan',
    description:
      'Satukan agenda harian dengan jatuh tempo tagihan listrik, wifi, dan kos. Dilengkapi kartu estimasi belanja pokok: centang saat belanja selesai, saldo otomatis terpotong!',
    highlights: [
      'Pengingat jatuh tempo tagihan anti denda',
      'Estimasi belanja pasar dengan checklist otomatis potong saldo',
      'To-do list harian produktif terintegrasi',
    ],
  },
  {
    icon: <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    badge: 'Motivasi Nyata',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    title: 'Target Tabungan Impian & Progress Ring',
    description:
      'Nabung beli laptop baru, liburan impian, atau dana darurat jadi seru dengan visual circular progress ring dan perayaan selebrasi saat targetmu tercapai.',
    highlights: [
      'Ring progress interaktif dan kalkulasi sisa target',
      'Estimasi waktu tercapai berdasarkan nominal setoran',
      'Efek selebrasi ceria saat tabungan lunas',
    ],
  },
  {
    icon: <Palette className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
    badge: 'Aesthetic UI',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    title: '5 Tema Unik & Dark Mode Penuh',
    description:
      'Catat keuangan gak boleh membosankan. Pilih tema sesuai seleramu: Pastel Mint, Lavender lembut, Sand elegan, Modern Teal, hingga Neo-Brutalist Saweria.',
    highlights: [
      'Dark mode adaptif yang ramah mata malam hari',
      'Floating capsule navbar dengan glider animation halus',
      'Desain responsif mobile-first terasa seperti native app',
    ],
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
    badge: 'Privasi Terjamin',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    title: '100% Keamanan Data Kelas Bank (RLS)',
    description:
      'Data finansialmu dilindungi Row Level Security (RLS) PostgreSQL di Supabase. User lain atau pihak luar mustahil bisa mengintip catatan uang pribadimu.',
    highlights: [
      'Multi-tenant data isolation matematis di database',
      'Mode demo terisolasi lokal tanpa mengirim data ke cloud',
      'PWA support: install langsung di HP tanpa Play Store',
    ],
  },
];

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { enterDemoMode } = useAuth();

  // Mode: 'hero' (Showcase & Landing) vs 'tour' (3-slide walkthrough)
  const [viewMode, setViewMode] = useState<'hero' | 'tour'>('hero');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

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

  const handleGuestDemo = async () => {
    setIsDemoLoading(true);
    await enterDemoMode();
    setIsDemoLoading(false);
    navigate('/app/dashboard');
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('fitur-unggulan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
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
      className="min-h-screen bg-gradient-to-b from-[#EBF3FC] via-[#E2EEFB] to-[#D8E8FA] text-slate-900 flex flex-col justify-between select-none relative overflow-x-hidden transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle Background Watermark */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden z-0">
        <span className="text-[12vw] sm:text-7xl md:text-8xl font-black text-sky-900/[0.04] tracking-widest uppercase leading-none transform -translate-y-2">
          FINANCE
        </span>
      </div>

      {/* ============================================================
          TOP NAVIGATION HEADER: Clean, informative, accessible
          ============================================================ */}
      <header className="sticky top-0 px-4 sm:px-8 py-3.5 flex items-center justify-between z-30 max-w-5xl mx-auto w-full bg-white/40 backdrop-blur-md border-b border-white/60 shadow-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="/pockito.png"
            alt="Pockito"
            className="w-8 h-8 rounded-xl object-contain bg-white border border-slate-300/80 shadow-xs"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg text-slate-900 tracking-tight">
              Pockito<span className="text-teal-600">.</span>
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-600/10 text-teal-800 border border-teal-600/20">
              v1.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {viewMode === 'tour' ? (
            <button
              onClick={() => setViewMode('hero')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-slate-300/60 transition-colors cursor-pointer"
            >
              Kembali ke Depan
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={scrollToFeatures}
                className="hidden sm:inline-flex text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
              >
                Fitur Unggulan
              </button>

              <button
                type="button"
                onClick={() => setViewMode('tour')}
                className="hidden sm:inline-flex text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
              >
                Tour 3 Slide
              </button>

              <button
                type="button"
                onClick={handleGuestDemo}
                disabled={isDemoLoading}
                className="text-xs font-black text-teal-800 hover:text-teal-950 px-3 py-1.5 rounded-full bg-teal-500/15 hover:bg-teal-500/25 border border-teal-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Coba Demo</span>
              </button>

              <Link
                to="/login"
                className="text-xs font-black text-white px-4 py-1.5 rounded-full bg-slate-900 hover:bg-black transition-all cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>Masuk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ============================================================
          VIEW 1: MODERN FLOATING FINTECH HERO + RICH FEATURE EXPLORER
          ============================================================ */}
      {viewMode === 'hero' && (
        <main className="flex-1 flex flex-col items-center w-full z-10 animate-in fade-in duration-300">
          {/* STAGE 1: FLOATING HERO SECTION */}
          <section className="w-full max-w-sm sm:max-w-md md:max-w-xl mx-auto px-5 sm:px-6 pt-4 pb-8 flex flex-col justify-between min-h-[calc(100vh-65px)]">
            {/* Top 55%: Floating 3D Cards Visual Stage */}
            <div className="flex-1 flex items-center justify-center my-auto py-2">
              <FloatingHeroVisual />
            </div>

            {/* Bottom 45%: Headline, Subtitle, & Frictionless Action Buttons */}
            <div className="space-y-4 pt-2 pb-3 text-center">
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-[1.18]">
                  Track Your Spending <br />
                  Like Never Before
                </h1>

                <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed max-w-xs sm:max-w-md mx-auto">
                  Alokasikan gaji ke kantong cerdas, kunci tabungan dari godaan belanja, dan satukan tagihan harianmu tanpa ribet akuntansi.
                </p>
              </div>

              {/* DUAL ACTION BUTTON GROUP: Clean, Clear Intent */}
              <div className="pt-2 space-y-2.5 max-w-xs sm:max-w-sm mx-auto w-full">
                {/* 1. Primary Highlight Button: Coba Mode Demo Instant */}
                <button
                  type="button"
                  onClick={handleGuestDemo}
                  disabled={isDemoLoading}
                  className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>{isDemoLoading ? 'Menyiapkan Demo...' : 'Coba Mode Demo (Tanpa Daftar)'}</span>
                </button>

                {/* 2. Secondary Clean Button: Masuk ke Akun / Login */}
                <Link
                  to="/login"
                  className="w-full py-3 rounded-full bg-white/80 hover:bg-white text-slate-800 font-bold text-xs border border-slate-300/80 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Sudah Punya Akun? Masuk di Sini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {/* Sub-actions & Quick Tour Switcher */}
                <div className="flex items-center justify-center gap-3 pt-1 text-xs font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => setViewMode('tour')}
                    className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>Lihat Tour (3 Slide)</span>
                  </button>
                  <span>•</span>
                  <Link
                    to="/register"
                    className="hover:text-slate-900 underline transition-colors cursor-pointer"
                  >
                    Daftar Akun Baru
                  </Link>
                </div>
              </div>

              {/* Scroll Down Hint to Feature Showcase */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={scrollToFeatures}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-slate-500 hover:text-slate-900 transition-colors cursor-pointer animate-bounce"
                >
                  <span>Pelajari Fitur Lengkap Pockito</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* STAGE 2: RICH INTERACTIVE FEATURE SHOWCASE SECTION */}
          <section
            id="fitur-unggulan"
            className="w-full bg-white/70 backdrop-blur-md border-t border-slate-200/80 py-12 px-5 sm:px-8 mt-4"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Section Header */}
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/15 text-teal-900 border border-teal-600/30 inline-block">
                  Workspace Finansial Terpadu
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Semua yang Kamu Butuhkan untuk Uang & Hari-Harimu
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Pockito bukan cuma aplikasi pencatat pengeluaran biasa. Kami mendesain sistem pengelolaan keuangan yang realistis untuk kebiasaan sehari-hari.
                </p>
              </div>

              {/* Feature Cards Grid (2 columns on tablet/desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
                {FEATURES.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                          {feat.icon}
                        </div>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${feat.badgeColor}`}
                        >
                          {feat.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          {feat.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    {/* Bullet Highlights */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      {feat.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* STAGE 3: INTERACTIVE DEMO CTA CALLOUT */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl text-center space-y-5 mt-8">
                <div className="space-y-2 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 border border-teal-400/30 text-teal-300 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tanpa Komitmen • 100% Gratis</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    Mau Buktikan Sendiri Cara Kerjanya?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    Masuk ke mode demo dengan data simulasi Rp 15.000.000. Coba atur kantong, kunci tabungan, dan catat belanja tanpa perlu mendaftar.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={handleGuestDemo}
                    disabled={isDemoLoading}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isDemoLoading ? 'Membuka...' : 'Buka Dashboard Demo Sekarang'}</span>
                  </button>

                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* MINIMALIST FOOTER */}
          <footer className="w-full py-8 px-5 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
            <div className="flex items-center justify-center gap-4 font-bold">
              <Link to="/login" className="hover:text-slate-900 transition-colors">Masuk</Link>
              <span>•</span>
              <Link to="/register" className="hover:text-slate-900 transition-colors">Daftar Akun</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-slate-900 transition-colors">Kebijakan Privasi</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-slate-900 transition-colors">Syarat & Ketentuan</Link>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              © {new Date().getFullYear()} Pockito. Workspace Finansial & Produktivitas Pribadi.
            </p>
          </footer>
        </main>
      )}

      {/* ============================================================
          VIEW 2: TOUR PLAY CAROUSEL (3 Slide Guided Walkthrough)
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

            {/* Right Column: Narration, Speech Bubble & Actions */}
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
                  {isLastSlide ? 'Selesai — Masuk ke Akun' : 'Lanjut ke Slide Berikutnya'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  className="w-full text-xs rounded-full"
                  onClick={handleGuestDemo}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
                >
                  Coba Mode Demo Langsung (Tanpa Daftar)
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
              {isLastSlide ? 'Selesai — Masuk ke Akun' : 'Lanjut'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              className="w-full text-xs rounded-full"
              onClick={handleGuestDemo}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
            >
              Coba Mode Demo Langsung
            </Button>
          </footer>
        </main>
      )}

      <div className="h-1" />
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { StatCards } from '../components/dashboard/StatCards';
import { SafeDailyLimitCard } from '../components/dashboard/SafeDailyLimitCard';
import { EmergencyRunwayCard } from '../components/dashboard/EmergencyRunwayCard';
import { BudgetDonut } from '../components/dashboard/BudgetDonut';
import { PocketCard } from '../components/pockets/PocketCard';
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { TodayTasksCard } from '../components/dashboard/TodayTasksCard';
import { TaskModal } from '../components/planner/TaskModal';
import { GoalModal } from '../components/goals/GoalModal';
import { SubscriptionModal } from '../components/subscriptions/SubscriptionModal';
import { DebtModal } from '../components/debts/DebtModal';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { TransactionHistoryModal } from '../components/dashboard/TransactionHistoryModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  CalendarClock,
  HandCoins,
  Wallet,
  Eye,
  EyeOff,
  PiggyBank,
  PieChart,
  Plus,
  Info,
  SlidersHorizontal,
  Zap,
  Sparkles,
  BarChart3,
  LayoutGrid,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';

interface DashboardPrefs {
  // Pintasan di bawah Sisa Budget (Bisa dipilih sesuai kebutuhan user)
  showShortcutSubscriptions: boolean;
  showShortcutDebts: boolean;
  showShortcutGoals: boolean;
  showShortcutReports: boolean;
  showShortcutPlanner: boolean;
  showShortcutTransactions: boolean;

  // Bagian modul lainnya
  showGuardrails: boolean;
  showDonutChart: boolean;
  showPocketMarquee: boolean;
  showRecentTransactions: boolean;
  showTasksAndShopping: boolean;
  showFinancialHub: boolean;
}

const DEFAULT_PREFS: DashboardPrefs = {
  showShortcutSubscriptions: true,
  showShortcutDebts: true,
  showShortcutGoals: true,
  showShortcutReports: true,
  showShortcutPlanner: true,
  showShortcutTransactions: true,

  showGuardrails: false, // Default false to eliminate pagu/budget limit clutter
  showDonutChart: true,
  showPocketMarquee: true,
  showRecentTransactions: true,
  showTasksAndShopping: true,
  showFinancialHub: true,
};

const PREFS_STORAGE_KEY = 'pockito_dashboard_prefs';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    overview,
    pocketSummaries,
    transactions,
    pockets,
    tasks,
    goals,
    subscriptions,
    debts,
    dailySafeLimit,
    formatMoney,
    isPrivacyMode,
    togglePrivacyMode,
    selectedPeriod,
    accounts,
  } = useData();
  const { showToast } = useNotification();
  const { theme, isDark } = useTheme();

  // Dashboard Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [financialHubTab, setFinancialHubTab] = useState<'goals' | 'subscriptions' | 'debts'>('goals');
  const [guardrailTab, setGuardrailTab] = useState<'daily_limit' | 'runway'>('daily_limit');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isBalanceInfoOpen, setIsBalanceInfoOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const [viewHistoryType, setViewHistoryType] = useState<'income' | 'expense' | null>(null);

  // Dashboard Preferences (Show/Hide sections as requested in feedback #9 & #12)
  const [prefs, setPrefs] = useState<DashboardPrefs>(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_PREFS;
  });

  const togglePref = (key: keyof DashboardPrefs) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const resetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
    try {
      localStorage.removeItem(PREFS_STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Tampilan dashboard dikembalikan ke tata letak bawaan.', 'info');
  };

  // Duplicate items for continuous 100% seamless marquee loop on mobile
  const marqueePockets =
    pocketSummaries.length < 3
      ? [...pocketSummaries, ...pocketSummaries, ...pocketSummaries, ...pocketSummaries]
      : [...pocketSummaries, ...pocketSummaries];

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getUserDisplayName = () => {
    if (!user?.full_name) return 'Kawan';
    const trimmed = user.full_name.trim();
    if (trimmed.toLowerCase() === 'pengguna pockito' || trimmed.toLowerCase() === 'pengguna') {
      return 'Kawan';
    }
    return trimmed.split(' ')[0];
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* 1. Top Header Row: User Avatar & Greeting (Clean & Compact without Redundant Pills) */}
      <div className="flex items-center gap-2.5 min-w-0 pt-0.5">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-brand-primary/25 dark:bg-brand-primary/30 border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center font-black text-teal-950 dark:text-teal-100 shadow-saweria-xs shrink-0 overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm sm:text-base font-black">{getUserDisplayName().charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-xs font-bold text-brand-darkMuted dark:text-slate-400 block leading-tight">
            {getGreeting()},
          </span>
          <h2 className="text-base sm:text-lg md:text-xl font-black text-brand-dark dark:text-slate-100 tracking-tight leading-tight truncate">
            {getUserDisplayName()}! 👋
          </h2>
        </div>
      </div>

      {/* 2. Hero Card: Total Saldo Riil (Dynamic theme: Yellow in Saweria, Teal in Teal-Mint, Midnight in Midnight Dark) */}
      {(() => {
        const activeHeroTheme = isDark || theme === 'midnight' ? 'midnight' : theme === 'saweria' ? 'saweria' : 'teal-mint';
        const heroStyles = {
          saweria: {
            card: 'bg-gradient-to-br from-[#FFE366] via-[#FFD233] to-[#F5BA00] text-brand-dark border-2 border-brand-dark shadow-saweria',
            watermark1: 'bg-white/30',
            watermark2: 'bg-black/5',
            label: 'text-amber-950 font-black',
            infoBtn: 'bg-black/10 hover:bg-black/20 text-brand-dark border-black/15',
            privacyBtn: isPrivacyMode ? 'bg-black/30 text-white border-black/30' : 'bg-black/10 hover:bg-black/20 text-brand-dark border-black/15',
            periodChip: 'bg-black/10 text-brand-dark border-black/15 font-black',
            balanceNumber: 'text-brand-dark drop-shadow-none',
            footerBorder: 'border-black/15',
            statusDot: 'bg-emerald-600 border-emerald-700',
            statusText: 'text-amber-950 font-bold',
            catatBtn: 'bg-brand-dark hover:bg-black text-white border-2 border-brand-dark shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5',
          },
          'teal-mint': {
            card: 'bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E] text-white border-2 border-brand-dark shadow-saweria',
            watermark1: 'bg-white/15',
            watermark2: 'bg-black/10',
            label: 'text-teal-100 font-black',
            infoBtn: 'bg-white/20 hover:bg-white/30 text-white border-white/20',
            privacyBtn: isPrivacyMode ? 'bg-black/30 text-white border-white/30' : 'bg-white/20 hover:bg-white/30 text-white border-white/20',
            periodChip: 'bg-white/20 text-white border-white/30 font-black',
            balanceNumber: 'text-white drop-shadow-sm',
            footerBorder: 'border-white/20',
            statusDot: 'bg-emerald-300 border-emerald-400',
            statusText: 'text-teal-100 font-bold',
            catatBtn: 'bg-[#0F2E28] hover:bg-black text-teal-100 hover:text-white border-2 border-teal-300/40 shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5 font-black',
          },
          midnight: {
            card: 'bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white border-2 border-teal-500/50 shadow-saweria',
            watermark1: 'bg-teal-500/10',
            watermark2: 'bg-black/30',
            label: 'text-teal-300 font-black',
            infoBtn: 'bg-slate-800/80 hover:bg-slate-700 text-teal-300 border-teal-500/30',
            privacyBtn: isPrivacyMode ? 'bg-black/50 text-teal-300 border-teal-500/40' : 'bg-slate-800/80 hover:bg-slate-700 text-teal-300 border-teal-500/30',
            periodChip: 'bg-slate-800/80 text-teal-300 border-teal-500/30 font-black',
            balanceNumber: 'text-white drop-shadow-md',
            footerBorder: 'border-teal-500/30',
            statusDot: 'bg-teal-400 border-teal-300',
            statusText: 'text-teal-200 font-bold',
            catatBtn: 'bg-teal-500 hover:bg-teal-400 text-white border-2 border-teal-300 shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5 font-black',
          },
        }[activeHeroTheme];

        return (
          <div className={`relative rounded-3xl ${heroStyles.card} p-5 sm:p-6 overflow-hidden transition-all`}>
            {/* Subtle geometric watermark/accent */}
            <div className={`absolute -right-8 -bottom-8 w-44 h-44 rounded-full ${heroStyles.watermark1} pointer-events-none`} />
            <div className={`absolute -right-2 -top-12 w-28 h-28 rounded-full ${heroStyles.watermark2} pointer-events-none`} />

            <div className="relative z-10 flex flex-col justify-between gap-4 sm:gap-5">
              {/* Card Top Row: Label + Info + Privacy Toggle + Period Chip */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs sm:text-sm uppercase tracking-wider ${heroStyles.label}`}>
                    Total Saldo Riil
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsBalanceInfoOpen(true)}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${heroStyles.infoBtn}`}
                    title="Pelajari bagaimana Saldo Riil dihitung dan diakumulasikan setiap bulan"
                  >
                    <Info className="w-2.5 h-2.5 stroke-[2.5]" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Privacy Eye Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      togglePrivacyMode();
                      showToast(
                        !isPrivacyMode
                          ? 'Mode Privasi Aktif: Saldo disensor 👁️'
                          : 'Mode Privasi Nonaktif: Saldo ditampilkan',
                        'info'
                      );
                    }}
                    className={`p-1.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${heroStyles.privacyBtn}`}
                    title={isPrivacyMode ? 'Buka sensor saldo' : 'Sensor nominal saldo'}
                    aria-label={isPrivacyMode ? 'Buka sensor saldo' : 'Sensor nominal saldo'}
                  >
                    {isPrivacyMode ? (
                      <EyeOff className="w-3.5 h-3.5 stroke-[2.4]" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                    )}
                  </button>

                  {/* Period Dropdown Chip */}
                  <span className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-black border shadow-saweria-xs flex items-center gap-1 backdrop-blur-sm ${heroStyles.periodChip}`}>
                    <span>{selectedPeriod}</span>
                  </span>
                </div>
              </div>

              {/* Card Center: Hero Balance Number */}
              <div className="py-0.5">
                <div className={`text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tight ${heroStyles.balanceNumber}`}>
                  {formatMoney(overview.totalRecordedBalance)}
                </div>
              </div>

              {/* Card Bottom Row: Account Info + Catat Gaji Button */}
              <div className={`flex items-center justify-between gap-2 pt-2 border-t ${heroStyles.footerBorder}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full animate-pulse border ${heroStyles.statusDot}`} />
                  <span className={`text-xs ${heroStyles.statusText}`}>
                    Kas & Bank Aktif
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(true)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-black text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${heroStyles.catatBtn}`}
                  title="Catat Gaji Bulanan atau Pemasukan Baru"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Catat Gaji</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. Two Metric Cards: Pengeluaran (Left) & Pemasukan (Right) - Matching Screenshot 1 (Tanpa Pagu / Sisa Budget) */}
      <StatCards
        overview={overview}
        onSelectType={(type) => setViewHistoryType(type)}
        showBudgetRemaining={false}
      />

      {/* 4. Pintasan Fitur (8 Icon Grid - Matching Screenshot 2: Clean, Circular & Familiar) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-brand-dark dark:border-slate-800 shadow-saweria p-4 sm:p-5 space-y-3 transition-colors">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-sm font-black text-brand-dark dark:text-slate-100 uppercase tracking-wider">
              Pintasan Fitur
            </h3>
            <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 hidden sm:inline">
              (Akses cepat 1-ketukan)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCustomizeOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3 text-brand-primary" />
            <span>Atur Tampilan</span>
          </button>
        </div>

        {/* 8-Icon Grid: 4 cols on mobile, 8 cols on desktop */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 pt-1">
          {/* 1. Tagihan */}
          <Link
            to="/app/subscriptions"
            className="flex flex-col items-center group text-center cursor-pointer select-none"
            title="Kelola Tagihan Rutin (Listrik, Wifi, Air)"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-amber-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 active:scale-95 transition-all">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4] fill-amber-500/20" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
              Tagihan
            </span>
          </Link>

          {/* 2. Hutang */}
          <Link
            to="/app/debts"
            className="flex flex-col items-center group text-center cursor-pointer select-none"
            title="Kelola Hutang & Piutang"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-purple-100 to-purple-50 dark:from-purple-950/60 dark:to-purple-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 active:scale-95 transition-all">
              <HandCoins className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
              Hutang
            </span>
          </Link>

          {/* 3. Tabungan */}
          <Link
            to="/app/goals"
            className="flex flex-col items-center group text-center cursor-pointer select-none"
            title="Target Tabungan & Dana Impian"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-950/60 dark:to-sky-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 active:scale-95 transition-all">
              <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
              Tabungan
            </span>
          </Link>

          {/* 4. Kantong */}
          <Link
            to="/app/budget"
            className="flex flex-col items-center group text-center cursor-pointer select-none"
            title="Alokasi Kantong Belanja"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-emerald-100 to-emerald-50 dark:from-emerald-950/60 dark:to-emerald-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 active:scale-95 transition-all">
              <PieChart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
              Kantong
            </span>
          </Link>

          {/* 5. Belanja */}
          <Link
            to="/app/planner"
            className="flex flex-col items-center group text-center cursor-pointer select-none"
            title="Planner & Checklist Belanja Pokok"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-rose-100 to-rose-50 dark:from-rose-950/60 dark:to-rose-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 active:scale-95 transition-all">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
              Belanja
            </span>
          </Link>

          {/* 6. Scan AI */}
          <button
            type="button"
            onClick={() => {
              showToast('Buka fitur AI Receipt Scanner di tombol Catat Transaksi!', 'info');
            }}
            className="flex flex-col items-center group text-center cursor-pointer select-none"
            title="Scan Struk Belanja dengan AI Gemini"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-teal-100 to-teal-50 dark:from-teal-950/60 dark:to-teal-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 active:scale-95 transition-all">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
              Scan AI
            </span>
          </button>

          {/* 7. Laporan */}
          <Link
            to="/app/reports"
            className="flex flex-col items-center group text-center cursor-pointer select-none"
            title="Laporan Keuangan & Analisis Arus Kas"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-cyan-100 to-cyan-50 dark:from-cyan-950/60 dark:to-cyan-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 active:scale-95 transition-all">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
              Laporan
            </span>
          </Link>

          {/* 8. Mutasi */}
          <Link
            to="/app/transactions"
            className="flex flex-col items-center group text-center cursor-pointer select-none"
            title="Semua Mutasi & Buku Kas"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-indigo-100 to-indigo-50 dark:from-indigo-950/60 dark:to-indigo-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 active:scale-95 transition-all">
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
              Mutasi
            </span>
          </Link>
        </div>
      </div>

      {/* 4. Financial Guardrails: Sleek Tabbed Folder Card (Matching Image 3: No bottom border, no circle bullets, responsive labels & smooth transitions) */}
      {prefs.showGuardrails && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-brand-dark dark:border-slate-800 shadow-saweria overflow-hidden transition-all">
          {/* Top Folder Tab Header (Seamless like Image 3: No dividing line, no bullets) */}
          <div className="p-2 sm:p-2.5 bg-brand-cream/60 dark:bg-slate-950/40">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1 bg-white/70 dark:bg-slate-900/60 rounded-2xl border-2 border-brand-dark/15 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setGuardrailTab('daily_limit')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 cursor-pointer ${
                  guardrailTab === 'daily_limit'
                    ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-xs scale-[1.01]'
                    : 'text-brand-darkMuted dark:text-slate-400 border-2 border-transparent hover:text-brand-dark dark:hover:text-slate-200 hover:bg-white/50'
                }`}
              >
                <CalendarCheck className="w-4 h-4 stroke-[2.3] shrink-0" />
                <span className="whitespace-nowrap">
                  <span className="sm:hidden">Batas Belanja</span>
                  <span className="hidden sm:inline">Batas Belanja Harian</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setGuardrailTab('runway')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 cursor-pointer ${
                  guardrailTab === 'runway'
                    ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-xs scale-[1.01]'
                    : 'text-brand-darkMuted dark:text-slate-400 border-2 border-transparent hover:text-brand-dark dark:hover:text-slate-200 hover:bg-white/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.3]" />
                <span className="whitespace-nowrap">
                  <span className="sm:hidden">Dana Darurat</span>
                  <span className="hidden sm:inline">Ketahanan Kas Darurat</span>
                </span>
              </button>
            </div>
          </div>

          {/* Active Tab Content Display with Smooth Animated Transition */}
          <div className="p-3.5 sm:p-5">
            <div
              key={guardrailTab}
              className="animate-in fade-in slide-in-from-top-1 duration-250"
            >
              {guardrailTab === 'daily_limit' ? (
                <SafeDailyLimitCard safeLimit={dailySafeLimit} embedded={true} />
              ) : (
                <EmergencyRunwayCard embedded={true} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Middle Section: Donut Allocation Breakdown + Pocket Summary Cards */}
      {(prefs.showDonutChart || prefs.showPocketMarquee) && (
        <div className={`grid grid-cols-1 ${prefs.showDonutChart && prefs.showPocketMarquee ? 'lg:grid-cols-3' : ''} gap-4 sm:gap-6 items-start`}>
          {/* Left: Donut Chart Card */}
          {prefs.showDonutChart && (
            <Card variant="saweria" className="bg-white">
              <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border">
                <div>
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">
                    Distribusi Alokasi Gaji
                  </h3>
                  <p className="text-[11px] text-brand-darkMuted mt-0.5">
                    Target pengeluaran per kantong
                  </p>
                </div>
                <Link
                  to="/app/budget"
                  className="text-xs font-black text-brand-dark hover:text-brand-primaryHover"
                >
                  Atur
                </Link>
              </div>

              <div className="py-2">
                <BudgetDonut
                  pocketSummaries={pocketSummaries}
                  monthlyIncome={overview.monthlyIncome}
                  unallocatedPercentage={overview.unallocatedPercentage}
                  unallocatedIncome={overview.unallocatedIncome}
                />
              </div>
            </Card>
          )}

          {/* Right: Quick Pockets Grid */}
          {prefs.showPocketMarquee && (
            <div className={`${prefs.showDonutChart ? 'lg:col-span-2' : ''} space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-brand-dark tracking-tight">
                  Status Kantong Pengeluaran ({pocketSummaries.length})
                </h3>
                <Link
                  to="/app/budget"
                  className="text-xs font-black text-brand-dark hover:text-brand-primaryHover flex items-center gap-1 group"
                >
                  <span>Kelola Semua</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {pocketSummaries.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-brand-dark p-6 text-center space-y-3 shadow-saweria">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border-2 border-brand-dark flex items-center justify-center mx-auto text-brand-dark shadow-saweria-sm">
                    <Wallet className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-brand-dark">Belum Ada Kantong Anggaran</h4>
                    <p className="text-xs text-brand-darkMuted max-w-sm mx-auto font-medium">
                      Alokasikan gajimu ke pos-pos penting (Makanan, Kos, Tabungan) agar arus kas terarah rapi dan terkontrol.
                    </p>
                  </div>
                  <Link
                    to="/app/budget"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-brand-primaryText border-2 border-brand-dark text-xs font-black shadow-saweria-sm hover:bg-brand-primaryHover transition-all active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <span>Mulai Buat Kantong Pertamamu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="relative w-full overflow-hidden rounded-2xl py-1">
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-brand-cream to-transparent z-10" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-brand-cream to-transparent z-10" />

                  <div
                    className={`animate-marquee flex gap-3.5 ${isMarqueePaused ? 'animation-paused' : ''}`}
                    onTouchStart={() => setIsMarqueePaused(true)}
                    onTouchEnd={() => setTimeout(() => setIsMarqueePaused(false), 800)}
                    onMouseEnter={() => setIsMarqueePaused(true)}
                    onMouseLeave={() => setIsMarqueePaused(false)}
                  >
                    {marqueePockets.map((pocket, idx) => (
                      <div key={`marquee-pocket-${pocket.id}-${idx}`} className="w-[280px] sm:w-[310px] shrink-0">
                        <PocketCard pocket={pocket} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. Side-by-side Recent Transactions & Smart Shopping / Task Checklist (Menjawab Feedback #10) */}
      {(prefs.showRecentTransactions || prefs.showTasksAndShopping) && (
        <div className={`grid grid-cols-1 ${prefs.showRecentTransactions && prefs.showTasksAndShopping ? 'md:grid-cols-2' : ''} gap-4 sm:gap-6 items-stretch`}>
          {prefs.showRecentTransactions && (
            <RecentTransactionsCard transactions={transactions} pockets={pockets} />
          )}
          {prefs.showTasksAndShopping && (
            <TodayTasksCard
              tasks={tasks}
              onOpenNewTask={() => setIsTaskModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* 7. Unified Financial Commitments Hub (Target, Tagihan, Hutang) (Menjawab Feedback #12) */}
      {prefs.showFinancialHub && (
        <Card variant="saweria" className="bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-brand-border">
            {/* Tab Selector (Fixed to grid grid-cols-3 so Hutang (2) is never cut off on mobile) */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-brand-cream/80 dark:bg-slate-800 rounded-2xl border-2 border-brand-dark/20 dark:border-slate-700 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFinancialHubTab('goals')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  financialHubTab === 'goals'
                    ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-xs'
                    : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200'
                }`}
              >
                <Target className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span className="whitespace-nowrap">Target ({goals.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFinancialHubTab('subscriptions')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  financialHubTab === 'subscriptions'
                    ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-xs'
                    : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span className="whitespace-nowrap">Tagihan ({subscriptions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFinancialHubTab('debts')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  financialHubTab === 'debts'
                    ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-xs'
                    : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200'
                }`}
              >
                <HandCoins className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span className="whitespace-nowrap">Hutang ({debts.filter((d) => !d.is_settled).length})</span>
              </button>
            </div>

            {/* Direct Create Action */}
            <div className="flex items-center gap-2">
              {financialHubTab === 'goals' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsGoalModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Buat Target Baru
                </Button>
              )}
              {financialHubTab === 'subscriptions' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Tambah Tagihan
                </Button>
              )}
              {financialHubTab === 'debts' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsDebtModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Catat Hutang/Piutang
                </Button>
              )}
            </div>
          </div>

          {/* Tab 1: Goals */}
          {financialHubTab === 'goals' && (
            <div className="pt-3.5 space-y-3">
              {goals.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-brand-cream/50 border border-brand-border space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-brand-dark mx-auto flex items-center justify-center text-emerald-800 shadow-saweria-xs">
                    <Target className="w-6 h-6 stroke-[2.3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-brand-dark">Belum Ada Target Tabungan Impian</h4>
                    <p className="text-xs font-bold text-brand-darkMuted mt-0.5">
                      Rencanakan dana liburan, gadget impian, atau dana darurat secara terarah.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsGoalModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    + Buat Target Tabungan Pertama
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {goals.slice(0, 3).map((goal) => {
                      const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                      return (
                        <div key={goal.id} className="p-3.5 rounded-2xl bg-brand-cream border border-brand-border space-y-2 flex flex-col justify-between hover:bg-brand-cream/80 transition-colors">
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
                              <span className="truncate pr-2 font-black">{goal.name}</span>
                              <span className="font-black text-brand-primary shrink-0">{percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full bg-brand-primary rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-2">
                            <span className="text-[10px] text-brand-darkMuted font-bold">Terkumpul:</span>
                            <span className="font-black text-brand-dark tabular-nums">{formatMoney(goal.current_amount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link
                      to="/app/goals"
                      className="text-xs font-black text-brand-dark hover:text-brand-primary flex items-center gap-1 group"
                    >
                      <span>Lihat Semua Target ({goals.length})</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 2: Subscriptions */}
          {financialHubTab === 'subscriptions' && (
            <div className="pt-3.5 space-y-3">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-brand-cream/50 border border-brand-border space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-brand-dark mx-auto flex items-center justify-center text-sky-800 shadow-saweria-xs">
                    <CalendarClock className="w-6 h-6 stroke-[2.3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-brand-dark">Belum Ada Tagihan Rutin</h4>
                    <p className="text-xs font-bold text-brand-darkMuted mt-0.5">
                      Catat tagihan listrik PLN, wifi, BPJS, atau langganan agar tidak telat bayar.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    + Tambah Tagihan Pertama
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {subscriptions.slice(0, 3).map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 rounded-2xl bg-brand-cream border border-brand-border flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-black text-brand-dark block truncate">{sub.name}</span>
                          <span className="text-[10px] font-bold text-brand-darkMuted block truncate">
                            Jatuh tempo tgl {sub.due_day}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-brand-dark tabular-nums block">
                            {formatMoney(sub.amount)}
                          </span>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded border border-sky-300">
                            Rutin
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link
                      to="/app/subscriptions"
                      className="text-xs font-black text-brand-dark hover:text-brand-primary flex items-center gap-1 group"
                    >
                      <span>Lihat Semua Tagihan ({subscriptions.length})</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 3: Debts */}
          {financialHubTab === 'debts' && (
            <div className="pt-3.5 space-y-3">
              {debts.filter((d) => !d.is_settled).length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-brand-cream/50 border border-brand-border space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 border-2 border-brand-dark mx-auto flex items-center justify-center text-rose-800 shadow-saweria-xs">
                    <HandCoins className="w-6 h-6 stroke-[2.3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-brand-dark">Tidak Ada Hutang / Piutang Aktif</h4>
                    <p className="text-xs font-bold text-brand-darkMuted mt-0.5">
                      Catat pinjaman uang atau uang yang dipinjam teman agar tidak ada yang lupa.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsDebtModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    + Catat Pinjaman / Piutang Baru
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {debts
                      .filter((d) => !d.is_settled)
                      .slice(0, 3)
                      .map((debt) => {
                        const isRec = debt.type === 'receivable';
                        const remaining = Math.max(0, debt.amount - debt.paid_amount);
                        return (
                          <div
                            key={debt.id}
                            className="p-3 rounded-2xl bg-brand-cream border border-brand-border flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                                    isRec
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border-rose-300'
                                  }`}
                                >
                                  {isRec ? 'Piutang' : 'Hutang'}
                                </span>
                                <span className="text-xs font-black text-brand-dark">{debt.person_name}</span>
                              </div>
                              <div className="text-[11px] font-bold text-brand-darkMuted mt-0.5">
                                {debt.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-black text-brand-dark tabular-nums">
                                {formatMoney(remaining)}
                              </div>
                              <div className="text-[10px] font-bold text-brand-darkMuted">
                                {debt.due_date ? `Target ${debt.due_date}` : 'Belum lunas'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link
                      to="/app/debts"
                      className="text-xs font-black text-brand-dark hover:text-brand-primary flex items-center gap-1 group"
                    >
                      <span>Buka Buku Hutang ({debts.filter((d) => !d.is_settled).length})</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      )}

      {/* MODALS */}

      {/* 1. Modal: Memahami Saldo Riil & Gaji Bulanan (Menjawab Feedback #14 & #16) */}
      <Modal
        isOpen={isBalanceInfoOpen}
        onClose={() => setIsBalanceInfoOpen(false)}
        title="Memahami Saldo Riil & Arus Gaji"
        subtitle="Panduan transparan cara Pockito mengelola uang kas dan rencana kantong Anda"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-2">
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
              1. Apa itu "Saldo Riil"?
            </h4>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              <b>Saldo Riil</b> adalah uang kas nyata yang saat ini benar-benar ada di tangan Anda (akumulasi uang tunai di dompet ditambah saldo di rekening bank aktif). Setiap ada uang masuk atau keluar aktual, Saldo Riil otomatis bertambah atau berkurang.
            </p>
          </div>

          <div className="p-4 bg-sky-50 rounded-2xl border-2 border-sky-300 space-y-2">
            <h4 className="text-xs font-black text-sky-900 uppercase tracking-wide">
              2. Bagaimana Jika Berganti Bulan?
            </h4>
            <p className="text-xs text-sky-950 font-medium leading-relaxed">
              Saldo Riil bersifat <b>kumulatif berkelanjutan</b>. Contoh: Sisa uang Oktober Anda ada Rp 500.000. Saat masuk bulan November dan Anda mencatat gaji Rp 1.300.000, maka Saldo Riil otomatis menjadi <b>Rp 1.800.000</b>. Uang Anda tidak pernah hilang atau di-reset otomatis saat ganti bulan.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2">
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
              3. Saldo Riil vs Rencana Budget Kantong
            </h4>
            <p className="text-xs text-amber-950 font-medium leading-relaxed">
              Pockito memisahkan dengan tegas antara <b>Uang Nyata (Saldo Riil)</b> dan <b>Rencana Belanja (Kantong/Pagu)</b>. Kantong anggaran adalah target panduan belanja bulanan, sedangkan Saldo Riil adalah kas fisik Anda. Jika pengeluaran sebuah kantong melebihi kuota, aplikasi akan memberi tanda peringatan (defisit) agar Anda mengerem belanja, namun uang riil Anda tetap tercatat akurat.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsBalanceInfoOpen(false)}
            >
              Saya Paham! 👍
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Modal: Kustomisasi Tampilan Dashboard (Menjawab Masukan User Soal Pintasan di Bawah Sisa Budget) */}
      <Modal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        title="Atur Tampilan Dashboard & Pintasan"
        subtitle="Pilih kartu pintasan dan modul yang ingin ditampilkan agar dashboard simpel dan relevan bagi Anda"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Section 1: Pintasan di Bawah Sisa Budget */}
          <div className="space-y-2">
            <div className="pb-1 border-b border-brand-border dark:border-slate-800">
              <h4 className="text-xs font-black text-brand-dark dark:text-slate-100 uppercase tracking-wider">
                Kartu Pintasan (di Bawah Sisa Budget)
              </h4>
              <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 mt-0.5">
                Centang kartu yang Anda butuhkan. Contoh: jika tidak punya hutang, Anda bisa mematikannya agar hemat ruang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                { key: 'showShortcutSubscriptions', label: 'Tagihan Rutin', desc: 'Listrik, Wi-Fi, kos, cicilan bulanan' },
                { key: 'showShortcutDebts', label: 'Hutang & Piutang', desc: 'Catatan pinjaman uang & penagihan' },
                { key: 'showShortcutGoals', label: 'Target Tabungan', desc: 'Pos impian tabungan masa depan' },
                { key: 'showShortcutReports', label: 'Laporan Keuangan', desc: 'Analisis & diagram arus kas' },
                { key: 'showShortcutPlanner', label: 'Planner & Belanja', desc: 'Checklist belanja kebutuhan pokok' },
                { key: 'showShortcutTransactions', label: 'Buku Transaksi', desc: 'Riwayat mutasi keluar & masuk' },
              ].map((item) => {
                const k = item.key as keyof DashboardPrefs;
                const isChecked = prefs[k];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-colors select-none ${
                      isChecked
                        ? 'bg-brand-cream/80 dark:bg-slate-800 border-brand-dark dark:border-brand-primary'
                        : 'bg-white dark:bg-slate-900 border-brand-border dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePref(k)}
                      className="w-4 h-4 mt-0.5 rounded text-brand-primary accent-brand-primary cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-black text-brand-dark dark:text-slate-100 block truncate">{item.label}</span>
                      <span className="text-[10px] text-brand-darkMuted dark:text-slate-400 font-medium block truncate">{item.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 2: Modul Lainnya di Dashboard */}
          <div className="space-y-2 pt-2">
            <div className="pb-1 border-b border-brand-border dark:border-slate-800">
              <h4 className="text-xs font-black text-brand-dark dark:text-slate-100 uppercase tracking-wider">
                Modul Konten Lainnya
              </h4>
              <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 mt-0.5">
                Atur bagian modul lain yang tampil di halaman beranda:
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              {[
                { key: 'showTasksAndShopping', label: 'Belanja Pokok & To-Do List', desc: 'Checklist kebutuhan belanja yang memotong saldo otomatis' },
                { key: 'showRecentTransactions', label: 'Riwayat Transaksi Terkini', desc: 'Aktivitas uang masuk dan keluar terbaru' },
                { key: 'showGuardrails', label: 'Batas Belanja Aman & Dana Darurat', desc: 'Analisis limit aman belanja harian' },
                { key: 'showDonutChart', label: 'Grafik Distribusi Alokasi Gaji', desc: 'Diagram donat persentase pembagian kantong' },
                { key: 'showPocketMarquee', label: 'Slider Status Kantong Anggaran', desc: 'Daftar kartu pos anggaran belanja' },
                { key: 'showFinancialHub', label: 'Hub Tab Target, Tagihan & Hutang Piutang', desc: 'Modul komitmen finansial di bagian bawah' },
              ].map((item) => {
                const k = item.key as keyof DashboardPrefs;
                const isChecked = prefs[k];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-colors select-none ${
                      isChecked
                        ? 'bg-brand-cream/80 dark:bg-slate-800 border-brand-dark dark:border-brand-primary'
                        : 'bg-white dark:bg-slate-900 border-brand-border dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePref(k)}
                      className="w-4 h-4 mt-0.5 rounded text-brand-primary accent-brand-primary cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-black text-brand-dark dark:text-slate-100 block">{item.label}</span>
                      <span className="text-[10px] text-brand-darkMuted dark:text-slate-400 font-medium block">{item.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t-2 border-brand-border dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={resetPrefs}
              className="text-xs font-black text-brand-darkMuted dark:text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              Reset ke Bawaan
            </button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCustomizeOpen(false)}
            >
              Simpan & Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Modal: Riwayat Transaksi (Dipicu saat Mengklik Pemasukan / Pengeluaran di Dashboard) */}
      {viewHistoryType && (
        <TransactionHistoryModal
          isOpen={!!viewHistoryType}
          onClose={() => setViewHistoryType(null)}
          type={viewHistoryType}
          period={selectedPeriod}
          transactions={transactions}
          pockets={pockets}
          accounts={accounts}
          formatMoney={formatMoney}
          onOpenNewTransaction={() => {
            if (viewHistoryType === 'income') {
              setIsIncomeModalOpen(true);
            } else {
              setIsTaskModalOpen(true);
            }
          }}
        />
      )}

      {/* Global Quick Modals */}
      <TransactionModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        defaultType="income"
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
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
  Bell,
  PiggyBank,
  PieChart,
  ChevronRight,
  Plus,
  Info,
  SlidersHorizontal,
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
  showShortcutPlanner: false,
  showShortcutTransactions: false,

  showGuardrails: true,
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
    dailyBriefing,
    openBriefing,
    selectedPeriod,
    accounts,
  } = useData();
  const { showToast } = useNotification();

  // Dashboard Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [financialHubTab, setFinancialHubTab] = useState<'goals' | 'subscriptions' | 'debts'>('goals');
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
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Space-Saving Unified Hero: Greeting + Saldo Riil (Clutter Free) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-brand-dark dark:border-slate-800 shadow-saweria flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-colors">
        {/* Left: Compact Greeting & Quick Action Chips */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1 sm:mb-1.5">
            {/* Clickable Daily Briefing Trigger Chip */}
            <button
              type="button"
              onClick={openBriefing}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black border-2 border-brand-dark shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                dailyBriefing.hasUrgentItems
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-brand-primary text-brand-dark hover:bg-brand-primaryHover'
              }`}
              title="Buka Ringkasan Briefing Finansial Hari Ini"
            >
              <Bell className="w-3 h-3 fill-current" />
              <span>
                {dailyBriefing.hasUrgentItems
                  ? `${dailyBriefing.urgentCount} Agenda Mendesak`
                  : `${dailyBriefing.items.length} Agenda Hari Ini`}
              </span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-dark dark:text-slate-100 tracking-tight truncate">
            {getGreeting()}, {getUserDisplayName()}! 👋
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted dark:text-slate-400 mt-0.5">
            Arus kas, alokasi kantong, dan checklist belanjamu terpadu di sini.
          </p>
        </div>

        {/* Right: Saldo Riil Box with Quick Salary Entry (Compact Side-by-Side on Mobile & Desktop) */}
        <div className="flex flex-row items-center justify-between gap-2.5 sm:gap-4 bg-brand-cream/60 dark:bg-slate-950/60 p-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-brand-dark dark:border-slate-800 shadow-saweria-sm shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-black text-brand-darkMuted dark:text-slate-400 uppercase tracking-wider">
                Total Saldo Riil
              </span>

              {/* Informative Help Button (Menjawab Feedback #14 & #16) */}
              <button
                type="button"
                onClick={() => setIsBalanceInfoOpen(true)}
                className="w-4 h-4 rounded-full bg-white dark:bg-slate-800 border border-brand-dark/40 dark:border-slate-700 hover:border-brand-dark flex items-center justify-center text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark transition-colors cursor-pointer"
                title="Pelajari bagaimana Saldo Riil dihitung dan diakumulasikan setiap bulan"
              >
                <Info className="w-2.5 h-2.5 stroke-[2.5]" />
              </button>

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
                className={`p-1 rounded-lg border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                  isPrivacyMode
                    ? 'bg-amber-100 border-brand-dark text-amber-800 shadow-saweria-xs'
                    : 'bg-white dark:bg-slate-800 border-brand-dark/30 dark:border-slate-700 text-brand-darkMuted dark:text-slate-300 hover:text-brand-dark hover:border-brand-dark shadow-saweria-xs'
                }`}
                title={isPrivacyMode ? 'Buka sensor saldo' : 'Sensor nominal saldo'}
                aria-label={isPrivacyMode ? 'Buka sensor saldo' : 'Sensor nominal saldo'}
              >
                {isPrivacyMode ? (
                  <EyeOff className="w-3 h-3 stroke-[2.4] text-amber-700" />
                ) : (
                  <Eye className="w-3 h-3 stroke-[2.2]" />
                )}
              </button>
            </div>

            <div className="text-xl sm:text-2xl font-black text-brand-dark dark:text-slate-100 tabular-nums tracking-tight truncate mt-0.5">
              {formatMoney(overview.totalRecordedBalance)}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] sm:text-[11px] font-bold text-brand-darkMuted dark:text-slate-400 truncate">
                Kas & rekening aktif
              </p>
            </div>
          </div>

          {/* Quick Add Income / Salary Button (Sebelah Saldo Riil di Mobile & Desktop) */}
          <div className="flex items-center justify-end pl-2 sm:pl-3 border-l border-brand-border dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(true)}
              className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-brand-dark font-black text-xs border-2 border-brand-dark dark:border-slate-700 shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
              title="Catat Gaji Bulanan atau Pemasukan Baru"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Catat Gaji</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Headline Stat Cards: Pemasukan (Mint), Pengeluaran (Rose), Sisa Budget (Honey) */}
      <StatCards
        overview={overview}
        onSelectType={(type) => setViewHistoryType(type)}
      />

      {/* 3. Pintasan Menu Tepat di Bawah Sisa Budget (Bisa Dipilih & Diatur User Sesuai Kebutuhan) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5 pt-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-black text-brand-dark dark:text-slate-100 uppercase tracking-wider">
              Pintasan Menu
            </h3>
            <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 hidden sm:inline">
              (Bisa dipilih sesuai kebutuhan)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCustomizeOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-black bg-white dark:bg-slate-800 hover:bg-brand-cream dark:hover:bg-slate-700 text-brand-dark dark:text-slate-200 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            title="Atur pintasan yang ingin dimunculkan atau disembunyikan di bawah Sisa Budget"
          >
            <SlidersHorizontal className="w-3 h-3 text-brand-primary" />
            <span>Atur Pintasan</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* 1. Tagihan Rutin */}
          {prefs.showShortcutSubscriptions && (
            <Link
              to="/app/subscriptions"
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-dark dark:border-slate-800 shadow-saweria-sm hover:bg-brand-cream/80 dark:hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-100 border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs group-hover:scale-105 transition-transform">
                  <CalendarClock className="w-4 h-4 text-sky-900 stroke-[2.3]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-brand-dark dark:text-slate-100 block truncate">Tagihan Rutin</span>
                  <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 block truncate">
                    {subscriptions.length} tagihan aktif
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="w-6 h-6 rounded-lg bg-sky-200/70 hover:bg-sky-300 text-sky-900 border border-brand-dark/40 flex items-center justify-center transition-all active:scale-90"
                  title="Tambah Tagihan Baru"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-brand-darkMuted group-hover:text-brand-dark hidden sm:inline" />
              </div>
            </Link>
          )}

          {/* 2. Hutang & Piutang */}
          {prefs.showShortcutDebts && (
            <Link
              to="/app/debts"
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-dark dark:border-slate-800 shadow-saweria-sm hover:bg-brand-cream/80 dark:hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-100 border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs group-hover:scale-105 transition-transform">
                  <HandCoins className="w-4 h-4 text-rose-900 stroke-[2.3]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-brand-dark dark:text-slate-100 block truncate">Hutang Piutang</span>
                  <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 block truncate">
                    {debts.filter((d) => !d.is_settled).length} aktif
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDebtModalOpen(true);
                  }}
                  className="w-6 h-6 rounded-lg bg-rose-200/70 hover:bg-rose-300 text-rose-900 border border-brand-dark/40 flex items-center justify-center transition-all active:scale-90"
                  title="Catat Hutang/Piutang Baru"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-brand-darkMuted group-hover:text-brand-dark hidden sm:inline" />
              </div>
            </Link>
          )}

          {/* 3. Target Tabungan */}
          {prefs.showShortcutGoals && (
            <Link
              to="/app/goals"
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-dark dark:border-slate-800 shadow-saweria-sm hover:bg-brand-cream/80 dark:hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs group-hover:scale-105 transition-transform">
                  <PiggyBank className="w-4 h-4 text-emerald-900 stroke-[2.3]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-brand-dark dark:text-slate-100 block truncate">Target Tabungan</span>
                  <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 block truncate">
                    {goals.length} target impian
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsGoalModalOpen(true);
                  }}
                  className="w-6 h-6 rounded-lg bg-emerald-200/70 hover:bg-emerald-300 text-emerald-900 border border-brand-dark/40 flex items-center justify-center transition-all active:scale-90"
                  title="Buat Target Baru"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-brand-darkMuted group-hover:text-brand-dark hidden sm:inline" />
              </div>
            </Link>
          )}

          {/* 4. Laporan Keuangan */}
          {prefs.showShortcutReports && (
            <Link
              to="/app/reports"
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-dark dark:border-slate-800 shadow-saweria-sm hover:bg-brand-cream/80 dark:hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs group-hover:scale-105 transition-transform">
                  <PieChart className="w-4 h-4 text-amber-900 stroke-[2.3]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-brand-dark dark:text-slate-100 block truncate">Laporan Keuangan</span>
                  <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 block truncate">
                    Analisis & arus kas
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-darkMuted group-hover:text-brand-dark shrink-0" />
            </Link>
          )}

          {/* 5. Planner & Belanja Pokok */}
          {prefs.showShortcutPlanner && (
            <Link
              to="/app/planner"
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-dark dark:border-slate-800 shadow-saweria-sm hover:bg-brand-cream/80 dark:hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-100 border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs group-hover:scale-105 transition-transform">
                  <Target className="w-4 h-4 text-teal-900 stroke-[2.3]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-brand-dark dark:text-slate-100 block truncate">Planner & Belanja</span>
                  <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 block truncate">
                    {tasks.filter((t) => !t.is_completed).length} tugas aktif
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-darkMuted group-hover:text-brand-dark shrink-0" />
            </Link>
          )}

          {/* 6. Semua Transaksi */}
          {prefs.showShortcutTransactions && (
            <Link
              to="/app/transactions"
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-dark dark:border-slate-800 shadow-saweria-sm hover:bg-brand-cream/80 dark:hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100 border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs group-hover:scale-105 transition-transform">
                  <Wallet className="w-4 h-4 text-purple-900 stroke-[2.3]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-brand-dark dark:text-slate-100 block truncate">Buku Transaksi</span>
                  <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 block truncate">
                    Semua mutasi kas
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-darkMuted group-hover:text-brand-dark shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* 4. Financial Guardrails: Safe Daily Spend Limit & Emergency Runway (Show/Hide configurable) */}
      {prefs.showGuardrails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          <SafeDailyLimitCard safeLimit={dailySafeLimit} />
          <EmergencyRunwayCard />
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary border-2 border-brand-dark text-xs font-black shadow-saweria-sm hover:bg-brand-primaryHover transition-all active:translate-x-0.5 active:translate-y-0.5"
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
            {/* Tab Selector */}
            <div className="flex items-center gap-1 p-1 bg-brand-cream/80 rounded-2xl border-2 border-brand-dark/20 w-fit">
              <button
                type="button"
                onClick={() => setFinancialHubTab('goals')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  financialHubTab === 'goals'
                    ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-xs'
                    : 'text-brand-darkMuted hover:text-brand-dark'
                }`}
              >
                <Target className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Target ({goals.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFinancialHubTab('subscriptions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  financialHubTab === 'subscriptions'
                    ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-xs'
                    : 'text-brand-darkMuted hover:text-brand-dark'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tagihan ({subscriptions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFinancialHubTab('debts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  financialHubTab === 'debts'
                    ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-xs'
                    : 'text-brand-darkMuted hover:text-brand-dark'
                }`}
              >
                <HandCoins className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Hutang ({debts.filter((d) => !d.is_settled).length})</span>
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

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
import { DashboardHeroBalance } from '../components/dashboard/DashboardHeroBalance';
import { DashboardShortcutsGrid } from '../components/dashboard/DashboardShortcutsGrid';
import { DashboardFinancialHub } from '../components/dashboard/DashboardFinancialHub';
import { DashboardBalanceInfoModal } from '../components/dashboard/DashboardBalanceInfoModal';
import {
  DashboardCustomizeModal,
  DashboardPrefs,
} from '../components/dashboard/DashboardCustomizeModal';
import { TaskModal } from '../components/planner/TaskModal';
import { GoalModal } from '../components/goals/GoalModal';
import { SubscriptionModal } from '../components/subscriptions/SubscriptionModal';
import { DebtModal } from '../components/debts/DebtModal';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { TransactionHistoryModal } from '../components/dashboard/TransactionHistoryModal';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Wallet,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';

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

  // Dashboard Modals & Tabs
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

  // Dashboard Preferences (Show/Hide sections)
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

  // Duplicate items for continuous seamless marquee loop on mobile
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
      {/* 1. Top Header Row: User Avatar & Greeting */}
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

      {/* 2. Hero Card: Total Saldo Riil (Modular Component) */}
      <DashboardHeroBalance
        totalBalance={overview.totalRecordedBalance}
        selectedPeriod={selectedPeriod}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacy={togglePrivacyMode}
        onOpenInfoModal={() => setIsBalanceInfoOpen(true)}
        onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
        formatMoney={formatMoney}
      />

      {/* 3. Two Metric Cards: Pengeluaran (Left) & Pemasukan (Right) */}
      <StatCards
        overview={overview}
        onSelectType={(type) => setViewHistoryType(type)}
        showBudgetRemaining={false}
      />

      {/* 4. Pintasan Fitur: 8-Icon Grid (Modular Component) */}
      <DashboardShortcutsGrid onOpenCustomize={() => setIsCustomizeOpen(true)} />

      {/* 5. Financial Guardrails: Tabbed Folder Card */}
      {prefs.showGuardrails && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-brand-dark dark:border-slate-800 shadow-saweria overflow-hidden transition-all">
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

      {/* 6. Middle Section: Donut Allocation Breakdown + Pocket Summary Cards */}
      {(prefs.showDonutChart || prefs.showPocketMarquee) && (
        <div className={`grid grid-cols-1 ${prefs.showDonutChart && prefs.showPocketMarquee ? 'lg:grid-cols-3' : ''} gap-4 sm:gap-6 items-start`}>
          {prefs.showDonutChart && (
            <Card variant="saweria" className="bg-white dark:bg-slate-900 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-brand-dark dark:text-slate-100 uppercase tracking-wider">
                    Distribusi Alokasi Gaji
                  </h3>
                  <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 mt-0.5">
                    Target pengeluaran per kantong
                  </p>
                </div>
                <Link
                  to="/app/budget"
                  className="text-xs font-black text-brand-dark hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-primary"
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

          {prefs.showPocketMarquee && (
            <div className={`${prefs.showDonutChart ? 'lg:col-span-2' : ''} space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-brand-dark dark:text-slate-100 tracking-tight">
                  Status Kantong Pengeluaran ({pocketSummaries.length})
                </h3>
                <Link
                  to="/app/budget"
                  className="text-xs font-black text-brand-dark hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-primary flex items-center gap-1 group"
                >
                  <span>Kelola Semua</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {pocketSummaries.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-brand-dark dark:border-slate-800 p-6 text-center space-y-3 shadow-saweria">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center mx-auto text-brand-dark dark:text-slate-100 shadow-saweria-sm">
                    <Wallet className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-brand-dark dark:text-slate-100">Belum Ada Kantong Anggaran</h4>
                    <p className="text-xs text-brand-darkMuted dark:text-slate-400 max-w-sm mx-auto font-medium">
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
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-brand-cream dark:from-slate-950 to-transparent z-10" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-brand-cream dark:from-slate-950 to-transparent z-10" />

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

      {/* 7. Side-by-side Recent Transactions & Smart Shopping / Task Checklist */}
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

      {/* 8. Unified Financial Commitments Hub (Target, Tagihan, Hutang) (Modular Component) */}
      {prefs.showFinancialHub && (
        <DashboardFinancialHub
          activeTab={financialHubTab}
          onSelectTab={setFinancialHubTab}
          goals={goals}
          subscriptions={subscriptions}
          debts={debts}
          onOpenNewGoal={() => setIsGoalModalOpen(true)}
          onOpenNewSubscription={() => setIsSubscriptionModalOpen(true)}
          onOpenNewDebt={() => setIsDebtModalOpen(true)}
          formatMoney={formatMoney}
        />
      )}

      {/* 9. Educational Modal: Saldo Riil & Gaji (Modular Component) */}
      <DashboardBalanceInfoModal
        isOpen={isBalanceInfoOpen}
        onClose={() => setIsBalanceInfoOpen(false)}
      />

      {/* 10. Customization Modal: Atur Tampilan Dashboard (Modular Component) */}
      <DashboardCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        prefs={prefs}
        onTogglePref={togglePref}
        onResetPrefs={resetPrefs}
      />

      {/* 11. Transaction History Modal */}
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

      {/* Global Quick Action Modals */}
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

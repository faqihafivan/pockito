import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCards } from '../components/dashboard/StatCards';
import { SafeDailyLimitCard } from '../components/dashboard/SafeDailyLimitCard';
import { EmergencyRunwayCard } from '../components/dashboard/EmergencyRunwayCard';
import { BudgetDonut } from '../components/dashboard/BudgetDonut';
import { PocketCard } from '../components/pockets/PocketCard';
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { TodayTasksCard } from '../components/dashboard/TodayTasksCard';
import { TaskModal } from '../components/planner/TaskModal';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Target,
  CalendarClock,
  HandCoins,
  CheckCircle2,
  Wallet,
  Eye,
  EyeOff,
  Bell,
} from 'lucide-react';
import { formatPeriod } from '../domain/finance/financialEngine';

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
    selectedPeriod,
    formatMoney,
    isPrivacyMode,
    togglePrivacyMode,
    dailyBriefing,
    openBriefing,
  } = useData();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);

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

  const periodLabel = formatPeriod(selectedPeriod);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Space-Saving Unified Hero: Greeting + Saldo Riil */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-brand-dark shadow-saweria flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Compact Greeting & Workspace Period */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1 sm:mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-[10px] sm:text-xs font-black text-brand-dark border border-brand-dark/20">
              <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
              <span>Workspace Periode {periodLabel}</span>
            </div>

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
                  : `${dailyBriefing.items.length} Briefing Hari Ini`}
              </span>
            </button>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-dark tracking-tight truncate">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Kawan'}! 👋
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-0.5">
            Pantau arus kas, alokasi kantong, dan pagu harianmu di sini.
          </p>
        </div>

        {/* Right: Saldo Riil Box (Prominent & Space-saving) */}
        <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 bg-brand-bg/60 p-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 border-brand-dark shadow-saweria-sm shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-wider">
                Total Saldo Riil
              </span>
              <button
                type="button"
                onClick={togglePrivacyMode}
                className="text-brand-darkMuted hover:text-brand-dark transition-colors p-0.5"
                title={isPrivacyMode ? 'Buka sensor saldo' : 'Sensor saldo'}
              >
                {isPrivacyMode ? (
                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-brand-dark tabular-nums tracking-tight truncate mt-0.5">
              {formatMoney(overview.totalRecordedBalance)}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] sm:text-[11px] font-bold text-brand-darkMuted truncate">
                Kas & rekening aktif
              </p>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-primary border-2 border-brand-dark flex items-center justify-center text-brand-dark shrink-0 shadow-saweria-sm">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* 2. Headline Stat Cards: Pemasukan, Pengeluaran, Sisa Pagu */}
      <StatCards overview={overview} />

      {/* 3. Financial Guardrails: Safe Daily Spend Limit & Emergency Runway */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <SafeDailyLimitCard safeLimit={dailySafeLimit} />
        <EmergencyRunwayCard />
      </div>

      {/* 4. Middle Section: Donut Allocation Breakdown + Pocket Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Donut Chart Card */}
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

        {/* Right: Quick Pockets Grid (2 Columns on large screens, Auto-sliding Carousel on Mobile) */}
        <div className="lg:col-span-2 space-y-3">
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

          {/* Continuous Infinite Marquee Loop (Mobile, Tablet & Desktop) or Empty State */}
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
              {/* Edge fade gradients for polished fintech aesthetics */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#FFFDF8] to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FFFDF8] to-transparent z-10" />

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
      </div>

      {/* 4. Bottom Section: Side-by-side Recent Transactions & Today's Tasks, and Full-width Savings Goals Below */}
      <div className="space-y-4 sm:space-y-6">
        {/* Row 1: Aktivitas Transaksi Terbaru & Agenda Tugas Bersebelahan (Equal Height) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          <RecentTransactionsCard transactions={transactions} pockets={pockets} />
          <TodayTasksCard
            tasks={tasks}
            onOpenNewTask={() => setIsTaskModalOpen(true)}
          />
        </div>

        {/* Row 2: Target Tabungan Memanjang di Bawah (Full Width Card) */}
        <Card variant="saweria" className="bg-white">
          <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border">
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-primary" />
              <span>Target Tabungan</span>
            </h3>
            <Link
              to="/app/goals"
              className="text-xs font-black text-brand-dark hover:text-brand-primaryHover flex items-center gap-1 group"
            >
              <span>Kelola Semua Target</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="pt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {goals.slice(0, 3).map((goal) => {
              const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
              return (
                <div key={goal.id} className="p-3.5 rounded-2xl bg-brand-cream border border-brand-border space-y-2 flex flex-col justify-between hover:bg-brand-cream/80 transition-colors">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
                      <span className="truncate pr-2 font-black">{goal.name}</span>
                      <span className="font-black text-brand-primary shrink-0">{percent}%</span>
                    </div>
                    <div className="w-full bg-white h-2.5 rounded-full border border-brand-border overflow-hidden mt-2">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-brand-darkMuted pt-1 border-t border-brand-border/40">
                    <span className="text-brand-dark font-black">{formatMoney(goal.current_amount)}</span>
                    <span className="text-[10px]">Target {formatMoney(goal.target_amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Row 3: Tagihan Rutin & Hutang Piutang Mini Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscriptions Widget */}
          <Card variant="saweria" className="bg-white">
            <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border">
              <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-brand-primary" />
                <span>Tagihan Rutin ({periodLabel})</span>
              </h3>
              <Link
                to="/app/subscriptions"
                className="text-xs font-black text-brand-dark hover:text-brand-primaryHover flex items-center gap-1 group"
              >
                <span>Kelola Semua</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="pt-3.5 space-y-2.5">
              {subscriptions.slice(0, 3).map((sub) => {
                const isPaid = sub.last_paid_period === selectedPeriod;
                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-2xl bg-brand-cream border border-brand-border flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-black text-brand-dark">{sub.name}</div>
                      <div className="text-[11px] font-bold text-brand-darkMuted mt-0.5">
                        Tgl {sub.due_day} • {formatMoney(sub.amount)}
                      </div>
                    </div>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Lunas</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-brand-dark border border-brand-border">
                        Belum Bayar
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Debts & Receivables Widget */}
          <Card variant="saweria" className="bg-white">
            <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border">
              <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-brand-primary" />
                <span>Hutang & Piutang Aktif</span>
              </h3>
              <Link
                to="/app/debts"
                className="text-xs font-black text-brand-dark hover:text-brand-primaryHover flex items-center gap-1 group"
              >
                <span>Buka Buku Hutang</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="pt-3.5 space-y-2.5">
              {debts.filter((d) => !d.is_settled).length === 0 ? (
                <div className="text-center py-6 text-xs font-bold text-brand-darkMuted">
                  Tidak ada catatan hutang atau piutang aktif saat ini.
                </div>
              ) : (
                debts
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
                  })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
};

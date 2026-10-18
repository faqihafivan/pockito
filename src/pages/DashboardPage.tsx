import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCards } from '../components/dashboard/StatCards';
import { BudgetDonut } from '../components/dashboard/BudgetDonut';
import { PocketCard } from '../components/pockets/PocketCard';
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { TodayTasksCard } from '../components/dashboard/TodayTasksCard';
import { PocketModal } from '../components/pockets/PocketModal';
import { TaskModal } from '../components/planner/TaskModal';
import { BudgetRecommendationModal } from '../components/pockets/BudgetRecommendationModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  ArrowRight,
  Target,
  SlidersHorizontal,
} from 'lucide-react';
import { formatIDR, formatPeriod } from '../domain/finance/financialEngine';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    overview,
    pocketSummaries,
    transactions,
    pockets,
    tasks,
    goals,
    selectedPeriod,
  } = useData();

  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);

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
      {/* 1. Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-xs font-black text-brand-dark border border-brand-primary/40 mb-1.5 sm:mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
            <span>Workspace Periode {periodLabel}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-brand-dark tracking-tight">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Teman'}! 👋
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-0.5 sm:mt-1">
            Pantau arus kas, alokasi kantong, dan agenda produktivitas harianmu di sini.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsRecommendationOpen(true)}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            Rekomendasi
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPocketModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Kantong
          </Button>
        </div>
      </div>

      {/* 2. Headline Stat Cards */}
      <StatCards overview={overview} />

      {/* 3. Middle Section: Donut Allocation Breakdown + Pocket Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Donut Chart Card */}
        <Card variant="saweria" className="bg-white flex flex-col justify-between">
          <div>
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

            <BudgetDonut
              pocketSummaries={pocketSummaries}
              monthlyIncome={overview.monthlyIncome}
              unallocatedPercentage={overview.unallocatedPercentage}
              unallocatedIncome={overview.unallocatedIncome}
            />

            {/* Desktop-only Pocket Color Breakdown Legend */}
            <div className="hidden lg:block pt-3 border-t-2 border-brand-border space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-brand-darkMuted">
                <span>Keterangan Pos Alokasi</span>
                <span>Porsi / Pagu</span>
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {pocketSummaries.map((pocket) => (
                  <div
                    key={pocket.id}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-brand-cream/60 border border-brand-border/60 hover:bg-brand-cream transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full border border-brand-dark shrink-0 shadow-sm"
                        style={{ backgroundColor: pocket.color }}
                      />
                      <span className="font-bold text-brand-dark truncate">{pocket.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 tabular-nums">
                      <span className="text-[11px] font-extrabold text-brand-darkMuted">
                        {pocket.allocation_percentage}%
                      </span>
                      <span className="font-black text-brand-dark text-xs">
                        {formatIDR(pocket.plannedAmount)}
                      </span>
                    </div>
                  </div>
                ))}
                {overview.unallocatedPercentage > 0 && (
                  <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-brand-cream/40 border border-dashed border-brand-border/80">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-3 h-3 rounded-full border border-brand-dark bg-[#E4E0D7] shrink-0" />
                      <span className="font-bold text-brand-darkMuted truncate">Belum Dialokasi</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 tabular-nums">
                      <span className="text-[11px] font-extrabold text-brand-darkMuted">
                        {overview.unallocatedPercentage}%
                      </span>
                      <span className="font-black text-brand-dark text-xs">
                        {formatIDR(overview.unallocatedIncome)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-brand-border space-y-1.5 mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
              <span>Total Alokasi Kantong:</span>
              <span className={`tabular-nums font-black ${overview.isOverallocated ? 'text-red-600' : 'text-brand-dark'}`}>
                {overview.totalAllocationPercentage}%
              </span>
            </div>
            {overview.unallocatedPercentage > 0 && (
              <div className="flex items-center justify-between text-xs font-bold text-[#047857]">
                <span>Sisa Belum Dialokasikan:</span>
                <span className="tabular-nums font-black">
                  {overview.unallocatedPercentage}% ({formatIDR(overview.unallocatedIncome)})
                </span>
              </div>
            )}
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

          {/* Continuous Infinite Marquee Loop (Mobile, Tablet & Desktop) */}
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
                    <span className="text-brand-dark font-black">{formatIDR(goal.current_amount)}</span>
                    <span className="text-[10px]">Target {formatIDR(goal.target_amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <PocketModal
        isOpen={isPocketModalOpen}
        onClose={() => setIsPocketModalOpen(false)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <BudgetRecommendationModal
        isOpen={isRecommendationOpen}
        onClose={() => setIsRecommendationOpen(false)}
      />
    </div>
  );
};

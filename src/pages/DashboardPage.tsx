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
import { formatIDR } from '../domain/finance/financialEngine';

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

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const periodLabel = selectedPeriod === '2026-10' ? 'Oktober 2026' : selectedPeriod;

  return (
    <div className="space-y-6">
      {/* 1. Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-primary/20 text-xs font-black text-brand-dark border border-brand-primary/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
            <span>Workspace Periode {periodLabel}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Teman'}! 👋
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
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
            + Kantong
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
          </div>

          <div className="pt-3 border-t-2 border-brand-border space-y-1.5">
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

        {/* Right: Quick Pockets Grid (2 Columns on large screens) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-brand-dark tracking-tight">
              Status Kantong Pengeluaran ({pocketSummaries.length})
            </h3>
            <Link
              to="/app/budget"
              className="text-xs font-black text-brand-dark hover:text-brand-primaryHover flex items-center gap-1 group"
            >
              <span>Kelola Semua Kantong</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pocketSummaries.map((pocket) => (
              <PocketCard key={pocket.id} pocket={pocket} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Transactions + Today's Tasks + Savings Goal Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <RecentTransactionsCard transactions={transactions} pockets={pockets} />
        </div>

        {/* Today's Tasks & Goals Snapshot */}
        <div className="space-y-6">
          <TodayTasksCard
            tasks={tasks}
            onOpenNewTask={() => setIsTaskModalOpen(true)}
          />

          {/* Quick Goals Glance */}
          <Card variant="saweria" className="bg-white">
            <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border">
              <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-primary" />
                <span>Target Tabungan</span>
              </h3>
              <Link
                to="/app/goals"
                className="text-xs font-black text-brand-dark hover:text-brand-primaryHover"
              >
                Lihat
              </Link>
            </div>

            <div className="pt-3 space-y-3">
              {goals.slice(0, 2).map((goal) => {
                const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                return (
                  <div key={goal.id} className="p-3 rounded-2xl bg-brand-cream border border-brand-border space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
                      <span>{goal.name}</span>
                      <span className="font-black text-brand-primary">{percent}%</span>
                    </div>
                    <div className="w-full bg-white h-2 rounded-full border border-brand-border overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-brand-darkMuted pt-0.5">
                      <span>{formatIDR(goal.current_amount)}</span>
                      <span>Target {formatIDR(goal.target_amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
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

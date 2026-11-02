import React from 'react';
import { Card } from '../ui/Card';
import { useData } from '../../context/DataContext';
import { FinancialOverview } from '../../types';
import { TrendingUp, TrendingDown, PiggyBank, AlertTriangle } from 'lucide-react';

interface StatCardsProps {
  overview: FinancialOverview;
}

export const StatCards: React.FC<StatCardsProps> = ({ overview }) => {
  const { formatMoney } = useData();

  // Percentage of income already distributed to budget pockets
  const allocatedPercentage = Math.max(0, Math.min(100, 100 - overview.unallocatedPercentage));

  return (
    <div className="space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
      {/* 1 & 2: Pemasukan & Pengeluaran (2 Columns on Mobile for maximum legibility) */}
      <div className="grid grid-cols-2 gap-2.5 sm:contents">
        {/* 1. Pemasukan Bulanan (Soft Mint Background) */}
        <Card
          variant="saweria"
          className="bg-[#EBF6F4] dark:bg-emerald-950/40 border-2 border-emerald-800/30 dark:border-emerald-600/40 p-3 sm:p-4 md:p-5 flex flex-col justify-between hover:translate-y-[-1px] transition-transform"
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Pemasukan
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-200/80 border border-emerald-800/40 flex items-center justify-center text-emerald-900 shrink-0 shadow-saweria-xs">
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl lg:text-2xl font-black text-emerald-950 dark:text-emerald-100 tabular-nums tracking-tight truncate">
              {formatMoney(overview.monthlyIncome)}
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <span>●</span> Kas Masuk Bulan Ini
            </p>
          </div>
        </Card>

        {/* 2. Total Pengeluaran (Soft Blush Rose Background) */}
        <Card
          variant="saweria"
          className="bg-[#FDF2F2] dark:bg-rose-950/40 border-2 border-rose-800/30 dark:border-rose-600/40 p-3 sm:p-4 md:p-5 flex flex-col justify-between hover:translate-y-[-1px] transition-transform"
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Pengeluaran
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-rose-200/80 border border-rose-800/40 flex items-center justify-center text-rose-900 shrink-0 shadow-saweria-xs">
              <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl lg:text-2xl font-black text-rose-950 dark:text-rose-100 tabular-nums tracking-tight truncate">
              {formatMoney(overview.totalMonthlyExpense)}
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5 flex items-center gap-1">
              <span>●</span> Kas Keluar Aktual
            </p>
          </div>
        </Card>
      </div>

      {/* 3. Sisa Budget Anggaran (Soft Honey Background) */}
      <Card
        variant="saweria"
        className={`p-3 sm:p-4 md:p-5 flex flex-col justify-between ${
          overview.isOverallocated
            ? 'bg-red-50 dark:bg-red-950/50 border-2 border-red-600 text-red-900'
            : 'bg-[#FEF9E7] dark:bg-amber-950/40 border-2 border-amber-800/30 dark:border-amber-600/40'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs ${
                overview.isOverallocated
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-200/80 text-amber-900 border-amber-800/40'
              }`}
            >
              {overview.isOverallocated ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <PiggyBank className="w-3.5 h-3.5 stroke-[2.2]" />
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider truncate">
              Sisa Budget
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${
              overview.isOverallocated
                ? 'bg-red-100 text-red-800 border-red-300'
                : overview.unallocatedPercentage === 0
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
            }`}
          >
            {overview.isOverallocated
              ? 'Budget Berlebih'
              : overview.unallocatedPercentage === 0
              ? '100% Terbagi Rapi'
              : `${overview.unallocatedPercentage}% Sisa`}
          </span>
        </div>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <div
              className={`text-base sm:text-xl lg:text-2xl font-black tabular-nums tracking-tight truncate ${
                overview.unallocatedIncome < 0
                  ? 'text-red-600'
                  : overview.isOverallocated
                  ? 'text-red-700'
                  : 'text-amber-950 dark:text-amber-100'
              }`}
            >
              {formatMoney(overview.unallocatedIncome)}
            </div>
            <span className="text-[10px] font-bold text-amber-800/80 dark:text-amber-300/80 hidden sm:inline">
              dari gaji pokok
            </span>
          </div>

          {/* Allocation progress bar */}
          <div className="w-full h-2 bg-amber-100/70 dark:bg-amber-950/60 rounded-full border border-amber-800/20 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overview.isOverallocated
                  ? 'bg-red-500'
                  : allocatedPercentage === 100
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, allocatedPercentage))}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

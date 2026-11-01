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
        {/* 1. Pemasukan Bulanan */}
        <Card
          variant="saweria"
          className="bg-white p-3 sm:p-4 md:p-5 flex flex-col justify-between hover:translate-y-[-1px] transition-transform"
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-wider">
              Pemasukan
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-100 border border-brand-dark flex items-center justify-center text-emerald-800 shrink-0 shadow-saweria-xs">
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl lg:text-2xl font-black text-brand-dark tabular-nums tracking-tight truncate">
              {formatMoney(overview.monthlyIncome)}
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
              <span>●</span> Kas Masuk Bulan Ini
            </p>
          </div>
        </Card>

        {/* 2. Total Pengeluaran */}
        <Card
          variant="saweria"
          className="bg-white p-3 sm:p-4 md:p-5 flex flex-col justify-between hover:translate-y-[-1px] transition-transform"
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-wider">
              Pengeluaran
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-rose-100 border border-brand-dark flex items-center justify-center text-rose-800 shrink-0 shadow-saweria-xs">
              <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl lg:text-2xl font-black text-brand-dark tabular-nums tracking-tight truncate">
              {formatMoney(overview.totalMonthlyExpense)}
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-rose-700 mt-0.5 flex items-center gap-1">
              <span>●</span> Kas Keluar Aktual
            </p>
          </div>
        </Card>
      </div>

      {/* 3. Sisa Pagu Anggaran (Full width on mobile with allocation progress bar, or 3rd column on desktop) */}
      <Card
        variant="saweria"
        className={`p-3 sm:p-4 md:p-5 flex flex-col justify-between ${
          overview.isOverallocated
            ? 'bg-red-50 border-red-600'
            : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs ${
                overview.isOverallocated
                  ? 'bg-red-500 text-white'
                  : 'bg-brand-primary/25 text-brand-dark'
              }`}
            >
              {overview.isOverallocated ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <PiggyBank className="w-3.5 h-3.5 stroke-[2.2]" />
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-wider truncate">
              Sisa Pagu
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${
              overview.isOverallocated
                ? 'bg-red-100 text-red-800 border-red-300'
                : overview.unallocatedPercentage === 0
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-brand-primary/20 text-brand-dark border-brand-dark/20'
            }`}
          >
            {overview.isOverallocated
              ? 'Pagu Berlebih'
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
                  : 'text-brand-dark'
              }`}
            >
              {formatMoney(overview.unallocatedIncome)}
            </div>
            <span className="text-[10px] font-bold text-brand-darkMuted hidden sm:inline">
              dari gaji pokok
            </span>
          </div>

          {/* Allocation progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full border border-brand-dark/20 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overview.isOverallocated
                  ? 'bg-red-500'
                  : allocatedPercentage === 100
                  ? 'bg-emerald-500'
                  : 'bg-brand-primary'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, allocatedPercentage))}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

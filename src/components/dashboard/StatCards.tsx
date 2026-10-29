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

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {/* 1. Pemasukan Bulanan */}
      <Card variant="saweria" className="bg-white p-2 sm:p-4 md:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[8.5px] min-[380px]:text-[9.5px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-tight">
            Pemasukan
          </span>
          <div className="w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-xl bg-[#10B981]/20 border border-brand-dark flex items-center justify-center text-[#047857] shrink-0">
            <TrendingUp className="w-2.5 h-2.5 min-[380px]:w-3 min-[380px]:h-3 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <div className="text-[11px] min-[380px]:text-xs sm:text-lg md:text-xl lg:text-2xl font-black text-brand-dark tabular-nums tracking-tight whitespace-nowrap">
            {formatMoney(overview.monthlyIncome)}
          </div>
          <p className="text-[8.5px] min-[380px]:text-[9.5px] sm:text-[11px] font-bold text-brand-darkMuted mt-0.5 whitespace-nowrap">
            Bulan Ini
          </p>
        </div>
      </Card>

      {/* 2. Total Pengeluaran */}
      <Card variant="saweria" className="bg-white p-2 sm:p-4 md:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[8.5px] min-[380px]:text-[9.5px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-tight">
            Pengeluaran
          </span>
          <div className="w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-xl bg-red-500/15 border border-brand-dark flex items-center justify-center text-red-600 shrink-0">
            <TrendingDown className="w-2.5 h-2.5 min-[380px]:w-3 min-[380px]:h-3 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <div className="text-[11px] min-[380px]:text-xs sm:text-lg md:text-xl lg:text-2xl font-black text-brand-dark tabular-nums tracking-tight whitespace-nowrap">
            {formatMoney(overview.totalMonthlyExpense)}
          </div>
          <p className="text-[8.5px] min-[380px]:text-[9.5px] sm:text-[11px] font-bold text-brand-darkMuted mt-0.5 whitespace-nowrap">
            Kas Keluar
          </p>
        </div>
      </Card>

      {/* 3. Sisa Pagu */}
      <Card
        variant="saweria"
        className={`p-2 sm:p-4 md:p-5 flex flex-col justify-between ${
          overview.isOverallocated ? 'bg-red-50 border-red-600' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[8.5px] min-[380px]:text-[9.5px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-tight">
            Sisa Pagu
          </span>
          <div
            className={`w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-xl border border-brand-dark flex items-center justify-center shrink-0 ${
              overview.isOverallocated
                ? 'bg-red-500 text-white'
                : 'bg-brand-primary/20 text-brand-dark'
            }`}
          >
            {overview.isOverallocated ? (
              <AlertTriangle className="w-2.5 h-2.5 min-[380px]:w-3 min-[380px]:h-3 sm:w-4 sm:h-4" />
            ) : (
              <PiggyBank className="w-2.5 h-2.5 min-[380px]:w-3 min-[380px]:h-3 sm:w-4 sm:h-4" />
            )}
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <div
            className={`text-[11px] min-[380px]:text-xs sm:text-lg md:text-xl lg:text-2xl font-black tabular-nums tracking-tight whitespace-nowrap ${
              overview.unallocatedIncome < 0
                ? 'text-red-600'
                : overview.isOverallocated
                ? 'text-red-700'
                : 'text-brand-dark'
            }`}
          >
            {formatMoney(overview.unallocatedIncome)}
          </div>
          <p className="text-[8.5px] min-[380px]:text-[9.5px] sm:text-[11px] font-bold text-brand-darkMuted mt-0.5 whitespace-nowrap">
            {overview.isOverallocated
              ? 'Pagu Berlebih'
              : `${overview.unallocatedPercentage}% Sisa`}
          </p>
        </div>
      </Card>
    </div>
  );
};

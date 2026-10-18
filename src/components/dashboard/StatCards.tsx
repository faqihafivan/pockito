import React from 'react';
import { Card } from '../ui/Card';
import { formatIDR } from '../../domain/finance/financialEngine';
import { FinancialOverview } from '../../types';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, AlertTriangle } from 'lucide-react';

interface StatCardsProps {
  overview: FinancialOverview;
}

export const StatCards: React.FC<StatCardsProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Saldo Riil */}
      <Card variant="saweria" className="bg-white p-3 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-wider truncate">
            Saldo Riil
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-brand-primary/20 border border-brand-dark flex items-center justify-center text-brand-dark shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-base sm:text-xl lg:text-2xl font-black text-brand-dark tabular-nums tracking-tight truncate">
            {formatIDR(overview.totalRecordedBalance)}
          </div>
          <p className="text-[9px] sm:text-[11px] text-brand-darkMuted mt-0.5 truncate">
            Kas & rekening aktif
          </p>
        </div>
      </Card>

      {/* 2. Pemasukan Bulanan */}
      <Card variant="saweria" className="bg-white p-3 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-wider truncate">
            Pemasukan
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#10B981]/20 border border-brand-dark flex items-center justify-center text-[#047857] shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-base sm:text-xl lg:text-2xl font-black text-brand-dark tabular-nums tracking-tight truncate">
            {formatIDR(overview.monthlyIncome)}
          </div>
          <p className="text-[9px] sm:text-[11px] text-brand-darkMuted mt-0.5 truncate">
            Bulan terpilih
          </p>
        </div>
      </Card>

      {/* 3. Total Pengeluaran */}
      <Card variant="saweria" className="bg-white p-3 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-wider truncate">
            Pengeluaran
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-red-500/15 border border-brand-dark flex items-center justify-center text-red-600 shrink-0">
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-base sm:text-xl lg:text-2xl font-black text-brand-dark tabular-nums tracking-tight truncate">
            {formatIDR(overview.totalMonthlyExpense)}
          </div>
          <p className="text-[9px] sm:text-[11px] text-brand-darkMuted mt-0.5 truncate">
            Kas keluar tercatat
          </p>
        </div>
      </Card>

      {/* 4. Sisa Anggaran */}
      <Card
        variant="saweria"
        className={`p-3 sm:p-5 flex flex-col justify-between ${
          overview.isOverallocated ? 'bg-red-50 border-red-600' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-black text-brand-darkMuted uppercase tracking-wider truncate">
            {overview.isOverallocated ? 'Over-Alloc!' : 'Sisa Kuota'}
          </span>
          <div
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border border-brand-dark flex items-center justify-center shrink-0 ${
              overview.isOverallocated
                ? 'bg-red-500 text-white'
                : 'bg-[#8B5CF6]/20 text-[#6D28D9]'
            }`}
          >
            {overview.isOverallocated ? (
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            ) : (
              <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div
            className={`text-base sm:text-xl lg:text-2xl font-black tabular-nums tracking-tight truncate ${
              overview.isOverallocated ? 'text-red-600' : 'text-brand-dark'
            }`}
          >
            {overview.isOverallocated
              ? `+${overview.totalAllocationPercentage}%`
              : formatIDR(overview.totalBudgetRemaining)}
          </div>
          <p className="text-[9px] sm:text-[11px] text-brand-darkMuted mt-0.5 truncate">
            {overview.isOverallocated ? 'Melebihi 100%' : 'Batas rencana'}
          </p>
        </div>
      </Card>
    </div>
  );
};

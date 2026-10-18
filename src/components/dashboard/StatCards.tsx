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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Saldo Riil */}
      <Card variant="saweria" className="bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-darkMuted uppercase tracking-wider">
            Saldo Riil (Kas & Bank)
          </span>
          <div className="w-8 h-8 rounded-xl bg-brand-primary/20 border border-brand-dark flex items-center justify-center text-brand-dark">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-brand-dark tabular-nums tracking-tight">
            {formatIDR(overview.totalRecordedBalance)}
          </div>
          <p className="text-[11px] text-brand-darkMuted mt-1">
            Total uang tunai & rekening aktif
          </p>
        </div>
      </Card>

      {/* 2. Pemasukan Bulanan */}
      <Card variant="saweria" className="bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-darkMuted uppercase tracking-wider">
            Pemasukan Bulan Ini
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 border border-brand-dark flex items-center justify-center text-[#047857]">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-brand-dark tabular-nums tracking-tight">
            {formatIDR(overview.monthlyIncome)}
          </div>
          <p className="text-[11px] text-brand-darkMuted mt-1">
            Dasar alokasi kantong budget
          </p>
        </div>
      </Card>

      {/* 3. Total Pengeluaran */}
      <Card variant="saweria" className="bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-darkMuted uppercase tracking-wider">
            Pengeluaran Bulan Ini
          </span>
          <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-brand-dark flex items-center justify-center text-red-600">
            <TrendingDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-brand-dark tabular-nums tracking-tight">
            {formatIDR(overview.totalMonthlyExpense)}
          </div>
          <p className="text-[11px] text-brand-darkMuted mt-1">
            Total kas keluar periode ini
          </p>
        </div>
      </Card>

      {/* 4. Sisa Anggaran */}
      <Card
        variant="saweria"
        className={overview.isOverallocated ? 'bg-red-50 border-red-600' : 'bg-white'}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-darkMuted uppercase tracking-wider">
            {overview.isOverallocated ? 'Alokasi Berlebih!' : 'Sisa Kuota Anggaran'}
          </span>
          <div
            className={`w-8 h-8 rounded-xl border border-brand-dark flex items-center justify-center ${
              overview.isOverallocated
                ? 'bg-red-500 text-white'
                : 'bg-[#8B5CF6]/20 text-[#6D28D9]'
            }`}
          >
            {overview.isOverallocated ? (
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <PiggyBank className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="mt-2">
          <div
            className={`text-2xl font-black tabular-nums tracking-tight ${
              overview.isOverallocated ? 'text-red-600' : 'text-brand-dark'
            }`}
          >
            {overview.isOverallocated
              ? `+${overview.totalAllocationPercentage}% (Kelebihan)`
              : formatIDR(overview.totalBudgetRemaining)}
          </div>
          <p className="text-[11px] text-brand-darkMuted mt-1">
            {overview.isOverallocated
              ? 'Total alokasi melebihi 100% pendapatan'
              : 'Sisa batas pengeluaran terencana'}
          </p>
        </div>
      </Card>
    </div>
  );
};

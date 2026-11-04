import React from 'react';
import { Card } from '../ui/Card';
import { useData } from '../../context/DataContext';
import { FinancialOverview } from '../../types';
import { TrendingUp, TrendingDown, PiggyBank, AlertTriangle, ChevronRight } from 'lucide-react';

export interface StatCardsProps {
  overview: FinancialOverview;
  onSelectType?: (type: 'income' | 'expense') => void;
  showBudgetRemaining?: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({
  overview,
  onSelectType,
  showBudgetRemaining = false,
}) => {
  const { formatMoney } = useData();

  // Percentage of income already distributed to budget pockets
  const allocatedPercentage = Math.max(0, Math.min(100, 100 - overview.unallocatedPercentage));

  return (
    <div
      className={
        showBudgetRemaining
          ? 'space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4'
          : 'grid grid-cols-2 gap-3 sm:gap-4'
      }
    >
      {/* 1. Total Pengeluaran (Expenses - Left Card like Screenshot 1) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectType?.('expense')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectType?.('expense');
          }
        }}
        className="group block text-left outline-none cursor-pointer select-none"
        title="Klik untuk melihat riwayat uang keluar bulan ini"
        aria-label="Lihat Riwayat Pengeluaran"
      >
        <Card
          variant="saweria"
          className="h-full bg-[#FDF2F2] dark:bg-rose-950/40 border-2 border-rose-800/30 dark:border-rose-600/40 p-3 sm:p-4 md:p-5 flex flex-col justify-between group-hover:border-rose-700 dark:group-hover:border-rose-400 group-hover:shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-200/80 dark:bg-rose-800/50 border border-rose-800/40 dark:border-rose-600/60 flex items-center justify-center text-rose-900 dark:text-rose-200 shrink-0 shadow-saweria-xs group-hover:scale-105 transition-transform">
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] sm:text-xs font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-0.5">
              <span>Pengeluaran</span>
              <ChevronRight className="w-3 h-3 text-rose-600 dark:text-rose-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </span>
          </div>

          <div className="mt-3">
            <div className="text-base sm:text-xl lg:text-2xl font-black text-rose-950 dark:text-rose-100 tabular-nums tracking-tight truncate">
              -{formatMoney(overview.totalMonthlyExpense)}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] sm:text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <span>●</span> Kas Keluar Aktual
              </p>
              <span className="text-[9px] font-black text-rose-800 dark:text-rose-300 underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                Riwayat
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Pemasukan Bulanan (Income - Right Card like Screenshot 1) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectType?.('income')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectType?.('income');
          }
        }}
        className="group block text-left outline-none cursor-pointer select-none"
        title="Klik untuk melihat riwayat uang masuk bulan ini"
        aria-label="Lihat Riwayat Pemasukan"
      >
        <Card
          variant="saweria"
          className="h-full bg-[#EBF6F4] dark:bg-emerald-950/40 border-2 border-emerald-800/30 dark:border-emerald-600/40 p-3 sm:p-4 md:p-5 flex flex-col justify-between group-hover:border-emerald-700 dark:group-hover:border-emerald-400 group-hover:shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-200/80 dark:bg-emerald-800/50 border border-emerald-800/40 dark:border-emerald-600/60 flex items-center justify-center text-emerald-900 dark:text-emerald-200 shrink-0 shadow-saweria-xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] sm:text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-0.5">
              <span>Pemasukan</span>
              <ChevronRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </span>
          </div>

          <div className="mt-3">
            <div className="text-base sm:text-xl lg:text-2xl font-black text-emerald-950 dark:text-emerald-100 tabular-nums tracking-tight truncate">
              +{formatMoney(overview.monthlyIncome)}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span>●</span> Kas Masuk Bulan Ini
              </p>
              <span className="text-[9px] font-black text-emerald-800 dark:text-emerald-300 underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                Riwayat
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Sisa Budget Anggaran (Hanya muncul jika showBudgetRemaining=true) */}
      {showBudgetRemaining && (
        <Card
          variant="saweria"
          className={`p-3 sm:p-4 md:p-5 flex flex-col justify-between ${
            overview.isOverallocated
              ? 'bg-red-50 dark:bg-red-950/50 border-2 border-red-600 text-red-900 dark:text-red-200'
              : 'bg-[#FEF9E7] dark:bg-amber-950/40 border-2 border-amber-800/30 dark:border-amber-600/40'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs ${
                  overview.isOverallocated
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-200/80 dark:bg-amber-800/50 text-amber-900 dark:text-amber-200 border-amber-800/40'
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
                  : allocatedPercentage === 100
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-300'
              }`}
            >
              {overview.isOverallocated
                ? 'Defisit'
                : allocatedPercentage === 100
                ? '100% Terbagi Rapi'
                : `${allocatedPercentage}% Terbagi`}
            </span>
          </div>

          <div className="mt-2">
            <div
              className={`text-base sm:text-xl lg:text-2xl font-black tabular-nums tracking-tight truncate ${
                overview.isOverallocated
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-amber-950 dark:text-amber-100'
              }`}
            >
              {formatMoney(overview.totalBudgetRemaining)}
            </div>

            <div className="mt-2 space-y-1">
              <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    overview.isOverallocated ? 'bg-red-600' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, allocatedPercentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-amber-800/80 dark:text-amber-300/80 pt-0.5">
                <span>
                  {overview.isOverallocated
                    ? 'Kelebihan alokasi'
                    : overview.unallocatedIncome > 0
                    ? `${formatMoney(overview.unallocatedIncome)} belum dialokasikan`
                    : 'Semua gaji telah dialokasikan'}
                </span>
                <span className="text-[9px] font-normal text-amber-700 dark:text-amber-400">
                  dari gaji pokok
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

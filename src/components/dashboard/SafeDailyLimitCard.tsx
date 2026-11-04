import React from 'react';
import { DailySafeLimitResult } from '../../types';
import { useData } from '../../context/DataContext';
import {
  CalendarCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SafeDailyLimitCardProps {
  safeLimit: DailySafeLimitResult;
  embedded?: boolean;
}

export const SafeDailyLimitCard: React.FC<SafeDailyLimitCardProps> = ({ safeLimit, embedded = false }) => {
  const { formatMoney } = useData();
  const {
    dailySafeLimit,
    remainingDays,
    totalRemainingBudget,
    todaySpent,
    remainingToday,
    burnRateStatus,
  } = safeLimit;

  const isOverToday = remainingToday < 0;

  // Status configuration matching the clean styling
  const statusConfig = {
    fast: {
      badgeBg: 'bg-red-50 text-red-700 border-red-500 dark:bg-red-950/50 dark:text-red-300 dark:border-red-600',
      label: 'Kecepatan Tinggi 🚨',
    },
    frugal: {
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-600',
      label: 'Sangat Hemat 🟢',
    },
    normal: {
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-400 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-600',
      label: 'Stabil & Aman 🟢',
    },
  }[burnRateStatus];

  // Today's spend percentage against daily limit
  const spentPercent =
    dailySafeLimit > 0
      ? Math.min(100, Math.round((todaySpent / dailySafeLimit) * 100))
      : todaySpent > 0
      ? 100
      : 0;

  return (
    <div
      className={`bg-white dark:bg-slate-900 flex flex-col justify-between transition-all relative overflow-hidden ${
        embedded
          ? 'border-0 shadow-none p-1 sm:p-2'
          : 'rounded-2xl sm:rounded-3xl border-2 border-brand-dark dark:border-slate-700 shadow-saweria p-4 sm:p-5'
      }`}
    >
      {/* Decorative background accent */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-brand-primary/10 dark:bg-brand-primary/5 pointer-events-none" />

      {/* Header: Title, Icon & Status Badge */}
      <div className="flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-primary/20 dark:bg-brand-primary/30 border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center shrink-0 shadow-saweria-xs">
            <CalendarCheck className="w-4 h-4 text-brand-dark dark:text-slate-100" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-black text-brand-dark dark:text-slate-100 tracking-tight leading-tight truncate">
              Batas Belanja Harian
            </h3>
            <p className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 truncate">
              {remainingDays} hari tersisa di bulan ini
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black border-2 shrink-0 ${statusConfig.badgeBg}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Sleek Hero Metric Strip (Glanceable, no nested card bloat) */}
      <div className="my-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-brand-cream/70 dark:bg-slate-800/70 border-2 border-brand-dark/25 dark:border-slate-700/80 space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] font-black text-brand-darkMuted dark:text-slate-400 uppercase tracking-wider block">
              Jatah Aman Hari Ini
            </span>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-brand-dark dark:text-slate-100 tabular-nums tracking-tight mt-0.5">
              {formatMoney(dailySafeLimit)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-brand-darkMuted dark:text-slate-400 uppercase tracking-wider block">
              Sisa Kuota Hari Ini
            </span>
            <span
              className={`text-sm sm:text-base font-black tabular-nums block mt-0.5 ${
                isOverToday ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {formatMoney(remainingToday)}
            </span>
          </div>
        </div>

        {/* Spend Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-white dark:bg-slate-900 rounded-full border border-brand-dark/30 dark:border-slate-600 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverToday
                  ? 'bg-red-500'
                  : spentPercent > 80
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, Math.max(spentPercent > 0 ? 4 : 0, spentPercent))}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-extrabold text-brand-darkMuted dark:text-slate-400">
            <span>Terpakai: {formatMoney(todaySpent)} ({spentPercent}%)</span>
            <span>Sisa Budget: {formatMoney(totalRemainingBudget)}</span>
          </div>
        </div>
      </div>

      {/* Footer: Compact 1-liner with inline micro hint and link */}
      <div className="flex items-center justify-between pt-1 border-t border-brand-border/60 dark:border-slate-800 text-xs">
        <span className="text-[10px] sm:text-[11px] font-bold text-brand-darkMuted dark:text-slate-400 flex items-center gap-1 min-w-0 pr-2 truncate">
          <Info className="w-3 h-3 shrink-0" />
          <span className="truncate">Sinkron dengan {remainingDays} hari kalender</span>
        </span>
        <Link
          to="/app/budget"
          className="text-xs font-black text-brand-dark dark:text-slate-200 hover:text-brand-primary flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Atur Kantong</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

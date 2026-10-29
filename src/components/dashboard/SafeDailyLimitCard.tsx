import React from 'react';
import { DailySafeLimitResult } from '../../types';
import { useData } from '../../context/DataContext';
import {
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SafeDailyLimitCardProps {
  safeLimit: DailySafeLimitResult;
}

export const SafeDailyLimitCard: React.FC<SafeDailyLimitCardProps> = ({ safeLimit }) => {
  const { formatMoney } = useData();
  const {
    dailySafeLimit,
    remainingDays,
    totalRemainingBudget,
    todaySpent,
    remainingToday,
    burnRateStatus,
    adviceMessage,
  } = safeLimit;

  const isOverToday = remainingToday < 0;

  // Status configuration matching the clean styling
  const statusConfig = {
    fast: {
      badgeBg: 'bg-red-50 text-red-700 border-red-500',
      label: 'Kecepatan Tinggi 🚨',
    },
    frugal: {
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-400',
      label: 'Sangat Hemat 🟢',
    },
    normal: {
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-400',
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
    <div className="bg-white rounded-3xl border-2 border-brand-dark shadow-saweria p-5 sm:p-6 space-y-4 relative overflow-hidden transition-all flex flex-col justify-between">
      {/* Decorative background accent */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-brand-primary/10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-sm">
            <CalendarCheck className="w-5 h-5 text-brand-dark" />
          </div>
          <div>
            <h3 className="text-base font-black text-brand-dark tracking-tight leading-tight">
              Batas Belanja Harian
            </h3>
            <p className="text-[11px] font-bold text-brand-darkMuted">
              Jatah belanja per hari agar pagu aman sampai akhir bulan
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-black border-2 shrink-0 ${statusConfig.badgeBg}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Main KPI: Big Jatah Hari Ini & Sisa Kuota */}
      <div className="p-4 rounded-2xl bg-brand-cream border-2 border-brand-dark space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] font-black text-brand-darkMuted uppercase tracking-wider block">
              Jatah Aman Hari Ini
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-brand-dark tabular-nums tracking-tight">
                {formatMoney(dailySafeLimit)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider block">
              Sisa Kuota Hari Ini
            </span>
            <span
              className={`text-base sm:text-lg font-black tabular-nums ${
                isOverToday ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {formatMoney(remainingToday)}
            </span>
          </div>
        </div>

        {/* Today's Spend Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-extrabold text-brand-darkMuted">
            <span>
              Pengeluaran Hari Ini: {formatMoney(todaySpent)}
            </span>
            <span>{spentPercent}% terpakai</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full border-2 border-brand-dark overflow-hidden p-0.5">
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
        </div>
      </div>

      {/* Breakdown Details (2-Column Grid matching Emergency Runway Card) */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-white border border-brand-border space-y-0.5">
          <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider">
            Sisa Hari Kalender:
          </span>
          <p className="font-black text-brand-dark tabular-nums">
            {remainingDays} Hari Lagi
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-brand-border space-y-0.5">
          <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider">
            Sisa Total Pagu Anggaran:
          </span>
          <p className="font-black text-brand-dark tabular-nums">
            {formatMoney(totalRemainingBudget)}
          </p>
        </div>
      </div>

      {/* Practical Advice Banner */}
      <div className="p-3 rounded-2xl bg-white border-2 border-brand-dark text-xs flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-brand-dark text-[11px] leading-relaxed">
            {adviceMessage}
          </p>
        </div>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-bold text-brand-darkMuted flex items-center gap-1">
          <Info className="w-3 h-3" />
          Otomatis sinkron dengan sisa hari kalender
        </span>
        <Link
          to="/app/budget"
          className="text-xs font-black text-brand-dark hover:text-brand-primary flex items-center gap-1 transition-colors"
        >
          <span>Atur Kantong</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

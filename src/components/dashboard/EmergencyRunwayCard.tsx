import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ShieldCheck, ArrowRight, Info, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyRunwayCard: React.FC = () => {
  const { emergencyRunway, formatMoney } = useData();
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const {
    totalLiquidCash,
    monthlyEssentialExpense,
    runwayMonths,
    status,
    statusLabel,
    targetAmount,
    progressPercentage,
    calculationMethod,
  } = emergencyRunway;

  const isInsufficient = status === 'insufficient_data';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-brand-dark dark:border-slate-700 shadow-saweria p-4 sm:p-5 flex flex-col justify-between transition-all relative overflow-hidden">
      {/* Decorative background accent */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-brand-primary/10 dark:bg-brand-primary/5 pointer-events-none" />

      {/* Header: Title, Icon & Status Badge */}
      <div className="flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-primary/20 dark:bg-brand-primary/30 border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center shrink-0 shadow-saweria-xs">
            <ShieldCheck className="w-4 h-4 text-brand-dark dark:text-slate-100" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-black text-brand-dark dark:text-slate-100 tracking-tight leading-tight truncate">
                Ketahanan Dana Darurat
              </h3>
              <button
                type="button"
                onClick={() => setShowFormulaModal(!showFormulaModal)}
                className="text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200 transition-colors shrink-0"
                title="Lihat Rumus Perhitungan"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 truncate">
              Kas Likuid: {formatMoney(totalLiquidCash)}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black border-2 shrink-0 ${
            isInsufficient
              ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-400'
              : statusLabel.includes('Tahap Awal')
              ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-600'
              : status === 'critical'
              ? 'bg-rose-50 text-rose-800 border-rose-400 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-600'
              : status === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-400 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-600'
              : status === 'safe'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-600'
              : 'bg-emerald-100 text-emerald-900 border-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-500'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Formula Explanation Banner (Toggleable) */}
      {showFormulaModal && (
        <div className="my-2 p-3 rounded-xl bg-brand-cream dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center justify-between font-black text-brand-dark dark:text-slate-100">
            <span className="flex items-center gap-1 text-[11px]">
              <Info className="w-3.5 h-3.5 text-brand-primary" />
              Rumus: Kas Likuid ÷ Biaya Pokok Bulanan
            </span>
            <button
              onClick={() => setShowFormulaModal(false)}
              className="text-[10px] uppercase font-bold text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark"
            >
              Tutup
            </button>
          </div>
          <p className="text-[10px] text-brand-darkMuted dark:text-slate-400 leading-tight">
            Metode:{' '}
            {calculationMethod === 'budget_starred'
              ? 'Alokasi kantong bertanda ⭐'
              : calculationMethod === 'manual_input'
              ? 'Input manual'
              : calculationMethod === 'actual_expenses'
              ? 'Estimasi pendapatan dasar'
              : 'Belum cukup data'}
          </p>
        </div>
      )}

      {/* Sleek Hero Metric Strip (Glanceable, no nested card bloat) */}
      <div className="my-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-brand-cream/70 dark:bg-slate-800/70 border-2 border-brand-dark/25 dark:border-slate-700/80 space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] font-black text-brand-darkMuted dark:text-slate-400 uppercase tracking-wider block">
              Daya Tahan Kas Riil
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-brand-dark dark:text-slate-100 tabular-nums tracking-tight">
                {isInsufficient ? '-' : runwayMonths}
              </span>
              <span className="text-xs sm:text-sm font-black text-brand-darkMuted dark:text-slate-400">
                {isInsufficient ? 'Data Kurang' : 'Bulan'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-brand-darkMuted dark:text-slate-400 uppercase tracking-wider block">
              Target 6 Bulan Aman
            </span>
            <span className="text-xs sm:text-sm font-black text-brand-dark dark:text-slate-100 tabular-nums block mt-0.5">
              {isInsufficient ? '-' : formatMoney(targetAmount)}
            </span>
          </div>
        </div>

        {/* Milestone Progress Track with 0 bln, 1 bln, 3 bln, 6 bln labels */}
        {!isInsufficient ? (
          <div className="space-y-1">
            <div className="w-full h-2.5 bg-white dark:bg-slate-900 rounded-full border border-brand-dark/30 dark:border-slate-600 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercentage >= 100
                    ? 'bg-emerald-500'
                    : progressPercentage >= 50
                    ? 'bg-brand-primary'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(4, progressPercentage))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-black text-brand-darkMuted dark:text-slate-400 uppercase tracking-tight">
              <span>0 Bln</span>
              <span className={runwayMonths >= 1 ? 'text-brand-dark dark:text-slate-200 font-black' : ''}>1 Bln Min</span>
              <span className={runwayMonths >= 3 ? 'text-brand-dark dark:text-slate-200 font-black' : ''}>3 Bln Wajar</span>
              <span className={runwayMonths >= 6 ? 'text-emerald-700 dark:text-emerald-400 font-black' : ''}>6 Bln Aman 🎯</span>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-brand-darkMuted dark:text-slate-400 font-bold py-1">
            Isi pemasukan dan alokasi kantong untuk menghitung daya tahan kas.
          </div>
        )}
      </div>

      {/* Footer: Compact 1-liner with inline micro hint and link */}
      <div className="flex items-center justify-between pt-1 border-t border-brand-border/60 dark:border-slate-800 text-xs">
        <span className="text-[10px] sm:text-[11px] font-bold text-brand-darkMuted dark:text-slate-400 flex items-center gap-1 min-w-0 pr-2 truncate">
          <Info className="w-3 h-3 shrink-0" />
          <span className="truncate">Pokok: {isInsufficient ? '-' : `${formatMoney(monthlyEssentialExpense)}/bln`}</span>
        </span>
        <Link
          to="/app/budget"
          className="text-xs font-black text-brand-dark dark:text-slate-200 hover:text-brand-primary flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Atur Kantong ⭐</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

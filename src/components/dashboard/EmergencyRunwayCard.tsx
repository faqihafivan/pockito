import React from 'react';
import { useData } from '../../context/DataContext';
import { ShieldCheck, ArrowRight, Sparkles, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyRunwayCard: React.FC = () => {
  const { emergencyRunway, formatMoney } = useData();

  const {
    totalLiquidCash,
    monthlyEssentialExpense,
    runwayMonths,
    status,
    statusLabel,
    adviceMessage,
    targetAmount,
    progressPercentage,
  } = emergencyRunway;

  return (
    <div className="bg-white rounded-3xl border-2 border-brand-dark shadow-saweria p-5 sm:p-6 space-y-4 relative overflow-hidden transition-all">
      {/* Decorative background accent */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-brand-primary/10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-sm">
            <ShieldCheck className="w-5 h-5 text-brand-dark" />
          </div>
          <div>
            <h3 className="text-base font-black text-brand-dark tracking-tight leading-tight">
              Ketahanan Dana Darurat
            </h3>
            <p className="text-[11px] font-bold text-brand-darkMuted">
              Berapa lama kamu bisa bertahan tanpa pemasukan
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-black border-2 ${
            status === 'critical'
              ? 'bg-red-50 text-red-700 border-red-500'
              : status === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-400'
              : status === 'safe'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
              : 'bg-emerald-100 text-emerald-900 border-emerald-600'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Main KPI: Big Months Metric & Target Progress */}
      <div className="p-4 rounded-2xl bg-brand-cream border-2 border-brand-dark space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-black text-brand-darkMuted uppercase tracking-wider block">
              Daya Tahan Kas Riil
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-brand-dark tabular-nums tracking-tight">
                {runwayMonths}
              </span>
              <span className="text-sm sm:text-base font-black text-brand-darkMuted">
                Bulan
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider block">
              Target 6 Bulan Aman
            </span>
            <span className="text-sm font-black text-brand-dark tabular-nums">
              {formatMoney(targetAmount)}
            </span>
          </div>
        </div>

        {/* Progress Bar towards 6 months benchmark */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-extrabold text-brand-darkMuted">
            <span>Progress Menuju Target Aman:</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full border-2 border-brand-dark overflow-hidden p-0.5">
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
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-white border border-brand-border space-y-0.5">
          <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider">
            Kas & Tabungan Siap Pakai:
          </span>
          <p className="font-black text-brand-dark tabular-nums">
            {formatMoney(totalLiquidCash)}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-brand-border space-y-0.5">
          <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider">
            Biaya Pokok / Bulan (⭐):
          </span>
          <p className="font-black text-brand-dark tabular-nums">
            {formatMoney(monthlyEssentialExpense)}
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
          Dihitung dari kantong anggaran prioritas (⭐)
        </span>
        <Link
          to="/app/budget"
          className="text-xs font-black text-brand-dark hover:text-brand-primary flex items-center gap-1 transition-colors"
        >
          <span>Atur Kantong ⭐</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

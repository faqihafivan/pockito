import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ShieldCheck, ArrowRight, Sparkles, Info, HelpCircle } from 'lucide-react';
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
    adviceMessage,
    targetAmount,
    progressPercentage,
    isEstimate,
    calculationMethod,
  } = emergencyRunway;

  const isInsufficient = status === 'insufficient_data';

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-brand-dark shadow-saweria p-4 sm:p-6 space-y-4 relative overflow-hidden transition-all">
      {/* Decorative background accent */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-brand-primary/10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-primary/20 border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-xs">
            <ShieldCheck className="w-5 h-5 text-brand-dark" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-black text-brand-dark tracking-tight leading-tight">
                Ketahanan Dana Darurat
              </h3>
              <button
                type="button"
                onClick={() => setShowFormulaModal(!showFormulaModal)}
                className="text-brand-darkMuted hover:text-brand-dark transition-colors"
                title="Lihat Rumus Perhitungan"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-brand-darkMuted">
              Berapa lama kamu bisa bertahan tanpa pemasukan
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-black border-2 shrink-0 ${
            isInsufficient
              ? 'bg-gray-100 text-gray-700 border-gray-400'
              : statusLabel.includes('Tahap Awal')
              ? 'bg-amber-100 text-amber-900 border-amber-400'
              : status === 'critical'
              ? 'bg-rose-50 text-rose-800 border-rose-400'
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

      {/* Formula Explanation Banner (Toggleable) */}
      {showFormulaModal && (
        <div className="p-3.5 rounded-2xl bg-brand-cream border-2 border-brand-dark text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between font-black text-brand-dark">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-brand-primary" />
              Rumus Transparan Pockito
            </span>
            <button
              onClick={() => setShowFormulaModal(false)}
              className="text-[10px] uppercase font-bold text-brand-darkMuted hover:text-brand-dark"
            >
              Tutup
            </button>
          </div>
          <p className="text-[11px] text-brand-dark font-medium leading-relaxed">
            <strong>Runway (Bulan) = Kas Likuid Siap Pakai ÷ Biaya Esensial Bulanan</strong>
          </p>
          <ul className="text-[10px] text-brand-darkMuted space-y-0.5 list-disc pl-3.5">
            <li>Hanya menghitung rekening kas, bank, dan e-wallet aktif (investasi & akun arsip dikecualikan).</li>
            <li>
              Metode saat ini:{' '}
              {calculationMethod === 'budget_starred'
                ? 'Estimasi dari alokasi kantong bertanda ⭐'
                : calculationMethod === 'manual_input'
                ? 'Input manual pengguna'
                : calculationMethod === 'actual_expenses'
                ? 'Pendekatan 50% pendapatan dasar'
                : 'Belum cukup data (perlu isi gaji / kantong ⭐)'}
            </li>
          </ul>
        </div>
      )}

      {/* Hero Metric Strip (Clean, single surface, no box-in-a-box clutter) */}
      <div className="p-4 rounded-2xl bg-brand-cream/80 border-2 border-brand-dark/40 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-black text-brand-darkMuted uppercase tracking-wider block">
              Daya Tahan Kas Riil
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-brand-dark tabular-nums tracking-tight">
                {isInsufficient ? '-' : runwayMonths}
              </span>
              <span className="text-xs sm:text-sm font-black text-brand-darkMuted">
                {isInsufficient ? 'Data Kurang' : 'Bulan'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider block">
              Target 6 Bulan Aman
            </span>
            <span className="text-xs sm:text-sm font-black text-brand-dark tabular-nums">
              {isInsufficient ? '-' : formatMoney(targetAmount)}
            </span>
          </div>
        </div>

        {/* Milestone Progress Track with 1 bln, 3 bln, 6 bln labels */}
        {!isInsufficient && (
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-3 bg-white rounded-full border border-brand-dark/30 overflow-hidden p-0.5 relative">
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
            <div className="flex items-center justify-between text-[9px] font-black text-brand-darkMuted uppercase tracking-tight">
              <span>0 Bln</span>
              <span className={runwayMonths >= 1 ? 'text-brand-dark font-black' : ''}>1 Bln Min</span>
              <span className={runwayMonths >= 3 ? 'text-brand-dark font-black' : ''}>3 Bln Wajar</span>
              <span className={runwayMonths >= 6 ? 'text-emerald-700 font-black' : ''}>6 Bln Aman 🎯</span>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Details Strip (Unified 2-column card with subtle divider instead of nested border boxes) */}
      <div className="grid grid-cols-2 divide-x divide-brand-border bg-brand-cream/40 rounded-xl p-2.5 border border-brand-border text-xs">
        <div className="px-2 space-y-0.5">
          <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider block">
            Kas Siap Pakai:
          </span>
          <p className="font-black text-brand-dark tabular-nums text-xs sm:text-sm">
            {formatMoney(totalLiquidCash)}
          </p>
          <span className="text-[9px] text-gray-500 font-bold block">
            (Kas & bank aktif)
          </span>
        </div>

        <div className="px-2 space-y-0.5">
          <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider block">
            Biaya Pokok / Bln (⭐):
          </span>
          <p className="font-black text-brand-dark tabular-nums text-xs sm:text-sm">
            {isInsufficient ? '-' : formatMoney(monthlyEssentialExpense)}
          </p>
          <span className="text-[9px] text-gray-500 font-bold block">
            {isEstimate ? '(Estimasi Alokasi)' : '(Data Aktual)'}
          </span>
        </div>
      </div>

      {/* Practical Advice Banner */}
      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
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
          Dihitung otomatis dari kas likuid & pos bertanda ⭐
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

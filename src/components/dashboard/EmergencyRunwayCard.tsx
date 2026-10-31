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
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-black text-brand-dark tracking-tight leading-tight">
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
            <p className="text-[11px] font-bold text-brand-darkMuted">
              Berapa lama kamu bisa bertahan tanpa pemasukan
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-black border-2 ${
            isInsufficient
              ? 'bg-gray-100 text-gray-700 border-gray-400'
              : status === 'critical'
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

      {/* Main KPI: Big Months Metric & Target Progress */}
      <div className="p-4 rounded-2xl bg-brand-cream border-2 border-brand-dark space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-black text-brand-darkMuted uppercase tracking-wider block">
              Daya Tahan Kas Riil
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-brand-dark tabular-nums tracking-tight">
                {isInsufficient ? '-' : runwayMonths}
              </span>
              <span className="text-sm sm:text-base font-black text-brand-darkMuted">
                {isInsufficient ? 'Data Kurang' : 'Bulan'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider block">
              Target 6 Bulan Aman
            </span>
            <span className="text-sm font-black text-brand-dark tabular-nums">
              {isInsufficient ? '-' : formatMoney(targetAmount)}
            </span>
          </div>
        </div>

        {/* Progress Bar towards 6 months benchmark */}
        {!isInsufficient && (
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
        )}
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-white border border-brand-border space-y-0.5">
          <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider block">
            Kas Likuid Siap Pakai:
          </span>
          <p className="font-black text-brand-dark tabular-nums">
            {formatMoney(totalLiquidCash)}
          </p>
          <span className="text-[9px] text-gray-500 font-semibold block">
            (Bukan investasi)
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-brand-border space-y-0.5">
          <span className="text-[10px] font-black text-brand-darkMuted uppercase tracking-wider block">
            Biaya Pokok / Bulan (⭐):
          </span>
          <p className="font-black text-brand-dark tabular-nums">
            {isInsufficient ? '-' : formatMoney(monthlyEssentialExpense)}
          </p>
          <span className="text-[9px] text-gray-500 font-semibold block">
            {isEstimate ? '(Estimasi Alokasi)' : '(Data Aktual)'}
          </span>
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
          Dihitung dari kas likuid & pos pengeluaran prioritas
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

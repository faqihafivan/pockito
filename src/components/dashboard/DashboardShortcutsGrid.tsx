import React from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import {
  SlidersHorizontal,
  Zap,
  HandCoins,
  PiggyBank,
  PieChart,
  Target,
  Sparkles,
  BarChart3,
  LayoutGrid,
} from 'lucide-react';

export interface DashboardShortcutsGridProps {
  onOpenCustomize: () => void;
}

export const DashboardShortcutsGrid: React.FC<DashboardShortcutsGridProps> = ({
  onOpenCustomize,
}) => {
  const { showToast } = useNotification();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-brand-dark dark:border-slate-800 shadow-saweria p-4 sm:p-5 space-y-3 transition-colors">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs sm:text-sm font-black text-brand-dark dark:text-slate-100 uppercase tracking-wider">
            Pintasan Fitur
          </h3>
          <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 hidden sm:inline">
            (Akses cepat 1-ketukan)
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenCustomize}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3 h-3 text-brand-primary" />
          <span>Atur Tampilan</span>
        </button>
      </div>

      {/* 8-Icon Grid: 4 cols on mobile, 8 cols on desktop */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 pt-1">
        {/* 1. Tagihan */}
        <Link
          to="/app/subscriptions"
          className="flex flex-col items-center group text-center cursor-pointer select-none"
          title="Kelola Tagihan Rutin (Listrik, Wifi, Air)"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-amber-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 active:scale-95 transition-all">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4] fill-amber-500/20" />
          </div>
          <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
            Tagihan
          </span>
        </Link>

        {/* 2. Hutang */}
        <Link
          to="/app/debts"
          className="flex flex-col items-center group text-center cursor-pointer select-none"
          title="Kelola Hutang & Piutang"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-purple-100 to-purple-50 dark:from-purple-950/60 dark:to-purple-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 active:scale-95 transition-all">
            <HandCoins className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
          </div>
          <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
            Hutang
          </span>
        </Link>

        {/* 3. Tabungan */}
        <Link
          to="/app/goals"
          className="flex flex-col items-center group text-center cursor-pointer select-none"
          title="Target Tabungan & Dana Impian"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-950/60 dark:to-sky-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 active:scale-95 transition-all">
            <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
          </div>
          <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
            Tabungan
          </span>
        </Link>

        {/* 4. Kantong */}
        <Link
          to="/app/budget"
          className="flex flex-col items-center group text-center cursor-pointer select-none"
          title="Alokasi Kantong Belanja"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-emerald-100 to-emerald-50 dark:from-emerald-950/60 dark:to-emerald-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 active:scale-95 transition-all">
            <PieChart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
          </div>
          <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
            Kantong
          </span>
        </Link>

        {/* 5. Belanja */}
        <Link
          to="/app/planner"
          className="flex flex-col items-center group text-center cursor-pointer select-none"
          title="Planner & Checklist Belanja Pokok"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-rose-100 to-rose-50 dark:from-rose-950/60 dark:to-rose-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 active:scale-95 transition-all">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
          </div>
          <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
            Belanja
          </span>
        </Link>

        {/* 6. Scan AI */}
        <button
          type="button"
          onClick={() => {
            showToast('Buka fitur AI Receipt Scanner di tombol Catat Transaksi!', 'info');
          }}
          className="flex flex-col items-center group text-center cursor-pointer select-none"
          title="Scan Struk Belanja dengan AI Gemini"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-teal-100 to-teal-50 dark:from-teal-950/60 dark:to-teal-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 active:scale-95 transition-all">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
          </div>
          <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
            Scan AI
          </span>
        </button>

        {/* 7. Laporan */}
        <Link
          to="/app/reports"
          className="flex flex-col items-center group text-center cursor-pointer select-none"
          title="Laporan Keuangan & Analisis Arus Kas"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-cyan-100 to-cyan-50 dark:from-cyan-950/60 dark:to-cyan-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 active:scale-95 transition-all">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
          </div>
          <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
            Laporan
          </span>
        </Link>

        {/* 8. Mutasi */}
        <Link
          to="/app/transactions"
          className="flex flex-col items-center group text-center cursor-pointer select-none"
          title="Semua Mutasi & Buku Kas"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-indigo-100 to-indigo-50 dark:from-indigo-950/60 dark:to-indigo-900/30 border-2 border-brand-dark/20 dark:border-slate-700 shadow-saweria-xs flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 active:scale-95 transition-all">
            <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
          </div>
          <span className="text-[11px] sm:text-xs font-black text-brand-dark dark:text-slate-200 mt-1.5 tracking-tight group-hover:text-brand-primary transition-colors">
            Mutasi
          </span>
        </Link>
      </div>
    </div>
  );
};

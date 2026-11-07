import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { Info, Eye, EyeOff, Plus } from 'lucide-react';

export interface DashboardHeroBalanceProps {
  totalBalance: number;
  selectedPeriod: string;
  isPrivacyMode: boolean;
  onTogglePrivacy: () => void;
  onOpenInfoModal: () => void;
  onOpenIncomeModal: () => void;
  formatMoney: (amount: number) => string;
}

export const DashboardHeroBalance: React.FC<DashboardHeroBalanceProps> = ({
  totalBalance,
  selectedPeriod,
  isPrivacyMode,
  onTogglePrivacy,
  onOpenInfoModal,
  onOpenIncomeModal,
  formatMoney,
}) => {
  const { theme, isDark } = useTheme();
  const { showToast } = useNotification();

  const activeHeroTheme =
    isDark || theme === 'midnight'
      ? 'midnight'
      : theme === 'saweria'
      ? 'saweria'
      : 'teal-mint';

  const heroStyles = {
    saweria: {
      card: 'bg-gradient-to-br from-[#FFE366] via-[#FFD233] to-[#F5BA00] text-brand-dark border-2 border-brand-dark shadow-saweria',
      watermark1: 'bg-white/30',
      watermark2: 'bg-black/5',
      label: 'text-amber-950 font-black',
      infoBtn: 'bg-black/10 hover:bg-black/20 text-brand-dark border-black/15',
      privacyBtn: isPrivacyMode
        ? 'bg-black/30 text-white border-black/30'
        : 'bg-black/10 hover:bg-black/20 text-brand-dark border-black/15',
      periodChip: 'bg-black/10 text-brand-dark border-black/15 font-black',
      balanceNumber: 'text-brand-dark drop-shadow-none',
      footerBorder: 'border-black/15',
      statusDot: 'bg-emerald-600 border-emerald-700',
      statusText: 'text-amber-950 font-bold',
      catatBtn:
        'bg-brand-dark hover:bg-black text-white border-2 border-brand-dark shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5',
    },
    'teal-mint': {
      card: 'bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E] text-white border-2 border-brand-dark shadow-saweria',
      watermark1: 'bg-white/15',
      watermark2: 'bg-black/10',
      label: 'text-teal-100 font-black',
      infoBtn: 'bg-white/20 hover:bg-white/30 text-white border-white/20',
      privacyBtn: isPrivacyMode
        ? 'bg-black/30 text-white border-white/30'
        : 'bg-white/20 hover:bg-white/30 text-white border-white/20',
      periodChip: 'bg-white/20 text-white border-white/30 font-black',
      balanceNumber: 'text-white drop-shadow-sm',
      footerBorder: 'border-white/20',
      statusDot: 'bg-emerald-300 border-emerald-400',
      statusText: 'text-teal-100 font-bold',
      catatBtn:
        'bg-[#0F2E28] hover:bg-black text-teal-100 hover:text-white border-2 border-teal-300/40 shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5 font-black',
    },
    midnight: {
      card: 'bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white border-2 border-teal-500/50 shadow-saweria',
      watermark1: 'bg-teal-500/10',
      watermark2: 'bg-black/30',
      label: 'text-teal-300 font-black',
      infoBtn: 'bg-slate-800/80 hover:bg-slate-700 text-teal-300 border-teal-500/30',
      privacyBtn: isPrivacyMode
        ? 'bg-black/50 text-teal-300 border-teal-500/40'
        : 'bg-slate-800/80 hover:bg-slate-700 text-teal-300 border-teal-500/30',
      periodChip: 'bg-slate-800/80 text-teal-300 border-teal-500/30 font-black',
      balanceNumber: 'text-white drop-shadow-md',
      footerBorder: 'border-teal-500/30',
      statusDot: 'bg-teal-400 border-teal-300',
      statusText: 'text-teal-200 font-bold',
      catatBtn:
        'bg-teal-500 hover:bg-teal-400 text-white border-2 border-teal-300 shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5 font-black',
    },
  }[activeHeroTheme];

  const handlePrivacyToggle = () => {
    onTogglePrivacy();
    showToast(
      !isPrivacyMode
        ? 'Mode Privasi Aktif: Saldo disensor 👁️'
        : 'Mode Privasi Nonaktif: Saldo ditampilkan',
      'info'
    );
  };

  return (
    <div className={`relative rounded-3xl ${heroStyles.card} p-5 sm:p-6 overflow-hidden transition-all`}>
      {/* Subtle geometric watermark/accent */}
      <div className={`absolute -right-8 -bottom-8 w-44 h-44 rounded-full ${heroStyles.watermark1} pointer-events-none`} />
      <div className={`absolute -right-2 -top-12 w-28 h-28 rounded-full ${heroStyles.watermark2} pointer-events-none`} />

      <div className="relative z-10 flex flex-col justify-between gap-4 sm:gap-5">
        {/* Card Top Row: Label + Info + Privacy Toggle + Period Chip */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs sm:text-sm uppercase tracking-wider ${heroStyles.label}`}>
              Total Saldo Riil
            </span>
            <button
              type="button"
              onClick={onOpenInfoModal}
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${heroStyles.infoBtn}`}
              title="Pelajari bagaimana Saldo Riil dihitung dan diakumulasikan setiap bulan"
            >
              <Info className="w-2.5 h-2.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Privacy Eye Toggle */}
            <button
              type="button"
              onClick={handlePrivacyToggle}
              className={`p-1.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${heroStyles.privacyBtn}`}
              title={isPrivacyMode ? 'Buka sensor saldo' : 'Sensor nominal saldo'}
              aria-label={isPrivacyMode ? 'Buka sensor saldo' : 'Sensor nominal saldo'}
            >
              {isPrivacyMode ? (
                <EyeOff className="w-3.5 h-3.5 stroke-[2.4]" />
              ) : (
                <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
              )}
            </button>

            {/* Period Dropdown Chip */}
            <span
              className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-black border shadow-saweria-xs flex items-center gap-1 backdrop-blur-sm ${heroStyles.periodChip}`}
            >
              <span>{selectedPeriod}</span>
            </span>
          </div>
        </div>

        {/* Card Center: Hero Balance Number */}
        <div className="py-0.5">
          <div className={`text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tight ${heroStyles.balanceNumber}`}>
            {formatMoney(totalBalance)}
          </div>
        </div>

        {/* Card Bottom Row: Account Info + Catat Gaji Button */}
        <div className={`flex items-center justify-between gap-2 pt-2 border-t ${heroStyles.footerBorder}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse border ${heroStyles.statusDot}`} />
            <span className={`text-xs ${heroStyles.statusText}`}>
              Kas & Bank Aktif
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenIncomeModal}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-black text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${heroStyles.catatBtn}`}
            title="Catat Gaji Bulanan atau Pemasukan Baru"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Catat Gaji</span>
          </button>
        </div>
      </div>
    </div>
  );
};

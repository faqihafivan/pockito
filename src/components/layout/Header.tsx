import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bell, Check, Eye, EyeOff, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { PeriodSelector } from './PeriodSelector';
import { ThemeDropdown } from './ThemeDropdown';
import { InAppAlert, ReminderService } from '../../services/reminderService';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenNewTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTransaction, onOpenNewTask }) => {
  const { user } = useAuth();
  const { isPrivacyMode, togglePrivacyMode, dailyBriefing, openBriefing } = useData();
  const { showToast } = useNotification();
  const [alerts] = useState<InAppAlert[]>(() => ReminderService.getAlerts());

  const totalNotificationCount = dailyBriefing.items.length + alerts.length;

  return (
    <header className="app-header sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-brand-dark dark:border-slate-800 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 transition-colors">
      {/* Left: Dynamic Realtime Period Selector & Brand Logo (Clean on Mobile & Desktop) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile-Only Mini Logo Brand */}
        <Link
          to="/app/dashboard"
          className="sm:hidden flex items-center gap-1.5 shrink-0 select-none group"
          title="Pockito Home"
        >
          <img
            src="/pockito.jpg"
            alt="Pockito"
            className="w-7 h-7 rounded-lg border-2 border-brand-dark dark:border-slate-700 shadow-saweria-xs object-contain bg-white dark:bg-slate-800"
          />
        </Link>

        {/* Realtime Period Selector (Stepper on Desktop, Compact Pill on Mobile) */}
        <PeriodSelector />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Modern Interactive Theme Selection Dropdown (Teal Mint, Saweria, Midnight Dark) */}
        <ThemeDropdown />

        {/* Privacy Toggle (Eye) - Desktop & Tablet */}
        <button
          onClick={() => {
            togglePrivacyMode();
            showToast(
              !isPrivacyMode
                ? 'Mode Privasi Aktif: Saldo disensor 👁️'
                : 'Mode Privasi Nonaktif: Saldo ditampilkan',
              'info'
            );
          }}
          className={`hidden md:inline-flex p-2 rounded-xl border-2 border-brand-dark dark:border-slate-700 transition-all shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 ${
            isPrivacyMode
              ? 'bg-amber-100 text-amber-900 border-brand-dark'
              : 'bg-white dark:bg-slate-800 hover:bg-brand-cream dark:hover:bg-slate-700 text-brand-dark dark:text-slate-100'
          }`}
          title={
            isPrivacyMode
              ? 'Buka sensor saldo (Mode Privasi Aktif)'
              : 'Sensor nominal saldo (Mode Privasi)'
          }
        >
          {isPrivacyMode ? (
            <EyeOff className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4] text-amber-700" />
          ) : (
            <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          )}
        </button>

        {/* PWA Install Button: Accessible on all devices (Android & iOS) */}
        <PWAInstallButton className="inline-flex" />

        {/* Notification Bell -> Opens Consolidated Daily Briefing */}
        <div className="relative shrink-0">
          <button
            onClick={openBriefing}
            className="p-1.5 sm:p-2 rounded-xl border-2 border-brand-dark dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-brand-cream dark:hover:bg-slate-700 shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark dark:text-slate-100 relative cursor-pointer"
            title={`Briefing Finansial & Pengingat (${totalNotificationCount} catatan)`}
            aria-label="Notifikasi & Pengingat"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
            {totalNotificationCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full border border-brand-dark text-[9px] font-black flex items-center justify-center shadow-saweria-sm ${
                  dailyBriefing.hasUrgentItems
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-brand-primary text-brand-primaryText'
                }`}
              >
                {totalNotificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Settings Button: Prominent Gear Icon on Mobile, User Avatar on Desktop */}
        {/* Mobile Settings Icon (Menjawab Masukan User: "Di mode HP tidak ada menu setting") */}
        <Link
          to="/app/settings"
          className="sm:hidden p-1.5 rounded-xl border-2 border-brand-dark dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-brand-cream dark:hover:bg-slate-700 shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center shrink-0 text-brand-dark dark:text-slate-100"
          title="Pengaturan Akun & Data"
          aria-label="Buka Pengaturan Akun"
        >
          <Settings className="w-4 h-4 stroke-[2.3]" />
        </Link>

        {/* Desktop Profile / Settings Avatar */}
        <Link
          to="/app/settings"
          className="hidden sm:flex p-1.5 sm:p-2 rounded-xl border-2 border-brand-dark dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-brand-cream dark:hover:bg-slate-700 shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all items-center justify-center shrink-0"
          title={`Profil & Pengaturan: ${user?.full_name || 'Pengguna'}`}
          aria-label="Buka Pengaturan Akun"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-5 h-5 rounded-md object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-md bg-brand-primary border border-brand-dark flex items-center justify-center text-[10px] font-black text-brand-primaryText">
              {user?.full_name && user.full_name !== 'Pengguna Pockito'
                ? user.full_name.charAt(0).toUpperCase()
                : 'P'}
            </div>
          )}
        </Link>

        {/* Quick Add Task (Desktop/Tablet Only) */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNewTask}
          leftIcon={<Check className="w-3.5 h-3.5" />}
          className="hidden sm:inline-flex"
        >
          <span>Tugas</span>
          <kbd className="hidden lg:inline-block ml-1.5 px-1 py-0.5 bg-black/10 dark:bg-white/10 rounded text-[9px] font-mono">T</kbd>
        </Button>

        {/* Quick Add Transaction (Desktop/Tablet Only - Mobile uses the large bottom center Catat button) */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewTransaction}
          leftIcon={<Plus className="w-4 h-4" />}
          className="hidden sm:inline-flex shrink-0 whitespace-nowrap"
        >
          <span>Catat</span>
          <kbd className="hidden lg:inline-block ml-1.5 px-1 py-0.5 bg-black/15 dark:bg-black/30 rounded text-[9px] font-mono">N</kbd>
        </Button>
      </div>
    </header>
  );
};

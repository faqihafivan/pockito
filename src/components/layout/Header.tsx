import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bell, Check, Eye, EyeOff, Palette, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/Button';
import { PeriodSelector } from './PeriodSelector';
import { InAppAlert, ReminderService } from '../../services/reminderService';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenNewTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTransaction, onOpenNewTask }) => {
  const { user } = useAuth();
  const { isPrivacyMode, togglePrivacyMode, dailyBriefing, openBriefing } = useData();
  const { showToast } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const [alerts] = useState<InAppAlert[]>(() => ReminderService.getAlerts());

  const totalNotificationCount = dailyBriefing.items.length + alerts.length;

  const handleToggleTheme = () => {
    toggleTheme();
    const nextThemeName =
      theme === 'teal-mint'
        ? 'Saweria Emas (Klasik)'
        : theme === 'saweria'
        ? 'Midnight Dark (Mode Gelap)'
        : 'Teal Mint (Cerah & Segar)';
    showToast(`Tema diganti ke: ${nextThemeName} 🎨`, 'info');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b-2 border-brand-dark px-3 sm:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Dynamic Realtime Period Selector (Topbar Navbar) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <PeriodSelector />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Quick Theme Switcher Button (1-Click Switch: Teal Mint -> Saweria -> Midnight) */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="p-1.5 sm:p-2 rounded-xl border-2 border-brand-dark bg-white hover:bg-brand-cream shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center shrink-0 text-brand-dark"
          title={`Tema: ${
            theme === 'teal-mint'
              ? 'Teal Mint (Klik untuk ganti)'
              : theme === 'saweria'
              ? 'Saweria Emas (Klik untuk ganti)'
              : 'Midnight Dark (Klik untuk ganti)'
          }`}
          aria-label="Ganti Tema Warna"
        >
          {theme === 'midnight' ? (
            <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-sky-400 stroke-[2.2]" />
          ) : theme === 'teal-mint' ? (
            <Palette className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#379A8D] stroke-[2.2]" />
          ) : (
            <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 stroke-[2.2]" />
          )}
        </button>

        {/* Privacy Toggle (Eye) */}
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
          className={`hidden md:inline-flex p-2 sm:p-2 rounded-xl border-2 border-brand-dark transition-all shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 ${
            isPrivacyMode
              ? 'bg-amber-100 text-amber-900 border-brand-dark'
              : 'bg-white hover:bg-brand-cream text-brand-dark'
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

        {/* PWA Install Button */}
        <PWAInstallButton className="hidden lg:inline-flex" />

        {/* Notification Bell -> Opens Consolidated Daily Briefing */}
        <div className="relative shrink-0">
          <button
            onClick={openBriefing}
            className="p-1.5 sm:p-2 rounded-xl border-2 border-brand-dark bg-white hover:bg-brand-cream shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark relative"
            title={`Briefing Finansial & Pengingat (${totalNotificationCount} catatan)`}
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
            {totalNotificationCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full border border-brand-dark text-[9px] font-black flex items-center justify-center shadow-saweria-sm ${
                  dailyBriefing.hasUrgentItems
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-brand-primary text-brand-dark'
                }`}
              >
                {totalNotificationCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile / Settings Quick Access */}
        <Link
          to="/app/settings"
          className="p-1.5 sm:p-2 rounded-xl border-2 border-brand-dark bg-white hover:bg-brand-cream shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center shrink-0"
          title={`Profil & Pengaturan: ${user?.full_name || 'Pengguna'}`}
          aria-label="Buka Pengaturan Akun"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-5 h-5 rounded-md object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-md bg-brand-primary border border-brand-dark flex items-center justify-center text-[10px] font-black text-brand-dark">
              {user?.full_name && user.full_name !== 'Pengguna Pockito'
                ? user.full_name.charAt(0).toUpperCase()
                : 'P'}
            </div>
          )}
        </Link>

        {/* Quick Add Task (Desktop/Tablet) */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNewTask}
          leftIcon={<Check className="w-3.5 h-3.5" />}
          className="hidden sm:inline-flex"
        >
          <span>Tugas</span>
          <kbd className="hidden lg:inline-block ml-1.5 px-1 py-0.5 bg-black/10 rounded text-[9px] font-mono">T</kbd>
        </Button>

        {/* Quick Add Transaction (Primary) */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewTransaction}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0 whitespace-nowrap"
        >
          <span>Catat</span>
          <kbd className="hidden lg:inline-block ml-1.5 px-1 py-0.5 bg-black/15 rounded text-[9px] font-mono">N</kbd>
        </Button>
      </div>
    </header>
  );
};

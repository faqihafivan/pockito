import React, { useState } from 'react';
import { Plus, Bell, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { PeriodSelector } from './PeriodSelector';
import { InAppAlert, ReminderService } from '../../services/reminderService';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenNewTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTransaction, onOpenNewTask }) => {
  const { isPrivacyMode, togglePrivacyMode, dailyBriefing, openBriefing } = useData();
  const { showToast } = useNotification();
  const [alerts] = useState<InAppAlert[]>(() => ReminderService.getAlerts());

  const totalNotificationCount = dailyBriefing.items.length + alerts.length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b-2 border-brand-dark px-3 sm:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Dynamic Realtime Period Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <PeriodSelector />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Privacy Toggle (Eye) - Hidden on mobile to keep '+ Catat' prominently visible without cut-off; available on desktop and directly on Total Saldo Riil */}
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
          className={`hidden md:inline-flex p-2 sm:p-2.5 rounded-xl border-2 border-brand-dark transition-all shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 ${
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
            <EyeOff className="w-5 h-5 stroke-[2.2] text-amber-700" />
          ) : (
            <Eye className="w-5 h-5 stroke-[2.2]" />
          )}
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton className="hidden md:inline-flex" />

        {/* Notification Bell -> Opens Consolidated Daily Briefing */}
        <div className="relative shrink-0">
          <button
            onClick={openBriefing}
            className="p-2 sm:p-2.5 rounded-xl border-2 border-brand-dark bg-white hover:bg-brand-cream shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark relative"
            title={`Briefing Finansial & Pengingat (${totalNotificationCount} catatan)`}
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            {totalNotificationCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full border border-brand-dark text-[9.5px] font-black flex items-center justify-center shadow-saweria-sm ${
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

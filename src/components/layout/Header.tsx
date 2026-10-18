import React, { useState } from 'react';
import { Plus, Bell, Calendar, ChevronDown, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import { InAppAlert, ReminderService } from '../../services/reminderService';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenNewTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTransaction, onOpenNewTask }) => {
  const { selectedPeriod, setSelectedPeriod } = useData();
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<InAppAlert[]>(() => ReminderService.getAlerts());

  // Available monthly periods
  const periods = [
    { value: '2026-10', label: 'Oktober 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'Agustus 2026' },
    { value: '2026-11', label: 'November 2026' },
  ];

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b-2 border-brand-dark px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Period Selector */}
      <div className="flex items-center gap-3">
        <div className="relative inline-flex items-center">
          <div className="absolute left-3 pointer-events-none text-brand-darkMuted">
            <Calendar className="w-4 h-4" />
          </div>
          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            aria-label="Pilih Periode Bulan"
            className="appearance-none bg-brand-cream border-2 border-brand-dark font-black text-xs sm:text-sm text-brand-dark rounded-xl pl-9 pr-8 py-2 cursor-pointer shadow-saweria-sm hover:bg-brand-primary/20 transition-colors focus:outline-none"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 pointer-events-none text-brand-dark">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-2 sm:p-2.5 rounded-xl border-2 border-brand-dark bg-white hover:bg-brand-cream shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark relative"
            title="Pengingat & Notifikasi"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-brand-dark border border-brand-dark text-[10px] font-black flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showAlerts && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border-2 border-brand-dark shadow-saweria-lg p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                <span className="font-black text-xs uppercase tracking-wider text-brand-dark">
                  Pengingat Aktif
                </span>
                {alerts.length > 0 && (
                  <button
                    onClick={() => {
                      ReminderService.clearAlerts();
                      setAlerts([]);
                    }}
                    className="text-[11px] font-bold text-brand-darkMuted hover:text-brand-dark underline"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
              <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-xs text-brand-darkMuted py-4 text-center">
                    Tidak ada pengingat saat ini.
                  </p>
                ) : (
                  alerts.map((a) => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-brand-cream border border-brand-border text-left">
                      <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
                        <span>{a.title}</span>
                        <span className="text-[10px] text-brand-darkMuted">{a.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-brand-darkMuted mt-1">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Task (Desktop/Tablet) */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNewTask}
          leftIcon={<Check className="w-3.5 h-3.5" />}
          className="hidden sm:inline-flex"
        >
          Tugas
        </Button>

        {/* Quick Add Transaction (Primary) */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewTransaction}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          <span className="hidden xs:inline">+ Catat Transaksi</span>
          <span className="xs:hidden">+ Catat</span>
        </Button>
      </div>
    </header>
  );
};

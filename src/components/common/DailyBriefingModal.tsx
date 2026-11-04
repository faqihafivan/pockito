import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  Receipt,
  Calendar,
  Target,
  ShieldCheck,
  CheckSquare,
  ArrowRight,
  CheckCircle2,
  X,
  HandCoins,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { DailyBriefingResult, DailyBriefingItem } from '../../types';

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: DailyBriefingResult;
  onOpenTransaction?: () => void;
  onOpenTask?: () => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({
  isOpen,
  onClose,
  briefing,
  onOpenTransaction,
  onOpenTask,
}) => {
  const navigate = useNavigate();
  const [dontShowToday, setDontShowToday] = useState(true);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (dontShowToday) {
      const todayISO = new Date().toISOString().split('T')[0];
      try {
        localStorage.setItem(`pockito_daily_briefing_seen_${todayISO}`, 'true');
      } catch {
        // ignore storage errors
      }
    }
    onClose();
  };

  const handleItemAction = (item: DailyBriefingItem) => {
    handleDismiss();
    if (item.actionType === 'open_transaction') {
      if (onOpenTransaction) onOpenTransaction();
    } else if (item.actionType === 'open_task') {
      if (onOpenTask) onOpenTask();
    } else if (item.actionRoute) {
      navigate(item.actionRoute);
    }
  };

  const getItemIcon = (type: DailyBriefingItem['type']) => {
    switch (type) {
      case 'bill':
        return <Receipt className="w-5 h-5 text-red-600" />;
      case 'debt':
        return <HandCoins className="w-5 h-5 text-amber-700" />;
      case 'daily_log':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'goal':
        return <Target className="w-5 h-5 text-emerald-600" />;
      case 'safe_limit':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-brand-dark" />;
    }
  };

  const getUrgencyBadgeClass = (urgency: DailyBriefingItem['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500 text-white border-brand-dark animate-pulse';
      case 'medium':
        return 'bg-brand-primary text-brand-dark border-brand-dark';
      case 'info':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        className="relative w-full max-w-lg bg-[#FFFDF8] dark:bg-slate-900 rounded-3xl border-3 border-brand-dark dark:border-slate-700 shadow-saweria-lg z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Warm Indonesian Greeting & Mascot */}
        <div className="p-4 sm:p-5 border-b-2 border-brand-dark dark:border-slate-700 bg-brand-cream dark:bg-slate-800 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-xl border-2 border-brand-dark dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-brand-cream dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 shadow-saweria-sm transition-all"
            title="Tutup Briefing"
          >
            <X className="w-4 h-4 text-brand-dark dark:text-slate-200" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary text-brand-dark text-[11px] font-black border-2 border-brand-dark shadow-saweria-sm uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5 fill-brand-dark stroke-brand-dark" />
              Notifikasi Finansial
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-darkMuted dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-brand-dark/20 dark:border-slate-700">
              <Calendar className="w-3 h-3" />
              {briefing.dateLabel}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-slate-100 tracking-tight">
            {briefing.greeting}
          </h2>
        </div>

        {/* Content: Consolidated Briefing Items */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {briefing.items.length === 0 ? (
            <div className="p-6 text-center space-y-2 bg-white dark:bg-slate-800 rounded-2xl border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-saweria-sm">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h4 className="text-base font-black text-brand-dark dark:text-slate-100">Semua Beres & Aman!</h4>
              <p className="text-xs text-brand-darkMuted dark:text-slate-400 font-medium">
                Tidak ada tagihan atau hutang mendesak hari ini.
              </p>
            </div>
          ) : (
            briefing.items.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm transition-all bg-white dark:bg-slate-800 flex flex-col justify-between gap-2.5 ${
                  item.urgency === 'high' ? 'border-l-6 border-l-red-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-cream dark:bg-slate-900 border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center shrink-0 shadow-saweria-sm">
                    {getItemIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-brand-dark dark:text-slate-100 tracking-tight leading-snug">
                      {item.title}
                    </h4>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-saweria-sm shrink-0 uppercase tracking-wider ${getUrgencyBadgeClass(
                          item.urgency
                        )}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct 1-Click Action Button */}
                {item.actionText && (
                  <div className="flex justify-end pt-1 border-t border-brand-border/40 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleItemAction(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-brand-primary hover:bg-brand-primaryHover text-brand-dark border-2 border-brand-dark shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer with "Don't show again today" and Close */}
        <div className="p-4 sm:p-5 border-t-2 border-brand-dark dark:border-slate-700 bg-brand-cream dark:bg-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-brand-dark dark:text-slate-300 self-start sm:self-center">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-brand-dark text-brand-primary focus:ring-0 cursor-pointer"
            />
            <span>Jangan tampilkan otomatis lagi hari ini</span>
          </label>

          <Button
            variant="primary"
            size="md"
            onClick={handleDismiss}
            className="w-full sm:w-auto shadow-saweria"
          >
            Siap, Mengerti! 👍
          </Button>
        </div>
      </div>
    </div>
  );
};

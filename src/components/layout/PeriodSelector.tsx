import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import {
  formatPeriod,
  getCurrentRealtimePeriod,
  offsetPeriod,
  INDONESIAN_MONTHS,
  INDONESIAN_MONTHS_SHORT,
} from '../../domain/finance/financialEngine';

export const PeriodSelector: React.FC = () => {
  const { selectedPeriod, setSelectedPeriod, transactions } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse currently selected year and month
  const [selectedYear, selectedMonth] = useMemo(() => {
    const parts = selectedPeriod.split('-');
    return [
      parseInt(parts[0], 10) || new Date().getFullYear(),
      parseInt(parts[1], 10) || new Date().getMonth() + 1,
    ];
  }, [selectedPeriod]);

  // Year being viewed inside the popover picker
  const [viewYear, setViewYear] = useState<number>(selectedYear);

  // Sync viewYear when selectedPeriod changes
  useEffect(() => {
    setViewYear(selectedYear);
  }, [selectedYear]);

  // Real-time current period
  const currentRealtimePeriod = useMemo(() => getCurrentRealtimePeriod(), []);
  const [currentRealtimeYear, currentRealtimeMonth] = useMemo(() => {
    const parts = currentRealtimePeriod.split('-');
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  }, [currentRealtimePeriod]);

  const isCurrentMonth = selectedPeriod === currentRealtimePeriod;

  // Track months that have actual transactions recorded
  const activePeriodsWithTransactions = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date) {
        set.add(tx.date.slice(0, 7));
      }
    });
    return set;
  }, [transactions]);

  // Click outside and Escape key handling to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    setSelectedPeriod(offsetPeriod(selectedPeriod, -1));
  };

  const handleNextMonth = () => {
    setSelectedPeriod(offsetPeriod(selectedPeriod, 1));
  };

  const handleSelectMonth = (monthIndex: number) => {
    const formattedMonth = String(monthIndex + 1).padStart(2, '0');
    setSelectedPeriod(`${viewYear}-${formattedMonth}`);
    setIsOpen(false);
  };

  const handleJumpToCurrent = () => {
    setSelectedPeriod(currentRealtimePeriod);
    setViewYear(currentRealtimeYear);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      {/* Stepper Group */}
      <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-brand-cream/80 p-1 rounded-2xl border-2 border-brand-dark shadow-saweria-sm">
        {/* Prev Month Button */}
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-brand-primary border border-brand-dark/40 hover:border-brand-dark active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark"
          title="Bulan Sebelumnya"
          aria-label="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        </button>

        {/* Center Period Label & Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white hover:bg-brand-primary/20 border border-brand-dark/40 hover:border-brand-dark active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark font-black text-xs sm:text-sm select-none"
          title="Pilih Bulan & Tahun Lainnya"
          aria-expanded={isOpen}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-dark shrink-0" />
          <span className="tabular-nums tracking-tight whitespace-nowrap">
            {formatPeriod(selectedPeriod)}
          </span>

          {isCurrentMonth && (
            <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-brand-primary text-brand-dark border border-brand-dark uppercase tracking-wider">
              Bulan Ini
            </span>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-brand-dark/70 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Next Month Button */}
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-brand-primary border border-brand-dark/40 hover:border-brand-dark active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark"
          title="Bulan Berikutnya"
          aria-label="Bulan Berikutnya"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Popover Month & Year Picker */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-3xl border-2 border-brand-dark shadow-saweria-lg p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Year Navigator */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1.5 rounded-xl border-2 border-brand-dark bg-brand-cream hover:bg-brand-primary transition-colors text-brand-dark"
              title="Tahun Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-base font-black text-brand-dark tabular-nums tracking-tight">
                Tahun {viewYear}
              </span>
              {viewYear !== currentRealtimeYear && (
                <button
                  type="button"
                  onClick={() => setViewYear(currentRealtimeYear)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-brand-cream hover:bg-brand-primary border border-brand-dark transition-colors"
                  title="Kembali ke tahun berjalan"
                >
                  Tahun Ini
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1.5 rounded-xl border-2 border-brand-dark bg-brand-cream hover:bg-brand-primary transition-colors text-brand-dark"
              title="Tahun Berikutnya"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* 12 Months Grid (Strict Chronological Order) */}
          <div className="grid grid-cols-3 gap-2 py-3">
            {INDONESIAN_MONTHS.map((monthName, index) => {
              const monthNum = String(index + 1).padStart(2, '0');
              const periodKey = `${viewYear}-${monthNum}`;
              const isSelected = selectedYear === viewYear && selectedMonth === index + 1;
              const isCurrentRealtime =
                currentRealtimeYear === viewYear && currentRealtimeMonth === index + 1;
              const hasTransactions = activePeriodsWithTransactions.has(periodKey);

              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => handleSelectMonth(index)}
                  className={`relative p-2.5 rounded-2xl text-xs font-black transition-all text-center select-none ${
                    isSelected
                      ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-sm scale-[1.02]'
                      : isCurrentRealtime
                      ? 'bg-brand-cream text-brand-dark border-2 border-dashed border-brand-dark hover:border-solid hover:bg-brand-primary/20'
                      : 'bg-white hover:bg-brand-cream text-brand-dark border-2 border-brand-border hover:border-brand-dark'
                  }`}
                  title={`${monthName} ${viewYear}${hasTransactions ? ' (Terdapat transaksi)' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center py-0.5">
                    <span className="text-sm font-black tracking-tight">
                      {INDONESIAN_MONTHS_SHORT[index]}
                    </span>
                    <span className="text-[10px] font-bold opacity-75 truncate max-w-full">
                      {monthName}
                    </span>
                  </div>

                  {/* Indicators */}
                  <div className="absolute top-1 right-1.5 flex items-center gap-0.5">
                    {hasTransactions && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-600"
                        title="Ada riwayat transaksi"
                      />
                    )}
                    {isCurrentRealtime && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-brand-primary border border-brand-dark"
                        title="Bulan berjalan (Realtime)"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Popover Footer: Quick Realtime Jump */}
          <div className="pt-2 border-t-2 border-brand-border flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleJumpToCurrent}
              className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border-2 border-brand-dark font-black text-xs transition-all ${
                isCurrentMonth
                  ? 'bg-brand-cream/60 text-brand-darkMuted cursor-default'
                  : 'bg-brand-primary hover:bg-brand-primaryHover text-brand-dark shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {isCurrentMonth
                  ? 'Sedang di Bulan Ini (Realtime)'
                  : `Lompat ke Bulan Ini (${formatPeriod(currentRealtimePeriod, true)})`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

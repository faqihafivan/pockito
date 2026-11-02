import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Search,
  TrendingUp,
  TrendingDown,
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
  const { selectedPeriod, setSelectedPeriod, transactions, overview, formatMoney } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse currently selected year
  const selectedYear = useMemo(() => {
    const parts = selectedPeriod.split('-');
    return parseInt(parts[0], 10) || new Date().getFullYear();
  }, [selectedPeriod]);

  // Year being viewed inside the popover picker
  const [viewYear, setViewYear] = useState<number>(selectedYear);

  // Sync viewYear when selectedPeriod changes
  useEffect(() => {
    setViewYear(selectedYear);
  }, [selectedYear]);

  // Real-time current period
  const currentRealtimePeriod = useMemo(() => getCurrentRealtimePeriod(), []);
  const [currentRealtimeYear] = useMemo(() => {
    const parts = currentRealtimePeriod.split('-');
    return [parseInt(parts[0], 10)];
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
    setSearchQuery('');
  };

  const handleJumpToCurrent = () => {
    setSelectedPeriod(currentRealtimePeriod);
    setViewYear(currentRealtimeYear);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter months if user types a search query
  const filteredMonths = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return INDONESIAN_MONTHS.map((name, idx) => ({ name, idx })).filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        INDONESIAN_MONTHS_SHORT[m.idx].toLowerCase().includes(q) ||
        `${m.idx + 1}` === q ||
        `0${m.idx + 1}` === q
    );
  }, [searchQuery]);

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      {/* Stepper Group */}
      <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-brand-cream/80 p-1 rounded-2xl border-2 border-brand-dark shadow-saweria-sm">
        {/* Prev Month Button */}
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-brand-primary border border-brand-dark/40 hover:border-brand-dark active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark cursor-pointer"
          title="Bulan Sebelumnya"
          aria-label="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        </button>

        {/* Center Period Label & Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white hover:bg-brand-primary/20 border border-brand-dark/40 hover:border-brand-dark active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark font-black text-xs sm:text-sm select-none cursor-pointer"
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
          className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-brand-primary border border-brand-dark/40 hover:border-brand-dark active:translate-x-0.5 active:translate-y-0.5 transition-all text-brand-dark cursor-pointer"
          title="Bulan Berikutnya"
          aria-label="Bulan Berikutnya"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Popover Month & Year Picker */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-3xl border-2 border-brand-dark shadow-saweria-lg p-3.5 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Financial Summary for Selected Month (Menjawab Feedback #6) */}
          <div className="mb-3 p-2.5 rounded-2xl bg-brand-cream border border-brand-border flex items-center justify-between text-xs font-black">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              <div className="text-left">
                <span className="text-[9px] text-brand-darkMuted uppercase block">Masuk</span>
                <span className="tabular-nums text-emerald-900">{formatMoney(overview.monthlyIncome)}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-brand-border" />
            <div className="flex items-center gap-1.5 text-rose-800">
              <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
              <div className="text-right">
                <span className="text-[9px] text-brand-darkMuted uppercase block">Keluar</span>
                <span className="tabular-nums text-rose-900">{formatMoney(overview.totalMonthlyExpense)}</span>
              </div>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 text-brand-darkMuted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bulan (misal: 'Mei', 'Okt')..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-bold bg-white text-brand-dark rounded-xl border-2 border-brand-border focus:border-brand-dark outline-none"
            />
          </div>

          {/* Year Navigator */}
          <div className="flex items-center justify-between pb-2.5 border-b-2 border-brand-border">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1.5 rounded-xl border-2 border-brand-dark bg-brand-cream hover:bg-brand-primary transition-colors text-brand-dark cursor-pointer"
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
                  className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-brand-cream hover:bg-brand-primary border border-brand-dark transition-colors cursor-pointer"
                  title="Kembali ke tahun berjalan"
                >
                  Tahun Ini
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1.5 rounded-xl border-2 border-brand-dark bg-brand-cream hover:bg-brand-primary transition-colors text-brand-dark cursor-pointer"
              title="Tahun Berikutnya"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-3 gap-1.5 py-2.5">
            {filteredMonths
              ? filteredMonths.map((m) => {
                  const formattedMonth = String(m.idx + 1).padStart(2, '0');
                  const periodKey = `${viewYear}-${formattedMonth}`;
                  const isSelected = selectedPeriod === periodKey;

                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => handleSelectMonth(m.idx)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all border-2 cursor-pointer ${
                        isSelected
                          ? 'bg-brand-primary text-brand-dark border-brand-dark shadow-saweria-sm'
                          : 'bg-brand-cream/60 border-brand-border text-brand-dark hover:border-brand-dark hover:bg-white'
                      }`}
                    >
                      {m.name}
                    </button>
                  );
                })
              : INDONESIAN_MONTHS.map((monthName, index) => {
                  const formattedMonth = String(index + 1).padStart(2, '0');
                  const periodKey = `${viewYear}-${formattedMonth}`;
                  const isSelected = selectedPeriod === periodKey;
                  const hasTransactions = activePeriodsWithTransactions.has(periodKey);
                  const isCurrentRealtime =
                    currentRealtimeYear === viewYear && currentRealtimePeriod.endsWith(formattedMonth);

                  return (
                    <button
                      key={monthName}
                      type="button"
                      onClick={() => handleSelectMonth(index)}
                      className={`relative py-2 px-1 rounded-xl text-xs font-black transition-all border-2 cursor-pointer ${
                        isSelected
                          ? 'bg-brand-primary text-brand-dark border-brand-dark shadow-saweria-sm scale-[1.02]'
                          : hasTransactions
                          ? 'bg-brand-cream border-brand-border text-brand-dark hover:border-brand-dark hover:bg-white'
                          : 'bg-white border-transparent text-brand-darkMuted hover:border-brand-border hover:bg-brand-cream/40'
                      }`}
                    >
                      <span>{INDONESIAN_MONTHS_SHORT[index]}</span>
                      {hasTransactions && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 absolute top-1 right-1" />
                      )}
                      {isCurrentRealtime && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary border border-brand-dark absolute top-1 left-1" />
                      )}
                    </button>
                  );
                })}
          </div>

          {/* Popover Footer: Quick Realtime Jump */}
          <div className="pt-2 border-t-2 border-brand-border flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleJumpToCurrent}
              className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border-2 border-brand-dark font-black text-xs transition-all cursor-pointer ${
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

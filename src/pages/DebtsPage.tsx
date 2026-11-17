import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DebtCard } from '../components/debts/DebtCard';
import { DebtModal } from '../components/debts/DebtModal';
import { DebtPaymentModal } from '../components/debts/DebtPaymentModal';
import { Debt, DebtType } from '../types';
import {
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Sparkles,
} from 'lucide-react';

export const DebtsPage: React.FC = () => {
  const { debts, formatMoney } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<Debt | null>(null);
  const [debtToPay, setDebtToPay] = useState<Debt | null>(null);
  const [defaultType, setDefaultType] = useState<DebtType>('receivable');
  const [filterTab, setFilterTab] = useState<'all' | 'receivable' | 'payable' | 'settled'>('all');

  // Stats
  const stats = useMemo(() => {
    let totalReceivable = 0; // Uang kita di luar (sisa)
    let totalPayable = 0; // Hutang kita ke orang (sisa)
    let activeReceivableCount = 0;
    let activePayableCount = 0;
    let settledCount = 0;

    debts.forEach((d) => {
      const remaining = Math.max(0, d.amount - d.paid_amount);
      if (d.is_settled || remaining === 0) {
        settledCount += 1;
      } else if (d.type === 'receivable') {
        totalReceivable += remaining;
        activeReceivableCount += 1;
      } else {
        totalPayable += remaining;
        activePayableCount += 1;
      }
    });

    const netPosition = totalReceivable - totalPayable;

    return {
      totalReceivable,
      totalPayable,
      activeReceivableCount,
      activePayableCount,
      settledCount,
      netPosition,
    };
  }, [debts]);

  // Filtered List
  const filteredList = useMemo(() => {
    return debts.filter((d) => {
      if (filterTab === 'settled') return d.is_settled;
      if (d.is_settled && filterTab !== 'all') return false;
      if (filterTab === 'receivable') return d.type === 'receivable';
      if (filterTab === 'payable') return d.type === 'payable';
      return true;
    });
  }, [debts, filterTab]);

  const handleOpenNew = (type: DebtType) => {
    setDebtToEdit(null);
    setDefaultType(type);
    setIsModalOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setDebtToEdit(debt);
    setIsModalOpen(true);
  };

  const handlePay = (debt: Debt) => {
    setDebtToPay(debt);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-xs font-black text-brand-dark border border-brand-primary/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
            <span>Social Finance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            Buku Hutang & Piutang
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
            Pantau talangan uang yang dipinjam teman (Piutang) dan kewajiban cicilanmu (Hutang).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleOpenNew('payable')}
            leftIcon={<ArrowUpRight className="w-4 h-4 text-rose-600" />}
          >
            + Hutang
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenNew('receivable')}
            leftIcon={<ArrowDownLeft className="w-4 h-4 text-brand-dark" />}
          >
            + Piutang
          </Button>
        </div>
      </div>

      {/* KPI Overview Bento Cards (Responsive 2x2 on Mobile, 3 cols on Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {/* Total Piutang */}
        <Card variant="saweria" className="p-3.5 sm:p-5 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between text-brand-darkMuted">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              Piutang (Uang di Teman)
            </span>
            <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5] shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono tabular-nums mt-1 sm:mt-1.5">
            {formatMoney(stats.totalReceivable)}
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold text-brand-darkMuted mt-0.5 sm:mt-1 truncate">
            {stats.activeReceivableCount} orang belum kembalikan
          </p>
        </Card>

        {/* Total Hutang */}
        <Card variant="saweria" className="p-3.5 sm:p-5 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between text-brand-darkMuted">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              Hutang (Kewajibanmu)
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 stroke-[2.5] shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-rose-700 font-mono tabular-nums mt-1 sm:mt-1.5">
            {formatMoney(stats.totalPayable)}
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold text-brand-darkMuted mt-0.5 sm:mt-1 truncate">
            {stats.activePayableCount} cicilan / hutang aktif
          </p>
        </Card>

        {/* Posisi Bersih */}
        <Card variant="saweria" className="col-span-2 sm:col-span-1 p-3.5 sm:p-5 bg-white flex sm:flex-col justify-between items-center sm:items-start gap-2">
          <div className="flex items-center justify-between w-full text-brand-darkMuted">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              Posisi Saldo Bersih
            </span>
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-dark stroke-[2.5] shrink-0" />
          </div>
          <div
            className={`text-lg sm:text-2xl font-black font-mono tabular-nums mt-0 sm:mt-1.5 ${
              stats.netPosition >= 0 ? 'text-brand-dark' : 'text-rose-700'
            }`}
          >
            {formatMoney(stats.netPosition)}
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold text-brand-darkMuted mt-0 sm:mt-1 hidden sm:block">
            {stats.netPosition >= 0
              ? 'Posisi aman (piutang > hutang)'
              : 'Posisi defisit (hutang > piutang)'}
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-b-2 border-brand-dark/15 pb-2">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Semua ({debts.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('receivable')}
          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            filterTab === 'receivable'
              ? 'bg-emerald-600 text-white border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Piutang ({stats.activeReceivableCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('payable')}
          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            filterTab === 'payable'
              ? 'bg-rose-600 text-white border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Hutang ({stats.activePayableCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('settled')}
          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            filterTab === 'settled'
              ? 'bg-brand-cream text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Lunas ({stats.settledCount})
        </button>
      </div>

      {/* Grid List / 3-Layer Rich Empty State */}
      {filteredList.length === 0 ? (
        <Card
          variant="saweria"
          className="p-8 sm:p-12 text-center bg-white border-2 border-brand-dark shadow-saweria flex flex-col items-center justify-center space-y-4"
        >
          {/* Layer 1: Layered SVG Visual with subtle glow */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-amber-100/60 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-brand-dark shadow-saweria-sm flex items-center justify-center text-amber-950 transform rotate-3 hover:rotate-0 transition-transform">
              <Users className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-7 h-7 rounded-xl bg-teal-500 border-2 border-brand-dark shadow-saweria-xs flex items-center justify-center text-white text-xs">
              ⚖️
            </div>
          </div>

          {/* Layer 2: Contextual Friendly Copy */}
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg sm:text-xl font-display font-black text-brand-dark tracking-tight">
              {filterTab === 'settled'
                ? 'Belum Ada yang Lunas'
                : 'Buku Catatan Masih Kosong'}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-brand-darkMuted leading-relaxed">
              {filterTab === 'settled'
                ? 'Catatan hutang atau piutang yang telah selesai dibayar akan tercatat rapi di sini.'
                : 'Catat uang talangan makan bersama teman atau cicilanmu agar silaturahmi tetap terjaga dan saldo tetap transparan.'}
            </p>
          </div>

          {/* Layer 3: Actionable Primary CTA */}
          {filterTab !== 'settled' && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleOpenNew('receivable')}
                leftIcon={<ArrowDownLeft className="w-4 h-4 text-brand-dark" />}
                className="min-h-[44px]"
              >
                + Catat Piutang (Talangan)
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleOpenNew('payable')}
                leftIcon={<ArrowUpRight className="w-4 h-4 text-rose-600" />}
                className="min-h-[44px]"
              >
                + Catat Hutang
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredList.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onEdit={handleEdit}
              onPay={handlePay}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <DebtModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDebtToEdit(null);
        }}
        debtToEdit={debtToEdit}
        defaultType={defaultType}
      />

      {/* Payment / Settlement Modal */}
      <DebtPaymentModal
        isOpen={Boolean(debtToPay)}
        onClose={() => setDebtToPay(null)}
        debt={debtToPay}
      />
    </div>
  );
};

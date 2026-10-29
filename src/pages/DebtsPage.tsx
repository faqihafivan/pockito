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

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Piutang */}
        <Card variant="saweria" className="p-5 bg-white">
          <div className="flex items-center justify-between text-brand-darkMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Piutang (Uang di Orang Lain)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tabular-nums mt-1.5">
            {formatMoney(stats.totalReceivable)}
          </div>
          <p className="text-[11px] font-bold text-brand-darkMuted mt-1">
            {stats.activeReceivableCount} orang belum mengembalikan
          </p>
        </Card>

        {/* Total Hutang */}
        <Card variant="saweria" className="p-5 bg-white">
          <div className="flex items-center justify-between text-brand-darkMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Hutang (Kewajibanmu)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black text-rose-700 tabular-nums mt-1.5">
            {formatMoney(stats.totalPayable)}
          </div>
          <p className="text-[11px] font-bold text-brand-darkMuted mt-1">
            {stats.activePayableCount} cicilan / hutang aktif
          </p>
        </Card>

        {/* Posisi Bersih */}
        <Card variant="saweria" className="p-5 bg-white">
          <div className="flex items-center justify-between text-brand-darkMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Posisi Saldo Bersih</span>
            <Scale className="w-4 h-4 text-brand-dark stroke-[2.5]" />
          </div>
          <div
            className={`text-2xl font-black tabular-nums mt-1.5 ${
              stats.netPosition >= 0 ? 'text-brand-dark' : 'text-rose-700'
            }`}
          >
            {formatMoney(stats.netPosition)}
          </div>
          <p className="text-[11px] font-bold text-brand-darkMuted mt-1">
            {stats.netPosition >= 0
              ? 'Posisi surplus (piutang > hutang)'
              : 'Posisi defisit (hutang > piutang)'}
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-brand-dark/15 pb-2">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
            filterTab === 'all'
              ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Semua ({debts.length})
        </button>
        <button
          onClick={() => setFilterTab('receivable')}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
            filterTab === 'receivable'
              ? 'bg-emerald-300 text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Piutang / Uang di Luar ({stats.activeReceivableCount})
        </button>
        <button
          onClick={() => setFilterTab('payable')}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
            filterTab === 'payable'
              ? 'bg-rose-300 text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Hutang / Kewajiban ({stats.activePayableCount})
        </button>
        <button
          onClick={() => setFilterTab('settled')}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
            filterTab === 'settled'
              ? 'bg-brand-cream text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Sudah Lunas ({stats.settledCount})
        </button>
      </div>

      {/* Grid List */}
      {filteredList.length === 0 ? (
        <Card variant="saweria" className="p-12 text-center bg-white">
          <Users className="w-12 h-12 text-brand-darkMuted mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-black text-brand-dark">Tidak Ada Catatan</h3>
          <p className="text-xs font-bold text-brand-darkMuted max-w-sm mx-auto mt-1">
            {filterTab === 'settled'
              ? 'Belum ada catatan yang ditandai lunas.'
              : 'Tidak ada catatan hutang maupun piutang di kategori ini.'}
          </p>
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

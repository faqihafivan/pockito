import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SubscriptionCard } from '../components/subscriptions/SubscriptionCard';
import { SubscriptionModal } from '../components/subscriptions/SubscriptionModal';
import { Subscription } from '../types';
import { formatPeriod } from '../domain/finance/financialEngine';
import {
  Plus,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  const { subscriptions, selectedPeriod, formatMoney } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subToEdit, setSubToEdit] = useState<Subscription | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');

  const periodLabel = formatPeriod(selectedPeriod);

  // Statistics calculation
  const stats = useMemo(() => {
    let totalMonthly = 0;
    let paidCount = 0;
    let paidAmount = 0;

    subscriptions.forEach((s) => {
      if (s.is_active) {
        totalMonthly += s.amount;
        if (s.last_paid_period === selectedPeriod) {
          paidCount += 1;
          paidAmount += s.amount;
        }
      }
    });

    const pendingCount = subscriptions.filter((s) => s.is_active && s.last_paid_period !== selectedPeriod).length;
    const remainingAmount = Math.max(0, totalMonthly - paidAmount);

    return {
      totalMonthly,
      paidCount,
      pendingCount,
      paidAmount,
      remainingAmount,
      totalActive: subscriptions.filter((s) => s.is_active).length,
    };
  }, [subscriptions, selectedPeriod]);

  // Filtered subscriptions
  const filteredList = useMemo(() => {
    return subscriptions.filter((s) => {
      if (!s.is_active) return false;
      const isPaid = s.last_paid_period === selectedPeriod;
      if (filterStatus === 'paid') return isPaid;
      if (filterStatus === 'pending') return !isPaid;
      return true;
    });
  }, [subscriptions, selectedPeriod, filterStatus]);

  const handleEdit = (sub: Subscription) => {
    setSubToEdit(sub);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setSubToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-xs font-black text-brand-dark border border-brand-primary/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
            <span>Periode {periodLabel}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            Langganan & Tagihan Rutin
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
            Pantau seluruh pengeluaran berulang (Kos, Internet, Spotify, Cicilan) dan bayar dengan 1-klik.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenNew}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Tambah Tagihan
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Rutin Bulanan */}
        <Card variant="saweria" className="p-5 bg-white">
          <div className="flex items-center justify-between text-brand-darkMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Komitmen / Bulan</span>
            <CalendarClock className="w-4 h-4 text-brand-primary stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black text-brand-dark tabular-nums mt-1.5">
            {formatMoney(stats.totalMonthly)}
          </div>
          <p className="text-[11px] font-bold text-brand-darkMuted mt-1">
            {stats.totalActive} tagihan aktif tercatat
          </p>
        </Card>

        {/* Sudah Dibayar Bulan Ini */}
        <Card variant="saweria" className="p-5 bg-white">
          <div className="flex items-center justify-between text-brand-darkMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Sudah Terbayar ({periodLabel})</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tabular-nums mt-1.5">
            {formatMoney(stats.paidAmount)}
          </div>
          <p className="text-[11px] font-bold text-brand-darkMuted mt-1">
            {stats.paidCount} dari {stats.totalActive} tagihan lunas
          </p>
        </Card>

        {/* Sisa Tagihan Bulan Ini */}
        <Card variant="saweria" className="p-5 bg-white">
          <div className="flex items-center justify-between text-brand-darkMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Sisa Belum Bayar</span>
            <AlertCircle className="w-4 h-4 text-amber-500 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black text-brand-dark tabular-nums mt-1.5">
            {formatMoney(stats.remainingAmount)}
          </div>
          <p className="text-[11px] font-bold text-brand-darkMuted mt-1">
            {stats.pendingCount} tagihan masih menanti pembayaran
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-brand-dark/15 pb-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
            filterStatus === 'all'
              ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Semua ({subscriptions.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
            filterStatus === 'pending'
              ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Belum Dibayar ({stats.pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('paid')}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
            filterStatus === 'paid'
              ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Sudah Lunas ({stats.paidCount})
        </button>
      </div>

      {/* Grid of Subscriptions */}
      {filteredList.length === 0 ? (
        <Card variant="saweria" className="p-12 text-center bg-white">
          <CalendarClock className="w-12 h-12 text-brand-darkMuted mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-black text-brand-dark">Tidak Ada Tagihan Rutin</h3>
          <p className="text-xs font-bold text-brand-darkMuted max-w-sm mx-auto mt-1">
            {filterStatus === 'pending'
              ? 'Hebat! Semua tagihan rutinmu untuk periode ini sudah lunas terbayar.'
              : 'Belum ada tagihan berkala. Tambahkan kos, wifi, atau paket langgananmu sekarang!'}
          </p>
          {filterStatus === 'all' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenNew}
              className="mt-4"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Tambah Tagihan Sekarang
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredList.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSubToEdit(null);
        }}
        subscriptionToEdit={subToEdit}
      />
    </div>
  );
};

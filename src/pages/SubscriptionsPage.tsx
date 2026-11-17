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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums mt-1.5">
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
              ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Semua ({subscriptions.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
            filterStatus === 'pending'
              ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Belum Dibayar ({stats.pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('paid')}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
            filterStatus === 'paid'
              ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-sm'
              : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
          }`}
        >
          Sudah Lunas ({stats.paidCount})
        </button>
      </div>

      {/* Grid of Subscriptions / 3-Layer Rich Empty State */}
      {filteredList.length === 0 ? (
        <Card
          variant="saweria"
          className="p-8 sm:p-12 text-center bg-white border-2 border-brand-dark shadow-saweria flex flex-col items-center justify-center space-y-4"
        >
          {/* Layer 1: Layered SVG Visual with subtle glow */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-sky-100/60 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 border-2 border-brand-dark shadow-saweria-sm flex items-center justify-center text-white transform -rotate-2 hover:rotate-0 transition-transform">
              <CalendarClock className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-xl bg-emerald-400 border-2 border-brand-dark shadow-saweria-xs flex items-center justify-center text-xs">
              ⚡
            </div>
          </div>

          {/* Layer 2: Contextual Friendly Copy */}
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg sm:text-xl font-display font-black text-brand-dark tracking-tight">
              {filterStatus === 'pending'
                ? 'Semua Tagihan Sudah Lunas! 🎉'
                : 'Belum Ada Tagihan Rutin'}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-brand-darkMuted leading-relaxed">
              {filterStatus === 'pending'
                ? 'Bagus sekali! Semua tanggal bayar kos, listrik, wifi, dan langgananmu periode ini sudah lunas tanpa denda.'
                : 'Daftarkan kos, listrik, wifi, atau streaming agar kamu tidak pernah terlambat bayar dan terhindar dari denda.'}
            </p>
          </div>

          {/* Layer 3: Actionable Primary CTA */}
          <div className="pt-2">
            {filterStatus === 'pending' ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setFilterStatus('all')}
                className="min-h-[44px]"
              >
                Lihat Semua Tagihan ({stats.totalActive})
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenNew}
                leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                className="min-h-[44px]"
              >
                + Tambah Tagihan Sekarang
              </Button>
            )}
          </div>
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

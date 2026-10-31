import React, { useState } from 'react';
import { Subscription } from '../../types';
import { formatIDR, formatPeriod, getSubscriptionDueDateInfo } from '../../domain/finance/financialEngine';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import {
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Edit2,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
}) => {
  const { pockets, accounts, selectedPeriod, paySubscription, deleteSubscription, formatMoney } = useData();
  const { showConfirm, showToast } = useNotification();
  const [isPaying, setIsPaying] = useState(false);

  const pocket = pockets.find((p) => p.id === subscription.category_pocket_id);
  const account = accounts.find((a) => a.id === subscription.account_id);

  const isPaidThisMonth = subscription.last_paid_period === selectedPeriod;
  const dueInfo = getSubscriptionDueDateInfo(subscription.due_day, selectedPeriod, isPaidThisMonth);

  const handlePay = async () => {
    const periodLabel = formatPeriod(selectedPeriod);
    const confirmed = await showConfirm({
      title: `Bayar ${subscription.name}?`,
      message: `Konfirmasi pembayaran ${subscription.name} sebesar ${formatIDR(subscription.amount)} untuk periode ${periodLabel}?\n\nTransaksi pengeluaran akan otomatis dicatat ke rekening ${account?.name || 'Utama'}.`,
      confirmText: 'Konfirmasi Bayar',
    });

    if (!confirmed) return;

    setIsPaying(true);
    try {
      await paySubscription(subscription.id, selectedPeriod, account?.id);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FAAE2B', '#10B981', '#18181B'],
      });
      showToast(`Berhasil membayar tagihan ${subscription.name}!`, 'success');
    } catch (err: unknown) {
      showToast((err as Error).message || 'Gagal memproses pembayaran', 'error');
    } finally {
      setIsPaying(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Hapus Tagihan Rutin?',
      message: `Hapus pengingat langganan "${subscription.name}"? Riwayat transaksi lama yang pernah dicatat tidak akan terhapus.`,
      confirmText: 'Ya, Hapus',
      isDanger: true,
    });

    if (confirmed) {
      await deleteSubscription(subscription.id);
      showToast('Tagihan rutin berhasil dihapus', 'info');
    }
  };

  return (
    <Card
      variant="saweria"
      className={`p-4 sm:p-5 bg-white relative transition-all ${
        isPaidThisMonth ? 'opacity-90' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-sm"
            style={{ backgroundColor: pocket?.color || '#FAAE2B' }}
          >
            <CalendarClock className="w-5 h-5 text-brand-dark stroke-[2.3]" />
          </div>
          <div>
            <h4 className="text-base font-black text-brand-dark tracking-tight line-clamp-1">
              {subscription.name}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-bold text-brand-darkMuted">
                Tgl {subscription.due_day} tiap {subscription.billing_cycle === 'monthly' ? 'bulan' : subscription.billing_cycle}
              </span>
              {pocket && (
                <>
                  <span className="text-brand-darkMuted">•</span>
                  <span className="text-[11px] font-bold text-brand-darkMuted">
                    {pocket.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {dueInfo.status === 'paid' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Lunas</span>
          </span>
        ) : dueInfo.status === 'overdue' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Lewat Tempo</span>
          </span>
        ) : dueInfo.status === 'due_today' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Hari Ini!</span>
          </span>
        ) : dueInfo.diffDays <= 3 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>{dueInfo.badgeLabel}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-cream text-brand-dark border border-brand-border">
            <span>Belum Bayar</span>
          </span>
        )}
      </div>

      {/* Amount Display */}
      <div className="mt-4 pt-3 border-t border-brand-border flex items-baseline justify-between">
        <div>
          <span className="text-[10px] font-bold text-brand-darkMuted uppercase tracking-wider block">
            Nominal Tagihan
          </span>
          <span className="text-xl font-black text-brand-dark tabular-nums">
            {formatMoney(subscription.amount)}
          </span>
        </div>

        {account && (
          <div className="text-right">
            <span className="text-[10px] font-bold text-brand-darkMuted uppercase tracking-wider block">
              Sumber Dana
            </span>
            <span className="text-xs font-bold text-brand-dark inline-flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-brand-primary" />
              <span>{account.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Notes if any */}
      {subscription.notes && (
        <p className="text-[11px] font-medium text-brand-darkMuted mt-2 p-2 rounded-xl bg-brand-cream/60 border border-brand-border/60">
          📝 {subscription.notes}
        </p>
      )}

      {/* Actions Bar */}
      <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(subscription)}
            className="p-1.5 rounded-lg border border-brand-border hover:bg-brand-cream text-brand-darkMuted hover:text-brand-dark transition-colors"
            title="Edit Tagihan"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg border border-brand-border hover:bg-rose-50 text-brand-darkMuted hover:text-rose-600 transition-colors"
            title="Hapus Tagihan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {!isPaidThisMonth ? (
          <Button
            size="sm"
            variant="primary"
            onClick={handlePay}
            isLoading={isPaying}
            leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            Bayar Sekarang
          </Button>
        ) : (
          <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tercatat di Transaksi</span>
          </span>
        )}
      </div>
    </Card>
  );
};

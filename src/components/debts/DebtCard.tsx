import React from 'react';
import { Debt } from '../../types';
import { formatIDR } from '../../domain/finance/financialEngine';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import {
  User,
  Calendar,
  CheckCircle2,
  Edit2,
  Trash2,
  Send,
  Coins,
} from 'lucide-react';

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onPay: (debt: Debt) => void;
}

export const DebtCard: React.FC<DebtCardProps> = ({ debt, onEdit, onPay }) => {
  const { deleteDebt, formatMoney } = useData();
  const { showConfirm, showToast } = useNotification();

  const isReceivable = debt.type === 'receivable';
  const remainingAmount = Math.max(0, debt.amount - debt.paid_amount);
  const percentPaid = debt.amount > 0 ? Math.min(100, Math.round((debt.paid_amount / debt.amount) * 100)) : 100;

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Hapus Catatan?',
      message: `Hapus catatan ${isReceivable ? 'piutang' : 'hutang'} ${debt.person_name} (${debt.description})?`,
      confirmText: 'Ya, Hapus',
      isDanger: true,
    });
    if (confirmed) {
      await deleteDebt(debt.id);
      showToast('Catatan berhasil dihapus', 'info');
    }
  };

  // WhatsApp Reminder template
  const handleWhatsAppReminder = () => {
    const message = `Halo ${debt.person_name}, semoga kabarnya baik ya! 🙏\n\nMau sekadar mengingatkan terkait titipan/talangan "${debt.description}" sebesar ${formatIDR(remainingAmount)}.\nBoleh minta tolong dicek saat ada waktu senggang ya. Terima kasih banyak!`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      variant="saweria"
      className={`p-4 sm:p-5 bg-white relative transition-all ${
        debt.is_settled ? 'opacity-85' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-sm ${
              isReceivable ? 'bg-emerald-300' : 'bg-rose-300'
            }`}
          >
            <User className="w-5 h-5 text-brand-dark stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isReceivable
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {isReceivable ? 'Piutang' : 'Hutang'}
              </span>
              {debt.is_settled && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Lunas</span>
                </span>
              )}
            </div>
            <h4 className="text-base font-black text-brand-dark tracking-tight mt-1 line-clamp-1">
              {debt.person_name}
            </h4>
            <p className="text-xs font-bold text-brand-darkMuted line-clamp-1">
              {debt.description}
            </p>
          </div>
        </div>

        {/* Due Date Indicator */}
        {debt.due_date && (
          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-brand-cream border border-brand-border text-[11px] font-bold text-brand-dark">
              <Calendar className="w-3 h-3 text-brand-darkMuted" />
              <span>{debt.due_date}</span>
            </span>
          </div>
        )}
      </div>

      {/* Progress & Amount Metrics */}
      <div className="mt-4 pt-3 border-t border-brand-border space-y-2">
        <div className="flex items-baseline justify-between text-xs font-bold text-brand-darkMuted">
          <span>Sudah Dibayar: <b className="text-brand-dark tabular-nums">{formatMoney(debt.paid_amount)}</b></span>
          <span>Total: <b className="text-brand-dark tabular-nums">{formatMoney(debt.amount)}</b></span>
        </div>

        <ProgressBar
          value={percentPaid}
          color={isReceivable ? '#10B981' : '#F43F5E'}
          size="md"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-brand-darkMuted">
            {debt.is_settled ? 'Status Lunas' : 'Sisa Belum Dibayar:'}
          </span>
          <span className={`text-base font-black tabular-nums ${debt.is_settled ? 'text-emerald-700' : 'text-brand-dark'}`}>
            {debt.is_settled ? 'Rp 0' : formatMoney(remainingAmount)}
          </span>
        </div>
      </div>

      {/* Notes if any */}
      {debt.notes && (
        <p className="text-[11px] font-medium text-brand-darkMuted mt-2 p-2 rounded-xl bg-brand-cream/60 border border-brand-border/60">
          📝 {debt.notes}
        </p>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(debt)}
            className="p-1.5 rounded-lg border border-brand-border hover:bg-brand-cream text-brand-darkMuted hover:text-brand-dark transition-colors"
            title="Edit Catatan"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg border border-brand-border hover:bg-rose-50 text-brand-darkMuted hover:text-rose-600 transition-colors"
            title="Hapus Catatan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp Reminder button for receivables */}
          {isReceivable && !debt.is_settled && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWhatsAppReminder}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              title="Kirim pengingat ramah via WhatsApp"
            >
              Tagih WA
            </Button>
          )}

          {!debt.is_settled && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onPay(debt)}
              leftIcon={<Coins className="w-3.5 h-3.5" />}
            >
              Catat Cicilan
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

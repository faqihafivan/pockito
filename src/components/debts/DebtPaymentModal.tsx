import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { Debt } from '../../types';
import { formatIDR } from '../../domain/finance/financialEngine';
import confetti from 'canvas-confetti';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
  isOpen,
  onClose,
  debt,
}) => {
  const { accounts, recordDebtPayment } = useData();
  const { showToast } = useNotification();

  if (!debt) return null;

  const remainingAmount = Math.max(0, debt.amount - debt.paid_amount);

  const [paymentAmount, setPaymentAmount] = useState<number>(remainingAmount);
  const [accountId, setAccountId] = useState<string>(debt.account_id || accounts[0]?.id || '');
  const [recordTransaction, setRecordTransaction] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (paymentAmount <= 0) {
      setError('Nominal pembayaran harus lebih besar dari Rp 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await recordDebtPayment(
        debt.id,
        paymentAmount,
        recordTransaction ? accountId : undefined,
        recordTransaction
      );

      if (updated.is_settled) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FAAE2B', '#10B981', '#18181B'],
        });
        showToast(`Hore! ${debt.type === 'receivable' ? 'Piutang' : 'Hutang'} ${debt.person_name} telah 100% lunas! 🎉`, 'success');
      } else {
        showToast(`Berhasil mencatat cicilan ${formatIDR(paymentAmount)}`, 'success');
      }

      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal memproses pembayaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Catat ${debt.type === 'receivable' ? 'Penerimaan' : 'Pembayaran'}: ${debt.person_name}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Info Ringkas */}
        <div className="p-3.5 rounded-2xl bg-brand-cream border border-brand-border">
          <div className="flex items-center justify-between text-xs font-bold text-brand-darkMuted">
            <span>Total Pokok</span>
            <span className="text-brand-dark tabular-nums font-black">{formatIDR(debt.amount)}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-brand-darkMuted mt-1">
            <span>Sudah Dicicil/Terbayar</span>
            <span className="text-emerald-700 tabular-nums font-black">{formatIDR(debt.paid_amount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-black text-brand-dark border-t border-brand-border/80 pt-2 mt-2">
            <span>Sisa Belum Lunas</span>
            <span className="tabular-nums text-rose-600">{formatIDR(remainingAmount)}</span>
          </div>
        </div>

        {/* Input Nominal Pembayaran */}
        <div>
          <CurrencyInput
            label="Nominal Pembayaran Kali Ini *"
            value={paymentAmount}
            onValueChange={setPaymentAmount}
            placeholder="Rp 0"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => setPaymentAmount(remainingAmount)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-primary/20 text-brand-dark border border-brand-primary/40 hover:bg-brand-primary/30 transition-colors"
            >
              Bayar Lunas ({formatIDR(remainingAmount)})
            </button>
            {remainingAmount > 100000 && (
              <button
                type="button"
                onClick={() => setPaymentAmount(Math.round(remainingAmount / 2))}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-cream text-brand-dark border border-brand-border hover:bg-brand-cream/80 transition-colors"
              >
                Bayar 50%
              </button>
            )}
          </div>
        </div>

        {/* Toggle Transaksi Saldo */}
        <div className="p-3 rounded-xl border border-brand-border bg-white space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={recordTransaction}
              onChange={(e) => setRecordTransaction(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-brand-dark text-brand-primary focus:ring-0"
            />
            <span className="text-xs font-black text-brand-dark">
              {debt.type === 'receivable'
                ? 'Tambahkan uang masuk ke rekening kas/bank'
                : 'Kurangi uang keluar dari rekening kas/bank'}
            </span>
          </label>

          {recordTransaction && (
            <div>
              <label className="block text-[11px] font-bold text-brand-darkMuted uppercase tracking-wider mb-1">
                Pilih Rekening
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-white font-bold text-xs text-brand-dark focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Simpan Pembayaran
          </Button>
        </div>
      </form>
    </Modal>
  );
};

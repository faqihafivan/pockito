import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Subscription, SubscriptionCycle } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionToEdit?: Subscription | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscriptionToEdit,
}) => {
  const { user } = useAuth();
  const { pockets, accounts, addSubscription, updateSubscription } = useData();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [cycle, setCycle] = useState<SubscriptionCycle>('monthly');
  const [dueDay, setDueDay] = useState<number>(1);
  const [pocketId, setPocketId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subscriptionToEdit) {
      setName(subscriptionToEdit.name);
      setAmount(subscriptionToEdit.amount);
      setCycle(subscriptionToEdit.billing_cycle);
      setDueDay(subscriptionToEdit.due_day);
      setPocketId(subscriptionToEdit.category_pocket_id || '');
      setAccountId(subscriptionToEdit.account_id || '');
      setNotes(subscriptionToEdit.notes || '');
    } else {
      setName('');
      setAmount(0);
      setCycle('monthly');
      setDueDay(new Date().getDate());
      setPocketId(pockets[0]?.id || '');
      setAccountId(accounts[0]?.id || '');
      setNotes('');
    }
    setError('');
  }, [subscriptionToEdit, isOpen, pockets, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama langganan / tagihan wajib diisi');
      return;
    }
    if (amount <= 0) {
      setError('Nominal harus lebih besar dari Rp 0');
      return;
    }
    if (dueDay < 1 || dueDay > 31) {
      setError('Tanggal jatuh tempo harus antara tanggal 1 - 31');
      return;
    }

    setIsSubmitting(true);
    try {
      if (subscriptionToEdit) {
        await updateSubscription(subscriptionToEdit.id, {
          name: name.trim(),
          amount,
          billing_cycle: cycle,
          due_day: dueDay,
          category_pocket_id: pocketId || undefined,
          account_id: accountId || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await addSubscription({
          user_id: user?.id || 'user-1',
          name: name.trim(),
          amount,
          billing_cycle: cycle,
          due_day: dueDay,
          category_pocket_id: pocketId || undefined,
          account_id: accountId || undefined,
          is_active: true,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal menyimpan tagihan rutin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subscriptionToEdit ? 'Edit Tagihan Rutin' : 'Tambah Tagihan Rutin Baru'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Nama Tagihan */}
        <Input
          label="Nama Langganan / Tagihan *"
          placeholder="Contoh: Sewa Kos, WiFi Indihome, Spotify"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Nominal Tagihan */}
        <CurrencyInput
          label="Nominal Tagihan per Periode *"
          value={amount}
          onValueChange={setAmount}
          placeholder="Rp 0"
        />

        {/* Siklus & Tanggal Jatuh Tempo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
              Siklus Tagihan
            </label>
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value as SubscriptionCycle)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-white font-bold text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 shadow-saweria-sm"
            >
              <option value="monthly">Bulanan</option>
              <option value="weekly">Mingguan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
              Tanggal Jatuh Tempo (1 - 31) *
            </label>
            <input
              type="number"
              min={1}
              max={31}
              value={dueDay}
              onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-white font-bold text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 shadow-saweria-sm"
              required
            />
          </div>
        </div>

        {/* Kantong Anggaran Terkait */}
        <div>
          <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
            Potong dari Kantong Anggaran
          </label>
          <select
            value={pocketId}
            onChange={(e) => setPocketId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-white font-bold text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 shadow-saweria-sm"
          >
            <option value="">-- Tanpa Alokasi Kantong Khusus --</option>
            {pockets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.allocation_percentage}%)
              </option>
            ))}
          </select>
        </div>

        {/* Sumber Rekening Pembayaran Default */}
        <div>
          <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
            Rekening Pembayaran Utama
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-white font-bold text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 shadow-saweria-sm"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.type})
              </option>
            ))}
          </select>
        </div>

        {/* Catatan / Keterangan Tambahan */}
        <Input
          label="Catatan Tambahan (Opsional)"
          placeholder="Contoh: No Pelanggan 123456 / Rekening Ibu Kos"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {subscriptionToEdit ? 'Simpan Perubahan' : 'Tambah Tagihan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { TransactionType } from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPocketId?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultPocketId,
}) => {
  const { user } = useAuth();
  const { accounts, pockets, addTransaction } = useData();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState<string>(accounts[1]?.id || '');
  const [pocketId, setPocketId] = useState<string>(defaultPocketId || pockets[0]?.id || '');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0) {
      setError('Nominal harus lebih besar dari Rp 0');
      return;
    }
    if (!description.trim()) {
      setError('Keterangan transaksi wajib diisi');
      return;
    }
    if (!accountId) {
      setError('Pilih rekening / sumber dana');
      return;
    }
    if (type === 'transfer' && accountId === destinationAccountId) {
      setError('Rekening tujuan transfer tidak boleh sama dengan rekening asal');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTransaction({
        user_id: user?.id || 'user-demo-1',
        account_id: accountId,
        pocket_id: type === 'expense' ? pocketId : undefined,
        type,
        amount,
        destination_account_id: type === 'transfer' ? destinationAccountId : undefined,
        date: date.includes('T') ? date : `${date}T12:00:00.000Z`,
        description: description.trim(),
        notes: notes.trim() || undefined,
      });

      // Reset and close
      setAmount(0);
      setDescription('');
      setNotes('');
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Transaksi Baru"
      subtitle="Arus kas langsung disinkronkan ke saldo riil & kantong budget"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-brand-cream rounded-2xl border-2 border-brand-dark">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-red-500 text-white shadow-saweria-sm border border-brand-dark'
                : 'text-brand-dark hover:bg-white/60'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              type === 'income'
                ? 'bg-[#10B981] text-white shadow-saweria-sm border border-brand-dark'
                : 'text-brand-dark hover:bg-white/60'
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              type === 'transfer'
                ? 'bg-brand-primary text-brand-dark shadow-saweria-sm border border-brand-dark'
                : 'text-brand-dark hover:bg-white/60'
            }`}
          >
            Transfer
          </button>
        </div>

        {/* Currency Input */}
        <CurrencyInput
          label="Nominal Transaksi (IDR)"
          value={amount}
          onValueChange={setAmount}
          placeholder="Rp 50.000"
          className="text-lg"
        />

        {/* Description */}
        <Input
          label="Keterangan Transaksi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === 'expense'
              ? 'Contoh: Nasi padang siang, Kopi, Bayar Wifi'
              : type === 'income'
              ? 'Contoh: Gaji bulanan, Bonus project freelance'
              : 'Contoh: Tarik tunai ATM, Pindah ke GoPay'
          }
        />

        {/* Conditional Fields: Pocket Picker for Expense */}
        {type === 'expense' && (
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
              Pilih Kantong / Pocket
            </label>
            <select
              value={pocketId}
              onChange={(e) => setPocketId(e.target.value)}
              className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none cursor-pointer"
            >
              {pockets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.allocation_percentage}%) {p.is_starred ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Account Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
              {type === 'transfer' ? 'Dari Rekening' : 'Rekening / Kas'}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none cursor-pointer"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          {type === 'transfer' ? (
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                Ke Rekening Tujuan
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none cursor-pointer"
              >
                {accounts
                  .filter((a) => a.id !== accountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Simpan Transaksi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

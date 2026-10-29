import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Debt, DebtType } from '../../types';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtToEdit?: Debt | null;
  defaultType?: DebtType;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  debtToEdit,
  defaultType = 'receivable',
}) => {
  const { user } = useAuth();
  const { accounts, pockets, addDebt, updateDebt } = useData();

  const [type, setType] = useState<DebtType>(defaultType);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  const [pocketId, setPocketId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (debtToEdit) {
      setType(debtToEdit.type);
      setPersonName(debtToEdit.person_name);
      setAmount(debtToEdit.amount);
      setDueDate(debtToEdit.due_date || '');
      setDescription(debtToEdit.description);
      setAccountId(debtToEdit.account_id || '');
      setPocketId(debtToEdit.pocket_id || '');
      setNotes(debtToEdit.notes || '');
    } else {
      setType(defaultType);
      setPersonName('');
      setAmount(0);
      setDueDate('');
      setDescription('');
      setAccountId(accounts[0]?.id || '');
      setPocketId('');
      setNotes('');
    }
    setError('');
  }, [debtToEdit, defaultType, isOpen, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!personName.trim()) {
      setError('Nama orang / pihak terkait wajib diisi');
      return;
    }
    if (amount <= 0) {
      setError('Nominal harus lebih besar dari Rp 0');
      return;
    }
    if (!description.trim()) {
      setError('Keterangan / tujuan hutang wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      if (debtToEdit) {
        await updateDebt(debtToEdit.id, {
          type,
          person_name: personName.trim(),
          amount,
          due_date: dueDate || undefined,
          description: description.trim(),
          account_id: accountId || undefined,
          pocket_id: pocketId || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await addDebt({
          user_id: user?.id || 'user-1',
          type,
          person_name: personName.trim(),
          amount,
          paid_amount: 0,
          due_date: dueDate || undefined,
          description: description.trim(),
          account_id: accountId || undefined,
          pocket_id: pocketId || undefined,
          is_settled: false,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal menyimpan catatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={debtToEdit ? 'Edit Catatan' : 'Tambah Hutang / Piutang'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Tipe Selector: Piutang vs Hutang */}
        <div>
          <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-2">
            Jenis Pencatatan *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('receivable')}
              className={`py-2.5 px-3 rounded-xl border-2 font-black text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${
                type === 'receivable'
                  ? 'bg-emerald-400 border-brand-dark text-brand-dark shadow-saweria-sm'
                  : 'bg-white border-brand-border text-brand-darkMuted hover:bg-brand-cream'
              }`}
            >
              <span>Piutang (Uangmu di Orang)</span>
              <span className="text-[10px] font-normal opacity-90">Orang lain pinjam uangmu</span>
            </button>

            <button
              type="button"
              onClick={() => setType('payable')}
              className={`py-2.5 px-3 rounded-xl border-2 font-black text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${
                type === 'payable'
                  ? 'bg-rose-400 border-brand-dark text-brand-dark shadow-saweria-sm'
                  : 'bg-white border-brand-border text-brand-darkMuted hover:bg-brand-cream'
              }`}
            >
              <span>Hutang (Kewajibanmu)</span>
              <span className="text-[10px] font-normal opacity-90">Kamu meminjam uang / cicilan</span>
            </button>
          </div>
        </div>

        {/* Nama Pihak Terkait */}
        <Input
          label={type === 'receivable' ? 'Nama Peminjam *' : 'Nama Pemberi Pinjaman / Platform *'}
          placeholder={type === 'receivable' ? 'Contoh: Dimas Kurniawan, Andi' : 'Contoh: Tokopedia Paylater, Teman'}
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          required
        />

        {/* Nominal Pokok */}
        <CurrencyInput
          label="Nominal Pokok *"
          value={amount}
          onValueChange={setAmount}
          placeholder="Rp 0"
        />

        {/* Keterangan */}
        <Input
          label="Keterangan / Keperluan *"
          placeholder="Contoh: Talangan makan bersama, Cicilan laptop"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Tanggal Jatuh Tempo */}
        <div>
          <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
            Target Tanggal Pengembalian (Opsional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-white font-bold text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 shadow-saweria-sm"
          />
        </div>

        {/* Akun / Rekening Sumber */}
        <div>
          <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
            Rekening Terkait (Opsional)
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-white font-bold text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 shadow-saweria-sm"
          >
            <option value="">-- Tanpa Rekening Tertentu --</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.type})
              </option>
            ))}
          </select>
        </div>

        {/* Kantong Anggaran Terkait */}
        <div>
          <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
            Kantong Terkait (Opsional)
          </label>
          <select
            value={pocketId}
            onChange={(e) => setPocketId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-white font-bold text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 shadow-saweria-sm"
          >
            <option value="">-- Tanpa Kantong --</option>
            {pockets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Catatan Tambahan */}
        <Input
          label="Catatan Tambahan (Opsional)"
          placeholder="Contoh: Janji transfer akhir bulan setelah gajian"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {debtToEdit ? 'Simpan Perubahan' : 'Catat Sekarang'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

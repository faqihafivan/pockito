import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SavingsGoal } from '../../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

const GOAL_COLORS = ['#FAAE2B', '#10B981', '#0EA5E9', '#8B5CF6', '#FF7A59', '#EC4899'];

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const { user } = useAuth();
  const { addGoal, updateGoal } = useData();

  const [name, setName] = useState(goalToEdit?.name || '');
  const [targetAmount, setTargetAmount] = useState<number>(goalToEdit?.target_amount || 5000000);
  const [currentAmount, setCurrentAmount] = useState<number>(goalToEdit?.current_amount || 0);
  const [targetDate, setTargetDate] = useState(goalToEdit?.target_date || '2026-12-31');
  const [color, setColor] = useState(goalToEdit?.color || '#FAAE2B');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama target tabungan wajib diisi');
      return;
    }
    if (targetAmount <= 0) {
      setError('Target nominal harus lebih besar dari Rp 0');
      return;
    }

    setIsSubmitting(true);
    try {
      if (goalToEdit) {
        await updateGoal(goalToEdit.id, {
          name: name.trim(),
          target_amount: targetAmount,
          current_amount: currentAmount,
          target_date: targetDate || undefined,
          color,
          is_completed: currentAmount >= targetAmount,
        });
      } else {
        await addGoal({
          user_id: user?.id || 'user-demo-1',
          name: name.trim(),
          target_amount: targetAmount,
          current_amount: currentAmount,
          target_date: targetDate || undefined,
          icon: 'Target',
          color,
          is_completed: currentAmount >= targetAmount,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal menyimpan target');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Target Tabungan' : 'Buat Target Tabungan Baru'}
      subtitle="Kumpulkan impian finansial Anda selangkah demi selangkah"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Target Impian"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Beli Laptop Baru, Liburan Akhir Tahun"
          required
        />

        <CurrencyInput
          label="Target Nominal yang Ingin Dicapai"
          value={targetAmount}
          onValueChange={setTargetAmount}
          placeholder="Rp 10.000.000"
        />

        <CurrencyInput
          label="Saldo yang Sudah Terkumpul Saat Ini"
          value={currentAmount}
          onValueChange={setCurrentAmount}
          placeholder="Rp 0"
        />

        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
            Target Tanggal Tercapai
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
            Warna Kartu Target
          </label>
          <div className="flex gap-2.5">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-xl border-2 transition-transform ${
                  color === c ? 'border-brand-dark scale-110 shadow-saweria-sm' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {goalToEdit ? 'Perbarui Target' : 'Simpan Target'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

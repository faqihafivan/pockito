import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Task, TaskPriority } from '../../types';
import { ReminderService } from '../../services/reminderService';
import { ShoppingBag } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { user } = useAuth();
  const { addTask, updateTask, pockets } = useData();

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [dueDate, setDueDate] = useState(
    taskToEdit?.due_date || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(taskToEdit?.start_time || '09:00');
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority || 'medium');
  const [isFinancialTask, setIsFinancialTask] = useState<boolean>(!!taskToEdit?.amount);
  const [amount, setAmount] = useState<number>(taskToEdit?.amount || 0);
  const [pocketId, setPocketId] = useState<string>(
    taskToEdit?.pocket_id || (pockets[0]?.id || '')
  );
  const [setReminder, setReminderState] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Synchronize form fields whenever modal opens or taskToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setDueDate(taskToEdit.due_date || new Date().toISOString().split('T')[0]);
        setStartTime(taskToEdit.start_time || '09:00');
        setPriority(taskToEdit.priority || 'medium');
        setIsFinancialTask(!!taskToEdit.amount && taskToEdit.amount > 0);
        setAmount(taskToEdit.amount || 0);
        setPocketId(taskToEdit.pocket_id || (pockets[0]?.id || ''));
        setReminderState(false);
      } else {
        setTitle('');
        setDescription('');
        setDueDate(new Date().toISOString().split('T')[0]);
        setStartTime('09:00');
        setPriority('medium');
        setIsFinancialTask(false);
        setAmount(0);
        setPocketId(pockets[0]?.id || '');
        setReminderState(false);
      }
      setError('');
    }
  }, [isOpen, taskToEdit, pockets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul tugas tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const taskAmount = isFinancialTask && amount > 0 ? amount : undefined;
      const taskPocket = isFinancialTask && pocketId ? pocketId : undefined;

      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          due_date: dueDate || undefined,
          start_time: startTime || undefined,
          priority,
          amount: taskAmount,
          pocket_id: taskPocket,
        });
      } else {
        await addTask({
          user_id: user?.id || 'user-demo-1',
          title: title.trim(),
          description: description.trim() || undefined,
          due_date: dueDate || undefined,
          start_time: startTime || undefined,
          priority,
          amount: taskAmount,
          pocket_id: taskPocket,
          is_completed: false,
        });

        if (setReminder) {
          ReminderService.triggerNotification(
            `Pengingat Tugas: ${title}`,
            `Jadwal: ${dueDate} jam ${startTime}`
          );
        }
      }

      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal menyimpan tugas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Agenda / Belanja' : 'Tambah Agenda / Belanja'}
      subtitle="Kelola agenda tugas dan kebutuhan belanja pokok yang terhubung ke saldo riil"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Judul Tugas / Belanja Pokok"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Beli Minyak Goreng & Beras, Bayar Listrik PLN"
          required
        />

        <div className="w-full text-left">
          <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Tambahkan rincian belanjaan atau instruksi penting..."
            className="w-full bg-white text-brand-dark text-sm font-medium rounded-xl border-2 border-brand-border p-3 focus:border-brand-dark focus:shadow-saweria-sm outline-none"
          />
        </div>

        {/* Financial Shopping Option (Checklist that auto-deducts balance) */}
        <div className="p-3 bg-brand-cream/70 rounded-2xl border-2 border-brand-border space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFinancialTask}
              onChange={(e) => {
                setIsFinancialTask(e.target.checked);
                if (e.target.checked && !pocketId && pockets.length > 0) {
                  setPocketId(pockets[0].id);
                }
              }}
              className="w-4 h-4 rounded text-brand-primary accent-brand-primary cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-brand-dark" />
              <span className="text-xs font-black text-brand-dark">
                Kebutuhan Belanja Pokok (Terkait Saldo Riil)
              </span>
            </div>
          </label>

          {isFinancialTask && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                  Estimasi Biaya
                </label>
                <CurrencyInput
                  value={amount}
                  onValueChange={(val: number) => setAmount(val)}
                  placeholder="Rp 0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                  Kantong Anggaran
                </label>
                <select
                  value={pocketId}
                  onChange={(e) => setPocketId(e.target.value)}
                  className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none"
                >
                  {pockets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
              Tanggal Target
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
              Jam / Waktu Mulai
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none"
            />
          </div>
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
            Prioritas
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
              const labels = { low: 'Santai (Low)', medium: 'Normal (Med)', high: 'Penting (High)' };
              const colors = {
                low: 'bg-[#10B981]/15 text-[#047857]',
                medium: 'bg-[#FAAE2B]/20 text-brand-dark',
                high: 'bg-red-500/15 text-red-700',
              };
              const active = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-black rounded-xl border-2 transition-all ${
                    active
                      ? `${colors[p]} border-brand-dark shadow-saweria-sm`
                      : 'border-brand-border text-brand-darkMuted hover:border-brand-dark'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Set Reminder Switch */}
        {!taskToEdit && (
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-brand-cream border border-brand-border cursor-pointer select-none">
            <input
              type="checkbox"
              checked={setReminder}
              onChange={(e) => setReminderState(e.target.checked)}
              className="w-4 h-4 rounded text-brand-primary accent-brand-primary cursor-pointer"
            />
            <span className="text-xs font-bold text-brand-dark">
              Kirim pengingat di sesi aktif aplikasi
            </span>
          </label>
        )}

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
            {taskToEdit ? 'Perbarui Tugas' : 'Simpan Tugas'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

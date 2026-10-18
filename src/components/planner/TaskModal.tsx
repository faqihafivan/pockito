import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Task, TaskPriority } from '../../types';
import { ReminderService } from '../../services/reminderService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { user } = useAuth();
  const { addTask, updateTask } = useData();

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [dueDate, setDueDate] = useState(
    taskToEdit?.due_date || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(taskToEdit?.start_time || '09:00');
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority || 'medium');
  const [setReminder, setReminderState] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul tugas tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          due_date: dueDate || undefined,
          start_time: startTime || undefined,
          priority,
        });
      } else {
        await addTask({
          user_id: user?.id || 'user-demo-1',
          title: title.trim(),
          description: description.trim() || undefined,
          due_date: dueDate || undefined,
          start_time: startTime || undefined,
          priority,
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
      title={taskToEdit ? 'Edit Tugas & Jadwal' : 'Tambah Tugas & Jadwal'}
      subtitle="Kelola agenda produktivitas harian berdampingan dengan keuangan Anda"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Judul Tugas / Aktivitas"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Bayar tagihan wifi, Review budget mingguan"
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
            placeholder="Tambahkan detail atau instruksi penting..."
            className="w-full bg-white text-brand-dark text-sm font-medium rounded-xl border-2 border-brand-border p-3 focus:border-brand-dark focus:shadow-saweria-sm outline-none"
          />
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

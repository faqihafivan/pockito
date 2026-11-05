import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TaskModal } from '../components/planner/TaskModal';
import { Task } from '../types';
import {
  Plus,
  CheckSquare,
  Square,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  ShoppingBag,
  AlertCircle,
  Tag,
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, toggleTask, deleteTask, pockets, accounts, addTransaction, formatMoney } = useData();
  const { showConfirm, showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'later' | 'shopping' | 'completed'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Deduction confirmation modal state
  const [pendingTask, setPendingTask] = useState<Task | null>(null);
  const [selectedPocketId, setSelectedPocketId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter tasks into Today, Upcoming, Later, Shopping, Completed
  const groupedTasks = useMemo(() => {
    const today: Task[] = [];
    const upcoming: Task[] = [];
    const later: Task[] = [];
    const shopping: Task[] = [];
    const completed: Task[] = [];

    tasks.forEach((t) => {
      if (t.is_completed) {
        completed.push(t);
        return;
      }

      // If it's a shopping item with amount, add to shopping list
      if (t.amount && t.amount > 0) {
        shopping.push(t);
      }

      if (!t.due_date) {
        later.push(t);
        return;
      }

      if (t.due_date === todayStr) {
        today.push(t);
      } else if (t.due_date > todayStr) {
        upcoming.push(t);
      } else {
        // Overdue tasks show in today with urgent tag
        today.push(t);
      }
    });

    return { today, upcoming, later, shopping, completed };
  }, [tasks, todayStr]);

  // Total estimated budget for pending shopping items
  const totalPendingShopping = useMemo(() => {
    return groupedTasks.shopping.reduce((acc, t) => acc + (t.amount || 0), 0);
  }, [groupedTasks.shopping]);

  const currentList = groupedTasks[activeTab];

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await showConfirm({
      title: 'Hapus Tugas?',
      message: `Hapus agenda tugas "${title}"?`,
      confirmText: 'Ya, Hapus',
      isDanger: true,
    });
    if (confirmed) {
      await deleteTask(id);
      showToast('Tugas berhasil dihapus', 'info');
    }
  };

  const handleCheckboxClick = (task: Task) => {
    if (task.is_completed) {
      toggleTask(task.id);
      return;
    }

    if (task.amount && task.amount > 0) {
      setPendingTask(task);
      setSelectedPocketId(task.pocket_id || (pockets[0]?.id || ''));
      return;
    }

    toggleTask(task.id);
    showToast(`Tugas "${task.title}" diselesaikan! ✨`, 'success');
  };

  const handleConfirmDeduct = async () => {
    if (!pendingTask || !pendingTask.amount) return;

    setIsProcessing(true);
    try {
      const pocket = pockets.find((p) => p.id === selectedPocketId) || pockets[0];
      const todayISO = new Date().toISOString().split('T')[0];

      await addTransaction({
        user_id: user?.id || 'user-demo-1',
        account_id: accounts[0]?.id || 'acc-cash',
        pocket_id: pocket ? pocket.id : (pockets[0]?.id || 'pocket-1'),
        amount: pendingTask.amount,
        type: 'expense',
        description: `[Belanja Selesai] ${pendingTask.title}`,
        date: todayISO,
      });

      await toggleTask(pendingTask.id);

      showToast(
        `Berhasil! ${formatMoney(pendingTask.amount)} dipotong dari ${pocket ? pocket.name : 'Kantong'} & tugas selesai! 🎉`,
        'success'
      );
      setPendingTask(null);
    } catch {
      showToast('Gagal memproses transaksi belanja.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteWithoutDeduct = async () => {
    if (!pendingTask) return;
    await toggleTask(pendingTask.id);
    showToast(`Tugas "${pendingTask.title}" ditandai selesai (saldo tidak dipotong).`, 'info');
    setPendingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            Planner & Belanja Pokok
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
            Satukan checklist belanja kebutuhan pokok dan agenda harian dalam satu layar praktis.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setTaskToEdit(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Tambah Agenda / Belanja
        </Button>
      </div>

      {/* Shopping Budget Summary Pill Banner */}
      {groupedTasks.shopping.length > 0 && (
        <div className="bg-emerald-50/90 dark:bg-emerald-950/40 p-4 sm:p-5 rounded-3xl border-2 border-emerald-300/80 dark:border-emerald-700/60 shadow-saweria-xs space-y-3">
          {/* Header Row: Icon, Title with Badge, Subtitle */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-200/80 dark:bg-emerald-900/60 border border-emerald-700/30 dark:border-emerald-500/40 flex items-center justify-center text-emerald-900 dark:text-emerald-200 shrink-0 mt-0.5 shadow-xs">
              <ShoppingBag className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                  Total Estimasi Kebutuhan Belanja Pokok
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-400/40 whitespace-nowrap">
                  {groupedTasks.shopping.length} Barang
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-800/90 dark:text-emerald-300/80 font-medium leading-relaxed mt-1">
                Centang barang belanjaan saat selesai untuk otomatis mencatat pengeluaran dan memotong Saldo Riil.
              </p>
            </div>
          </div>

          {/* Dedicated Bottom Bar for Nominal Rp: Aligned & Structured */}
          <div className="pt-2.5 border-t border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between gap-3">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Estimasi Pengeluaran:
            </span>
            <div className="inline-flex items-center px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-xs">
              <span className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-200 tabular-nums">
                {formatMoney(totalPendingShopping)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Segment Tabs: Hari Ini, Mendatang, Kapan-kapan, Belanja Pokok, Selesai */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'today'
              ? 'bg-brand-primary text-brand-primaryText border-brand-dark shadow-saweria-sm'
              : 'bg-white text-brand-darkMuted border-brand-border hover:border-brand-dark'
          }`}
        >
          Hari Ini ({groupedTasks.today.length})
        </button>

        <button
          onClick={() => setActiveTab('shopping')}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'shopping'
              ? 'bg-emerald-600 text-white border-brand-dark shadow-saweria-sm'
              : 'bg-white text-emerald-800 border-emerald-300 hover:border-emerald-500'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Belanja Pokok ({groupedTasks.shopping.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-brand-primary text-brand-primaryText border-brand-dark shadow-saweria-sm'
              : 'bg-white text-brand-darkMuted border-brand-border hover:border-brand-dark'
          }`}
        >
          Mendatang ({groupedTasks.upcoming.length})
        </button>

        <button
          onClick={() => setActiveTab('later')}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'later'
              ? 'bg-brand-primary text-brand-primaryText border-brand-dark shadow-saweria-sm'
              : 'bg-white text-brand-darkMuted border-brand-border hover:border-brand-dark'
          }`}
        >
          Kapan-kapan ({groupedTasks.later.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-brand-primary text-brand-primaryText border-brand-dark shadow-saweria-sm'
              : 'bg-white text-brand-darkMuted border-brand-border hover:border-brand-dark'
          }`}
        >
          Selesai ({groupedTasks.completed.length})
        </button>
      </div>

      {/* Task List */}
      <Card variant="saweria" className="bg-white p-0 overflow-hidden">
        <div className="divide-y divide-brand-border">
          {currentList.length === 0 ? (
            <div className="p-12 text-center text-xs text-brand-darkMuted space-y-2">
              <CheckCircle2 className="w-8 h-8 text-brand-primary mx-auto" />
              <p className="font-bold">Tidak ada agenda atau belanjaan pada tab ini.</p>
            </div>
          ) : (
            currentList.map((task) => {
              const isShopping = Boolean(task.amount && task.amount > 0);
              const taskPocket = isShopping ? pockets.find((p) => p.id === task.pocket_id) : null;

              return (
                <div
                  key={task.id}
                  className="p-3.5 sm:p-4 flex items-start justify-between gap-3 hover:bg-brand-cream/30 transition-colors group relative"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleCheckboxClick(task)}
                      className={`p-1 mt-0.5 transition-colors shrink-0 cursor-pointer ${
                        task.is_completed ? 'text-emerald-600' : 'text-brand-dark hover:text-brand-primary'
                      }`}
                      title={
                        isShopping
                          ? 'Klik untuk selesaikan belanja & potong saldo riil'
                          : task.is_completed
                          ? 'Tandai belum selesai'
                          : 'Tandai selesai'
                      }
                    >
                      {task.is_completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 pr-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-black text-brand-dark truncate ${
                            task.is_completed ? 'line-through text-brand-darkMuted' : ''
                          }`}
                        >
                          {task.title}
                        </h4>

                        {isShopping && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black tabular-nums whitespace-nowrap shrink-0">
                            <ShoppingBag className="w-3 h-3 shrink-0" />
                            <span className="whitespace-nowrap">{formatMoney(task.amount!)}</span>
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-brand-darkMuted mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-bold text-brand-darkMuted">
                        {isShopping && taskPocket && (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-700">
                            <Tag className="w-2.5 h-2.5 shrink-0" />
                            <span>{taskPocket.name}</span>
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{task.due_date === todayStr ? 'Hari Ini' : task.due_date}</span>
                          </span>
                        )}
                        {task.start_time && (
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Clock className="w-3 h-3 text-brand-primary shrink-0" />
                            <span>{task.start_time}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pojok Kanan Atas: Prioritas, Bawah: Action Buttons */}
                  <div className="flex flex-col items-end justify-between gap-2.5 shrink-0 self-stretch">
                    <div>
                      {task.priority === 'high' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600 whitespace-nowrap">
                          Penting
                        </span>
                      )}
                      {task.priority === 'medium' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600 whitespace-nowrap">
                          Sedang
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-auto">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1.5 rounded-lg text-brand-darkMuted hover:text-brand-dark hover:bg-brand-cream cursor-pointer"
                        title="Edit Tugas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id, task.title)}
                        className="p-1.5 rounded-lg text-brand-darkMuted hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Deduction Modal for Shopping Task */}
      {pendingTask && (
        <Modal
          isOpen={!!pendingTask}
          onClose={() => setPendingTask(null)}
          title="Selesaikan Belanja & Potong Saldo?"
          subtitle="Otomatisasi pengeluaran ke dalam buku kas dan saldo riil Anda"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                  Detail Kebutuhan Belanja
                </span>
                <span className="text-sm font-black text-emerald-950 tabular-nums">
                  {formatMoney(pendingTask.amount || 0)}
                </span>
              </div>
              <h4 className="text-sm font-black text-brand-dark">{pendingTask.title}</h4>
              {pendingTask.description && (
                <p className="text-xs text-brand-darkMuted font-medium">
                  {pendingTask.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                Potong dari Kantong:
              </label>
              <select
                value={selectedPocketId}
                onChange={(e) => setSelectedPocketId(e.target.value)}
                className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none"
              >
                {pockets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-brand-cream rounded-xl border border-brand-border flex items-start gap-2.5 text-xs text-brand-darkMuted font-medium">
              <AlertCircle className="w-4 h-4 text-brand-dark shrink-0 mt-0.5" />
              <span>
                Memilih <b>Potong Saldo</b> akan langsung mengurangi <b>Total Saldo Riil</b> dan mencatatnya ke Riwayat Transaksi.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPendingTask(null)}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCompleteWithoutDeduct}
                className="w-full sm:w-auto"
              >
                Hanya Selesaikan
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={handleConfirmDeduct}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 border-brand-dark text-white font-black"
              >
                Ya, Potong Saldo ({formatMoney(pendingTask.amount || 0)})
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Global Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

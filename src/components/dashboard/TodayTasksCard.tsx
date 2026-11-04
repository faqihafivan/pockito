import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Task } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  CheckSquare,
  Square,
  ChevronRight,
  Clock,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface TodayTasksCardProps {
  tasks: Task[];
  onOpenNewTask: () => void;
}

export const TodayTasksCard: React.FC<TodayTasksCardProps> = ({ tasks, onOpenNewTask }) => {
  const { user } = useAuth();
  const { toggleTask, pockets, accounts, addTransaction, formatMoney } = useData();
  const { showToast } = useNotification();

  // Task pending deduction confirmation
  const [pendingTask, setPendingTask] = useState<Task | null>(null);
  const [selectedPocketId, setSelectedPocketId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Active / uncompleted tasks
  const uncompletedTasks = tasks.filter((t) => !t.is_completed);
  const activeTasks = uncompletedTasks.slice(0, 3);
  const remainingCount = Math.max(0, uncompletedTasks.length - 3);
  const completedTodayCount = tasks.filter((t) => t.is_completed).length;

  const handleCheckboxClick = (task: Task) => {
    // If task is completed, un-completing it simply toggles
    if (task.is_completed) {
      toggleTask(task.id);
      return;
    }

    // If task has an amount (shopping/financial task), prompt to auto-deduct balance
    if (task.amount && task.amount > 0) {
      setPendingTask(task);
      setSelectedPocketId(task.pocket_id || (pockets[0]?.id || ''));
      return;
    }

    // Standard task
    toggleTask(task.id);
    showToast(`Tugas "${task.title}" diselesaikan! ✨`, 'success');
  };

  const handleConfirmDeduct = async () => {
    if (!pendingTask || !pendingTask.amount) return;

    setIsProcessing(true);
    try {
      const pocket = pockets.find((p) => p.id === selectedPocketId) || pockets[0];
      const todayISO = new Date().toISOString().split('T')[0];

      // 1. Record transaction
      await addTransaction({
        user_id: user?.id || 'user-demo-1',
        account_id: accounts[0]?.id || 'acc-cash',
        pocket_id: pocket ? pocket.id : (pockets[0]?.id || 'pocket-1'),
        amount: pendingTask.amount,
        type: 'expense',
        description: `[Belanja Selesai] ${pendingTask.title}`,
        date: todayISO,
      });

      // 2. Mark task completed
      await toggleTask(pendingTask.id);

      showToast(
        `Berhasil! ${formatMoney(pendingTask.amount)} dipotong dari ${pocket ? pocket.name : 'Kantong'} & tugas diselesaikan! 🎉`,
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
    <>
      <Card variant="saweria" className="bg-white h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border gap-2">
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <h3 className="text-xs sm:text-sm font-black text-brand-dark uppercase tracking-wider truncate">
                  <span className="hidden sm:inline">Belanja Pokok & To-Do List</span>
                  <span className="sm:hidden">Belanja & To-Do</span>
                </h3>
                {completedTodayCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 whitespace-nowrap shrink-0">
                    ✓ {completedTodayCount} Selesai
                  </span>
                )}
              </div>
              <p className="text-[11px] text-brand-darkMuted mt-0.5 truncate">
                Checklist kebutuhan harian & potong saldo otomatis
              </p>
            </div>
            <Link
              to="/app/planner"
              className="text-xs font-black text-brand-dark hover:text-brand-primaryHover flex items-center gap-1 group whitespace-nowrap shrink-0"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>

          <div className="divide-y divide-brand-border/60 mt-1">
            {activeTasks.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-brand-darkMuted">
                  Semua checklist tugas & belanjaan telah selesai! 🎉
                </p>
                <button
                  type="button"
                  onClick={onOpenNewTask}
                  className="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                >
                  + Tambah Kebutuhan / Tugas Baru
                </button>
              </div>
            ) : (
              activeTasks.map((task) => {
                const isShopping = Boolean(task.amount && task.amount > 0);
                const taskPocket = isShopping
                  ? pockets.find((p) => p.id === task.pocket_id)
                  : null;

                return (
                  <div
                    key={task.id}
                    className="py-2.5 flex items-center justify-between gap-3 group hover:bg-brand-cream/40 px-1 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleCheckboxClick(task)}
                        className={`w-5 h-5 rounded-lg border-2 border-brand-dark flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          task.is_completed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white hover:bg-emerald-100'
                        }`}
                        aria-label="Tandai selesai"
                        title={
                          isShopping
                            ? 'Checklist untuk selesaikan belanja & potong saldo riil'
                            : 'Tandai selesai'
                        }
                      >
                        {task.is_completed ? (
                          <CheckSquare className="w-4 h-4 text-white stroke-[2.5]" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-transparent" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-xs font-black text-brand-dark truncate ${
                              task.is_completed ? 'line-through text-brand-darkMuted' : ''
                            }`}
                          >
                            {task.title}
                          </p>

                          {isShopping && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black tabular-nums">
                              <ShoppingBag className="w-2.5 h-2.5" />
                              {formatMoney(task.amount!)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-brand-darkMuted mt-0.5">
                          {isShopping && taskPocket && (
                            <span className="font-bold text-brand-darkMuted truncate">
                              [{taskPocket.name}]
                            </span>
                          )}
                          {task.start_time && (
                            <span className="flex items-center gap-1 font-bold">
                              <Clock className="w-3 h-3 text-brand-primary" />
                              {task.start_time}
                            </span>
                          )}
                          {task.due_date && <span>• {task.due_date}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {task.priority === 'high' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-red-100 text-red-700 border border-red-300">
                          Penting
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {remainingCount > 0 && (
            <Link
              to="/app/planner"
              className="mt-2.5 block text-center py-2 px-3 rounded-xl bg-brand-cream/70 dark:bg-slate-800/60 border border-brand-dark/20 text-xs font-black text-brand-dark hover:bg-brand-cream transition-colors"
            >
              + {remainingCount} tugas lainnya (Klik Lihat Semua)
            </Link>
          )}
        </div>

        <div className="pt-3 border-t border-brand-border flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenNewTask}
            className="text-xs font-black text-brand-dark hover:text-brand-primary flex items-center gap-1 group cursor-pointer"
          >
            <span>+ Catat Belanja / Tugas</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <Link
            to="/app/planner"
            className="text-xs font-bold text-brand-darkMuted hover:text-brand-dark whitespace-nowrap"
          >
            Buka Planner
          </Link>
        </div>
      </Card>

      {/* Confirmation Modal: Belanja Selesai -> Potong Saldo Riil */}
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
                  Detail Kebutuhan
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
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 border-brand-dark text-brand-dark font-black"
              >
                Ya, Potong Saldo ({formatMoney(pendingTask.amount || 0)})
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

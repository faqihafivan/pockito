import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const { tasks, toggleTask, deleteTask } = useData();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'later' | 'completed'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter tasks into Today, Upcoming, Later, Completed
  const groupedTasks = useMemo(() => {
    const today: Task[] = [];
    const upcoming: Task[] = [];
    const later: Task[] = [];
    const completed: Task[] = [];

    tasks.forEach((t) => {
      if (t.is_completed) {
        completed.push(t);
        return;
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

    return { today, upcoming, later, completed };
  }, [tasks, todayStr]);

  const currentList = groupedTasks[activeTab];

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Hapus tugas "${title}"?`)) {
      await deleteTask(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            Planner & Tugas Produktivitas
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
            Kelola agenda penting, tanggal jatuh tempo tagihan, dan kebiasaan harianmu.
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
          + Tambah Tugas
        </Button>
      </div>

      {/* Segment Tabs: Hari Ini, Mendatang, Nanti, Selesai */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shrink-0 ${
            activeTab === 'today'
              ? 'bg-brand-primary text-brand-dark border-brand-dark shadow-saweria-sm'
              : 'bg-white text-brand-darkMuted border-brand-border hover:border-brand-dark'
          }`}
        >
          Hari Ini ({groupedTasks.today.length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shrink-0 ${
            activeTab === 'upcoming'
              ? 'bg-brand-primary text-brand-dark border-brand-dark shadow-saweria-sm'
              : 'bg-white text-brand-darkMuted border-brand-border hover:border-brand-dark'
          }`}
        >
          Mendatang ({groupedTasks.upcoming.length})
        </button>

        <button
          onClick={() => setActiveTab('later')}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shrink-0 ${
            activeTab === 'later'
              ? 'bg-brand-primary text-brand-dark border-brand-dark shadow-saweria-sm'
              : 'bg-white text-brand-darkMuted border-brand-border hover:border-brand-dark'
          }`}
        >
          Kapan-kapan ({groupedTasks.later.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shrink-0 ${
            activeTab === 'completed'
              ? 'bg-brand-primary text-brand-dark border-brand-dark shadow-saweria-sm'
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
              <p className="font-bold">Tidak ada agenda pada tab ini.</p>
            </div>
          ) : (
            currentList.map((task) => (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-brand-cream/30 transition-colors group"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="p-1 text-brand-dark hover:text-brand-primary transition-colors shrink-0"
                    title={task.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {task.is_completed ? (
                      <CheckSquare className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="overflow-hidden">
                    <h4
                      className={`text-sm font-black text-brand-dark truncate ${
                        task.is_completed ? 'line-through text-brand-darkMuted' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-brand-darkMuted mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-bold text-brand-darkMuted">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.due_date === todayStr ? 'Hari Ini' : task.due_date}
                        </span>
                      )}
                      {task.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-primary" />
                          {task.start_time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.priority === 'high' && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-red-100 text-red-700 border border-red-300">
                      Penting
                    </span>
                  )}
                  {task.priority === 'medium' && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300">
                      Sedang
                    </span>
                  )}

                  <button
                    onClick={() => handleEdit(task)}
                    className="p-1.5 rounded-lg text-brand-darkMuted hover:text-brand-dark hover:bg-brand-cream"
                    title="Edit Tugas"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id, task.title)}
                    className="p-1.5 rounded-lg text-brand-darkMuted hover:text-red-600 hover:bg-red-50"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

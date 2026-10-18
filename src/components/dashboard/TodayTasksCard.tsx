import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Task } from '../../types';
import { useData } from '../../context/DataContext';
import { CheckSquare, ChevronRight, Clock } from 'lucide-react';

interface TodayTasksCardProps {
  tasks: Task[];
  onOpenNewTask: () => void;
}

export const TodayTasksCard: React.FC<TodayTasksCardProps> = ({ tasks, onOpenNewTask }) => {
  const { toggleTask } = useData();

  // Filter tasks that are uncompleted, or recent
  const activeTasks = tasks.filter((t) => !t.is_completed).slice(0, 4);

  return (
    <Card variant="saweria" className="bg-white h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border">
        <div>
          <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">
            Agenda & Tugas Hari Ini
          </h3>
          <p className="text-[11px] text-brand-darkMuted mt-0.5">
            Sinkronisasi aktivitas produktivitas & keuangan
          </p>
        </div>
        <Link
          to="/app/planner"
          className="text-xs font-black text-brand-dark hover:text-brand-primaryHover flex items-center gap-1 group"
        >
          <span>Planner</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="divide-y divide-brand-border/60 mt-2">
        {activeTasks.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-brand-darkMuted">
              Semua agenda tugas hari ini telah diselesaikan! 🎉
            </p>
            <button
              onClick={onOpenNewTask}
              className="text-xs font-bold text-brand-primaryHover underline"
            >
              Tambah Tugas Baru
            </button>
          </div>
        ) : (
          activeTasks.map((task) => (
            <div key={task.id} className="py-2.5 flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded-lg border-2 border-brand-dark hover:bg-brand-primary flex items-center justify-center transition-colors shrink-0"
                  aria-label="Tandai selesai"
                >
                  {task.is_completed && <CheckSquare className="w-4 h-4 text-brand-dark" />}
                </button>
                <div className="overflow-hidden">
                  <p
                    className={`text-xs font-black text-brand-dark truncate ${
                      task.is_completed ? 'line-through text-brand-darkMuted' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-brand-darkMuted mt-0.5">
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

              {task.priority === 'high' && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-red-100 text-red-700 border border-red-300 shrink-0">
                  Penting
                </span>
              )}
            </div>
          ))
        )}
      </div>
      </div>
    </Card>
  );
};

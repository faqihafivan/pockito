import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { GoalModal } from '../components/goals/GoalModal';
import { SavingsGoal } from '../types';
import { formatIDR } from '../domain/finance/financialEngine';
import {
  Plus,
  Target,
  Calendar,
  Edit2,
  Coins,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoalsPage: React.FC = () => {
  const { goals, updateGoal } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);

  const handleDeposit = async (goal: SavingsGoal) => {
    const depositPrompt = window.prompt(
      `Setor tabungan ke "${goal.name}". Masukkan nominal Rupiah (contoh: 500000):`,
      '500000'
    );
    if (!depositPrompt) return;

    const amount = parseInt(depositPrompt.replace(/[^0-9]/g, ''), 10);
    if (isNaN(amount) || amount <= 0) return;

    const newCurrent = goal.current_amount + amount;
    const isCompleted = newCurrent >= goal.target_amount;

    await updateGoal(goal.id, {
      current_amount: newCurrent,
      is_completed: isCompleted,
    });

    if (isCompleted) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FAAE2B', '#10B981', '#FF7A59'],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            Target Tabungan Impian
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
            Kumpulkan dana untuk impian besar tanpa mengorbankan kebutuhan harian.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setGoalToEdit(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Buat Target Tabungan
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
          const remaining = Math.max(0, goal.target_amount - goal.current_amount);
          const isDone = goal.is_completed || percent >= 100;

          return (
            <Card
              key={goal.id}
              variant="saweria"
              className="bg-white flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl border-2 border-brand-dark flex items-center justify-center text-brand-dark shadow-saweria-sm"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Target className="w-6 h-6 stroke-[2.3]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-brand-dark leading-tight">{goal.name}</h4>
                      {goal.target_date && (
                        <p className="flex items-center gap-1 text-[11px] font-bold text-brand-darkMuted mt-0.5">
                          <Calendar className="w-3 h-3 text-brand-primary" />
                          <span>Hingga {goal.target_date}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setGoalToEdit(goal);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-brand-border hover:border-brand-dark hover:bg-brand-cream text-brand-dark"
                    title="Edit Target"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress nominals */}
                <div className="mt-4 pt-3 border-t border-brand-border grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-brand-darkMuted uppercase">
                      Terkumpul
                    </span>
                    <div className="text-base font-black text-brand-dark tabular-nums">
                      {formatIDR(goal.current_amount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-brand-darkMuted uppercase">
                      Target
                    </span>
                    <div className="text-base font-black text-brand-dark tabular-nums">
                      {formatIDR(goal.target_amount)}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <ProgressBar value={percent} color={goal.color} size="md" showLabel />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-darkMuted">
                  {isDone ? '🎉 Target Tercapai!' : `Kurang ${formatIDR(remaining)}`}
                </span>

                <Button
                  variant={isDone ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleDeposit(goal)}
                  leftIcon={<Coins className="w-3.5 h-3.5" />}
                >
                  Setor Tabungan
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalToEdit={goalToEdit}
      />
    </div>
  );
};

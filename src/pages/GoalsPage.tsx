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
import { useNotification } from '../context/NotificationContext';

export const GoalsPage: React.FC = () => {
  const { goals, updateGoal, formatMoney } = useData();
  const { showPrompt, showToast } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);

  const handleDeposit = async (goal: SavingsGoal) => {
    const depositPrompt = await showPrompt({
      title: `Setor ke: ${goal.name}`,
      message: `Masukkan nominal Rupiah yang ingin kamu tabung hari ini:`,
      defaultValue: '100000',
      placeholder: 'Contoh: 100000',
      confirmText: 'Setor Tabungan',
    });
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
      showToast(`Selamat! Target "${goal.name}" telah 100% tercapai! 🎉`, 'success');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FAAE2B', '#10B981', '#FF7A59'],
      });
    } else {
      showToast(`Berhasil menabung ${formatIDR(amount)} ke "${goal.name}"`, 'success');
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
          Buat Target Tabungan
        </Button>
      </div>

      {/* Goals Grid / Rich 3-Layer Empty State */}
      {goals.length === 0 ? (
        <Card
          variant="saweria"
          className="p-8 sm:p-12 text-center bg-white border-2 border-brand-dark shadow-saweria flex flex-col items-center justify-center space-y-4"
        >
          {/* Layer 1: Layered SVG Visual with subtle glow */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-teal-100/60 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 border-2 border-brand-dark shadow-saweria-sm flex items-center justify-center text-white transform -rotate-3 hover:rotate-0 transition-transform">
              <Target className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-xl bg-amber-400 border-2 border-brand-dark shadow-saweria-xs flex items-center justify-center text-xs">
              ✨
            </div>
          </div>

          {/* Layer 2: Contextual Friendly Copy */}
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg sm:text-xl font-display font-black text-brand-dark tracking-tight">
              Belum Ada Target Tabungan
            </h3>
            <p className="text-xs sm:text-sm font-medium text-brand-darkMuted leading-relaxed">
              Punya impian beli laptop baru, liburan seru, atau dana darurat? Pasang target dan kumpulkan sedikit demi sedikit setiap bulan.
            </p>
          </div>

          {/* Layer 3: Actionable Primary CTA */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setGoalToEdit(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
              className="min-h-[44px]"
            >
              + Buat Target Tabungan Pertamamu
            </Button>
          </div>
        </Card>
      ) : (
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
                      type="button"
                      onClick={() => {
                        setGoalToEdit(goal);
                        setIsModalOpen(true);
                      }}
                      className="w-10 h-10 rounded-xl border border-brand-border hover:border-brand-dark hover:bg-brand-cream text-brand-dark flex items-center justify-center transition-all cursor-pointer"
                      title="Edit Target"
                      aria-label={`Edit target ${goal.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress nominals */}
                  <div className="mt-4 pt-3 border-t border-brand-border grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-brand-darkMuted uppercase">
                        Terkumpul
                      </span>
                      <div className="text-base font-black text-brand-dark font-mono tabular-nums">
                        {formatMoney(goal.current_amount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-brand-darkMuted uppercase">
                        Target
                      </span>
                      <div className="text-base font-black text-brand-dark font-mono tabular-nums">
                        {formatMoney(goal.target_amount)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <ProgressBar value={percent} color={goal.color} size="md" showLabel />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-darkMuted font-mono">
                    {isDone ? '🎉 Target Tercapai!' : `Kurang ${formatMoney(remaining)}`}
                  </span>

                  <Button
                    variant={isDone ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleDeposit(goal)}
                    leftIcon={<Coins className="w-3.5 h-3.5" />}
                    className="min-h-[40px]"
                  >
                    Setor Tabungan
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalToEdit={goalToEdit}
      />
    </div>
  );
};

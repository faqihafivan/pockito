import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { BUDGET_TEMPLATES, formatIDR } from '../domain/finance/financialEngine';
import { DataService } from '../services/dataService';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { savePockets, accounts, addTransaction } = useData();

  const [step, setStep] = useState<1 | 2>(1);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(user?.monthly_income || 6000000);
  const [selectedTemplate, setSelectedTemplate] = useState(BUDGET_TEMPLATES[1]);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleNextStep = () => {
    if (monthlyIncome <= 0) return;
    setStep(2);
  };

  const handleCompleteOnboarding = async () => {
    setIsFinishing(true);
    try {
      // 1. Update user profile with income and completed status
      await updateUser({
        monthly_income: monthlyIncome,
        onboarding_completed: true,
      });

      // 2. Generate initial pockets from selected template
      const initialPockets = selectedTemplate.pockets.map((p, idx) => ({
        id: 'pocket-onboard-' + idx + '-' + Math.random().toString(36).substring(2, 6),
        user_id: user?.id || 'user-demo-1',
        name: p.name,
        icon: p.icon,
        color: p.color,
        allocation_percentage: p.allocation_percentage,
        is_starred: p.is_starred,
        sort_order: idx + 1,
      }));

      await savePockets(initialPockets);

      // 3. Record initial income transaction so Saldo Riil matches entered income
      if (monthlyIncome > 0) {
        const availableAccounts = accounts.length > 0 ? accounts : await DataService.getAccounts();
        const primaryAccount = availableAccounts[0];
        if (primaryAccount) {
          const today = new Date().toISOString().split('T')[0];
          await addTransaction({
            user_id: user?.id || 'user-demo-1',
            account_id: primaryAccount.id,
            amount: monthlyIncome,
            type: 'income',
            description: 'Pemasukan Gaji Awal',
            date: today,
          });
        }
      }

      // Trigger celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FAAE2B', '#10B981', '#FF7A59', '#18181B'],
      });

      setTimeout(() => {
        navigate('/app/dashboard', { replace: true });
      }, 700);
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          <span
            className={`w-8 h-8 rounded-full border-2 border-brand-dark flex items-center justify-center font-black text-xs ${
              step >= 1 ? 'bg-brand-primary text-brand-dark' : 'bg-white text-gray-400'
            }`}
          >
            1
          </span>
          <div className="w-12 h-1 bg-brand-dark" />
          <span
            className={`w-8 h-8 rounded-full border-2 border-brand-dark flex items-center justify-center font-black text-xs ${
              step === 2 ? 'bg-brand-primary text-brand-dark' : 'bg-white text-gray-400'
            }`}
          >
            2
          </span>
        </div>

        {/* Step 1: Income Setup */}
        {step === 1 && (
          <Card variant="saweria" className="bg-white space-y-5">
            <div className="text-center space-y-1">
              <span className="text-xs font-black text-brand-primary uppercase tracking-wider">
                Langkah 1 dari 2
              </span>
              <h2 className="text-2xl font-black text-brand-dark">
                Berapa Estimasi Pemasukan Bulananmu?
              </h2>
              <p className="text-xs font-bold text-brand-darkMuted">
                Angka ini menjadi dasar perhitungan persentase kantong budget kamu. Bisa diubah kapan saja.
              </p>
            </div>

            <div className="pt-2">
              <CurrencyInput
                label="Pemasukan Bulanan / Gaji Bersih (IDR)"
                value={monthlyIncome}
                onValueChange={setMonthlyIncome}
                placeholder="Rp 6.000.000"
                className="text-xl"
              />
            </div>

            <div className="p-3 bg-brand-cream rounded-xl border border-brand-border text-xs text-brand-darkMuted leading-relaxed">
              💡 <strong>Tips:</strong> Jika pendapatanmu bervariasi (misal freelancer), masukkan rata-rata minimum per bulan agar pengeluaranmu selalu terkendali.
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleNextStep}
                disabled={monthlyIncome <= 0}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Pilih Pola Kantong Budget
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Choose Starter Template */}
        {step === 2 && (
          <Card variant="saweria" className="bg-white space-y-5">
            <div className="text-center space-y-1">
              <span className="text-xs font-black text-brand-primary uppercase tracking-wider">
                Langkah 2 dari 2
              </span>
              <h2 className="text-2xl font-black text-brand-dark">
                Pilih Pola Alokasi Kantong Awal
              </h2>
              <p className="text-xs font-bold text-brand-darkMuted">
                Pilih template yang paling sesuai dengan gaya hidupmu. Semua kantong bisa diedit nanti.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUDGET_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-dark bg-brand-primary/20 shadow-saweria-sm'
                        : 'border-brand-border bg-white hover:border-brand-dark'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-brand-dark">{tpl.name}</h4>
                      {isSelected && <Check className="w-4 h-4 text-brand-dark stroke-[3]" />}
                    </div>
                    <p className="text-[11px] text-brand-darkMuted mt-1 leading-snug">{tpl.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Template Summary Nominal Preview */}
            <div className="bg-brand-cream p-4 rounded-2xl border-2 border-brand-dark space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-brand-dark">
                <span>Rencana Pembagian Gaji:</span>
                <span className="tabular-nums">{formatIDR(monthlyIncome)}</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {selectedTemplate.pockets.map((p, idx) => {
                  const nominal = Math.round((monthlyIncome * p.allocation_percentage) / 100);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-brand-dark">{p.name} ({p.allocation_percentage}%)</span>
                      </div>
                      <span className="text-brand-dark tabular-nums">{formatIDR(nominal)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setStep(1)}>
                Kembali
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleCompleteOnboarding}
                isLoading={isFinishing}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Selesai & Masuk Workspace
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

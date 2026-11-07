import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SavingsGoal, Subscription, Debt } from '../../types';
import {
  Target,
  CalendarClock,
  HandCoins,
  Plus,
  ArrowRight,
} from 'lucide-react';

export interface DashboardFinancialHubProps {
  activeTab: 'goals' | 'subscriptions' | 'debts';
  onSelectTab: (tab: 'goals' | 'subscriptions' | 'debts') => void;
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  debts: Debt[];
  onOpenNewGoal: () => void;
  onOpenNewSubscription: () => void;
  onOpenNewDebt: () => void;
  formatMoney: (amount: number) => string;
}

export const DashboardFinancialHub: React.FC<DashboardFinancialHubProps> = ({
  activeTab,
  onSelectTab,
  goals,
  subscriptions,
  debts,
  onOpenNewGoal,
  onOpenNewSubscription,
  onOpenNewDebt,
  formatMoney,
}) => {
  return (
    <Card variant="saweria" className="bg-white dark:bg-slate-900 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border dark:border-slate-800">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('goals')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-xs'
                : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Target Impian ({goals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('subscriptions')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-xs'
                : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Tagihan Rutin ({subscriptions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('debts')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'debts'
                ? 'bg-brand-primary text-brand-primaryText border-2 border-brand-dark shadow-saweria-xs'
                : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-200'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Buku Hutang ({debts.filter((d) => !d.is_settled).length})</span>
          </button>
        </div>

        {/* Action Button for Active Tab */}
        <div>
          {activeTab === 'goals' && (
            <button
              type="button"
              onClick={onOpenNewGoal}
              className="text-xs font-black text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Tambah Target</span>
            </button>
          )}

          {activeTab === 'subscriptions' && (
            <button
              type="button"
              onClick={onOpenNewSubscription}
              className="text-xs font-black text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Tambah Tagihan</span>
            </button>
          )}

          {activeTab === 'debts' && (
            <button
              type="button"
              onClick={onOpenNewDebt}
              className="text-xs font-black text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Catat Hutang</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Goals */}
      {activeTab === 'goals' && (
        <div className="pt-3.5 space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-brand-cream/50 dark:bg-slate-800/50 border border-brand-border dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-brand-dark mx-auto flex items-center justify-center text-emerald-800 dark:text-emerald-300 shadow-saweria-xs">
                <Target className="w-6 h-6 stroke-[2.3]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-dark dark:text-slate-100">Belum Ada Target Tabungan Impian</h4>
                <p className="text-xs font-bold text-brand-darkMuted dark:text-slate-400 mt-0.5">
                  Rencanakan dana liburan, gadget impian, atau dana darurat secara terarah.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={onOpenNewGoal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + Buat Target Tabungan Pertama
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {goals.slice(0, 3).map((goal) => {
                  const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                  return (
                    <div
                      key={goal.id}
                      className="p-3.5 rounded-2xl bg-brand-cream dark:bg-slate-800 border border-brand-border dark:border-slate-700 space-y-2 flex flex-col justify-between hover:bg-brand-cream/80 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-brand-dark dark:text-slate-100">
                          <span className="truncate pr-2 font-black">{goal.name}</span>
                          <span className="font-black text-brand-primary tabular-nums shrink-0">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-brand-primary rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-[10px] text-brand-darkMuted dark:text-slate-400 font-bold">Terkumpul:</span>
                        <span className="font-black text-brand-dark dark:text-slate-100 tabular-nums">
                          {formatMoney(goal.current_amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 flex justify-end">
                <Link
                  to="/app/goals"
                  className="text-xs font-black text-brand-dark hover:text-brand-primary dark:text-slate-200 dark:hover:text-brand-primary flex items-center gap-1 group"
                >
                  <span>Lihat Semua Target ({goals.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="pt-3.5 space-y-3">
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-brand-cream/50 dark:bg-slate-800/50 border border-brand-border dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 border-2 border-brand-dark mx-auto flex items-center justify-center text-sky-800 dark:text-sky-300 shadow-saweria-xs">
                <CalendarClock className="w-6 h-6 stroke-[2.3]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-dark dark:text-slate-100">Belum Ada Tagihan Rutin</h4>
                <p className="text-xs font-bold text-brand-darkMuted dark:text-slate-400 mt-0.5">
                  Catat tagihan listrik PLN, wifi, BPJS, atau langganan agar tidak telat bayar.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={onOpenNewSubscription}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + Tambah Tagihan Pertama
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subscriptions.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-2xl bg-brand-cream dark:bg-slate-800 border border-brand-border dark:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-black text-brand-dark dark:text-slate-100 block truncate">{sub.name}</span>
                      <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 block truncate">
                        Jatuh tempo tgl {sub.due_day}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-brand-dark dark:text-slate-100 tabular-nums block">
                        {formatMoney(sub.amount)}
                      </span>
                      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-300 dark:border-sky-700">
                        Rutin
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex justify-end">
                <Link
                  to="/app/subscriptions"
                  className="text-xs font-black text-brand-dark hover:text-brand-primary dark:text-slate-200 dark:hover:text-brand-primary flex items-center gap-1 group"
                >
                  <span>Lihat Semua Tagihan ({subscriptions.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Debts */}
      {activeTab === 'debts' && (
        <div className="pt-3.5 space-y-3">
          {debts.filter((d) => !d.is_settled).length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-brand-cream/50 dark:bg-slate-800/50 border border-brand-border dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border-2 border-brand-dark mx-auto flex items-center justify-center text-rose-800 dark:text-rose-300 shadow-saweria-xs">
                <HandCoins className="w-6 h-6 stroke-[2.3]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-dark dark:text-slate-100">Tidak Ada Hutang / Piutang Aktif</h4>
                <p className="text-xs font-bold text-brand-darkMuted dark:text-slate-400 mt-0.5">
                  Catat pinjaman uang atau uang yang dipinjam teman agar tidak ada yang lupa.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={onOpenNewDebt}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + Catat Pinjaman / Piutang Baru
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {debts
                  .filter((d) => !d.is_settled)
                  .slice(0, 3)
                  .map((debt) => {
                    const isRec = debt.type === 'receivable';
                    const remaining = Math.max(0, debt.amount - debt.paid_amount);
                    return (
                      <div
                        key={debt.id}
                        className="p-3 rounded-2xl bg-brand-cream dark:bg-slate-800 border border-brand-border dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                isRec
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                              }`}
                            >
                              {isRec ? 'Piutang' : 'Hutang'}
                            </span>
                            <span className="text-xs font-black text-brand-dark dark:text-slate-100">{debt.person_name}</span>
                          </div>
                          <div className="text-[11px] font-bold text-brand-darkMuted dark:text-slate-400 mt-0.5">
                            {debt.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-brand-dark dark:text-slate-100 tabular-nums">
                            {formatMoney(remaining)}
                          </div>
                          <div className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400">
                            {debt.due_date ? `Target ${debt.due_date}` : 'Belum lunas'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="pt-2 flex justify-end">
                <Link
                  to="/app/debts"
                  className="text-xs font-black text-brand-dark hover:text-brand-primary dark:text-slate-200 dark:hover:text-brand-primary flex items-center gap-1 group"
                >
                  <span>Buka Buku Hutang ({debts.filter((d) => !d.is_settled).length})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

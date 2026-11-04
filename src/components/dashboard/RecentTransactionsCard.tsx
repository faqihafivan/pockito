import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Transaction, Pocket } from '../../types';
import { useData } from '../../context/DataContext';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight, ArrowRight } from 'lucide-react';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  pockets: Pocket[];
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  pockets,
}) => {
  const { formatMoney } = useData();
  const pocketMap = new Map(pockets.map((p) => [p.id, p]));
  const recent = transactions.slice(0, 3);
  const remainingTxCount = Math.max(0, transactions.length - 3);

  return (
    <Card variant="saweria" className="bg-white h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border gap-2">
        <div className="min-w-0 pr-1">
          <h3 className="text-xs sm:text-sm font-black text-brand-dark uppercase tracking-wider truncate">
            Aktivitas Transaksi
          </h3>
          <p className="text-[11px] text-brand-darkMuted mt-0.5 truncate">
            Arus kas riil yang baru saja dicatat
          </p>
        </div>
        <Link
          to="/app/transactions"
          className="text-xs font-black text-brand-dark hover:text-brand-primaryHover flex items-center gap-1 group whitespace-nowrap shrink-0"
        >
          <span>Lihat Semua</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </div>

      <div className="divide-y divide-brand-border/60 mt-2">
        {recent.length === 0 ? (
          <p className="py-6 text-center text-xs text-brand-darkMuted">
            Belum ada transaksi tercatat. Klik tombol "Catat Transaksi" untuk memulai!
          </p>
        ) : (
          recent.map((tx) => {
            const pocket = tx.pocket_id ? pocketMap.get(tx.pocket_id) : null;
            const isExpense = tx.type === 'expense';
            const isIncome = tx.type === 'income';

            return (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-9 h-9 rounded-xl border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-sm ${
                      isIncome
                        ? 'bg-[#10B981]/20 text-[#047857]'
                        : isExpense
                        ? 'bg-red-500/15 text-red-600'
                        : 'bg-brand-primary/20 text-brand-dark'
                    }`}
                  >
                    {isIncome && <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />}
                    {isExpense && <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />}
                    {!isIncome && !isExpense && <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />}
                  </div>

                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-brand-dark truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-brand-darkMuted font-medium">
                      <span>{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      {pocket && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-brand-dark" style={{ color: pocket.color }}>
                            {pocket.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-xs font-black tabular-nums shrink-0 ${
                    isIncome ? 'text-[#047857]' : isExpense ? 'text-red-600' : 'text-brand-dark'
                  }`}
                >
                  {isIncome ? `+${formatMoney(tx.amount)}` : isExpense ? `-${formatMoney(tx.amount)}` : formatMoney(tx.amount)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {remainingTxCount > 0 && (
        <Link
          to="/app/transactions"
          className="mt-2.5 block text-center py-2 px-3 rounded-xl bg-brand-cream/70 dark:bg-slate-800/60 border border-brand-dark/20 text-xs font-black text-brand-dark hover:bg-brand-cream transition-colors"
        >
          + {remainingTxCount} transaksi lainnya (Klik Lihat Semua)
        </Link>
      )}
      </div>

      <div className="pt-3 border-t border-brand-border flex items-center justify-between">
        <Link
          to="/app/transactions"
          className="text-xs font-black text-brand-dark hover:text-brand-primary flex items-center gap-1 group"
        >
          <span>Buku Kas Lengkap</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  );
};

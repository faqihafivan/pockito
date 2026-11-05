import React from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Transaction, Pocket, Account } from '../../types';
import { formatPeriod } from '../../domain/finance/financialEngine';
import {
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ReceiptText,
  ExternalLink,
  Calendar,
  Wallet,
} from 'lucide-react';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  period: string;
  transactions: Transaction[];
  pockets: Pocket[];
  accounts: Account[];
  formatMoney: (amount: number) => string;
  onOpenNewTransaction: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  type,
  period,
  transactions,
  pockets,
  accounts,
  formatMoney,
  onOpenNewTransaction,
}) => {
  const isIncome = type === 'income';

  // Filter transactions for this specific month & type
  const matchingTransactions = transactions
    .filter((tx) => tx.type === type && tx.date && tx.date.startsWith(period))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalAmount = matchingTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const pocketMap = new Map(pockets.map((p) => [p.id, p]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const title = isIncome ? 'Riwayat Kas Masuk (Pemasukan)' : 'Riwayat Kas Keluar (Pengeluaran)';
  const subtitle = `Daftar transaksi aktual untuk periode ${formatPeriod(period)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} maxWidth="lg">
      <div className="space-y-4">
        {/* Total Summary Banner */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between ${
            isIncome
              ? 'bg-[#EBF6F4] dark:bg-emerald-950/40 border-emerald-800/30 dark:border-emerald-600/40 text-emerald-950 dark:text-emerald-100'
              : 'bg-[#FDF2F2] dark:bg-rose-950/40 border-rose-800/30 dark:border-rose-600/40 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-saweria-xs ${
                isIncome
                  ? 'bg-emerald-200/80 dark:bg-emerald-800/60 border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-200/80 dark:bg-rose-800/60 border-rose-800/40 text-rose-900 dark:text-rose-200'
              }`}
            >
              {isIncome ? (
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <TrendingDown className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                {isIncome ? 'Total Pemasukan Bulan Ini' : 'Total Pengeluaran Bulan Ini'}
              </span>
              <span className="text-lg sm:text-xl font-black tabular-nums tracking-tight">
                {isIncome ? '+' : '-'} {formatMoney(totalAmount)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNewTransaction();
            }}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 font-black text-xs shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
              isIncome
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-brand-dark'
                : 'bg-rose-500 hover:bg-rose-600 text-white border-brand-dark'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isIncome ? '+ Catat Pemasukan' : '+ Catat Pengeluaran'}</span>
          </button>
        </div>

        {/* Transaction Items List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {matchingTransactions.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-brand-border dark:border-slate-800 bg-brand-cream/40 dark:bg-slate-900/40 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center mx-auto shadow-saweria-xs text-brand-darkMuted">
                <ReceiptText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-dark dark:text-slate-100">
                  Belum ada transaksi {isIncome ? 'pemasukan' : 'pengeluaran'}
                </h4>
                <p className="text-xs text-brand-darkMuted dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {isIncome
                    ? 'Catat gaji pokok atau pemasukan lainnya untuk menambah Saldo Riil kas Anda.'
                    : 'Belum ada pengeluaran kas yang tercatat pada bulan yang dipilih.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewTransaction();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary text-white font-black text-xs border-2 border-brand-dark shadow-saweria-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{isIncome ? 'Catat Pemasukan Sekarang' : 'Catat Pengeluaran Sekarang'}</span>
              </button>
            </div>
          ) : (
            matchingTransactions.map((tx) => {
              const pocket = tx.pocket_id ? pocketMap.get(tx.pocket_id) : undefined;
              const account = tx.account_id ? accountMap.get(tx.account_id) : undefined;

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-xs flex items-center justify-between gap-3 hover:translate-x-0.5 transition-transform"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center shrink-0 shadow-saweria-xs ${
                        isIncome
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-brand-dark dark:text-slate-100 truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{tx.date}</span>
                        </span>

                        {pocket && (
                          <span
                            className="text-[9px] font-black px-1.5 py-0.2 rounded-full border"
                            style={{
                              backgroundColor: `${pocket.color}15`,
                              color: pocket.color,
                              borderColor: `${pocket.color}40`,
                            }}
                          >
                            {pocket.name}
                          </span>
                        )}

                        {account && (
                          <span className="text-[9px] font-bold text-brand-darkMuted dark:text-slate-400 flex items-center gap-0.5">
                            <Wallet className="w-2.5 h-2.5" />
                            <span>{account.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-black tabular-nums tracking-tight block ${
                        isIncome
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatMoney(tx.amount)}
                    </span>
                    {tx.notes && (
                      <span className="text-[9px] font-bold text-brand-darkMuted dark:text-slate-400 block truncate max-w-[120px]">
                        {tx.notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t-2 border-brand-border dark:border-slate-800 flex items-center justify-between gap-2">
          <Link
            to={`/app/transactions?type=${type}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-black text-brand-primary hover:underline underline-offset-2"
          >
            <span>Buka Buku Transaksi Lengkap</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};

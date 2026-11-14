import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TransactionModal } from '../components/transactions/TransactionModal';
import {
  Plus,
  Search,
  Camera,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CalendarClock,
  HandCoins,
  Trash2,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const TransactionsPage: React.FC = () => {
  const { transactions, pockets, accounts, deleteTransaction, formatMoney, isLoading } = useData();
  const { showConfirm, showToast } = useNotification();

  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');

  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    method: 'manual' | 'scan';
  }>({ isOpen: false, method: 'manual' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>(() => {
    if (typeParam === 'income' || typeParam === 'expense' || typeParam === 'transfer') {
      return typeParam;
    }
    return 'all';
  });

  useEffect(() => {
    if (typeParam === 'income' || typeParam === 'expense' || typeParam === 'transfer') {
      setFilterType(typeParam);
    }
  }, [typeParam]);
  const [filterPocket, setFilterPocket] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');

  const pocketMap = useMemo(() => new Map(pockets.map((p) => [p.id, p])), [pockets]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(query);
        const notesMatch = tx.notes?.toLowerCase().includes(query);
        if (!descMatch && !notesMatch) return false;
      }

      // Type
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Pocket
      if (filterPocket !== 'all' && tx.pocket_id !== filterPocket) {
        return false;
      }

      // Account
      if (filterAccount !== 'all' && tx.account_id !== filterAccount && tx.destination_account_id !== filterAccount) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, filterType, filterPocket, filterAccount]);

  const handleDelete = async (id: string, description: string) => {
    const confirmed = await showConfirm({
      title: 'Hapus Transaksi?',
      message: `Hapus transaksi "${description}"?\nSaldo akun akan otomatis disesuaikan kembali.`,
      confirmText: 'Ya, Hapus',
      isDanger: true,
    });
    if (confirmed) {
      await deleteTransaction(id);
      showToast('Transaksi berhasil dihapus', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            Buku Transaksi Riil
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
            Daftar lengkap arus kas pemasukan, pengeluaran, dan transfer antar rekening.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setTransactionModal({ isOpen: true, method: 'scan' })}
            leftIcon={<Camera className="w-4 h-4 text-brand-dark" />}
          >
            Scan Struk / Catat
          </Button>
          <Link to="/app/subscriptions">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<CalendarClock className="w-4 h-4 text-brand-dark" />}
            >
              Tagihan Rutin
            </Button>
          </Link>
          <Link to="/app/debts">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<HandCoins className="w-4 h-4 text-brand-dark" />}
            >
              Hutang & Piutang
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => setTransactionModal({ isOpen: true, method: 'manual' })}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Catat Baru
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card variant="saweria" className="bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-brand-darkMuted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi..."
              className="w-full bg-brand-cream text-brand-dark text-xs font-bold pl-10 pr-3 py-2.5 rounded-xl border-2 border-brand-border focus:border-brand-dark outline-none"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-brand-cream text-brand-dark text-xs font-bold px-3 py-2.5 rounded-xl border-2 border-brand-border focus:border-brand-dark outline-none cursor-pointer"
            >
              <option value="all">Semua Tipe Transaksi</option>
              <option value="expense">Pengeluaran Saja</option>
              <option value="income">Pemasukan Saja</option>
              <option value="transfer">Transfer Saja</option>
            </select>
          </div>

          {/* Pocket Filter */}
          <div>
            <select
              value={filterPocket}
              onChange={(e) => setFilterPocket(e.target.value)}
              className="w-full bg-brand-cream text-brand-dark text-xs font-bold px-3 py-2.5 rounded-xl border-2 border-brand-border focus:border-brand-dark outline-none cursor-pointer"
            >
              <option value="all">Semua Kantong</option>
              {pockets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full bg-brand-cream text-brand-dark text-xs font-bold px-3 py-2.5 rounded-xl border-2 border-brand-border focus:border-brand-dark outline-none cursor-pointer"
            >
              <option value="all">Semua Rekening / Kas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Ledger Table / List */}
      <Card variant="saweria" className="bg-white overflow-hidden p-0">
        <div className="p-4 border-b-2 border-brand-border flex items-center justify-between">
          <span className="text-xs font-black text-brand-dark uppercase tracking-wider">
            Hasil Ditemukan ({filteredTransactions.length} Transaksi)
          </span>
        </div>

        <div className="divide-y divide-brand-border">
          {isLoading ? (
            <div className="divide-y divide-brand-border animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0 border border-brand-border" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <div className="h-3 w-44 bg-slate-100 dark:bg-slate-700 rounded-md" />
                    </div>
                  </div>
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-md shrink-0" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-10 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl border-2 border-brand-dark bg-brand-cream/80 dark:bg-slate-800 flex items-center justify-center shadow-saweria-sm">
                <Search className="w-6 h-6 text-brand-dark dark:text-slate-200 stroke-[2.2]" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-black text-brand-dark dark:text-slate-100">
                  Tidak Ada Transaksi yang Cocok
                </h4>
                <p className="text-xs text-brand-darkMuted leading-relaxed">
                  Kriteria pencarian atau filter yang dipilih tidak menemukan riwayat. Coba ubah kata kunci atau bersihkan filter.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterPocket('all');
                  setFilterAccount('all');
                }}
                aria-label="Reset Semua Filter Transaksi"
                className="mt-2"
              >
                Reset Semua Filter
              </Button>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const pocket = tx.pocket_id ? pocketMap.get(tx.pocket_id) : null;
              const account = accountMap.get(tx.account_id);
              const destAccount = tx.destination_account_id ? accountMap.get(tx.destination_account_id) : null;

              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-brand-cream/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div
                      className={`w-10 h-10 rounded-xl border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-sm ${isIncome
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : isExpense
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : 'bg-brand-primary/20 text-brand-dark dark:text-slate-200'
                        }`}
                    >
                      {isIncome && <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />}
                      {isExpense && <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />}
                      {!isIncome && !isExpense && <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />}
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="text-sm font-black text-brand-dark truncate">{tx.description}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-brand-darkMuted font-bold">
                        <span>
                          {new Date(tx.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span className="text-brand-dark">
                          {tx.type === 'transfer'
                            ? `${account?.name || 'Kas'} ➔ ${destAccount?.name || 'Kas'}`
                            : account?.name || 'Kas'}
                        </span>
                        {pocket && (
                          <>
                            <span>•</span>
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] text-white font-black"
                              style={{ backgroundColor: pocket.color }}
                            >
                              {pocket.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={`text-sm font-black tabular-nums text-right ${isIncome ? 'text-emerald-700 dark:text-emerald-300' : isExpense ? 'text-red-600 dark:text-red-400' : 'text-brand-dark dark:text-slate-100'
                        }`}
                    >
                      {isIncome
                        ? `+${formatMoney(tx.amount)}`
                        : isExpense
                          ? `-${formatMoney(tx.amount)}`
                          : formatMoney(tx.amount)}
                    </div>
                    <button
                      onClick={() => handleDelete(tx.id, tx.description)}
                      className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-brand-darkMuted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Hapus Transaksi"
                      aria-label={`Hapus transaksi ${tx.description}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <TransactionModal
        isOpen={transactionModal.isOpen}
        onClose={() => setTransactionModal((prev) => ({ ...prev, isOpen: false }))}
        defaultMethod={transactionModal.method}
      />
    </div>
  );
};

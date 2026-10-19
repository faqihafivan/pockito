import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { formatIDR } from '../domain/finance/financialEngine';
import {
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Trash2,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const TransactionsPage: React.FC = () => {
  const { transactions, pockets, accounts, deleteTransaction } = useData();
  const { showConfirm, showToast } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
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

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Catat Transaksi Baru
        </Button>
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
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-brand-darkMuted space-y-2">
              <p>Tidak ada transaksi yang cocok dengan kriteria filter.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterPocket('all');
                  setFilterAccount('all');
                }}
              >
                Reset Filter
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
                          ? 'bg-[#10B981]/20 text-[#047857]'
                          : isExpense
                            ? 'bg-red-500/15 text-red-600'
                            : 'bg-brand-primary/20 text-brand-dark'
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
                      className={`text-sm font-black tabular-nums text-right ${isIncome ? 'text-[#047857]' : isExpense ? 'text-red-600' : 'text-brand-dark'
                        }`}
                    >
                      {isIncome
                        ? `+${formatIDR(tx.amount)}`
                        : isExpense
                          ? `-${formatIDR(tx.amount)}`
                          : formatIDR(tx.amount)}
                    </div>
                    <button
                      onClick={() => handleDelete(tx.id, tx.description)}
                      className="p-1.5 rounded-lg text-brand-darkMuted hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Transaksi"
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

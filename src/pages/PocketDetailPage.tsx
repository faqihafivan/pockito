import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { PocketModal } from '../components/pockets/PocketModal';
import { formatIDR } from '../domain/finance/financialEngine';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { getPocketIcon } from '../domain/finance/pocketIcons';

export const PocketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pocketSummaries, transactions, deletePocket } = useData();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const pocket = pocketSummaries.find((p) => p.id === id);

  if (!pocket) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-black text-brand-dark">Kantong Tidak Ditemukan</h3>
        <p className="text-xs text-brand-darkMuted">Kantong yang Anda cari mungkin telah dihapus.</p>
        <Link to="/app/budget">
          <Button variant="primary" size="sm">
            Kembali ke Daftar Kantong
          </Button>
        </Link>
      </div>
    );
  }

  // Transactions tagged to this pocket
  const pocketTransactions = transactions.filter((t) => t.pocket_id === pocket.id);
  const isOverBudget = pocket.spentAmount > pocket.plannedAmount;

  const handleDelete = async () => {
    if (window.confirm(`Yakin ingin menghapus kantong "${pocket.name}"?`)) {
      await deletePocket(pocket.id);
      navigate('/app/budget');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/budget"
          className="inline-flex items-center gap-2 text-xs font-black text-brand-dark hover:text-brand-primaryHover"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Kantong</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Hapus
          </Button>
        </div>
      </div>

      {/* Pocket Hero Card */}
      <Card variant="saweria" className="bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl border-2 border-brand-dark flex items-center justify-center text-brand-dark shadow-saweria shrink-0"
              style={{ backgroundColor: pocket.color }}
            >
              {React.createElement(getPocketIcon(pocket.icon), {
                className: 'w-8 h-8 stroke-[2.2]',
              })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-brand-dark">{pocket.name}</h2>
                {pocket.is_starred && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary/20 border border-brand-dark text-[11px] font-black text-brand-dark">
                    <Star className="w-3 h-3 fill-brand-primary" /> Prioritas
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-brand-darkMuted mt-0.5">
                Alokasi: {pocket.allocation_percentage}% dari Pemasukan Bulanan
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsTxModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            + Catat Pengeluaran di Sini
          </Button>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 bg-brand-cream rounded-2xl border border-brand-border">
            <span className="text-[10px] font-black text-brand-darkMuted uppercase">
              Rencana Pagu Bulanan
            </span>
            <div className="text-lg font-black text-brand-dark tabular-nums mt-0.5">
              {formatIDR(pocket.plannedAmount)}
            </div>
          </div>

          <div className="p-4 bg-brand-cream rounded-2xl border border-brand-border">
            <span className="text-[10px] font-black text-brand-darkMuted uppercase">
              Total Terpakai Bulan Ini
            </span>
            <div
              className={`text-lg font-black tabular-nums mt-0.5 ${
                isOverBudget ? 'text-red-600' : 'text-brand-dark'
              }`}
            >
              {formatIDR(pocket.spentAmount)}
            </div>
          </div>

          <div className="p-4 bg-brand-cream rounded-2xl border border-brand-border">
            <span className="text-[10px] font-black text-brand-darkMuted uppercase">
              Sisa Kuota Anggaran
            </span>
            <div
              className={`text-lg font-black tabular-nums mt-0.5 ${
                isOverBudget ? 'text-red-600' : 'text-[#047857]'
              }`}
            >
              {isOverBudget
                ? `Melebihi ${formatIDR(Math.abs(pocket.remainingAmount))}`
                : formatIDR(pocket.remainingAmount)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
            <span>Realisasi Anggaran</span>
            <span>{pocket.spentPercentage}%</span>
          </div>
          <ProgressBar value={pocket.spentPercentage} color={pocket.color} size="lg" />
        </div>
      </Card>

      {/* History of Transactions */}
      <Card variant="saweria" className="bg-white">
        <div className="flex items-center justify-between pb-3 border-b-2 border-brand-border">
          <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">
            Riwayat Pengeluaran Kantong Ini ({pocketTransactions.length})
          </h3>
        </div>

        <div className="divide-y divide-brand-border/60 mt-2">
          {pocketTransactions.length === 0 ? (
            <p className="py-8 text-center text-xs text-brand-darkMuted">
              Belum ada transaksi pengeluaran yang dialokasikan ke kantong ini.
            </p>
          ) : (
            pocketTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-brand-dark text-red-600 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-dark">{tx.description}</p>
                    <p className="text-[10px] text-brand-darkMuted">
                      {new Date(tx.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-black text-red-600 tabular-nums">
                  -{formatIDR(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        defaultPocketId={pocket.id}
      />

      <PocketModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        pocketToEdit={pocket}
      />
    </div>
  );
};

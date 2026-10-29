import React, { useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatIDR, formatPeriod } from '../../domain/finance/financialEngine';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, Sparkles, ShieldCheck, FileText } from 'lucide-react';

interface MonthlyStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyStatementModal: React.FC<MonthlyStatementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const {
    overview,
    pocketSummaries,
    transactions,
    selectedPeriod,
    emergencyRunway,
  } = useData();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Top 8 transactions for this period
  const topTransactions = transactions
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const netSavings = overview.monthlyIncome - overview.totalMonthlyExpense;
  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lembar Laporan Keuangan Bulanan"
      subtitle="Siap dicetak atau disimpan sebagai dokumen PDF resmi"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Print Action Bar (Hidden in print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-brand-cream border-2 border-brand-dark no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-brand-dark" />
            <p className="text-xs font-bold text-brand-dark">
              Format A4 Portrait siap cetak / simpan ke PDF
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClose}
            >
              Tutup
            </Button>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Cetak / Simpan PDF
            </Button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div
          ref={printAreaRef}
          id="pockito-printable-statement"
          className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-brand-dark shadow-saweria-sm space-y-6 text-brand-dark"
        >
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-brand-dark pb-5">
            <div className="flex items-center gap-3">
              <img
                src="/pockito.jpg"
                alt="Pockito"
                className="w-12 h-12 rounded-2xl border-2 border-brand-dark object-contain shadow-saweria-sm"
              />
              <div>
                <h1 className="text-2xl font-black tracking-tight leading-none">
                  Pockito<span className="text-brand-primary">.</span>
                </h1>
                <p className="text-xs font-extrabold text-brand-darkMuted uppercase tracking-wider mt-1">
                  Laporan Rekening & Evaluasi Finansial
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <p className="font-black text-brand-dark">
                Periode: {formatPeriod(selectedPeriod)}
              </p>
              <p className="font-bold text-brand-darkMuted">
                Pemilik: {user?.full_name || 'Pengguna Pockito'}
              </p>
              <p className="text-[10px] text-brand-darkMuted">
                Dicetak pada: {printDate}
              </p>
            </div>
          </div>

          {/* 1. KPI Executive Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-brand-cream border-2 border-brand-dark">
              <span className="text-[10px] font-black uppercase text-brand-darkMuted block">
                Total Pemasukan
              </span>
              <span className="text-base font-black text-brand-dark tabular-nums mt-0.5 block">
                {formatIDR(overview.monthlyIncome)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-cream border-2 border-brand-dark">
              <span className="text-[10px] font-black uppercase text-brand-darkMuted block">
                Total Pengeluaran
              </span>
              <span className="text-base font-black text-red-600 tabular-nums mt-0.5 block">
                {formatIDR(overview.totalMonthlyExpense)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-cream border-2 border-brand-dark">
              <span className="text-[10px] font-black uppercase text-brand-darkMuted block">
                Surplus Bersih
              </span>
              <span
                className={`text-base font-black tabular-nums mt-0.5 block ${
                  netSavings >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {formatIDR(netSavings)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-cream border-2 border-brand-dark">
              <span className="text-[10px] font-black uppercase text-brand-darkMuted block">
                Ketahanan Darurat
              </span>
              <span className="text-base font-black text-brand-dark tabular-nums mt-0.5 block">
                {emergencyRunway.runwayMonths} Bulan
              </span>
            </div>
          </div>

          {/* 2. Pockets Budget Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-primary" />
                Realisasi Pos Anggaran (Pockets)
              </h3>
              <span className="text-[10px] font-bold text-brand-darkMuted">
                {pocketSummaries.length} Kantong Terdaftar
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border-2 border-brand-dark">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-cream border-b-2 border-brand-dark font-black text-brand-dark uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Nama Kantong</th>
                    <th className="py-2.5 px-3 text-center">Porsi (%)</th>
                    <th className="py-2.5 px-3 text-right">Pagu Terencana</th>
                    <th className="py-2.5 px-3 text-right">Realisasi Keluar</th>
                    <th className="py-2.5 px-3 text-right">Sisa Pagu</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-brand-border font-bold">
                  {pocketSummaries.map((p) => {
                    const isOver = p.remainingAmount < 0;
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 flex items-center gap-1.5 font-black text-brand-dark">
                          <span>{p.name}</span>
                          {p.is_starred && <span className="text-amber-500">⭐</span>}
                        </td>
                        <td className="py-2 px-3 text-center">{p.allocation_percentage}%</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatIDR(p.plannedAmount)}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatIDR(p.spentAmount)}</td>
                        <td
                          className={`py-2 px-3 text-right tabular-nums font-black ${
                            isOver ? 'text-red-600' : 'text-emerald-700'
                          }`}
                        >
                          {formatIDR(p.remainingAmount)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              isOver
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOver ? 'Over' : 'Aman'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Top Expense Transactions */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              Transaksi Pengeluaran Terbesar Periode Ini
            </h3>
            <div className="overflow-x-auto rounded-2xl border-2 border-brand-dark">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-cream border-b-2 border-brand-dark font-black text-brand-dark uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Tanggal</th>
                    <th className="py-2 px-3">Keterangan</th>
                    <th className="py-2 px-3 text-right">Nominal (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-brand-border font-bold">
                  {topTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-3 text-center text-brand-darkMuted">
                        Belum ada transaksi pengeluaran tercatat periode ini.
                      </td>
                    </tr>
                  ) : (
                    topTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 text-brand-darkMuted text-[11px]">
                          {tx.date.split('T')[0]}
                        </td>
                        <td className="py-2 px-3 text-brand-dark font-black truncate max-w-xs">
                          {tx.description}
                        </td>
                        <td className="py-2 px-3 text-right font-black text-red-600 tabular-nums">
                          {formatIDR(tx.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Financial Health Footnote */}
          <div className="p-4 rounded-2xl bg-brand-cream/80 border-2 border-brand-dark flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-black text-brand-dark">
                Status Kesehatan Finansial: {emergencyRunway.statusLabel}
              </p>
              <p className="text-[11px] font-bold text-brand-darkMuted leading-relaxed">
                {emergencyRunway.adviceMessage}
              </p>
            </div>
          </div>

          {/* Document Sign-off / Footer */}
          <div className="pt-4 border-t border-brand-border flex items-center justify-between text-[11px] font-bold text-brand-darkMuted">
            <span>Dihasilkan secara mandiri melalui Pockito — Workspace Keuangan Pribadi.</span>
            <span>Halaman 1 dari 1</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

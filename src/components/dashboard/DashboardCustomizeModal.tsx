import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface DashboardPrefs {
  // Pintasan di bawah Sisa Budget
  showShortcutSubscriptions: boolean;
  showShortcutDebts: boolean;
  showShortcutGoals: boolean;
  showShortcutReports: boolean;
  showShortcutPlanner: boolean;
  showShortcutTransactions: boolean;

  // Bagian modul lainnya
  showGuardrails: boolean;
  showDonutChart: boolean;
  showPocketMarquee: boolean;
  showRecentTransactions: boolean;
  showTasksAndShopping: boolean;
  showFinancialHub: boolean;
}

export interface DashboardCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefs: DashboardPrefs;
  onTogglePref: (key: keyof DashboardPrefs) => void;
  onResetPrefs: () => void;
}

export const DashboardCustomizeModal: React.FC<DashboardCustomizeModalProps> = ({
  isOpen,
  onClose,
  prefs,
  onTogglePref,
  onResetPrefs,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atur Tampilan Dashboard & Pintasan"
      subtitle="Pilih kartu pintasan dan modul yang ingin ditampilkan agar dashboard simpel dan relevan bagi Anda"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Section 1: Pintasan di Bawah Sisa Budget */}
        <div className="space-y-2">
          <div className="pb-1 border-b border-brand-border dark:border-slate-800">
            <h4 className="text-xs font-black text-brand-dark dark:text-slate-100 uppercase tracking-wider">
              Kartu Pintasan (di Bawah Sisa Budget)
            </h4>
            <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 mt-0.5">
              Centang kartu yang Anda butuhkan. Contoh: jika tidak punya hutang, Anda bisa mematikannya agar hemat ruang.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {[
              { key: 'showShortcutSubscriptions', label: 'Tagihan Rutin', desc: 'Listrik, Wi-Fi, kos, cicilan bulanan' },
              { key: 'showShortcutDebts', label: 'Hutang & Piutang', desc: 'Catatan pinjaman uang & penagihan' },
              { key: 'showShortcutGoals', label: 'Target Tabungan', desc: 'Pos impian tabungan masa depan' },
              { key: 'showShortcutReports', label: 'Laporan Keuangan', desc: 'Analisis & diagram arus kas' },
              { key: 'showShortcutPlanner', label: 'Planner & Belanja', desc: 'Checklist belanja kebutuhan pokok' },
              { key: 'showShortcutTransactions', label: 'Buku Transaksi', desc: 'Riwayat mutasi keluar & masuk' },
            ].map((item) => {
              const k = item.key as keyof DashboardPrefs;
              const isChecked = prefs[k];
              return (
                <label
                  key={item.key}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-colors select-none ${
                    isChecked
                      ? 'bg-brand-cream/80 dark:bg-slate-800 border-brand-dark dark:border-brand-primary'
                      : 'bg-white dark:bg-slate-900 border-brand-border dark:border-slate-800 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onTogglePref(k)}
                    className="w-4 h-4 mt-0.5 rounded text-brand-primary accent-brand-primary cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-black text-brand-dark dark:text-slate-100 block truncate">{item.label}</span>
                    <span className="text-[10px] text-brand-darkMuted dark:text-slate-400 font-medium block truncate">{item.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 2: Modul Lainnya di Dashboard */}
        <div className="space-y-2 pt-2">
          <div className="pb-1 border-b border-brand-border dark:border-slate-800">
            <h4 className="text-xs font-black text-brand-dark dark:text-slate-100 uppercase tracking-wider">
              Modul Konten Lainnya
            </h4>
            <p className="text-[11px] text-brand-darkMuted dark:text-slate-400 mt-0.5">
              Atur bagian modul lain yang tampil di halaman beranda:
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            {[
              { key: 'showTasksAndShopping', label: 'Belanja Pokok & To-Do List', desc: 'Checklist kebutuhan belanja yang memotong saldo otomatis' },
              { key: 'showRecentTransactions', label: 'Riwayat Transaksi Terkini', desc: 'Aktivitas uang masuk dan keluar terbaru' },
              { key: 'showGuardrails', label: 'Batas Belanja Aman & Dana Darurat', desc: 'Analisis limit aman belanja harian' },
              { key: 'showDonutChart', label: 'Grafik Distribusi Alokasi Gaji', desc: 'Diagram donat persentase pembagian kantong' },
              { key: 'showPocketMarquee', label: 'Slider Status Kantong Anggaran', desc: 'Daftar kartu pos anggaran belanja' },
              { key: 'showFinancialHub', label: 'Hub Tab Target, Tagihan & Hutang Piutang', desc: 'Modul komitmen finansial di bagian bawah' },
            ].map((item) => {
              const k = item.key as keyof DashboardPrefs;
              const isChecked = prefs[k];
              return (
                <label
                  key={item.key}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-colors select-none ${
                    isChecked
                      ? 'bg-brand-cream/80 dark:bg-slate-800 border-brand-dark dark:border-brand-primary'
                      : 'bg-white dark:bg-slate-900 border-brand-border dark:border-slate-800 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onTogglePref(k)}
                    className="w-4 h-4 mt-0.5 rounded text-brand-primary accent-brand-primary cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-black text-brand-dark dark:text-slate-100 block">{item.label}</span>
                    <span className="text-[10px] text-brand-darkMuted dark:text-slate-400 font-medium block">{item.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t-2 border-brand-border dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetPrefs}
            className="text-xs font-black text-brand-darkMuted dark:text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            Reset ke Bawaan
          </button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Simpan & Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};

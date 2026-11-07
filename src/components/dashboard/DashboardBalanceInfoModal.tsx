import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface DashboardBalanceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardBalanceInfoModal: React.FC<DashboardBalanceInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Memahami Saldo Riil & Arus Gaji"
      subtitle="Panduan transparan cara Pockito mengelola uang kas dan rencana kantong Anda"
    >
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 space-y-2">
          <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
            1. Apa itu "Saldo Riil"?
          </h4>
          <p className="text-xs text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
            <b>Saldo Riil</b> adalah uang kas nyata yang saat ini benar-benar ada di tangan Anda (akumulasi uang tunai di dompet ditambah saldo di rekening bank aktif). Setiap ada uang masuk atau keluar aktual, Saldo Riil otomatis bertambah atau berkurang.
          </p>
        </div>

        <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border-2 border-sky-300 dark:border-sky-700 space-y-2">
          <h4 className="text-xs font-black text-sky-900 dark:text-sky-200 uppercase tracking-wide">
            2. Bagaimana Jika Berganti Bulan?
          </h4>
          <p className="text-xs text-sky-950 dark:text-sky-100 font-medium leading-relaxed">
            Saldo Riil bersifat <b>kumulatif berkelanjutan</b>. Contoh: Sisa uang Oktober Anda ada Rp 500.000. Saat masuk bulan November dan Anda mencatat gaji Rp 1.300.000, maka Saldo Riil otomatis menjadi <b>Rp 1.800.000</b>. Uang Anda tidak pernah hilang atau di-reset otomatis saat ganti bulan.
          </p>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border-2 border-amber-300 dark:border-amber-700 space-y-2">
          <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wide">
            3. Saldo Riil vs Rencana Budget Kantong
          </h4>
          <p className="text-xs text-amber-950 dark:text-amber-100 font-medium leading-relaxed">
            Pockito memisahkan dengan tegas antara <b>Uang Nyata (Saldo Riil)</b> dan <b>Rencana Belanja (Kantong/Pagu)</b>. Kantong anggaran adalah target panduan belanja bulanan, sedangkan Saldo Riil adalah kas fisik Anda. Jika pengeluaran sebuah kantong melebihi kuota, aplikasi akan memberi tanda peringatan (defisit) agar Anda mengerem belanja, namun uang riil Anda tetap tercatat akurat.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="button" variant="primary" onClick={onClose}>
            Saya Paham! 👍
          </Button>
        </div>
      </div>
    </Modal>
  );
};

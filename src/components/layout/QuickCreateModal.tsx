import React from 'react';
import {
  X,
  ReceiptText,
  CalendarClock,
  HandCoins,
  PiggyBank,
  CalendarCheck2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransaction: () => void;
  onSelectSubscription: () => void;
  onSelectDebt: () => void;
  onSelectGoal: () => void;
  onSelectTask: () => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onSelectTransaction,
  onSelectSubscription,
  onSelectDebt,
  onSelectGoal,
  onSelectTask,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      title: 'Catat Transaksi Cepat',
      desc: 'Pengeluaran harian, jajan kopi, atau pemasukan uang',
      icon: ReceiptText,
      color: '#FAAE2B', // brand-primary
      onClick: () => {
        onClose();
        onSelectTransaction();
      },
      tag: 'Paling Sering',
    },
    {
      title: 'Tambah Tagihan Rutin',
      desc: 'Kos, Wi-Fi, listrik, air, atau langganan bulanan',
      icon: CalendarClock,
      color: '#38BDF8', // sky
      onClick: () => {
        onClose();
        onSelectSubscription();
      },
    },
    {
      title: 'Catat Hutang & Piutang',
      desc: 'Pinjam uang ke orang lain atau teman pinjam uang',
      icon: HandCoins,
      color: '#FB7185', // rose
      onClick: () => {
        onClose();
        onSelectDebt();
      },
    },
    {
      title: 'Buat Target Tabungan',
      desc: 'Rencana dana darurat, liburan, beli gadget impian',
      icon: PiggyBank,
      color: '#34D399', // emerald
      onClick: () => {
        onClose();
        onSelectGoal();
      },
    },
    {
      title: 'Tambah Tugas & Agenda',
      desc: 'Reminder to-do list harian atau checklist finansial',
      icon: CalendarCheck2,
      color: '#A78BFA', // violet
      onClick: () => {
        onClose();
        onSelectTask();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border-2 border-brand-dark shadow-saweria-lg p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-brand-dark pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-primary border-2 border-brand-dark flex items-center justify-center shadow-saweria-sm">
              <Sparkles className="w-4 h-4 text-brand-dark" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-dark leading-tight">
                Buat Catatan Baru
              </h3>
              <p className="text-[11px] font-bold text-brand-darkMuted">
                Pilih jenis pencatatan finansialmu:
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-brand-dark hover:bg-brand-cream text-brand-dark transition-colors shadow-saweria-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="space-y-2.5">
          {actions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={item.onClick}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-brand-dark bg-white hover:bg-brand-cream/80 active:translate-x-0.5 active:translate-y-0.5 shadow-saweria-sm transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-5 h-5 text-brand-dark stroke-[2.3]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-brand-dark">
                        {item.title}
                      </span>
                      {item.tag && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-brand-primary border border-brand-dark">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-brand-darkMuted leading-tight mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-brand-darkMuted group-hover:text-brand-dark group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer cancel button on mobile */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border-2 border-brand-dark bg-brand-cream font-black text-xs text-brand-dark hover:bg-brand-dark hover:text-white transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

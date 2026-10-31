import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  CalendarClock,
  HandCoins,
  PiggyBank,
  PieChart,
  ReceiptText,
  Settings2,
  Compass,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDemo, logout } = useAuth();
  const { subscriptions, debts, goals, selectedPeriod } = useData();

  if (!isOpen) return null;

  const unpaidSubsCount = subscriptions.filter(
    (s) => s.is_active && s.last_paid_period !== selectedPeriod
  ).length;

  const activeDebtsCount = debts.filter((d) => !d.is_settled).length;
  const activeGoalsCount = goals.length;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const menuItems = [
    {
      to: '/app/subscriptions',
      title: 'Tagihan Rutin',
      desc: 'Kos, Wi-Fi, listrik, cicilan & subscription bulanan',
      icon: CalendarClock,
      color: '#38BDF8',
      badge: unpaidSubsCount > 0 ? `${unpaidSubsCount} Perlu Bayar` : 'Lunas',
      badgeDanger: unpaidSubsCount > 0,
    },
    {
      to: '/app/debts',
      title: 'Hutang & Piutang',
      desc: 'Pantau pinjaman uang & penagihan ke teman',
      icon: HandCoins,
      color: '#FB7185',
      badge: activeDebtsCount > 0 ? `${activeDebtsCount} Aktif` : undefined,
      badgeDanger: false,
    },
    {
      to: '/app/goals',
      title: 'Target Tabungan',
      desc: 'Progres pos tabungan & impian barang masa depan',
      icon: PiggyBank,
      color: '#34D399',
      badge: activeGoalsCount > 0 ? `${activeGoalsCount} Target` : undefined,
      badgeDanger: false,
    },
    {
      to: '/app/reports',
      title: 'Laporan Keuangan',
      desc: 'Analisis arus kas bulanan & diagram pengeluaran',
      icon: PieChart,
      color: '#FBBF24',
    },
    {
      to: '/app/transactions',
      title: 'Semua Transaksi',
      desc: 'Buku besar dan riwayat mutasi keluar/masuk',
      icon: ReceiptText,
      color: '#A78BFA',
    },
    {
      to: '/app/settings',
      title: 'Pengaturan & Backup',
      desc: 'Kategori kantong, rekening, export data JSON',
      icon: Settings2,
      color: '#E4E0D7',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl border-2 border-brand-dark shadow-saweria-lg p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-brand-dark pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary border-2 border-brand-dark flex items-center justify-center shadow-saweria-sm">
              <Compass className="w-5 h-5 text-brand-dark" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-dark leading-tight">
                Menu & Fitur Lengkap
              </h3>
              <p className="text-[11px] font-bold text-brand-darkMuted">
                Akses cepat ke seluruh workspace Pockito
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

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isCurrentPage = location.pathname === item.to;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleNavigate(item.to)}
                className={`flex items-start justify-between p-3 rounded-2xl border-2 border-brand-dark transition-all text-left shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 group ${
                  isCurrentPage ? 'bg-amber-50 ring-2 ring-brand-primary' : 'bg-white hover:bg-brand-cream/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-saweria-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-5 h-5 text-brand-dark stroke-[2.3]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-brand-dark">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase border ${
                            item.badgeDanger
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-brand-primary/30 text-brand-dark border-brand-dark/40'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] font-bold text-brand-darkMuted leading-tight mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-darkMuted group-hover:text-brand-dark shrink-0 mt-1" />
              </button>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="pt-2 border-t-2 border-brand-dark/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/30 border-2 border-brand-dark flex items-center justify-center font-black text-xs text-brand-dark shrink-0">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'P'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-brand-dark truncate">
                {user?.full_name || 'Pengguna Pockito'}
              </div>
              <div className="text-[10px] font-bold text-brand-darkMuted truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                <span>{isDemo ? 'Mode Demo' : user?.email || 'Akun Lokal'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="px-3 py-1.5 rounded-xl border-2 border-brand-dark bg-white hover:bg-rose-50 text-rose-700 font-black text-xs flex items-center gap-1.5 shadow-saweria-sm shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

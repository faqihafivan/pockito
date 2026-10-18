import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  WalletCards,
  ReceiptText,
  CalendarCheck2,
  PieChart,
  PiggyBank,
  Settings2,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatIDR } from '../../domain/finance/financialEngine';
import { useData } from '../../context/DataContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { overview } = useData();

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/budget', label: 'Kantong / Pockets', icon: WalletCards },
    { to: '/app/transactions', label: 'Transaksi', icon: ReceiptText },
    { to: '/app/planner', label: 'Planner & Tugas', icon: CalendarCheck2 },
    { to: '/app/reports', label: 'Laporan Keuangan', icon: PieChart },
    { to: '/app/goals', label: 'Target Tabungan', icon: PiggyBank },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r-2 border-brand-dark h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b-2 border-brand-dark flex items-center justify-between bg-brand-cream/60">
        <div className="flex items-center gap-3">
          <img
            src="/pockito.jpg"
            alt="Pockito"
            className="w-11 h-11 rounded-xl object-contain bg-white border-2 border-brand-dark shadow-saweria-sm shrink-0"
          />
          <div>
            <h1 className="text-xl font-black text-brand-dark tracking-tight leading-none">
              Pockito<span className="text-brand-primary">.</span>
            </h1>
            <p className="text-[11px] font-bold text-brand-darkMuted tracking-wider uppercase mt-1">
              Money & Life
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Mini Glance */}
      <div className="px-5 py-4 border-b border-brand-border bg-white">
        <div className="bg-brand-cream/80 rounded-xl p-3 border border-brand-border">
          <div className="flex items-center justify-between text-[11px] font-bold text-brand-darkMuted uppercase">
            <span>Saldo Riil</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          </div>
          <div className="text-base font-black text-brand-dark tabular-nums mt-0.5">
            {formatIDR(overview.totalRecordedBalance)}
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
                    : 'text-brand-darkMuted hover:text-brand-dark hover:bg-brand-cream border-2 border-transparent'
                }`
              }
            >
              <Icon className="w-5 h-5 stroke-[2.2] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile & Settings */}
      <div className="p-4 border-t-2 border-brand-dark bg-brand-cream/40 space-y-2">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              isActive
                ? 'bg-brand-dark text-white'
                : 'text-brand-darkMuted hover:text-brand-dark hover:bg-white'
            }`
          }
        >
          <Settings2 className="w-5 h-5 stroke-[2.2] shrink-0" />
          <span>Pengaturan Akun</span>
        </NavLink>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-primary/30 border border-brand-dark flex items-center justify-center font-bold text-xs text-brand-dark shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-brand-dark truncate">{user?.full_name || 'Pengguna'}</p>
              <p className="text-[10px] text-brand-darkMuted truncate">{user?.email || 'pockito@user'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-brand-darkMuted hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Keluar"
          >
            <LogOut className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </aside>
  );
};

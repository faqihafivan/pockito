import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  WalletCards,
  ReceiptText,
  CalendarClock,
  HandCoins,
  CalendarCheck2,
  PieChart,
  PiggyBank,
  Settings2,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { overview, formatMoney, isPrivacyMode, togglePrivacyMode } = useData();

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/budget', label: 'Kantong / Pockets', icon: WalletCards },
    { to: '/app/transactions', label: 'Transaksi', icon: ReceiptText },
    { to: '/app/subscriptions', label: 'Tagihan Rutin', icon: CalendarClock },
    { to: '/app/debts', label: 'Hutang & Piutang', icon: HandCoins },
    { to: '/app/planner', label: 'Planner & Belanja', icon: CalendarCheck2 },
    { to: '/app/reports', label: 'Laporan Keuangan', icon: PieChart },
    { to: '/app/goals', label: 'Target Tabungan', icon: PiggyBank },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r-2 border-brand-dark dark:border-slate-800 h-screen sticky top-0 z-30 select-none transition-colors">
      {/* Brand Header */}
      <div className="p-6 border-b-2 border-brand-dark dark:border-slate-800 flex items-center justify-between bg-brand-cream/60 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <img
            src="/pockito.jpg"
            alt="Pockito"
            className="w-11 h-11 rounded-xl object-contain bg-white dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm shrink-0"
          />
          <div>
            <h1 className="text-xl font-black text-brand-dark dark:text-slate-100 tracking-tight leading-none">
              Pockito<span className="text-brand-primary">.</span>
            </h1>
            <p className="text-[11px] font-bold text-brand-darkMuted dark:text-slate-400 tracking-wider uppercase mt-1">
              Money & Life
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Mini Glance */}
      <div className="px-5 py-4 border-b border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="bg-brand-cream/80 dark:bg-slate-800/80 rounded-xl p-3 border border-brand-border dark:border-slate-700">
          <div className="flex items-center justify-between text-[11px] font-bold text-brand-darkMuted dark:text-slate-400 uppercase">
            <span>Saldo Riil</span>
            <button
              type="button"
              onClick={togglePrivacyMode}
              className="text-brand-dark dark:text-slate-200 hover:text-brand-primary transition-colors p-0.5 rounded cursor-pointer"
              title={isPrivacyMode ? 'Buka Sensor Saldo (Mode Privasi Aktif)' : 'Sensor Saldo (Mode Privasi)'}
            >
              {isPrivacyMode ? (
                <EyeOff className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-brand-darkMuted dark:text-slate-400" />
              )}
            </button>
          </div>
          <div className="text-base font-black text-brand-dark dark:text-slate-100 tabular-nums mt-0.5">
            {formatMoney(overview.totalRecordedBalance)}
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
                    ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm'
                    : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-100 hover:bg-brand-cream dark:hover:bg-slate-800 border-2 border-transparent'
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
      <div className="p-4 border-t-2 border-brand-dark dark:border-slate-800 bg-brand-cream/40 dark:bg-slate-950/40 space-y-2">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              isActive
                ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark dark:border-slate-700 shadow-saweria-sm'
                : 'text-brand-darkMuted dark:text-slate-400 hover:text-brand-dark dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800'
            }`
          }
        >
          <Settings2 className="w-5 h-5 stroke-[2.2] shrink-0" />
          <span>Pengaturan Akun</span>
        </NavLink>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-primary/30 border border-brand-dark dark:border-slate-700 flex items-center justify-center font-bold text-xs text-brand-dark dark:text-slate-100 shrink-0">
              {user?.full_name?.charAt(0) || 'P'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-brand-dark dark:text-slate-100 truncate">{user?.full_name || 'Pengguna'}</p>
              <p className="text-[10px] text-brand-darkMuted dark:text-slate-400 truncate">{user?.email || 'pockito@user'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-brand-darkMuted dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Keluar"
          >
            <LogOut className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </aside>
  );
};

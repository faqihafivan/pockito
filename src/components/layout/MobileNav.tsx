import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  WalletCards,
  Plus,
  CalendarCheck2,
  PieChart,
} from 'lucide-react';

interface MobileNavProps {
  onOpenQuickCreate?: () => void;
  onOpenNewTransaction?: () => void;
  onOpenMobileMenu?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenQuickCreate,
  onOpenNewTransaction,
}) => {
  const location = useLocation();

  const handleCatatAction = () => {
    if (onOpenQuickCreate) {
      onOpenQuickCreate();
    } else if (onOpenNewTransaction) {
      onOpenNewTransaction();
    }
  };

  const navTabs = [
    {
      id: 'home',
      label: 'Dashboard',
      to: '/app/dashboard',
      icon: LayoutGrid,
    },
    {
      id: 'kantong',
      label: 'Kantong',
      to: '/app/budget',
      icon: WalletCards,
    },
    {
      id: 'catat',
      label: 'Catat Transaksi',
      action: handleCatatAction,
      icon: Plus,
      isAction: true,
    },
    {
      id: 'planner',
      label: 'Planner',
      to: '/app/planner',
      icon: CalendarCheck2,
    },
    {
      id: 'laporan',
      label: 'Laporan',
      to: '/app/reports',
      icon: PieChart,
    },
  ];

  const getActiveIndex = () => {
    if (location.pathname === '/app/dashboard') return 0;
    if (location.pathname.startsWith('/app/budget')) return 1;
    if (location.pathname === '/app/planner') return 3;
    if (
      location.pathname === '/app/reports' ||
      location.pathname === '/app/goals' ||
      location.pathname === '/app/subscriptions' ||
      location.pathname === '/app/debts' ||
      location.pathname === '/app/settings' ||
      location.pathname === '/app/transactions'
    ) {
      return 4;
    }
    return 0;
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="lg:hidden fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none select-none flex justify-center pb-[env(safe-area-inset-bottom)]">
      {/* Floating Capsule Bar (Matching reference image: Rounded-full, Elevated, Pure Glass/White, Squircle Active) */}
      <nav
        className="pointer-events-auto w-auto max-w-[calc(100vw-32px)] sm:max-w-md h-14 sm:h-16 px-2 sm:px-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-full border border-slate-100/90 dark:border-slate-800/80 shadow-[0_12px_36px_-6px_rgba(24,24,27,0.14),0_4px_16px_-2px_rgba(24,24,27,0.06)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1.5 sm:gap-2.5 transition-all duration-300"
        aria-label="Navigasi Utama Mobile"
      >
        {navTabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = idx === activeIndex && !tab.isAction;

          // Action Button (Center Catat +)
          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={tab.action}
                className="group relative flex items-center justify-center focus:outline-none cursor-pointer"
                aria-label={tab.label}
                title={tab.label}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 text-brand-dark dark:text-slate-100 hover:bg-brand-primary/15 hover:text-brand-primary dark:hover:bg-brand-primary/20 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-200">
                  <Icon className="w-5.5 h-5.5 sm:w-6 sm:h-6 stroke-[2.4]" />
                </div>
              </button>
            );
          }

          // Active Item with Colored Squircle (Matching reference image active tab)
          return (
            <NavLink
              key={tab.id}
              to={tab.to!}
              className="group relative flex items-center justify-center focus:outline-none cursor-pointer"
              aria-label={tab.label}
              title={tab.label}
            >
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm scale-105'
                    : 'text-slate-400 dark:text-slate-500 hover:text-brand-dark dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 active:scale-95'
                }`}
              >
                <Icon
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${
                    isActive ? 'stroke-[2.4]' : 'stroke-[2]'
                  }`}
                />
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

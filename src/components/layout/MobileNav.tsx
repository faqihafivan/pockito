import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  WalletCards,
  Plus,
  CalendarCheck2,
  Compass,
} from 'lucide-react';

interface MobileNavProps {
  onOpenQuickCreate: () => void;
  onOpenMobileMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenQuickCreate,
  onOpenMobileMenu,
}) => {
  const location = useLocation();

  const isHomeActive = location.pathname === '/app/dashboard';
  const isBudgetActive = location.pathname.startsWith('/app/budget');
  const isPlannerActive = location.pathname === '/app/planner';
  const isFiturActive =
    location.pathname === '/app/subscriptions' ||
    location.pathname === '/app/debts' ||
    location.pathname === '/app/goals' ||
    location.pathname === '/app/reports' ||
    location.pathname === '/app/transactions' ||
    location.pathname === '/app/settings';

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-brand-dark shadow-[0_-4px_16px_rgba(24,24,27,0.08)] pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1 px-2 select-none"
    >
      <div className="max-w-md mx-auto flex items-end justify-between">
        {/* 1. Home */}
        <NavLink
          to="/app/dashboard"
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group"
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              isHomeActive
                ? 'bg-brand-primary/25 text-brand-dark scale-105'
                : 'text-brand-darkMuted group-hover:text-brand-dark'
            }`}
          >
            <LayoutGrid className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              isHomeActive ? 'font-black text-brand-dark' : 'font-bold text-brand-darkMuted'
            }`}
          >
            Home
          </span>
        </NavLink>

        {/* 2. Kantong */}
        <NavLink
          to="/app/budget"
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group"
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              isBudgetActive
                ? 'bg-brand-primary/25 text-brand-dark scale-105'
                : 'text-brand-darkMuted group-hover:text-brand-dark'
            }`}
          >
            <WalletCards className={`w-5 h-5 ${isBudgetActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              isBudgetActive ? 'font-black text-brand-dark' : 'font-bold text-brand-darkMuted'
            }`}
          >
            Kantong
          </span>
        </NavLink>

        {/* 3. Center Elevated '+ Catat' Button */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={onOpenQuickCreate}
            className="group relative -top-3.5 flex flex-col items-center focus:outline-none active:scale-95 transition-transform"
            aria-label="Catat Baru"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-primary border-2 border-brand-dark shadow-[2px_2px_0px_#18181B] group-hover:shadow-[3px_3px_0px_#18181B] flex items-center justify-center transition-all bg-gradient-to-br from-[#FFD56B] to-[#FAAE2B]">
              <Plus className="w-6 h-6 stroke-[3] text-brand-dark" />
            </div>
            <span className="text-[10px] font-black uppercase text-brand-dark mt-0.5 tracking-wider">
              Catat
            </span>
          </button>
        </div>

        {/* 4. Planner */}
        <NavLink
          to="/app/planner"
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group"
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              isPlannerActive
                ? 'bg-brand-primary/25 text-brand-dark scale-105'
                : 'text-brand-darkMuted group-hover:text-brand-dark'
            }`}
          >
            <CalendarCheck2 className={`w-5 h-5 ${isPlannerActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              isPlannerActive ? 'font-black text-brand-dark' : 'font-bold text-brand-darkMuted'
            }`}
          >
            Planner
          </span>
        </NavLink>

        {/* 5. Fitur */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group focus:outline-none"
          aria-label="Menu Fitur Lengkap"
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              isFiturActive
                ? 'bg-brand-primary/25 text-brand-dark scale-105'
                : 'text-brand-darkMuted group-hover:text-brand-dark'
            }`}
          >
            <Compass className={`w-5 h-5 ${isFiturActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              isFiturActive ? 'font-black text-brand-dark' : 'font-bold text-brand-darkMuted'
            }`}
          >
            Fitur
          </span>
        </button>
      </div>
    </nav>
  );
};

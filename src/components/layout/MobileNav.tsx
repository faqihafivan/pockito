import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Plus,
  CheckSquare,
  BarChart3,
} from 'lucide-react';

interface MobileNavProps {
  onOpenNewTransaction: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenNewTransaction }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-brand-dark px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg select-none">
      <NavLink
        to="/app/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
            isActive ? 'text-brand-dark bg-brand-primary/20' : 'text-brand-darkMuted'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/app/budget"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
            isActive ? 'text-brand-dark bg-brand-primary/20' : 'text-brand-darkMuted'
          }`
        }
      >
        <Wallet className="w-5 h-5" />
        <span>Kantong</span>
      </NavLink>

      {/* Center Floating Action Button (FAB) */}
      <button
        onClick={onOpenNewTransaction}
        className="-mt-5 w-12 h-12 rounded-2xl bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria flex items-center justify-center active:translate-y-0 active:shadow-saweria-sm transition-all"
        aria-label="Catat Transaksi Cepat"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <NavLink
        to="/app/planner"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
            isActive ? 'text-brand-dark bg-brand-primary/20' : 'text-brand-darkMuted'
          }`
        }
      >
        <CheckSquare className="w-5 h-5" />
        <span>Planner</span>
      </NavLink>

      <NavLink
        to="/app/reports"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
            isActive ? 'text-brand-dark bg-brand-primary/20' : 'text-brand-darkMuted'
          }`
        }
      >
        <BarChart3 className="w-5 h-5" />
        <span>Laporan</span>
      </NavLink>
    </nav>
  );
};

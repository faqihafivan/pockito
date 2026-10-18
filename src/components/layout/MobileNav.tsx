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
  onOpenNewTransaction: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenNewTransaction }) => {
  const location = useLocation();

  const isHomeActive = location.pathname === '/app/dashboard';
  const isKantongActive = location.pathname.startsWith('/app/budget');
  const isPlannerActive = location.pathname === '/app/planner';
  const isLaporanActive =
    location.pathname === '/app/reports' || location.pathname === '/app/goals';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 select-none">
      {/* Top Border with Elegant Concave Scoop Notch (Cekungan) */}
      <div className="relative w-full">
        {/* Border container: Left Line + Center SVG Notch + Right Line */}
        <div className="flex items-start w-full">
          <div className="flex-1 border-t-2 border-brand-dark bg-white h-[2px]" />
          
          {/* Concave Notch SVG */}
          <div className="w-[92px] h-[30px] -mt-[1px] shrink-0 bg-transparent relative">
            <svg
              viewBox="0 0 92 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full block"
            >
              {/* Scoop fill that creates the transparent/canvas cutout into the navbar */}
              <path
                d="M 0 1.5 C 20 1.5, 22 28, 46 28 C 70 28, 72 1.5, 92 1.5 L 92 0 L 0 0 Z"
                fill="#FFFDF8"
              />
              {/* Continuous 2.5px Black Outline outlining the scoop notch */}
              <path
                d="M 0 1.5 C 20 1.5, 22 28, 46 28 C 70 28, 72 1.5, 92 1.5"
                stroke="#18181B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex-1 border-t-2 border-brand-dark bg-white h-[2px]" />
        </div>

        {/* Center Floating Orange Button (Catat) - Sits Halfway across the line */}
        <div className="absolute left-1/2 -top-[24px] -translate-x-1/2 z-20 flex flex-col items-center">
          <button
            onClick={onOpenNewTransaction}
            type="button"
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-[2.5px_2.5px_0px_#18181B] hover:shadow-[3.5px_3.5px_0px_#18181B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1.5px_1.5px_0px_#18181B] flex items-center justify-center hover:bg-brand-primaryHover transition-all duration-150 group"
            aria-label="Catat Transaksi Cepat"
          >
            <Plus className="w-6 h-6 stroke-[3] text-brand-dark group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Navbar Body */}
      <nav className="bg-white px-2 pt-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-between shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">
        {/* Left Side: Home & Kantong */}
        <div className="flex items-center justify-around flex-1 pr-6">
          <NavLink
            to="/app/dashboard"
            className="flex flex-col items-center justify-center py-1 group focus:outline-none"
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isHomeActive
                  ? 'bg-brand-primary/20 text-brand-dark'
                  : 'text-brand-darkMuted group-hover:text-brand-dark'
              }`}
            >
              <LayoutGrid
                className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[2]'}`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                isHomeActive
                  ? 'font-black text-brand-dark'
                  : 'font-bold text-brand-darkMuted group-hover:text-brand-dark'
              }`}
            >
              Home
            </span>
            {isHomeActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary border border-brand-dark mt-0.5" />
            )}
          </NavLink>

          <NavLink
            to="/app/budget"
            className="flex flex-col items-center justify-center py-1 group focus:outline-none"
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isKantongActive
                  ? 'bg-brand-primary/20 text-brand-dark'
                  : 'text-brand-darkMuted group-hover:text-brand-dark'
              }`}
            >
              <WalletCards
                className={`w-5 h-5 ${isKantongActive ? 'stroke-[2.5]' : 'stroke-[2]'}`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                isKantongActive
                  ? 'font-black text-brand-dark'
                  : 'font-bold text-brand-darkMuted group-hover:text-brand-dark'
              }`}
            >
              Kantong
            </span>
            {isKantongActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary border border-brand-dark mt-0.5" />
            )}
          </NavLink>
        </div>

        {/* Center Spacer & Label under the notch */}
        <div className="w-[84px] flex flex-col items-center justify-end pt-3 shrink-0">
          <span className="text-[10px] font-black text-brand-dark tracking-tight">
            Catat
          </span>
        </div>

        {/* Right Side: Planner & Laporan */}
        <div className="flex items-center justify-around flex-1 pl-6">
          <NavLink
            to="/app/planner"
            className="flex flex-col items-center justify-center py-1 group focus:outline-none"
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isPlannerActive
                  ? 'bg-brand-primary/20 text-brand-dark'
                  : 'text-brand-darkMuted group-hover:text-brand-dark'
              }`}
            >
              <CalendarCheck2
                className={`w-5 h-5 ${isPlannerActive ? 'stroke-[2.5]' : 'stroke-[2]'}`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                isPlannerActive
                  ? 'font-black text-brand-dark'
                  : 'font-bold text-brand-darkMuted group-hover:text-brand-dark'
              }`}
            >
              Planner
            </span>
            {isPlannerActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary border border-brand-dark mt-0.5" />
            )}
          </NavLink>

          <NavLink
            to="/app/reports"
            className="flex flex-col items-center justify-center py-1 group focus:outline-none"
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isLaporanActive
                  ? 'bg-brand-primary/20 text-brand-dark'
                  : 'text-brand-darkMuted group-hover:text-brand-dark'
              }`}
            >
              <PieChart
                className={`w-5 h-5 ${isLaporanActive ? 'stroke-[2.5]' : 'stroke-[2]'}`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                isLaporanActive
                  ? 'font-black text-brand-dark'
                  : 'font-bold text-brand-darkMuted group-hover:text-brand-dark'
              }`}
            >
              Laporan
            </span>
            {isLaporanActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary border border-brand-dark mt-0.5" />
            )}
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

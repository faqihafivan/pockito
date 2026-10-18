import React, { useRef, useState, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 390;
  });

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current && containerRef.current.offsetWidth > 0) {
        setContainerWidth(containerRef.current.offsetWidth);
      } else if (typeof window !== 'undefined') {
        setContainerWidth(window.innerWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const navTabs = [
    {
      id: 'home',
      label: 'Home',
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
      label: 'Catat',
      action: onOpenNewTransaction,
      to: '/app/transactions',
      icon: Plus,
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
    if (location.pathname === '/app/transactions') return 2;
    if (location.pathname === '/app/planner') return 3;
    if (location.pathname === '/app/reports' || location.pathname === '/app/goals') return 4;
    return 0;
  };

  const activeIndex = getActiveIndex();
  const ActiveIcon = navTabs[activeIndex]?.icon || LayoutGrid;

  // Exact circular arc notch geometry (concentric circle matching the navigation button)
  const barTopY = 20; // Flat top line of the navbar
  const activeCy = 24; // Center Y of the active button
  const R = 31; // Notch radius (uniform circular cradle around 24px radius button + shadow)
  const r = 8; // Smooth shoulder fillet radius
  const tabWidth = containerWidth / 5;
  const activeCx = (activeIndex + 0.5) * tabWidth;

  const y_s = barTopY + r;
  const dy = y_s - activeCy;
  const dist = R + r;
  const dx = Math.sqrt(Math.max(0, dist * dist - dy * dy));

  const p0x = Math.max(0, activeCx - dx).toFixed(2);
  const p0y = barTopY;

  const cosPhi = dx / dist;
  const sinPhi = dy / dist;
  const t1x = (activeCx - R * cosPhi).toFixed(2);
  const t1y = (activeCy + R * sinPhi).toFixed(2);

  const t2x = (activeCx + R * cosPhi).toFixed(2);
  const t2y = (activeCy + R * sinPhi).toFixed(2);

  const p3x = Math.min(containerWidth, activeCx + dx).toFixed(2);
  const p3y = barTopY;

  // SVG Solid Fill Path (Solid white surface, perfectly blocking scroll content)
  const pathD = `M 0 ${barTopY} L ${p0x} ${p0y} A ${r} ${r} 0 0 1 ${t1x} ${t1y} A ${R} ${R} 0 0 0 ${t2x} ${t2y} A ${r} ${r} 0 0 1 ${p3x} ${p3y} L ${containerWidth} ${barTopY} L ${containerWidth} 120 L 0 120 Z`;

  // Continuous grey contour line (pure circular arc mirroring the navigation bar circle)
  const borderLineD = `M 0 ${barTopY} L ${p0x} ${p0y} A ${r} ${r} 0 0 1 ${t1x} ${t1y} A ${R} ${R} 0 0 0 ${t2x} ${t2y} A ${r} ${r} 0 0 1 ${p3x} ${p3y} L ${containerWidth} ${barTopY}`;

  return (
    <div
      ref={containerRef}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 select-none overflow-visible h-[90px] pointer-events-none"
    >
      {/* 1. Curved Background Surface (Pure white surface with seamless scoop notch & soft shadow) */}
      <svg
        className="absolute top-0 left-0 w-full h-[120px] pointer-events-none drop-shadow-[0_-5px_16px_rgba(24,24,27,0.08)]"
        viewBox={`0 0 ${containerWidth} 120`}
        preserveAspectRatio="none"
      >
        <path
          d={pathD}
          fill="#FFFFFF"
          className="transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />
        {/* Subtle grey contour line clearly tracing the indented scoop curve */}
        <path
          d={borderLineD}
          fill="none"
          stroke="#B5B0A4"
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />
      </svg>

      {/* 2. Elevated Active Circular Button (Resting inside the scoop notch, Saweria neo-brutalist shadow) */}
      <div
        className="absolute z-30 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
        style={{
          left: `${activeCx}px`,
          top: '24px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-12 h-12 rounded-full bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-[3px_3px_0px_#18181B] flex items-center justify-center">
          <ActiveIcon className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* 3. Navigation Interactive Items (5 Tabs) */}
      <nav className="absolute top-[22px] left-0 right-0 bottom-0 pointer-events-auto flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navTabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = idx === activeIndex;

          const tabInner = !isActive ? (
            <>
              <Icon className="w-5 h-5 text-brand-darkMuted group-hover:text-brand-dark transition-colors stroke-[2]" />
              <span className="text-[10px] font-bold text-brand-darkMuted group-hover:text-brand-dark mt-1 tracking-tight">
                {tab.label}
              </span>
            </>
          ) : (
            // Active tab has elevated circular icon in the scoop notch
            <div className="w-6 h-6" aria-hidden="true" />
          );

          if (tab.action) {
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                type="button"
                className="relative flex flex-col items-center justify-center flex-1 h-full focus:outline-none group"
                aria-label={tab.label}
              >
                {tabInner}
              </button>
            );
          }

          return (
            <NavLink
              key={tab.id}
              to={tab.to!}
              className="relative flex flex-col items-center justify-center flex-1 h-full focus:outline-none group"
            >
              {tabInner}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { TransactionModal } from '../transactions/TransactionModal';
import { TaskModal } from '../planner/TaskModal';
import { DailyBriefingModal } from '../common/DailyBriefingModal';
import { QuickCreateModal } from './QuickCreateModal';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { SubscriptionModal } from '../subscriptions/SubscriptionModal';
import { DebtModal } from '../debts/DebtModal';
import { GoalModal } from '../goals/GoalModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const AppShell: React.FC = () => {
  const { user, isLoading, authStatus, isDemo, logout } = useAuth();
  const { dailyBriefing, isBriefingOpen, openBriefing, closeBriefing } = useData();
  const location = useLocation();

  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isDebtOpen, setIsDebtOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-show Daily Briefing once per day on entry if there are items to review
  useEffect(() => {
    if (user && user.onboarding_completed) {
      const todayISO = new Date().toISOString().split('T')[0];
      try {
        const hasSeenToday = localStorage.getItem(`pockito_daily_briefing_seen_${todayISO}`);
        if (!hasSeenToday && dailyBriefing.items.length > 0) {
          openBriefing();
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [user?.onboarding_completed, dailyBriefing.items.length]);

  // Desktop Global Keyboard Shortcuts (N = New Tx, T = New Task, B = Briefing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsTransactionOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTaskOpen(true);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        openBriefing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/pockito.jpg"
            alt="Pockito"
            className="w-16 h-16 rounded-2xl object-contain bg-white border-2 border-brand-dark shadow-saweria animate-bounce"
          />
          <p className="text-xs font-black uppercase tracking-wider text-brand-dark">
            Memuat Pockito...
          </p>
        </div>
      </div>
    );
  }

  // Route Guard: Unauthenticated users are redirected to login
  if (authStatus === 'unauthenticated' || (!user && authStatus !== 'demo')) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect to onboarding if not completed and not already on onboarding page
  if (user && !user.onboarding_completed && location.pathname !== '/app/onboarding' && !isDemo) {
    return <Navigate to="/app/onboarding" replace />;
  }

  // Standalone isolated layout for Onboarding (clean wizard without Header, Sidebar, or MobileNav)
  if (location.pathname === '/app/onboarding') {
    return (
      <main className="min-h-screen bg-brand-cream text-brand-dark">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-cream text-brand-dark">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Demo Mode Top Indicator Ribbon */}
        {isDemo && (
          <div className="bg-amber-100 border-b-2 border-brand-dark px-4 py-2 flex items-center justify-between text-xs font-bold text-brand-dark z-30">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-primary text-[10px] font-black uppercase border border-brand-dark shadow-saweria-sm">
                Mode Demo
              </span>
              <span>Anda sedang menjelajahi simulasi data demo terisolasi. Perubahan tidak tersimpan ke cloud.</span>
            </div>
            <button
              onClick={() => logout()}
              className="px-2 py-0.5 rounded-lg border border-brand-dark bg-white hover:bg-red-50 text-red-700 font-black text-xs transition-colors"
            >
              Keluar Demo
            </button>
          </div>
        )}

        <Header
          onOpenNewTransaction={() => setIsTransactionOpen(true)}
          onOpenNewTask={() => setIsTaskOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-36 sm:pb-40 lg:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile Thumb Navigation with 1-Tap Quick Create and Feature Menu */}
        <MobileNav
          onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* Center Quick Create Action Sheet (Mobile 1-Tap Center Button) */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSelectTransaction={() => setIsTransactionOpen(true)}
        onSelectSubscription={() => setIsSubscriptionOpen(true)}
        onSelectDebt={() => setIsDebtOpen(true)}
        onSelectGoal={() => setIsGoalOpen(true)}
        onSelectTask={() => setIsTaskOpen(true)}
      />

      {/* Full Feature Drawer for Mobile (Tagihan, Hutang, Target, Laporan, dsb) */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Global Quick Add Modals */}
      <TransactionModal
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      <DebtModal
        isOpen={isDebtOpen}
        onClose={() => setIsDebtOpen(false)}
      />

      <GoalModal
        isOpen={isGoalOpen}
        onClose={() => setIsGoalOpen(false)}
      />

      <TaskModal
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
      />

      {/* Unified Daily Financial Briefing & Actionable Agenda Modal */}
      <DailyBriefingModal
        isOpen={isBriefingOpen}
        onClose={closeBriefing}
        briefing={dailyBriefing}
        onOpenTransaction={() => setIsTransactionOpen(true)}
        onOpenTask={() => setIsTaskOpen(true)}
      />
    </div>
  );
};

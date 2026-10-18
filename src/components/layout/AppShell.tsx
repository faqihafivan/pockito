import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { TransactionModal } from '../transactions/TransactionModal';
import { TaskModal } from '../planner/TaskModal';
import { useAuth } from '../../context/AuthContext';

export const AppShell: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

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
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect to onboarding if not completed and not already on onboarding page
  if (!user.onboarding_completed && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <div className="flex min-h-screen bg-brand-cream text-brand-dark">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenNewTransaction={() => setIsTransactionOpen(true)}
          onOpenNewTask={() => setIsTaskOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-36 sm:pb-40 lg:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile Thumb Navigation */}
        <MobileNav onOpenNewTransaction={() => setIsTransactionOpen(true)} />
      </div>

      {/* Global Quick Add Modals */}
      <TransactionModal
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
      />

      <TaskModal
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
      />
    </div>
  );
};

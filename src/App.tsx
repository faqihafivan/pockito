import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';

// Root Entry Page (Eagerly loaded for instant LCP & zero landing layout shift)
import { LandingPage } from './pages/LandingPage';

// Public Pages (Code-split dynamic imports)
const WelcomePage = lazy(() => import('./pages/WelcomePage').then(m => ({ default: m.WelcomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));

// Authenticated Pages (Code-split dynamic imports)
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BudgetPage = lazy(() => import('./pages/BudgetPage').then(m => ({ default: m.BudgetPage })));
const PocketDetailPage = lazy(() => import('./pages/PocketDetailPage').then(m => ({ default: m.PocketDetailPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const DebtsPage = lazy(() => import('./pages/DebtsPage').then(m => ({ default: m.DebtsPage })));
const PlannerPage = lazy(() => import('./pages/PlannerPage').then(m => ({ default: m.PlannerPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then(m => ({ default: m.GoalsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <DataProvider>
              <Suspense fallback={<PageLoader fullScreen message="Memuat Pockito..." />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/welcome" element={<WelcomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  {/* Authenticated Application Shell */}
                  <Route path="/app" element={<AppShell />}>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="onboarding" element={<OnboardingPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="budget" element={<BudgetPage />} />
                    <Route path="budget/:id" element={<PocketDetailPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="transactions/new" element={<Navigate to="/app/transactions" replace />} />
                    <Route path="subscriptions" element={<SubscriptionsPage />} />
                    <Route path="debts" element={<DebtsPage />} />
                    <Route path="planner" element={<PlannerPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="goals" element={<GoalsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  {/* Catch-all Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </DataProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

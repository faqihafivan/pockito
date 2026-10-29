import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';

// Authenticated Pages
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BudgetPage } from './pages/BudgetPage';
import { PocketDetailPage } from './pages/PocketDetailPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { PlannerPage } from './pages/PlannerPage';
import { ReportsPage } from './pages/ReportsPage';
import { GoalsPage } from './pages/GoalsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { DebtsPage } from './pages/DebtsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <DataProvider>
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
        </DataProvider>
      </AuthProvider>
    </NotificationProvider>
  </BrowserRouter>
</ErrorBoundary>
  );
}

export default App;

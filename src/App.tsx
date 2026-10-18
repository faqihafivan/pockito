import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppShell } from './components/layout/AppShell';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Authenticated Pages
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BudgetPage } from './pages/BudgetPage';
import { PocketDetailPage } from './pages/PocketDetailPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { PlannerPage } from './pages/PlannerPage';
import { ReportsPage } from './pages/ReportsPage';
import { GoalsPage } from './pages/GoalsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated Application Shell */}
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="budget" element={<BudgetPage />} />
              <Route path="budget/:id" element={<PocketDetailPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="transactions/new" element={<Navigate to="/app/transactions" replace />} />
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
    </BrowserRouter>
  );
}

export default App;

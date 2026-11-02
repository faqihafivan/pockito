import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../../src/context/ThemeContext';
import { ThemeDropdown } from '../../src/components/layout/ThemeDropdown';
import { Header } from '../../src/components/layout/Header';
import { StatCards } from '../../src/components/dashboard/StatCards';
import { TodayTasksCard } from '../../src/components/dashboard/TodayTasksCard';
import { PlannerPage } from '../../src/pages/PlannerPage';
import { NotificationProvider } from '../../src/context/NotificationContext';
import { AuthProvider } from '../../src/context/AuthContext';
import { DataProvider } from '../../src/context/DataContext';
import { FinancialOverview, Task } from '../../src/types';

const mockOverview: FinancialOverview = {
  monthlyIncome: 6500000,
  totalMonthlyExpense: 2250000,
  totalRecordedBalance: 4250000,
  totalBudgetPlanned: 4750000,
  totalBudgetRemaining: 2500000,
  unallocatedIncome: 1750000,
  unallocatedPercentage: 27,
  totalAllocationPercentage: 73,
  isOverallocated: false,
};

const mockTasks: Task[] = [
  {
    id: 'task-test-1',
    user_id: 'user-demo-1',
    title: 'Beli Minyak Goreng & Beras',
    priority: 'high',
    is_completed: false,
    amount: 145000,
    pocket_id: 'pocket-1',
  },
  {
    id: 'task-test-2',
    user_id: 'user-demo-1',
    title: 'Evaluasi Modul Pembelajaran',
    priority: 'medium',
    is_completed: false,
  },
];

const ThemeTestConsumer = () => {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="is-dark">{isDark ? 'YES' : 'NO'}</span>
      <button onClick={() => setTheme('saweria')}>Set Saweria</button>
      <button onClick={() => setTheme('midnight')}>Set Midnight</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('Tahap B: Theme Engine & Smart Shopping Tasks', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('initializes ThemeProvider with default teal-mint and updates document attributes', () => {
    render(
      <ThemeProvider>
        <ThemeTestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme').textContent).toBe('teal-mint');
    expect(document.documentElement.getAttribute('data-theme')).toBe('teal-mint');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Change to midnight
    act(() => {
      fireEvent.click(screen.getByText('Set Midnight'));
    });

    expect(screen.getByTestId('current-theme').textContent).toBe('midnight');
    expect(screen.getByTestId('is-dark').textContent).toBe('YES');
    expect(document.documentElement.getAttribute('data-theme')).toBe('midnight');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Change to saweria
    act(() => {
      fireEvent.click(screen.getByText('Set Saweria'));
    });

    expect(screen.getByTestId('current-theme').textContent).toBe('saweria');
    expect(document.documentElement.getAttribute('data-theme')).toBe('saweria');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders StatCards with Pemasukan (Mint), Pengeluaran (Rose), and Sisa Budget (Honey)', () => {
    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <DataProvider>
              <StatCards overview={mockOverview} />
            </DataProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Pemasukan/i)).toBeInTheDocument();
    expect(screen.getByText(/Pengeluaran/i)).toBeInTheDocument();
    expect(screen.getByText(/Sisa Budget/i)).toBeInTheDocument();
    expect(screen.getByText(/Kas Masuk Bulan Ini/i)).toBeInTheDocument();
    expect(screen.getByText(/Kas Keluar Aktual/i)).toBeInTheDocument();
  });

  it('renders TodayTasksCard with shopping price badge and triggers modal on checking shopping item', () => {
    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <DataProvider>
              <TodayTasksCard tasks={mockTasks} onOpenNewTask={() => {}} />
            </DataProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Belanja Pokok & To-Do List/i)).toBeInTheDocument();
    expect(screen.getByText(/Beli Minyak Goreng & Beras/i)).toBeInTheDocument();
    expect(screen.getByText(/Evaluasi Modul Pembelajaran/i)).toBeInTheDocument();

    // The shopping item should display the price
    expect(screen.getByText(/Rp 145\.000/i)).toBeInTheDocument();

    // Clicking checkbox of shopping item should open deduction modal
    const checkboxButtons = screen.getAllByRole('button', { name: /Tandai selesai/i });
    fireEvent.click(checkboxButtons[0]);

    // Modal should appear
    expect(screen.getByText(/Selesaikan Belanja & Potong Saldo\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Potong dari Kantong:/i)).toBeInTheDocument();
    expect(screen.getByText(/Ya, Potong Saldo/i)).toBeInTheDocument();
  });

  it('renders PlannerPage with Belanja Pokok tab and shopping budget summary banner', async () => {
    localStorage.setItem('pockito_tasks_v1', JSON.stringify(mockTasks));
    localStorage.setItem('pockito:demo:tasks:v2', JSON.stringify(mockTasks));

    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <DataProvider>
              <PlannerPage />
            </DataProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Planner & Belanja Pokok/i)).toBeInTheDocument();
    
    // Wait for tasks to load from DataService into DataProvider
    const shoppingTabButton = await screen.findByRole('button', { name: /Belanja Pokok/i });
    expect(shoppingTabButton).toBeInTheDocument();

    // Click on Belanja Pokok tab
    act(() => {
      fireEvent.click(shoppingTabButton);
    });

    // Should display shopping tasks once loaded
    expect(await screen.findByText(/Beli Minyak Goreng & Beras/i)).toBeInTheDocument();
  });

  it('renders ThemeDropdown popover and switches theme between Teal Mint, Saweria, and Midnight Dark', () => {
    render(
      <NotificationProvider>
        <ThemeProvider>
          <ThemeDropdown />
        </ThemeProvider>
      </NotificationProvider>
    );

    const triggerBtn = screen.getByRole('button', { name: /Pilih Tema Tampilan/i });
    expect(triggerBtn).toBeInTheDocument();

    // Open popover
    act(() => {
      fireEvent.click(triggerBtn);
    });

    expect(screen.getByText(/Pilih Tema Tampilan/i)).toBeInTheDocument();
    expect(screen.getByText(/Teal Mint/i)).toBeInTheDocument();
    expect(screen.getByText(/Saweria Emas/i)).toBeInTheDocument();
    expect(screen.getByText(/Midnight Dark/i)).toBeInTheDocument();

    // Select Midnight Dark
    const midnightBtn = screen.getByRole('button', { name: /Midnight Dark/i });
    act(() => {
      fireEvent.click(midnightBtn);
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('midnight');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('renders Header with mobile-optimized uncluttered bar and dedicated Settings link', () => {
    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <DataProvider>
              <ThemeProvider>
                <Header onOpenNewTransaction={() => {}} onOpenNewTask={() => {}} />
              </ThemeProvider>
            </DataProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    // Settings links should be present (both mobile gear and desktop avatar)
    const settingsLinks = screen.getAllByRole('link', { name: /Buka Pengaturan Akun/i });
    expect(settingsLinks.length).toBeGreaterThanOrEqual(1);
    expect(settingsLinks[0]).toHaveAttribute('href', '/app/settings');

    // Catat button in header should be hidden on mobile (hidden sm:inline-flex)
    const catatBtn = screen.getByRole('button', { name: /Catat/i });
    expect(catatBtn.className).toContain('hidden sm:inline-flex');
  });
});

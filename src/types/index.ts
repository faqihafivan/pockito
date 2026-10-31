export type AccountType = 'bank' | 'cash' | 'ewallet' | 'investment';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type AuthStatus = 'initializing' | 'authenticated' | 'demo' | 'unauthenticated' | 'error';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  currency: string;
  timezone: string;
  monthly_income: number; // Stored as integer IDR
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  period: string; // 'YYYY-MM'
  total_expected_income: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pocket {
  id: string;
  user_id: string;
  budget_id?: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Hex color code
  allocation_percentage: number; // e.g. 25.5 (0 - 100)
  is_starred: boolean; // Priority indicator
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  opening_balance: number; // Stored as integer IDR
  currency: string;
  color: string;
  is_archived: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  pocket_id?: string | null; // Null for income, transfers, or unallocated expense
  type: TransactionType;
  amount: number; // Always positive integer IDR
  destination_account_id?: string | null; // For transfers
  date: string; // ISO date string 'YYYY-MM-DDTHH:mm:ssZ'
  description: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number; // Integer IDR
  current_amount: number; // Integer IDR
  target_date?: string; // 'YYYY-MM-DD'
  icon: string;
  color: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string; // 'YYYY-MM-DD'
  start_time?: string; // 'HH:mm'
  priority: TaskPriority;
  is_completed: boolean;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  task_id?: string;
  title: string;
  scheduled_at: string;
  recurrence: ReminderRecurrence;
  is_sent: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface BudgetCalculationResult {
  pocketId: string;
  plannedAmount: number; // Integer IDR
  percentage: number;
}

export interface PocketSummary extends Pocket {
  plannedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  spentPercentage: number;
}

export interface FinancialOverview {
  totalRecordedBalance: number;
  monthlyIncome: number;
  totalMonthlyExpense: number;
  totalBudgetPlanned: number;
  totalBudgetRemaining: number;
  unallocatedIncome: number;
  unallocatedPercentage: number;
  isOverallocated: boolean;
  totalAllocationPercentage: number;
}

export type SubscriptionCycle = 'monthly' | 'weekly' | 'yearly';

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number; // Integer IDR
  billing_cycle: SubscriptionCycle;
  due_day: number; // 1 - 31
  category_pocket_id?: string;
  account_id?: string;
  is_active: boolean;
  last_paid_period?: string; // 'YYYY-MM'
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  user_id: string;
  period: string; // 'YYYY-MM'
  due_date: string; // 'YYYY-MM-DD'
  paid_at: string; // ISO string 'YYYY-MM-DDTHH:mm:ssZ' or 'YYYY-MM-DD'
  recorded_at: string; // ISO string
  amount: number; // Integer IDR
  account_id: string;
  transaction_id?: string | null;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionDueStatus = 'paid' | 'overdue' | 'due_today' | 'upcoming';

export interface SubscriptionDueDateInfo {
  status: SubscriptionDueStatus;
  diffDays: number; // positive = days until due, negative = days past due, 0 = due today
  dueDate: Date;
  dueDateISO: string; // 'YYYY-MM-DD'
  badgeLabel: string; // 'Lunas' | 'Lewat Tempo' | 'Hari Ini!' | 'Besok!' | 'X Hari Lagi' | 'Belum Bayar'
  badgeVariant: 'success' | 'danger' | 'warning' | 'neutral';
}

export type DebtType = 'receivable' | 'payable';

export interface Debt {
  id: string;
  user_id: string;
  type: DebtType; // 'receivable' (piutang / orang pinjam uang ke kita) | 'payable' (hutang / kita pinjam ke orang lain)
  person_name: string;
  amount: number; // Total pokok (Integer IDR)
  paid_amount: number; // Total dicicil/dibayar (Integer IDR)
  due_date?: string; // 'YYYY-MM-DD'
  description: string;
  account_id?: string;
  pocket_id?: string;
  is_settled: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  user_id: string;
  amount: number; // Integer IDR
  paid_at: string; // ISO string 'YYYY-MM-DDTHH:mm:ssZ' or 'YYYY-MM-DD'
  account_id?: string | null;
  transaction_id?: string | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyBriefingItem {
  id: string;
  type: 'bill' | 'daily_log' | 'goal' | 'safe_limit' | 'task' | 'debt';
  title: string;
  message: string;
  urgency: 'high' | 'medium' | 'info';
  badge: string;
  actionText?: string;
  actionType?: 'open_transaction' | 'open_task' | 'navigate';
  actionRoute?: string;
}

export interface DailyBriefingResult {
  greeting: string;
  dateLabel: string;
  items: DailyBriefingItem[];
  hasUrgentItems: boolean;
  urgentCount: number;
  summaryHeadline: string;
}

export interface DailySafeLimitResult {

  dailySafeLimit: number; // Batas aman belanja per hari (Integer IDR)
  totalRemainingBudget: number; // Sisa pagu anggaran bulan ini
  remainingDays: number; // Sisa hari dalam bulan (termasuk hari ini)
  currentDay: number; // Tanggal hari ini
  totalDaysInMonth: number; // Total hari dalam bulan ini
  todaySpent: number; // Total pengeluaran tercatat hari ini
  remainingToday: number; // dailySafeLimit - todaySpent (bisa negatif jika hari ini over)
  burnRateStatus: 'frugal' | 'normal' | 'fast'; // 'frugal' (hemat), 'normal' (aman), 'fast' (boros)
  pacePercentage: number; // Persentase varians laju pengeluaran vs laju hari kalender
  adviceMessage: string; // Rekomendasi/insight aksi harian
}

export type RunwayStatus = 'critical' | 'warning' | 'safe' | 'resilient' | 'insufficient_data';

export interface EmergencyRunwayResult {
  totalLiquidCash: number; // Total saldo kas riil aktif (hanya akun likuid non-investasi, non-arsip)
  monthlyEssentialExpense: number; // Pengeluaran pokok bulanan
  runwayMonths: number; // Berapa bulan bisa bertahan tanpa pemasukan (1 desimal)
  status: RunwayStatus; // 'critical' (<1 bln) | 'warning' (1-3 bln) | 'safe' (3-6 bln) | 'resilient' (>6 bln) | 'insufficient_data'
  statusLabel: string; // "Kritis ⚠️", "Waspada 🟡", "Ideal & Sehat 🟢", "Sangat Tangguh 🛡️", "Data Belum Cukup"
  badgeColor: string;
  adviceMessage: string; // Rekomendasi praktis finansial
  targetMonths: number; // Standar perencana keuangan (6 bulan)
  targetAmount: number; // monthlyEssentialExpense * 6
  progressPercentage: number; // Persentase menuju target 6 bulan
  isEstimate: boolean; // Menandakan apakah perhitungan bersifat estimasi alokasi
  calculationMethod: 'budget_starred' | 'actual_expenses' | 'manual_input' | 'insufficient';
  manualMonthlyExpense?: number;
}

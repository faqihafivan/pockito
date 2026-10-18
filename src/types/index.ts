export type AccountType = 'bank' | 'cash' | 'ewallet' | 'investment';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

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

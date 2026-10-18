import { Account, FinancialOverview, Pocket, PocketSummary, Transaction } from '../../types';

/**
 * Format an integer amount into Indonesian Rupiah (IDR).
 * Example: 7500000 -> "Rp 7.500.000"
 */
export function formatIDR(amount: number, prefix: boolean = true): string {
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  if (!prefix) {
    return isNegative ? `-${formatted}` : formatted;
  }
  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Parses a string or raw input into a safe non-negative integer IDR.
 */
export function parseIDRInput(value: string | number): number {
  if (typeof value === 'number') {
    return Math.max(0, Math.round(value));
  }
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

/**
 * Calculates planned amounts for all pockets, applying strict integer rounding
 * reconciliation so that:
 * sum(plannedAmounts) == round(monthlyIncome * (sum(percentages) / 100))
 * without losing a single Rupiah.
 */
export function calculatePocketAllocations(
  monthlyIncome: number,
  pockets: Pocket[]
): Map<string, number> {
  const allocationMap = new Map<string, number>();
  if (monthlyIncome <= 0 || pockets.length === 0) {
    pockets.forEach((p) => allocationMap.set(p.id, 0));
    return allocationMap;
  }

  let totalAllocatedNominal = 0;
  const rawNominals: { id: string; percentage: number; rounded: number; remainder: number }[] = [];

  // 1. Calculate standard rounded nominals
  pockets.forEach((pocket) => {
    const rawAmount = (monthlyIncome * pocket.allocation_percentage) / 100;
    const rounded = Math.floor(rawAmount);
    const remainder = rawAmount - rounded;
    rawNominals.push({ id: pocket.id, percentage: pocket.allocation_percentage, rounded, remainder });
    totalAllocatedNominal += rounded;
  });

  // 2. Expected total nominal based on sum of percentages
  const totalPercentage = pockets.reduce((sum, p) => sum + p.allocation_percentage, 0);
  const expectedTotalNominal = Math.round((monthlyIncome * totalPercentage) / 100);
  let discrepancy = expectedTotalNominal - totalAllocatedNominal;

  // 3. Sort by highest fractional remainder to distribute discrepancy
  rawNominals.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < rawNominals.length; i++) {
    let finalAmount = rawNominals[i].rounded;
    if (discrepancy > 0) {
      finalAmount += 1;
      discrepancy -= 1;
    }
    allocationMap.set(rawNominals[i].id, finalAmount);
  }

  return allocationMap;
}

/**
 * Calculates actual recorded account balances from transactions.
 * Balances strictly reflect real transactions:
 * Opening Balance + Income - Expense + Transfers In - Transfers Out
 */
export function calculateNetBalance(
  accounts: Account[],
  transactions: Transaction[]
): {
  accountBalances: Record<string, number>;
  totalBalance: number;
} {
  const accountBalances: Record<string, number> = {};

  // Initialize with opening balance
  accounts.forEach((acc) => {
    accountBalances[acc.id] = Math.round(acc.opening_balance || 0);
  });

  // Apply transactions chronologically or sequentially
  transactions.forEach((tx) => {
    const amount = Math.abs(Math.round(tx.amount));

    if (tx.type === 'income') {
      if (accountBalances[tx.account_id] !== undefined) {
        accountBalances[tx.account_id] += amount;
      }
    } else if (tx.type === 'expense') {
      if (accountBalances[tx.account_id] !== undefined) {
        accountBalances[tx.account_id] -= amount;
      }
    } else if (tx.type === 'transfer') {
      // Outward from source account
      if (accountBalances[tx.account_id] !== undefined) {
        accountBalances[tx.account_id] -= amount;
      }
      // Inward to destination account
      if (tx.destination_account_id && accountBalances[tx.destination_account_id] !== undefined) {
        accountBalances[tx.destination_account_id] += amount;
      }
    }
  });

  // Calculate total across non-archived accounts
  const totalBalance = accounts
    .filter((a) => !a.is_archived)
    .reduce((sum, a) => sum + (accountBalances[a.id] || 0), 0);

  return { accountBalances, totalBalance };
}

/**
 * Computes pocket summaries (planned, spent, remaining) for a specific monthly period.
 * Format for period: 'YYYY-MM'
 */
export function calculatePocketSummaries(
  pockets: Pocket[],
  monthlyIncome: number,
  transactions: Transaction[],
  period: string
): PocketSummary[] {
  const plannedMap = calculatePocketAllocations(monthlyIncome, pockets);

  // Filter transactions for this period and category
  const periodTransactions = transactions.filter((tx) => {
    if (!tx.date) return false;
    return tx.date.startsWith(period) && tx.type === 'expense' && tx.pocket_id;
  });

  // Accumulate spending per pocket
  const spendingMap = new Map<string, number>();
  periodTransactions.forEach((tx) => {
    if (tx.pocket_id) {
      const current = spendingMap.get(tx.pocket_id) || 0;
      spendingMap.set(tx.pocket_id, current + Math.round(tx.amount));
    }
  });

  return pockets.map((pocket) => {
    const plannedAmount = plannedMap.get(pocket.id) || 0;
    const spentAmount = spendingMap.get(pocket.id) || 0;
    const remainingAmount = plannedAmount - spentAmount;
    const spentPercentage = plannedAmount > 0 ? Math.round((spentAmount / plannedAmount) * 100) : 0;

    return {
      ...pocket,
      plannedAmount,
      spentAmount,
      remainingAmount,
      spentPercentage,
    };
  });
}

/**
 * Calculates high-level overview metrics for the selected period.
 */
export function calculateFinancialOverview(
  accounts: Account[],
  pockets: Pocket[],
  monthlyIncome: number,
  transactions: Transaction[],
  period: string
): FinancialOverview {
  const { totalBalance } = calculateNetBalance(accounts, transactions);

  // Total expenses in period
  const totalMonthlyExpense = transactions
    .filter((tx) => tx.date.startsWith(period) && tx.type === 'expense')
    .reduce((sum, tx) => sum + Math.round(tx.amount), 0);

  // Total allocation percentage
  const totalAllocationPercentage = Math.round(
    pockets.reduce((sum, p) => sum + Number(p.allocation_percentage), 0) * 100
  ) / 100;

  const isOverallocated = totalAllocationPercentage > 100;
  const unallocatedPercentage = Math.max(0, Math.round((100 - totalAllocationPercentage) * 100) / 100);
  const unallocatedIncome = Math.round((monthlyIncome * unallocatedPercentage) / 100);

  const plannedMap = calculatePocketAllocations(monthlyIncome, pockets);
  const totalBudgetPlanned = Array.from(plannedMap.values()).reduce((sum, amt) => sum + amt, 0);
  const totalBudgetRemaining = totalBudgetPlanned - totalMonthlyExpense;

  return {
    totalRecordedBalance: totalBalance,
    monthlyIncome,
    totalMonthlyExpense,
    totalBudgetPlanned,
    totalBudgetRemaining,
    unallocatedIncome,
    unallocatedPercentage,
    isOverallocated,
    totalAllocationPercentage,
  };
}

/**
 * Budget recommendation templates.
 * Provides ready-to-use allocation presets without silently overwriting user data.
 */
export interface RecommendationTemplate {
  id: string;
  name: string;
  description: string;
  pockets: {
    name: string;
    icon: string;
    color: string;
    allocation_percentage: number;
    is_starred: boolean;
  }[];
}

export const BUDGET_TEMPLATES: RecommendationTemplate[] = [
  {
    id: 'rule503020',
    name: 'Aturan Klasik 50/30/20',
    description: '50% Kebutuhan Pokok, 30% Keinginan & Hiburan, 20% Tabungan/Investasi.',
    pockets: [
      { name: 'Kebutuhan & Tagihan', icon: 'Home', color: '#713B3B', allocation_percentage: 50, is_starred: true },
      { name: 'Hiburan & Keinginan', icon: 'Coffee', color: '#A78BFA', allocation_percentage: 30, is_starred: false },
      { name: 'Tabungan & Darurat', icon: 'PiggyBank', color: '#10B981', allocation_percentage: 20, is_starred: true },
    ],
  },
  {
    id: 'balanced',
    name: 'Pockito Seimbang (Recommended)',
    description: 'Pilihan paling fleksibel: Makanan, Kos, Tabungan, Hiburan, dan Transportasi.',
    pockets: [
      { name: 'Makan & Minum', icon: 'Utensils', color: '#FF7A59', allocation_percentage: 30, is_starred: true },
      { name: 'Kos & Tagihan Rutin', icon: 'Home', color: '#713B3B', allocation_percentage: 25, is_starred: true },
      { name: 'Tabungan & Dana Darurat', icon: 'ShieldCheck', color: '#10B981', allocation_percentage: 20, is_starred: true },
      { name: 'Transport & Bensin', icon: 'Car', color: '#0EA5E9', allocation_percentage: 15, is_starred: false },
      { name: 'Nongkrong & Hiburan', icon: 'Smile', color: '#FAAE2B', allocation_percentage: 10, is_starred: false },
    ],
  },
  {
    id: 'student',
    name: 'Mahasiswa / Hemat Mandiri',
    description: 'Dioptimalkan untuk pengeluaran esensial, belajar, dan tabungan saku.',
    pockets: [
      { name: 'Uang Makan Harian', icon: 'Utensils', color: '#FF7A59', allocation_percentage: 45, is_starred: true },
      { name: 'Kuliah & Fotokopi/Buku', icon: 'BookOpen', color: '#0EA5E9', allocation_percentage: 15, is_starred: false },
      { name: 'Kos & Listrik', icon: 'Home', color: '#713B3B', allocation_percentage: 25, is_starred: true },
      { name: 'Tabungan Mahasiswa', icon: 'PiggyBank', color: '#10B981', allocation_percentage: 15, is_starred: true },
    ],
  },
  {
    id: 'freelancer',
    name: 'Freelancer / Buffer Builder',
    description: 'Prioritas pada buffer kas mengantisipasi pemasukan yang fluktuatif.',
    pockets: [
      { name: 'Living Expenses', icon: 'Home', color: '#713B3B', allocation_percentage: 40, is_starred: true },
      { name: 'Cash Buffer / Darurat', icon: 'ShieldCheck', color: '#10B981', allocation_percentage: 30, is_starred: true },
      { name: 'Langganan & Tool Kerja', icon: 'Laptop', color: '#0EA5E9', allocation_percentage: 15, is_starred: true },
      { name: 'Self Reward', icon: 'Coffee', color: '#FAAE2B', allocation_percentage: 15, is_starred: false },
    ],
  },
];

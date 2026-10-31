import {
  Account,
  DailyBriefingItem,
  DailyBriefingResult,
  DailySafeLimitResult,
  Debt,
  EmergencyRunwayResult,
  FinancialOverview,
  Pocket,
  PocketSummary,
  SavingsGoal,
  Subscription,
  SubscriptionDueDateInfo,
  Task,
  Transaction,
} from '../../types';

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
 * Maximum safe nominal IDR (Rp 999.999.999.999 / 999 Miliar) to prevent
 * integer overflow and extreme layout breaking.
 */
export const MAX_SAFE_IDR = 999_999_999_999;

/**
 * Parses a string or raw input into a safe non-negative integer IDR.
 */
export function parseIDRInput(value: string | number): number {
  if (typeof value === 'number') {
    return Math.min(MAX_SAFE_IDR, Math.max(0, Math.round(value)));
  }
  const clean = value.replace(/[^0-9]/g, '');
  if (!clean) return 0;
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : Math.min(MAX_SAFE_IDR, Math.max(0, parsed));
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

/**
 * Indonesian month names in strict chronological order (Januari - Desember).
 */
export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const INDONESIAN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Formats a 'YYYY-MM' period string into a human readable Indonesian label.
 * E.g. '2026-10' -> 'Oktober 2026', '2026-10' (short) -> 'Okt 2026'
 */
export function formatPeriod(periodStr: string, short: boolean = false): string {
  if (!periodStr) return '';
  const parts = periodStr.split('-');
  if (parts.length < 2) return periodStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return periodStr;
  const monthName = short ? INDONESIAN_MONTHS_SHORT[month - 1] : INDONESIAN_MONTHS[month - 1];
  return `${monthName} ${year}`;
}

/**
 * Returns the current real-time period 'YYYY-MM' from system time.
 */
export function getCurrentRealtimePeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Offsets a 'YYYY-MM' period by deltaMonths (+1 for next month, -1 for previous month).
 */
export function offsetPeriod(periodStr: string, deltaMonths: number): string {
  if (!periodStr) return getCurrentRealtimePeriod();
  const parts = periodStr.split('-');
  const year = parseInt(parts[0], 10) || new Date().getFullYear();
  const month = parseInt(parts[1], 10) || (new Date().getMonth() + 1);
  const date = new Date(year, month - 1 + deltaMonths, 1);
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${newYear}-${newMonth}`;
}

/**
 * Calculates precise due date information, status, and days remaining for a subscription bill
 * relative to the selected period and reference date (defaulting to today).
 *
 * Prevents false "Lewat Tempo" (overdue) flags when viewing future periods (e.g. today is 31 Oct,
 * viewing 10 Nov), while strictly enforcing overdue status when the due date has actually passed.
 */
export function getSubscriptionDueDateInfo(
  dueDay: number,
  selectedPeriod: string,
  isPaid: boolean = false,
  todayDate: Date = new Date()
): SubscriptionDueDateInfo {
  const parts = (selectedPeriod || getCurrentRealtimePeriod()).split('-');
  const selYear = parseInt(parts[0], 10) || todayDate.getFullYear();
  const selMonth = parseInt(parts[1], 10) || (todayDate.getMonth() + 1);

  // Cap dueDay to the max days in the selected month (e.g. Feb 28/29, April 30)
  const maxDaysInMonth = new Date(selYear, selMonth, 0).getDate();
  const safeDueDay = Math.min(Math.max(1, dueDay || 1), maxDaysInMonth);

  const dueDate = new Date(selYear, selMonth - 1, safeDueDay, 23, 59, 59, 999);
  const dueDateISO = `${selYear}-${String(selMonth).padStart(2, '0')}-${String(safeDueDay).padStart(2, '0')}`;

  if (isPaid) {
    return {
      status: 'paid',
      diffDays: 0,
      dueDate,
      dueDateISO,
      badgeLabel: 'Lunas',
      badgeVariant: 'success',
    };
  }

  // Calculate day difference relative to start of today (local time)
  const todayStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).getTime();
  const dueDayStart = new Date(selYear, selMonth - 1, safeDueDay).getTime();
  const diffDays = Math.round((dueDayStart - todayStart) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'overdue',
      diffDays,
      dueDate,
      dueDateISO,
      badgeLabel: 'Lewat Tempo',
      badgeVariant: 'danger',
    };
  }

  if (diffDays === 0) {
    return {
      status: 'due_today',
      diffDays: 0,
      dueDate,
      dueDateISO,
      badgeLabel: 'Hari Ini!',
      badgeVariant: 'warning',
    };
  }

  if (diffDays === 1) {
    return {
      status: 'upcoming',
      diffDays: 1,
      dueDate,
      dueDateISO,
      badgeLabel: 'Besok!',
      badgeVariant: 'warning',
    };
  }

  if (diffDays <= 3) {
    return {
      status: 'upcoming',
      diffDays,
      dueDate,
      dueDateISO,
      badgeLabel: `${diffDays} Hari Lagi`,
      badgeVariant: 'warning',
    };
  }

  return {
    status: 'upcoming',
    diffDays,
    dueDate,
    dueDateISO,
    badgeLabel: 'Belum Bayar',
    badgeVariant: 'neutral',
  };
}

/**
 * Calculates the daily safe-to-spend limit and spending pace/burn rate for the given period.
 */
export function calculateDailySafeLimit(
  pocketSummaries: PocketSummary[],
  transactions: Transaction[],
  period: string,
  referenceDate: Date = new Date()
): DailySafeLimitResult {
  const parts = period.split('-');
  const year = parseInt(parts[0], 10) || referenceDate.getFullYear();
  const month = parseInt(parts[1], 10) || (referenceDate.getMonth() + 1);

  // Total days in the selected month
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Reference date values
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const isCurrentMonth = refYear === year && refMonth === month;
  const isPastMonth = (year < refYear) || (year === refYear && month < refMonth);

  let currentDay: number;
  let remainingDays: number;

  if (isCurrentMonth) {
    currentDay = Math.min(referenceDate.getDate(), totalDaysInMonth);
    remainingDays = Math.max(1, totalDaysInMonth - currentDay + 1);
  } else if (isPastMonth) {
    currentDay = totalDaysInMonth;
    remainingDays = 1;
  } else {
    // Future month
    currentDay = 1;
    remainingDays = totalDaysInMonth;
  }

  // Calculate total budget planned and remaining
  const totalBudgetPlanned = pocketSummaries.reduce((sum, p) => sum + p.plannedAmount, 0);
  const totalSpent = pocketSummaries.reduce((sum, p) => sum + p.spentAmount, 0);
  const totalRemainingBudget = Math.max(0, totalBudgetPlanned - totalSpent);

  // Daily safe limit for remaining days
  const dailySafeLimit = remainingDays > 0 ? Math.floor(totalRemainingBudget / remainingDays) : 0;

  // Calculate expenses for "today"
  const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
  const todaySpent = transactions
    .filter((tx) => tx.type === 'expense' && tx.date && tx.date.startsWith(todayStr))
    .reduce((sum, tx) => sum + Math.round(tx.amount), 0);

  const remainingToday = dailySafeLimit - todaySpent;

  // Pace / Burn rate calculation
  const elapsedDayRatio = totalDaysInMonth > 0 ? currentDay / totalDaysInMonth : 0;
  const spentRatio = totalBudgetPlanned > 0 ? totalSpent / totalBudgetPlanned : 0;
  const paceDiff = spentRatio - elapsedDayRatio;
  const pacePercentage = Math.round(paceDiff * 100);

  let burnRateStatus: 'frugal' | 'normal' | 'fast' = 'normal';
  let adviceMessage = '';

  if (totalBudgetPlanned === 0) {
    adviceMessage = 'Atur alokasi kantong anggaranmu terlebih dahulu untuk melihat batas aman belanja harian.';
  } else if (totalRemainingBudget <= 0) {
    burnRateStatus = 'fast';
    adviceMessage = '⚠️ Pagu anggaran bulan ini sudah habis! Tahan pengeluaran non-esensial sampai gajian berikutnya.';
  } else if (paceDiff > 0.12) {
    burnRateStatus = 'fast';
    adviceMessage = `🚨 Kecepatan belanja terlalu tinggi (${Math.round(spentRatio * 100)}% anggaran di hari ke-${currentDay}). Rem pengeluaran fleksibel agar tidak boncos!`;
  } else if (paceDiff < -0.12 && currentDay > 5) {
    burnRateStatus = 'frugal';
    adviceMessage = `🌟 Luar biasa hemat! Di hari ke-${currentDay}, anggaran baru terpakai ${Math.round(spentRatio * 100)}%. Sisa pagu masih sangat aman.`;
  } else {
    burnRateStatus = 'normal';
    adviceMessage = `🟢 Pengeluaranmu stabil dan seimbang. Batas belanja aman harianmu adalah ${formatIDR(dailySafeLimit)}.`;
  }

  return {
    dailySafeLimit,
    totalRemainingBudget,
    remainingDays,
    currentDay,
    totalDaysInMonth,
    todaySpent,
    remainingToday,
    burnRateStatus,
    pacePercentage,
    adviceMessage,
  };
}

/**
 * Format IDR with Privacy Mode support (sensors numbers when privacy mode is active)
 */
export function formatIDRPrivacy(
  amount: number,
  isPrivacyMode: boolean,
  prefix: boolean = true
): string {
  if (isPrivacyMode) {
    return prefix ? 'Rp •••••••' : '•••••••';
  }
  return formatIDR(amount, prefix);
}

/**
 * Calculates Emergency Fund Runway (Ketahanan Dana Darurat).
 * Measures how many months the user can survive without income based on
 * strictly liquid cash reserves (excluding investments and archived accounts)
 * vs. essential monthly living expenses.
 */
export function calculateEmergencyRunway(
  accounts: Account[],
  pockets: Pocket[],
  overview: FinancialOverview,
  monthlyIncome: number,
  manualMonthlyExpense?: number,
  transactions: Transaction[] = []
): EmergencyRunwayResult {
  // 1. Calculate Total Liquid Cash strictly from active, non-investment accounts
  const { accountBalances } = calculateNetBalance(accounts, transactions);
  const liquidAccounts = accounts.filter((a) => !a.is_archived && a.type !== 'investment');
  const totalLiquidCash = liquidAccounts.reduce((sum, a) => {
    const bal = accountBalances[a.id] !== undefined ? accountBalances[a.id] : Math.max(0, a.opening_balance || 0);
    return sum + Math.max(0, bal);
  }, 0);

  // 2. Determine Monthly Essential Living Expense without fake arbitrary fallbacks
  const effectiveIncome = monthlyIncome > 0 ? monthlyIncome : overview.monthlyIncome;
  const hasManual = typeof manualMonthlyExpense === 'number' && manualMonthlyExpense > 0;

  if (!hasManual && effectiveIncome <= 0) {
    return {
      totalLiquidCash,
      monthlyEssentialExpense: 0,
      runwayMonths: 0,
      status: 'insufficient_data',
      statusLabel: 'Data Belum Cukup',
      badgeColor: '#9CA3AF',
      adviceMessage:
        'Lengkapi penghasilan bulanan di profil atau tentukan estimasi biaya pokok bulanan untuk menghitung daya tahan dana darurat secara akurat.',
      targetMonths: 6,
      targetAmount: 0,
      progressPercentage: 0,
      isEstimate: true,
      calculationMethod: 'insufficient',
    };
  }

  let monthlyEssentialExpense: number;
  let calculationMethod: 'budget_starred' | 'actual_expenses' | 'manual_input' | 'insufficient';

  if (hasManual) {
    monthlyEssentialExpense = Math.round(manualMonthlyExpense!);
    calculationMethod = 'manual_input';
  } else {
    const starredPockets = pockets.filter((p) => p.is_starred);
    let essentialPercentage = starredPockets.reduce(
      (sum, p) => sum + p.allocation_percentage,
      0
    );

    // If user hasn't starred any pocket, assume standard 50% basic needs rule
    if (essentialPercentage === 0) {
      essentialPercentage = 50;
    }

    monthlyEssentialExpense = Math.max(
      10000,
      Math.round((effectiveIncome * essentialPercentage) / 100)
    );
    calculationMethod = starredPockets.length > 0 ? 'budget_starred' : 'actual_expenses';
  }

  // 3. Calculate Runway Months
  const rawMonths =
    monthlyEssentialExpense > 0 ? totalLiquidCash / monthlyEssentialExpense : 0;
  const runwayMonths = Math.round(rawMonths * 10) / 10;

  // 4. Determine Financial Health Status
  let status: 'critical' | 'warning' | 'safe' | 'resilient' | 'insufficient_data' = 'warning';
  let statusLabel = 'Waspada 🟡';
  let badgeColor = '#F59E0B'; // Amber
  let adviceMessage = '';

  const targetMonths = 6;
  const targetAmount = monthlyEssentialExpense * targetMonths;
  const progressPercentage = targetAmount > 0
    ? Math.min(100, Math.round((totalLiquidCash / targetAmount) * 100))
    : 0;

  if (runwayMonths < 1) {
    status = 'critical';
    statusLabel = 'Kritis ⚠️';
    badgeColor = '#EF4444'; // Red
    adviceMessage =
      'Tabungan daruratmu kurang dari 1 bulan. Prioritaskan alokasi ke pos darurat sebelum belanja sekunder!';
  } else if (runwayMonths < 3) {
    status = 'warning';
    statusLabel = 'Waspada 🟡';
    badgeColor = '#F59E0B'; // Amber
    adviceMessage = `Dana darurat cukup untuk ${runwayMonths} bulan. Naikkan tabungan hingga minimal 3 bulan untuk rasa aman.`;
  } else if (runwayMonths < 6) {
    status = 'safe';
    statusLabel = 'Ideal & Sehat 🟢';
    badgeColor = '#10B981'; // Green
    adviceMessage = `Bagus! Dana daruratmu (${runwayMonths} bulan) sudah memenuhi batas standar aman hidup tanpa cemas.`;
  } else {
    status = 'resilient';
    statusLabel = 'Sangat Tangguh 🛡️';
    badgeColor = '#059669'; // Emerald
    adviceMessage = `Luar biasa! Ketahanan finansialmu mencapai ${runwayMonths} bulan. Kamu sangat aman dan bisa mulai berinvestasi.`;
  }

  return {
    totalLiquidCash,
    monthlyEssentialExpense,
    runwayMonths,
    status,
    statusLabel,
    badgeColor,
    adviceMessage,
    targetMonths,
    targetAmount,
    progressPercentage,
    isEstimate: calculationMethod !== 'manual_input',
    calculationMethod,
    manualMonthlyExpense: hasManual ? manualMonthlyExpense : undefined,
  };
}

export type TemplateApplicationMode = 'rebalance' | 'fresh_remap';

export interface ApplyTemplateOptions {
  mode: TemplateApplicationMode;
  template: RecommendationTemplate;
  currentPockets: Pocket[];
  currentTransactions: Transaction[];
  userId?: string;
}

export interface ApplyTemplateResult {
  updatedPockets: Pocket[];
  updatedTransactions: Transaction[];
  migratedCount: number;
}

/**
 * Intelligently applies a budget recommendation template without destroying user work.
 * - In 'rebalance' mode: Keeps all existing pockets & transactions intact, aligning percentages.
 * - In 'fresh_remap' mode: Builds new template pockets and automatically migrates old transactions
 *   to the best matching new pockets so no transaction is orphaned.
 */
export function applyBudgetTemplate({
  mode,
  template,
  currentPockets,
  currentTransactions,
  userId = 'user-1',
}: ApplyTemplateOptions): ApplyTemplateResult {
  // If user has no pockets yet, both modes behave identically: create the template pockets
  if (currentPockets.length === 0) {
    const newPockets: Pocket[] = template.pockets.map((p, index) => ({
      id: `pocket-tpl-${index}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      name: p.name,
      icon: p.icon,
      color: p.color,
      allocation_percentage: p.allocation_percentage,
      is_starred: p.is_starred,
      sort_order: index + 1,
    }));
    return {
      updatedPockets: newPockets,
      updatedTransactions: currentTransactions,
      migratedCount: 0,
    };
  }

  if (mode === 'rebalance') {
    // Mode 1: Preserve all pockets, calculate new percentages to reflect template spirit
    let templateNeeds = 0;
    let templateSavings = 0;
    let templateWants = 0;

    template.pockets.forEach((p) => {
      const lower = p.name.toLowerCase();
      if (lower.includes('tabung') || lower.includes('darurat') || lower.includes('invest')) {
        templateSavings += p.allocation_percentage;
      } else if (
        p.is_starred ||
        lower.includes('kebutuhan') ||
        lower.includes('tagihan') ||
        lower.includes('makan') ||
        lower.includes('kos')
      ) {
        templateNeeds += p.allocation_percentage;
      } else {
        templateWants += p.allocation_percentage;
      }
    });

    const totalTpl = templateNeeds + templateSavings + templateWants;
    if (totalTpl !== 100) {
      templateNeeds = 50;
      templateWants = 30;
      templateSavings = 20;
    }

    // Classify existing pockets
    const needsPockets: Pocket[] = [];
    const savingsPockets: Pocket[] = [];
    const wantsPockets: Pocket[] = [];

    currentPockets.forEach((p) => {
      const lower = p.name.toLowerCase();
      if (
        lower.includes('tabung') ||
        lower.includes('darurat') ||
        lower.includes('invest') ||
        lower.includes('emas') ||
        lower.includes('saham') ||
        lower.includes('goal')
      ) {
        savingsPockets.push(p);
      } else if (
        p.is_starred ||
        lower.includes('makan') ||
        lower.includes('kos') ||
        lower.includes('listrik') ||
        lower.includes('air') ||
        lower.includes('transport') ||
        lower.includes('bensin') ||
        lower.includes('obat') ||
        lower.includes('cicilan') ||
        lower.includes('pulsa')
      ) {
        needsPockets.push(p);
      } else {
        wantsPockets.push(p);
      }
    });

    let targetNeeds = templateNeeds;
    let targetSavings = templateSavings;
    let targetWants = templateWants;

    if (savingsPockets.length === 0 && (needsPockets.length > 0 || wantsPockets.length > 0)) {
      targetNeeds += Math.round(targetSavings * 0.7);
      targetWants += targetSavings - Math.round(targetSavings * 0.7);
      targetSavings = 0;
    }
    if (needsPockets.length === 0 && wantsPockets.length > 0) {
      targetWants += targetNeeds;
      targetNeeds = 0;
    }

    const newPercentages = new Map<string, number>();

    const distribute = (group: Pocket[], targetSum: number) => {
      if (group.length === 0 || targetSum <= 0) return;
      const initialWeightSum = group.reduce((sum, p) => sum + (p.allocation_percentage || 1), 0);
      let allocated = 0;

      group.forEach((p, idx) => {
        if (idx === group.length - 1) {
          newPercentages.set(p.id, Math.max(1, targetSum - allocated));
        } else {
          const weight = (p.allocation_percentage || 1) / initialWeightSum;
          const share = Math.max(1, Math.round(targetSum * weight));
          allocated += share;
          newPercentages.set(p.id, share);
        }
      });
    };

    distribute(needsPockets, targetNeeds);
    distribute(savingsPockets, targetSavings);
    distribute(wantsPockets, targetWants);

    // Final total reconciliation to ensure exact 100%
    const currentSum = Array.from(newPercentages.values()).reduce((a, b) => a + b, 0);
    const diff = 100 - currentSum;
    if (diff !== 0 && currentPockets.length > 0) {
      const firstId = currentPockets[0].id;
      const cur = newPercentages.get(firstId) || 0;
      newPercentages.set(firstId, Math.max(1, cur + diff));
    }

    const updatedPockets: Pocket[] = currentPockets.map((p) => ({
      ...p,
      allocation_percentage: newPercentages.get(p.id) ?? p.allocation_percentage,
    }));

    return {
      updatedPockets,
      updatedTransactions: currentTransactions,
      migratedCount: 0,
    };
  }

  // Mode 2: 'fresh_remap' - New template pockets with automatic transaction migration
  const newPockets: Pocket[] = template.pockets.map((p, index) => ({
    id: `pocket-tpl-${index}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    name: p.name,
    icon: p.icon,
    color: p.color,
    allocation_percentage: p.allocation_percentage,
    is_starred: p.is_starred,
    sort_order: index + 1,
  }));

  const findBestMatch = (oldPocket: Pocket): Pocket => {
    const oldName = oldPocket.name.toLowerCase();

    // 1. Direct match or substring
    for (const np of newPockets) {
      const newName = np.name.toLowerCase();
      if (oldName.includes(newName) || newName.includes(oldName)) {
        return np;
      }
    }

    // 2. Keyword matching
    const isNeeds =
      oldName.includes('makan') ||
      oldName.includes('kos') ||
      oldName.includes('listrik') ||
      oldName.includes('transport') ||
      oldName.includes('bensin') ||
      oldName.includes('tagihan') ||
      oldName.includes('kebutuhan');
    const isSavings =
      oldName.includes('tabung') ||
      oldName.includes('darurat') ||
      oldName.includes('invest') ||
      oldName.includes('emas') ||
      oldName.includes('goal');
    const isWants =
      oldName.includes('nongkrong') ||
      oldName.includes('kopi') ||
      oldName.includes('hiburan') ||
      oldName.includes('jalan') ||
      oldName.includes('keinginan');

    for (const np of newPockets) {
      const newName = np.name.toLowerCase();
      if (
        isSavings &&
        (newName.includes('tabung') || newName.includes('darurat') || newName.includes('invest'))
      ) {
        return np;
      }
      if (
        isNeeds &&
        (newName.includes('kebutuhan') ||
          newName.includes('pokok') ||
          newName.includes('makan') ||
          newName.includes('kos') ||
          newName.includes('tagihan'))
      ) {
        return np;
      }
      if (
        isWants &&
        (newName.includes('keinginan') ||
          newName.includes('hiburan') ||
          newName.includes('lifestyle') ||
          newName.includes('kopi'))
      ) {
        return np;
      }
    }

    // 3. Fallback based on priority flag
    if (oldPocket.is_starred) {
      const starred = newPockets.find((p) => p.is_starred);
      if (starred) return starred;
    }

    // 4. Default to first pocket
    return newPockets[0];
  };

  const pocketIdMap = new Map<string, string>();
  currentPockets.forEach((oldP) => {
    const match = findBestMatch(oldP);
    pocketIdMap.set(oldP.id, match.id);
  });

  let migratedCount = 0;
  const updatedTransactions = currentTransactions.map((tx) => {
    if (!tx.pocket_id) return tx;
    const newPocketId = pocketIdMap.get(tx.pocket_id);
    if (newPocketId) {
      migratedCount++;
      return { ...tx, pocket_id: newPocketId };
    }
    return tx;
  });

  return {
    updatedPockets: newPockets,
    updatedTransactions,
    migratedCount,
  };
}

/**
 * Formats a Date object into a full Indonesian date string.
 * Example: "Kamis, 29 Oktober 2026"
 */
export function formatIndonesianDate(date: Date = new Date()): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

export interface GenerateDailyBriefingParams {
  userName?: string;
  selectedPeriod: string;
  subscriptions: Subscription[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  tasks: Task[];
  debts?: Debt[];
  dailySafeLimit?: DailySafeLimitResult;
  formatMoney?: (amount: number, prefix?: boolean) => string;
  todayDate?: Date;
}

/**
 * Generates an all-in-one daily financial briefing that consolidates:
 * 1. Upcoming bills & subscriptions due today or within 3 days (or overdue)
 * 2. Upcoming debts payable due soon
 * 3. Daily expense check-in (did user record an expense today?)
 * 4. Active savings goal motivation & remaining amount
 * 5. Safe daily spend limit guardrail & pacing
 * 6. High-priority or due-today planner tasks
 */
export function generateDailyBriefing({
  userName = 'Kawan',
  selectedPeriod,
  subscriptions,
  transactions,
  goals,
  tasks,
  debts = [],
  dailySafeLimit,
  formatMoney = (amt) => formatIDR(amt),
  todayDate = new Date(),
}: GenerateDailyBriefingParams): DailyBriefingResult {
  const todayISO = todayDate.toISOString().split('T')[0];
  const items: DailyBriefingItem[] = [];

  // Time-aware greeting
  const hour = todayDate.getHours();
  let greetingPrefix = 'Selamat Malam';
  if (hour < 11) greetingPrefix = 'Selamat Pagi';
  else if (hour < 15) greetingPrefix = 'Selamat Siang';
  else if (hour < 18) greetingPrefix = 'Selamat Sore';

  const firstName = userName ? userName.split(' ')[0] : 'Kawan';
  const greeting = `${greetingPrefix}, ${firstName}! 👋`;
  const dateLabel = formatIndonesianDate(todayDate);

  // 1. Tagihan Mendatang (Subscriptions)
  const unpaidSubs = subscriptions.filter(
    (sub) => sub.is_active && sub.last_paid_period !== selectedPeriod
  );

  unpaidSubs.forEach((sub) => {
    const dueInfo = getSubscriptionDueDateInfo(sub.due_day, selectedPeriod, false, todayDate);

    if (dueInfo.status === 'due_today') {
      items.push({
        id: `sub-${sub.id}`,
        type: 'bill',
        title: `Tagihan ${sub.name} Jatuh Tempo Hari Ini!`,
        message: `Nominal: ${formatMoney(sub.amount)}. Segera selesaikan tagihan rutin agar layanan tetap aktif lancar.`,
        urgency: 'high',
        badge: 'Hari Ini!',
        actionText: 'Bayar Tagihan',
        actionType: 'navigate',
        actionRoute: '/app/subscriptions',
      });
    } else if (dueInfo.status === 'upcoming' && dueInfo.diffDays <= 3) {
      items.push({
        id: `sub-${sub.id}`,
        type: 'bill',
        title: `Tagihan ${sub.name} Jatuh Tempo ${dueInfo.diffDays === 1 ? 'Besok' : `${dueInfo.diffDays} Hari Lagi`}`,
        message: `Nominal: ${formatMoney(sub.amount)} pada tanggal ${dueInfo.dueDate.getDate()}. Pastikan saldo rekeningmu mencukupi.`,
        urgency: dueInfo.diffDays === 1 ? 'high' : 'medium',
        badge: dueInfo.badgeLabel,
        actionText: 'Cek Tagihan',
        actionType: 'navigate',
        actionRoute: '/app/subscriptions',
      });
    } else if (dueInfo.status === 'overdue') {
      items.push({
        id: `sub-${sub.id}`,
        type: 'bill',
        title: `Tagihan ${sub.name} Sudah Lewat Tempo!`,
        message: `Nominal: ${formatMoney(sub.amount)} (Jatuh tempo tgl ${dueInfo.dueDate.getDate()} ${formatPeriod(selectedPeriod, true)}). Segera lakukan pembayaran.`,
        urgency: 'high',
        badge: 'Lewat Tempo',
        actionText: 'Bayar Sekarang',
        actionType: 'navigate',
        actionRoute: '/app/subscriptions',
      });
    }
  });

  // 2. Hutang Jatuh Tempo (Debts payable)
  const unpaidPayableDebts = debts.filter(
    (d) => d.type === 'payable' && !d.is_settled && d.due_date
  );

  unpaidPayableDebts.forEach((debt) => {
    if (!debt.due_date) return;
    const debtDueDate = new Date(debt.due_date);
    const diffTime = debtDueDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const sisaHutang = Math.max(0, debt.amount - (debt.paid_amount || 0));

    if (diffDays <= 0) {
      items.push({
        id: `debt-${debt.id}`,
        type: 'debt',
        title: `Hutang ke ${debt.person_name} Sudah Jatuh Tempo!`,
        message: `Sisa kewajiban: ${formatMoney(sisaHutang)}. Segera lunasi atau konfirmasi kepada yang bersangkutan.`,
        urgency: 'high',
        badge: 'Jatuh Tempo',
        actionText: 'Bayar Cicilan',
        actionType: 'navigate',
        actionRoute: '/app/debts',
      });
    } else if (diffDays <= 3) {
      items.push({
        id: `debt-${debt.id}`,
        type: 'debt',
        title: `Hutang ke ${debt.person_name} Jatuh Tempo ${diffDays} Hari Lagi`,
        message: `Sisa kewajiban: ${formatMoney(sisaHutang)} (Tenggat: ${debt.due_date}).`,
        urgency: 'medium',
        badge: `${diffDays} Hari Lagi`,
        actionText: 'Cek Hutang',
        actionType: 'navigate',
        actionRoute: '/app/debts',
      });
    }
  });

  // 3. Check-in Pengeluaran Hari Ini (Daily Log Check-in)
  const todayExpenses = transactions.filter(
    (tx) => tx.type === 'expense' && tx.date && tx.date.startsWith(todayISO)
  );

  if (todayExpenses.length === 0) {
    items.push({
      id: 'daily-log-checkin',
      type: 'daily_log',
      title: 'Sudah Mencatat Pengeluaran Hari Ini? ✍️',
      message:
        'Belum ada transaksi pengeluaran yang kamu catat hari ini. Rutin mencatat mencegah kebocoran halus dan menjaga saldo pagu tetap akurat.',
      urgency: 'medium',
      badge: 'Belum Dicatat',
      actionText: '+ Catat Pengeluaran',
      actionType: 'open_transaction',
    });
  }

  // 4. Target Tabungan (Goal Motivation)
  const activeGoals = goals.filter((g) => !g.is_completed);
  if (activeGoals.length > 0) {
    const sortedGoals = [...activeGoals].sort((a, b) => {
      const pctA = a.target_amount > 0 ? a.current_amount / a.target_amount : 0;
      const pctB = b.target_amount > 0 ? b.current_amount / b.target_amount : 0;
      return pctB - pctA;
    });

    const topGoal = sortedGoals[0];
    const pct =
      topGoal.target_amount > 0
        ? Math.min(100, Math.round((topGoal.current_amount / topGoal.target_amount) * 100))
        : 0;
    const remainingGoal = Math.max(0, topGoal.target_amount - topGoal.current_amount);

    items.push({
      id: `goal-${topGoal.id}`,
      type: 'goal',
      title: `Ingat Tujuanmu: "${topGoal.name}" 🎯`,
      message: `Progress saat ini sudah mencapai ${pct}% (${formatMoney(
        topGoal.current_amount
      )}). Tinggal ${formatMoney(remainingGoal)} lagi untuk tercapai!`,
      urgency: pct >= 80 ? 'high' : 'info',
      badge: `${pct}% Tercapai`,
      actionText: 'Lihat Target',
      actionType: 'navigate',
      actionRoute: '/app/goals',
    });
  }

  // 5. Batas Belanja Aman Harian (Daily Safe Limit Guardrail)
  if (dailySafeLimit) {
    if (dailySafeLimit.burnRateStatus === 'fast') {
      items.push({
        id: 'safe-limit-alert',
        type: 'safe_limit',
        title: 'Laju Pengeluaran Lebih Cepat Dari Kalender ⚠️',
        message: `Pengeluaran hari ini tercatat ${formatMoney(
          dailySafeLimit.todaySpent
        )}. ${dailySafeLimit.adviceMessage}`,
        urgency: 'high',
        badge: 'Perhatian',
        actionText: 'Atur Pagu',
        actionType: 'navigate',
        actionRoute: '/app/budget',
      });
    } else {
      items.push({
        id: 'safe-limit-info',
        type: 'safe_limit',
        title: 'Jatah Belanja Aman Hari Ini 🛡️',
        message: `Batas belanja amanmu hari ini: ${formatMoney(
          Math.max(0, dailySafeLimit.remainingToday)
        )}/hari. Sisa ${dailySafeLimit.remainingDays} hari hingga akhir bulan.`,
        urgency: 'info',
        badge: 'Aman',
        actionText: 'Cek Pagu',
        actionType: 'navigate',
        actionRoute: '/app/budget',
      });
    }
  }

  // 6. Tugas / Agenda Penting Hari Ini (Planner Tasks)
  const urgentTasks = tasks.filter((t) => {
    if (t.is_completed) return false;
    const isToday = t.due_date === todayISO;
    const isHighPriority = t.priority === 'high';
    return isToday || isHighPriority;
  });

  if (urgentTasks.length > 0) {
    const todayTasks = urgentTasks.filter((t) => t.due_date === todayISO);
    const count = todayTasks.length > 0 ? todayTasks.length : urgentTasks.length;
    const firstTitle = urgentTasks[0].title;

    items.push({
      id: 'urgent-tasks',
      type: 'task',
      title: `Ada ${count} Agenda Tugas Penting Hari Ini 📋`,
      message: `Tugas terdekat: "${firstTitle}". Selesaikan satu per satu untuk menjaga ritme produktivitasmu.`,
      urgency: 'medium',
      badge: `${count} Tugas`,
      actionText: 'Buka Agenda',
      actionType: 'navigate',
      actionRoute: '/app/planner',
    });
  }

  // Determine overall urgency & summary headline
  const urgentCount = items.filter((i) => i.urgency === 'high').length;
  const hasUrgentItems = urgentCount > 0;

  let summaryHeadline = '';
  if (urgentCount > 0) {
    summaryHeadline = `Ada ${urgentCount} hal mendesak yang butuh perhatianmu hari ini!`;
  } else if (items.length > 0) {
    summaryHeadline = `Berikut ringkasan briefing finansial & agenda harianmu:`;
  } else {
    summaryHeadline = `Semua urusan finansial dan agendamu rapi dan aman terkendali! 🎉`;
  }

  return {
    greeting,
    dateLabel,
    items,
    hasUrgentItems,
    urgentCount,
    summaryHeadline,
  };
}

/**
 * Returns the current date in local calendar format 'YYYY-MM-DD'
 * ensuring Indonesian / local timezone doesn't drift into the previous month at midnight.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a timezone-safe ISO string anchored to local calendar date and time.
 * Prevents UTC string conversions at 00:30 WIB from shifting dates to the previous month.
 */
export function getLocalSafeISOString(d: Date = new Date()): string {
  const localDate = getLocalDateString(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${localDate}T${hours}:${minutes}:${seconds}.000Z`;
}

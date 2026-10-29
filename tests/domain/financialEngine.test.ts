import { describe, it, expect } from 'vitest';
import {
  formatIDR,
  parseIDRInput,
  calculatePocketAllocations,
  calculateNetBalance,
  calculatePocketSummaries,
  calculateFinancialOverview,
  formatPeriod,
  offsetPeriod,
  getCurrentRealtimePeriod,
  calculateDailySafeLimit,
  formatIDRPrivacy,
  calculateEmergencyRunway,
  applyBudgetTemplate,
  BUDGET_TEMPLATES,
  formatIndonesianDate,
  generateDailyBriefing,
} from '../../src/domain/finance/financialEngine';
import { Account, Pocket, Transaction, Subscription, SavingsGoal, Task, Debt } from '../../src/types';

describe('Financial Domain Engine: Pockito Integrity', () => {
  describe('formatIDR and parseIDRInput', () => {
    it('formats integer Rupiah correctly with default prefix', () => {
      expect(formatIDR(50000)).toBe('Rp 50.000');
      expect(formatIDR(15000000)).toBe('Rp 15.000.000');
      expect(formatIDR(0)).toBe('Rp 0');
      expect(formatIDR(-25000)).toBe('-Rp 25.000');
    });

    it('formats integer Rupiah without prefix when requested', () => {
      expect(formatIDR(7500000, false)).toBe('7.500.000');
      expect(formatIDR(-10000, false)).toBe('-10.000');
    });

    it('parses raw user input string into safe non-negative integer', () => {
      expect(parseIDRInput('Rp 50.000')).toBe(50000);
      expect(parseIDRInput('7,500,000')).toBe(7500000);
      expect(parseIDRInput('12000000')).toBe(12000000);
      expect(parseIDRInput('')).toBe(0);
      expect(parseIDRInput(-500)).toBe(0);
    });
  });

  describe('calculatePocketAllocations (Rounding Reconciliation)', () => {
    const mockPockets: Pocket[] = [
      { id: 'p1', user_id: 'u1', name: 'Makan', icon: 'Utensils', color: '#FF7A59', allocation_percentage: 50, is_starred: true, sort_order: 1 },
      { id: 'p2', user_id: 'u1', name: 'Tabungan', icon: 'PiggyBank', color: '#10B981', allocation_percentage: 30, is_starred: true, sort_order: 2 },
      { id: 'p3', user_id: 'u1', name: 'Hiburan', icon: 'Smile', color: '#A78BFA', allocation_percentage: 20, is_starred: false, sort_order: 3 },
    ];

    it('accurately reconciles allocations totaling 100%', () => {
      const income = 10000000; // Rp 10.000.000
      const allocations = calculatePocketAllocations(income, mockPockets);

      expect(allocations.get('p1')).toBe(5000000);
      expect(allocations.get('p2')).toBe(3000000);
      expect(allocations.get('p3')).toBe(2000000);

      const total = Array.from(allocations.values()).reduce((sum, v) => sum + v, 0);
      expect(total).toBe(income);
    });

    it('handles decimal percentages and reconciles rounding differences without losing a single rupiah', () => {
      const decimalPockets: Pocket[] = [
        { id: 'p1', user_id: 'u1', name: 'A', icon: 'Circle', color: '#fff', allocation_percentage: 33.33, is_starred: false, sort_order: 1 },
        { id: 'p2', user_id: 'u1', name: 'B', icon: 'Circle', color: '#fff', allocation_percentage: 33.33, is_starred: false, sort_order: 2 },
        { id: 'p3', user_id: 'u1', name: 'C', icon: 'Circle', color: '#fff', allocation_percentage: 33.34, is_starred: false, sort_order: 3 },
      ];
      const income = 10000000; // Rp 10.000.000
      const allocations = calculatePocketAllocations(income, decimalPockets);

      const totalAllocated = Array.from(allocations.values()).reduce((sum, v) => sum + v, 0);
      expect(totalAllocated).toBe(income);
    });

    it('handles allocations when sum is below 100%', () => {
      const sub100Pockets: Pocket[] = [
        { id: 'p1', user_id: 'u1', name: 'A', icon: 'Circle', color: '#fff', allocation_percentage: 40, is_starred: false, sort_order: 1 },
        { id: 'p2', user_id: 'u1', name: 'B', icon: 'Circle', color: '#fff', allocation_percentage: 30, is_starred: false, sort_order: 2 },
      ];
      const income = 6000000;
      const allocations = calculatePocketAllocations(income, sub100Pockets);

      expect(allocations.get('p1')).toBe(2400000);
      expect(allocations.get('p2')).toBe(1800000);
      const total = Array.from(allocations.values()).reduce((sum, v) => sum + v, 0);
      expect(total).toBe(4200000); // 70% of 6.000.000
    });

    it('handles zero income safely without NaN or exceptions', () => {
      const allocations = calculatePocketAllocations(0, mockPockets);
      expect(allocations.get('p1')).toBe(0);
      expect(allocations.get('p2')).toBe(0);
      expect(allocations.get('p3')).toBe(0);
    });

    it('handles very small income amounts with integer rounding', () => {
      const smallIncome = 10; // Rp 10
      const allocations = calculatePocketAllocations(smallIncome, mockPockets);
      const total = Array.from(allocations.values()).reduce((sum, v) => sum + v, 0);
      expect(total).toBe(10);
    });

    it('recalculates cleanly when monthly income is edited after saving', () => {
      const initialIncome = 5000000;
      const initialAllocations = calculatePocketAllocations(initialIncome, mockPockets);
      expect(initialAllocations.get('p1')).toBe(2500000);

      const updatedIncome = 8000000;
      const updatedAllocations = calculatePocketAllocations(updatedIncome, mockPockets);
      expect(updatedAllocations.get('p1')).toBe(4000000);
      expect(updatedAllocations.get('p2')).toBe(2400000);
      expect(updatedAllocations.get('p3')).toBe(1600000);
    });
  });

  describe('calculateNetBalance (Account & Ledger Integrity)', () => {
    const mockAccounts: Account[] = [
      { id: 'acc-bca', user_id: 'u1', name: 'Bank BCA', type: 'bank', opening_balance: 1000000, currency: 'IDR', color: '#00529C', is_archived: false },
      { id: 'acc-gopay', user_id: 'u1', name: 'GoPay', type: 'ewallet', opening_balance: 200000, currency: 'IDR', color: '#00AED6', is_archived: false },
      { id: 'acc-cash', user_id: 'u1', name: 'Dompet Tunai', type: 'cash', opening_balance: 50000, currency: 'IDR', color: '#10B981', is_archived: false },
    ];

    it('calculates balance with zero transactions (opening balance only)', () => {
      const { accountBalances, totalBalance } = calculateNetBalance(mockAccounts, []);
      expect(accountBalances['acc-bca']).toBe(1000000);
      expect(accountBalances['acc-gopay']).toBe(200000);
      expect(accountBalances['acc-cash']).toBe(50000);
      expect(totalBalance).toBe(1250000);
    });

    it('correctly increments balance on income and decrements on expense', () => {
      const transactions: Transaction[] = [
        { id: 't1', user_id: 'u1', account_id: 'acc-bca', type: 'income', amount: 5000000, date: '2026-10-01T10:00:00Z', description: 'Gaji Pokok' },
        { id: 't2', user_id: 'u1', account_id: 'acc-bca', type: 'expense', amount: 1500000, pocket_id: 'p1', date: '2026-10-02T10:00:00Z', description: 'Sewa Kos' },
        { id: 't3', user_id: 'u1', account_id: 'acc-gopay', type: 'expense', amount: 50000, pocket_id: 'p2', date: '2026-10-03T12:00:00Z', description: 'Makan Siang' },
      ];

      const { accountBalances, totalBalance } = calculateNetBalance(mockAccounts, transactions);
      expect(accountBalances['acc-bca']).toBe(1000000 + 5000000 - 1500000); // 4.500.000
      expect(accountBalances['acc-gopay']).toBe(200000 - 50000); // 150.000
      expect(accountBalances['acc-cash']).toBe(50000);
      expect(totalBalance).toBe(4500000 + 150000 + 50000); // 4.700.000
    });

    it('ensures internal transfers move money between accounts without altering net total balance', () => {
      const transferTx: Transaction[] = [
        {
          id: 't-transfer',
          user_id: 'u1',
          account_id: 'acc-bca',
          destination_account_id: 'acc-cash',
          type: 'transfer',
          amount: 300000,
          date: '2026-10-05T09:00:00Z',
          description: 'Tarik Tunai ATM',
        },
      ];

      const initial = calculateNetBalance(mockAccounts, []);
      const afterTransfer = calculateNetBalance(mockAccounts, transferTx);

      // BCA decreased by 300.000
      expect(afterTransfer.accountBalances['acc-bca']).toBe(initial.accountBalances['acc-bca'] - 300000);
      // Cash increased by 300.000
      expect(afterTransfer.accountBalances['acc-cash']).toBe(initial.accountBalances['acc-cash'] + 300000);
      // Net total balance is strictly unchanged!
      expect(afterTransfer.totalBalance).toBe(initial.totalBalance);
    });
  });

  describe('calculatePocketSummaries and FinancialOverview', () => {
    const mockPockets: Pocket[] = [
      { id: 'p-food', user_id: 'u1', name: 'Makan', icon: 'Utensils', color: '#FF7A59', allocation_percentage: 40, is_starred: true, sort_order: 1 },
      { id: 'p-bills', user_id: 'u1', name: 'Tagihan', icon: 'Home', color: '#713B3B', allocation_percentage: 30, is_starred: true, sort_order: 2 },
      { id: 'p-save', user_id: 'u1', name: 'Tabungan', icon: 'PiggyBank', color: '#10B981', allocation_percentage: 30, is_starred: true, sort_order: 3 },
    ];
    const mockAccounts: Account[] = [
      { id: 'acc1', user_id: 'u1', name: 'Utama', type: 'bank', opening_balance: 5000000, currency: 'IDR', color: '#FAAE2B', is_archived: false },
    ];

    it('computes pocket spent and remaining amounts accurately for the period', () => {
      const income = 6000000;
      const transactions: Transaction[] = [
        { id: 't1', user_id: 'u1', account_id: 'acc1', pocket_id: 'p-food', type: 'expense', amount: 500000, date: '2026-10-02T12:00:00Z', description: 'Groceries' },
        { id: 't2', user_id: 'u1', account_id: 'acc1', pocket_id: 'p-food', type: 'expense', amount: 300000, date: '2026-10-04T18:00:00Z', description: 'Dinner' },
        { id: 't3', user_id: 'u1', account_id: 'acc1', pocket_id: 'p-bills', type: 'expense', amount: 1500000, date: '2026-10-05T08:00:00Z', description: 'Listrik' },
        // Transaction from different month should not be counted in 2026-10
        { id: 't4', user_id: 'u1', account_id: 'acc1', pocket_id: 'p-food', type: 'expense', amount: 200000, date: '2026-09-28T12:00:00Z', description: 'Bulan Lalu' },
      ];

      const summaries = calculatePocketSummaries(mockPockets, income, transactions, '2026-10');

      const foodSummary = summaries.find((s) => s.id === 'p-food')!;
      expect(foodSummary.plannedAmount).toBe(2400000); // 40% of 6.000.000
      expect(foodSummary.spentAmount).toBe(800000); // 500k + 300k
      expect(foodSummary.remainingAmount).toBe(1600000);
      expect(foodSummary.spentPercentage).toBe(33); // 800k / 2400k = 33.3% -> 33%

      const billsSummary = summaries.find((s) => s.id === 'p-bills')!;
      expect(billsSummary.spentAmount).toBe(1500000);

      const saveSummary = summaries.find((s) => s.id === 'p-save')!;
      expect(saveSummary.spentAmount).toBe(0);
      expect(saveSummary.remainingAmount).toBe(1800000);
    });

    it('reports overallocated state when sum of percentages exceeds 100%', () => {
      const overPockets: Pocket[] = [
        { id: 'p1', user_id: 'u1', name: 'A', icon: 'Circle', color: '#fff', allocation_percentage: 60, is_starred: false, sort_order: 1 },
        { id: 'p2', user_id: 'u1', name: 'B', icon: 'Circle', color: '#fff', allocation_percentage: 55, is_starred: false, sort_order: 2 },
      ];

      const overview = calculateFinancialOverview(mockAccounts, overPockets, 5000000, [], '2026-10');
      expect(overview.isOverallocated).toBe(true);
      expect(overview.totalAllocationPercentage).toBe(115);
      expect(overview.unallocatedPercentage).toBe(0);
    });
  });

  describe('Period Formatting and Manipulation', () => {
    it('formats YYYY-MM to full Indonesian month and year', () => {
      expect(formatPeriod('2026-10')).toBe('Oktober 2026');
      expect(formatPeriod('2026-01')).toBe('Januari 2026');
      expect(formatPeriod('2026-12')).toBe('Desember 2026');
      expect(formatPeriod('2027-05')).toBe('Mei 2027');
    });

    it('formats YYYY-MM to short Indonesian month and year', () => {
      expect(formatPeriod('2026-10', true)).toBe('Okt 2026');
      expect(formatPeriod('2026-08', true)).toBe('Agu 2026');
      expect(formatPeriod('2026-11', true)).toBe('Nov 2026');
    });

    it('offsets period forward and backward correctly across years', () => {
      expect(offsetPeriod('2026-10', 1)).toBe('2026-11');
      expect(offsetPeriod('2026-10', -1)).toBe('2026-09');
      expect(offsetPeriod('2026-12', 1)).toBe('2027-01');
      expect(offsetPeriod('2026-01', -1)).toBe('2025-12');
    });

    it('gets valid real-time period matching current year-month', () => {
      const current = getCurrentRealtimePeriod();
      expect(current).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('calculateDailySafeLimit (Safe-to-Spend & Burn Rate)', () => {
    const mockSummaries = [
      {
        id: 'p1',
        user_id: 'u1',
        name: 'Makan',
        icon: 'Utensils',
        color: '#FF7A59',
        allocation_percentage: 50,
        is_starred: true,
        sort_order: 1,
        plannedAmount: 3000000,
        spentAmount: 1000000,
        remainingAmount: 2000000,
        spentPercentage: 33,
      },
    ];

    it('computes daily safe limit accurately based on remaining days', () => {
      // 10th of October 2026 (31 total days). Remaining days = 31 - 10 + 1 = 22 days.
      // Remaining budget = 2.000.000. Daily safe limit = floor(2000000 / 22) = 90.909
      const refDate = new Date('2026-10-10T12:00:00Z');
      const result = calculateDailySafeLimit(mockSummaries, [], '2026-10', refDate);

      expect(result.totalRemainingBudget).toBe(2000000);
      expect(result.remainingDays).toBe(22);
      expect(result.currentDay).toBe(10);
      expect(result.totalDaysInMonth).toBe(31);
      expect(result.dailySafeLimit).toBe(90909);
      expect(result.todaySpent).toBe(0);
      expect(result.remainingToday).toBe(90909);
    });

    it('deducts expenses made today from today remaining limit', () => {
      const refDate = new Date('2026-10-10T12:00:00Z');
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          user_id: 'u1',
          account_id: 'acc1',
          pocket_id: 'p1',
          type: 'expense',
          amount: 25000,
          date: '2026-10-10T08:30:00Z',
          description: 'Kopi & Roti Pagi',
        },
      ];

      const result = calculateDailySafeLimit(mockSummaries, transactions, '2026-10', refDate);
      expect(result.todaySpent).toBe(25000);
      expect(result.remainingToday).toBe(90909 - 25000);
    });

    it('detects fast burn rate when spending significantly outpaces calendar days', () => {
      // On day 5 of October (5/31 = ~16% elapsed), but 70% of budget already spent
      const fastSummaries = [
        {
          id: 'p1',
          user_id: 'u1',
          name: 'Jajan',
          icon: 'Utensils',
          color: '#FF7A59',
          allocation_percentage: 100,
          is_starred: false,
          sort_order: 1,
          plannedAmount: 1000000,
          spentAmount: 700000,
          remainingAmount: 300000,
          spentPercentage: 70,
        },
      ];

      const refDate = new Date('2026-10-05T12:00:00Z');
      const result = calculateDailySafeLimit(fastSummaries, [], '2026-10', refDate);

      expect(result.burnRateStatus).toBe('fast');
      expect(result.adviceMessage).toContain('Kecepatan belanja terlalu tinggi');
    });

    it('detects frugal status when user is well disciplined mid-month', () => {
      // On day 20 of October (~64% elapsed), but only 20% budget spent
      const frugalSummaries = [
        {
          id: 'p1',
          user_id: 'u1',
          name: 'Kebutuhan',
          icon: 'Home',
          color: '#10B981',
          allocation_percentage: 100,
          is_starred: true,
          sort_order: 1,
          plannedAmount: 1000000,
          spentAmount: 200000,
          remainingAmount: 800000,
          spentPercentage: 20,
        },
      ];

      const refDate = new Date('2026-10-20T12:00:00Z');
      const result = calculateDailySafeLimit(frugalSummaries, [], '2026-10', refDate);

      expect(result.burnRateStatus).toBe('frugal');
      expect(result.adviceMessage).toContain('Luar biasa hemat');
    });
  });

  describe('formatIDRPrivacy (Privacy Mode sensor)', () => {
    it('returns masked bullet symbols when isPrivacyMode is true', () => {
      expect(formatIDRPrivacy(5000000, true)).toBe('Rp •••••••');
      expect(formatIDRPrivacy(5000000, true, false)).toBe('•••••••');
    });

    it('returns regular Rupiah when isPrivacyMode is false', () => {
      expect(formatIDRPrivacy(5000000, false)).toBe('Rp 5.000.000');
      expect(formatIDRPrivacy(5000000, false, false)).toBe('5.000.000');
    });
  });

  describe('calculateEmergencyRunway (Ketahanan Dana Darurat)', () => {
    const mockAccounts: Account[] = [
      {
        id: 'acc-1',
        user_id: 'u1',
        name: 'BCA',
        type: 'bank',
        opening_balance: 6000000,
        currency: 'IDR',
        color: '#00529C',
        is_archived: false,
      },
    ];

    const mockPockets: Pocket[] = [
      {
        id: 'p1',
        user_id: 'u1',
        name: 'Makan & Tagihan',
        icon: 'Utensils',
        color: '#FF7A59',
        allocation_percentage: 40,
        is_starred: true, // Priority essential pocket
        sort_order: 1,
      },
      {
        id: 'p2',
        user_id: 'u1',
        name: 'Nongkrong',
        icon: 'Smile',
        color: '#FAAE2B',
        allocation_percentage: 20,
        is_starred: false,
        sort_order: 2,
      },
    ];

    const mockOverview = {
      totalRecordedBalance: 6000000,
      monthlyIncome: 5000000,
      totalMonthlyExpense: 0,
      netSavings: 5000000,
      savingsRate: 100,
      isOverallocated: false,
      totalAllocationPercentage: 60,
      unallocatedPercentage: 40,
      totalBudgetPlanned: 3000000,
      totalBudgetRemaining: 3000000,
      unallocatedIncome: 2000000,
    };

    it('calculates runway months and classifies safe status correctly', () => {
      // Monthly income: 5.000.000, Starred pocket: 40% = 2.000.000/month
      // Cash: 6.000.000 -> 6.000.000 / 2.000.000 = 3.0 months
      const result = calculateEmergencyRunway(mockAccounts, mockPockets, mockOverview, 5000000);

      expect(result.totalLiquidCash).toBe(6000000);
      expect(result.monthlyEssentialExpense).toBe(2000000);
      expect(result.runwayMonths).toBe(3);
      expect(result.status).toBe('safe');
      expect(result.targetMonths).toBe(6);
      expect(result.targetAmount).toBe(12000000);
      expect(result.progressPercentage).toBe(50);
    });

    it('detects critical status when liquid cash is under 1 month', () => {
      const lowOverview = { ...mockOverview, totalRecordedBalance: 1000000 };
      const lowAccounts: Account[] = [
        { ...mockAccounts[0], opening_balance: 1000000 },
      ];

      const result = calculateEmergencyRunway(lowAccounts, mockPockets, lowOverview, 5000000);

      expect(result.runwayMonths).toBe(0.5);
      expect(result.status).toBe('critical');
      expect(result.adviceMessage).toContain('kurang dari 1 bulan');
    });

    it('detects resilient status when liquid cash exceeds 6 months', () => {
      const richOverview = { ...mockOverview, totalRecordedBalance: 15000000 };
      const richAccounts: Account[] = [
        { ...mockAccounts[0], opening_balance: 15000000 },
      ];

      const result = calculateEmergencyRunway(richAccounts, mockPockets, richOverview, 5000000);

      expect(result.runwayMonths).toBe(7.5);
      expect(result.status).toBe('resilient');
      expect(result.adviceMessage).toContain('Luar biasa');
    });
  });

  describe('applyBudgetTemplate: Smart Template Protection & Migration', () => {
    const existingPockets: Pocket[] = [
      { id: 'poc-makan', user_id: 'u1', name: 'Makan Siang & Jajan', icon: 'Utensils', color: '#111', allocation_percentage: 20, is_starred: true, sort_order: 1 },
      { id: 'poc-kos', user_id: 'u1', name: 'Sewa Kos Bulanan', icon: 'Home', color: '#222', allocation_percentage: 40, is_starred: true, sort_order: 2 },
      { id: 'poc-kopi', user_id: 'u1', name: 'Nongkrong & Kopi', icon: 'Coffee', color: '#333', allocation_percentage: 20, is_starred: false, sort_order: 3 },
      { id: 'poc-darurat', user_id: 'u1', name: 'Tabungan Darurat', icon: 'PiggyBank', color: '#444', allocation_percentage: 20, is_starred: true, sort_order: 4 },
    ];

    const existingTransactions: Transaction[] = [
      { id: 'tx-1', user_id: 'u1', account_id: 'acc-1', pocket_id: 'poc-makan', type: 'expense', amount: 50000, date: '2026-10-20', description: 'Nasi Padang' },
      { id: 'tx-2', user_id: 'u1', account_id: 'acc-1', pocket_id: 'poc-kopi', type: 'expense', amount: 35000, date: '2026-10-21', description: 'Es Kopi Susu' },
      { id: 'tx-3', user_id: 'u1', account_id: 'acc-1', pocket_id: 'poc-darurat', type: 'expense', amount: 200000, date: '2026-10-22', description: 'Setor Dana Darurat' },
      { id: 'tx-4', user_id: 'u1', account_id: 'acc-1', pocket_id: null, type: 'income', amount: 7500000, date: '2026-10-01', description: 'Gaji Pokok' },
    ];

    const template503020 = BUDGET_TEMPLATES[0]; // 50/30/20

    it('Mode rebalance: preserves all existing pockets, IDs, and transactions while balancing percentages to 100%', () => {
      const result = applyBudgetTemplate({
        mode: 'rebalance',
        template: template503020,
        currentPockets: existingPockets,
        currentTransactions: existingTransactions,
      });

      // 1. All original pocket IDs must be preserved
      expect(result.updatedPockets).toHaveLength(4);
      expect(result.updatedPockets.map((p) => p.id)).toEqual(['poc-makan', 'poc-kos', 'poc-kopi', 'poc-darurat']);

      // 2. Sum of all percentages must equal exactly 100%
      const totalPct = result.updatedPockets.reduce((sum, p) => sum + p.allocation_percentage, 0);
      expect(totalPct).toBe(100);

      // 3. Transactions must remain completely untouched
      expect(result.updatedTransactions).toEqual(existingTransactions);
      expect(result.migratedCount).toBe(0);
    });

    it('Mode fresh_remap: creates new template pockets and auto-migrates old transactions without data loss', () => {
      const result = applyBudgetTemplate({
        mode: 'fresh_remap',
        template: template503020,
        currentPockets: existingPockets,
        currentTransactions: existingTransactions,
        userId: 'u1',
      });

      // 1. New pockets created from template (3 pockets in 50/30/20)
      expect(result.updatedPockets).toHaveLength(3);
      const newNeedsPocket = result.updatedPockets.find((p) => p.name.includes('Kebutuhan'));
      const newWantsPocket = result.updatedPockets.find((p) => p.name.includes('Keinginan'));
      const newSavingsPocket = result.updatedPockets.find((p) => p.name.includes('Tabungan'));

      expect(newNeedsPocket).toBeDefined();
      expect(newWantsPocket).toBeDefined();
      expect(newSavingsPocket).toBeDefined();

      // 2. Transactions are remapped accurately based on category keywords
      // tx-1 (Makan) -> newNeedsPocket
      const txMakan = result.updatedTransactions.find((t) => t.id === 'tx-1');
      expect(txMakan?.pocket_id).toBe(newNeedsPocket?.id);

      // tx-2 (Kopi) -> newWantsPocket
      const txKopi = result.updatedTransactions.find((t) => t.id === 'tx-2');
      expect(txKopi?.pocket_id).toBe(newWantsPocket?.id);

      // tx-3 (Darurat) -> newSavingsPocket
      const txDarurat = result.updatedTransactions.find((t) => t.id === 'tx-3');
      expect(txDarurat?.pocket_id).toBe(newSavingsPocket?.id);

      // tx-4 (Income without pocket) -> remains null
      const txIncome = result.updatedTransactions.find((t) => t.id === 'tx-4');
      expect(txIncome?.pocket_id).toBeNull();

      // 3. Migrated count reflects the 3 expenses that had pockets
      expect(result.migratedCount).toBe(3);
    });

    it('handles empty initial pockets gracefully by building the template structure', () => {
      const result = applyBudgetTemplate({
        mode: 'rebalance',
        template: template503020,
        currentPockets: [],
        currentTransactions: [],
        userId: 'u1',
      });

      expect(result.updatedPockets).toHaveLength(3);
      expect(result.migratedCount).toBe(0);
    });
  });

  describe('formatIndonesianDate and generateDailyBriefing', () => {
    it('formats Indonesian date correctly', () => {
      // 2026-10-29 is Thursday (Kamis)
      const testDate = new Date(2026, 9, 29, 10, 0, 0); // Month is 0-indexed (9 = Oktober)
      expect(formatIndonesianDate(testDate)).toBe('Kamis, 29 Oktober 2026');
    });

    it('generates daily briefing with upcoming bills, daily log nudge, goal reminder, and tasks', () => {
      const fixedDate = new Date(2026, 9, 29, 14, 0, 0); // 29 Okt 2026 (Siang)

      const mockSubs: Subscription[] = [
        {
          id: 'sub-1',
          user_id: 'u1',
          name: 'Wifi Indihome',
          amount: 350000,
          billing_cycle: 'monthly',
          due_day: 31, // 2 days from 29th
          is_active: true,
          last_paid_period: '2026-09',
        },
        {
          id: 'sub-2',
          user_id: 'u1',
          name: 'Spotify Family',
          amount: 86000,
          billing_cycle: 'monthly',
          due_day: 29, // today!
          is_active: true,
          last_paid_period: '2026-09',
        },
        {
          id: 'sub-3',
          user_id: 'u1',
          name: 'Netflix',
          amount: 186000,
          billing_cycle: 'monthly',
          due_day: 29,
          is_active: true,
          last_paid_period: '2026-10', // already paid this month
        },
      ];

      const mockGoals: SavingsGoal[] = [
        {
          id: 'g-1',
          user_id: 'u1',
          name: 'Beli Laptop MacBook M3',
          target_amount: 15000000,
          current_amount: 7500000,
          icon: 'Laptop',
          color: '#10B981',
          is_completed: false,
        },
      ];

      const mockTasks: Task[] = [
        {
          id: 't-1',
          user_id: 'u1',
          title: 'Review laporan keuangan bulanan',
          due_date: '2026-10-29',
          priority: 'high',
          is_completed: false,
        },
      ];

      const mockDebts: Debt[] = [
        {
          id: 'd-1',
          user_id: 'u1',
          person_name: 'Budi Santoso',
          amount: 500000,
          paid_amount: 0,
          type: 'payable',
          due_date: '2026-10-30', // tomorrow
          is_settled: false,
          description: 'Pinjaman modal usaha',
          created_at: '2026-10-01',
        },
      ];

      // No transactions today
      const briefing = generateDailyBriefing({
        userName: 'Faqih Pratama',
        selectedPeriod: '2026-10',
        subscriptions: mockSubs,
        transactions: [],
        goals: mockGoals,
        tasks: mockTasks,
        debts: mockDebts,
        todayDate: fixedDate,
      });

      expect(briefing.greeting).toContain('Selamat Siang, Faqih!');
      expect(briefing.dateLabel).toBe('Kamis, 29 Oktober 2026');
      expect(briefing.hasUrgentItems).toBe(true);

      // Debt item should be present
      const debtItem = briefing.items.find((i) => i.id === 'debt-d-1');
      expect(debtItem).toBeDefined();
      expect(debtItem?.title).toContain('Budi Santoso');

      // Sub-2 is due today (high urgency)
      const sub2Item = briefing.items.find((i) => i.id === 'sub-sub-2');
      expect(sub2Item).toBeDefined();
      expect(sub2Item?.urgency).toBe('high');
      expect(sub2Item?.badge).toBe('Hari Ini!');

      // Sub-1 is due in 2 days
      const sub1Item = briefing.items.find((i) => i.id === 'sub-sub-1');
      expect(sub1Item).toBeDefined();
      expect(sub1Item?.badge).toBe('2 Hari Lagi');

      // Sub-3 was already paid, so it should NOT be in items
      const sub3Item = briefing.items.find((i) => i.id === 'sub-sub-3');
      expect(sub3Item).toBeUndefined();

      // Daily log check-in should trigger because 0 transactions today
      const logCheckin = briefing.items.find((i) => i.type === 'daily_log');
      expect(logCheckin).toBeDefined();
      expect(logCheckin?.actionType).toBe('open_transaction');

      // Goal item should be present with 50%
      const goalItem = briefing.items.find((i) => i.type === 'goal');
      expect(goalItem).toBeDefined();
      expect(goalItem?.badge).toBe('50% Tercapai');

      // Task item should be present
      const taskItem = briefing.items.find((i) => i.type === 'task');
      expect(taskItem).toBeDefined();
      expect(taskItem?.title).toContain('1 Agenda Tugas');
    });

    it('does not trigger daily log checkin if an expense was recorded today', () => {
      const fixedDate = new Date(2026, 9, 29, 14, 0, 0);

      const todayTx: Transaction[] = [
        {
          id: 'tx-today',
          user_id: 'u1',
          account_id: 'acc-1',
          amount: 25000,
          date: '2026-10-29T12:00:00Z',
          description: 'Makan siang soto ayam',
          type: 'expense',
        },
      ];

      const briefing = generateDailyBriefing({
        userName: 'Faqih',
        selectedPeriod: '2026-10',
        subscriptions: [],
        transactions: todayTx,
        goals: [],
        tasks: [],
        todayDate: fixedDate,
      });

      const logCheckin = briefing.items.find((i) => i.type === 'daily_log');
      expect(logCheckin).toBeUndefined();
    });
  });
});

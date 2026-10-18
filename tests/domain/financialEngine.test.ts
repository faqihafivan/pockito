import { describe, it, expect } from 'vitest';
import {
  formatIDR,
  parseIDRInput,
  calculatePocketAllocations,
  calculateNetBalance,
  calculatePocketSummaries,
  calculateFinancialOverview,
} from '../../src/domain/finance/financialEngine';
import { Account, Pocket, Transaction } from '../../src/types';

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
});

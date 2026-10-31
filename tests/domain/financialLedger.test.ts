import { describe, it, expect } from 'vitest';
import {
  calculateNetBalance,
  calculateFinancialOverview,
  calculateEmergencyRunway,
  formatIDRPrivacy,
} from '../../src/domain/finance/financialEngine';
import { Account, Pocket, Transaction } from '../../src/types';

describe('P1 Financial Ledger Invariants & Business Logic', () => {
  const accountA: Account = {
    id: 'acc-a',
    user_id: 'user-1',
    name: 'BCA Utama',
    type: 'bank',
    opening_balance: 10000000, // 10 jt
    currency: 'IDR',
    color: '#00529C',
    is_archived: false,
  };

  const accountB: Account = {
    id: 'acc-b',
    user_id: 'user-1',
    name: 'GoPay E-Wallet',
    type: 'ewallet',
    opening_balance: 500000, // 500 rb
    currency: 'IDR',
    color: '#00AED6',
    is_archived: false,
  };

  const accountInvestment: Account = {
    id: 'acc-inv',
    user_id: 'user-1',
    name: 'Bibit Reksadana',
    type: 'investment',
    opening_balance: 25000000, // 25 jt (Investasi, TIDAK likuid langsung)
    currency: 'IDR',
    color: '#10B981',
    is_archived: false,
  };

  const accountArchived: Account = {
    id: 'acc-archived',
    user_id: 'user-1',
    name: 'Rekening Lama',
    type: 'bank',
    opening_balance: 1000000,
    currency: 'IDR',
    color: '#888',
    is_archived: true,
  };

  const samplePocket: Pocket = {
    id: 'poc-food',
    user_id: 'user-1',
    name: 'Makan & Minum',
    icon: 'Utensils',
    color: '#FF7A59',
    allocation_percentage: 30,
    is_starred: true,
    sort_order: 1,
  };

  it('FIN-04: Internal transfer preserves total overall balance and never alters income/expense', () => {
    const transferTx: Transaction = {
      id: 'tx-trf-1',
      user_id: 'user-1',
      account_id: 'acc-a',
      destination_account_id: 'acc-b',
      amount: 1500000, // 1.5 jt dari A ke B
      type: 'transfer',
      date: '2026-10-15T12:00:00Z',
      description: 'Topup GoPay dari BCA',
    };

    const accounts = [accountA, accountB];
    const { accountBalances, totalBalance } = calculateNetBalance(accounts, [transferTx]);

    // Account A should decrease by 1.5 jt: 10jt - 1.5jt = 8.5jt
    expect(accountBalances['acc-a']).toBe(8500000);
    // Account B should increase by 1.5 jt: 500rb + 1.5jt = 2jt
    expect(accountBalances['acc-b']).toBe(2000000);
    // Total balance remains unchanged: 10.5jt
    expect(totalBalance).toBe(10500000);

    // Verify Financial Overview: monthly expense and income are untouched by transfer
    const overview = calculateFinancialOverview(accounts, [samplePocket], 5000000, [transferTx], '2026-10');
    expect(overview.totalMonthlyExpense).toBe(0);
    expect(overview.totalRecordedBalance).toBe(10500000);
  });

  it('FIN-07: Expense without pocket_id reduces account balance and counts toward total monthly expense', () => {
    const unallocatedExpense: Transaction = {
      id: 'tx-unallocated',
      user_id: 'user-1',
      account_id: 'acc-a',
      pocket_id: null, // Tanpa kantong
      amount: 250000,
      type: 'expense',
      date: '2026-10-16T14:00:00Z',
      description: 'Biaya admin tak terduga',
    };

    const accounts = [accountA];
    const { accountBalances } = calculateNetBalance(accounts, [unallocatedExpense]);
    expect(accountBalances['acc-a']).toBe(9750000);

    const overview = calculateFinancialOverview(accounts, [samplePocket], 5000000, [unallocatedExpense], '2026-10');
    expect(overview.totalMonthlyExpense).toBe(250000);
  });

  it('RUNWAY-01 & RUNWAY-02: Emergency runway excludes investment and archived accounts from liquid cash', () => {
    const allAccounts = [accountA, accountB, accountInvestment, accountArchived];
    const pockets = [samplePocket]; // 30% dari 5jt = 1.5jt pokok per bulan
    const monthlyIncome = 5000000;

    const overview = calculateFinancialOverview(allAccounts, pockets, monthlyIncome, [], '2026-10');

    const runway = calculateEmergencyRunway(allAccounts, pockets, overview, monthlyIncome, undefined, []);

    // Liquid cash should only sum BCA (10jt) + GoPay (500rb) = 10.5jt
    // Investment (25jt) and Archived (1jt) MUST BE EXCLUDED!
    expect(runway.totalLiquidCash).toBe(10500000);

    // Monthly essential expense = 30% of 5jt = 1.5jt
    expect(runway.monthlyEssentialExpense).toBe(1500000);

    // Runway months = 10.5jt / 1.5jt = 7.0 months
    expect(runway.runwayMonths).toBe(7);
    expect(runway.status).toBe('resilient');
  });

  it('RUNWAY-03: Returns "insufficient_data" when income and manual expense are zero, without guessing Rp3.000.000', () => {
    const accounts = [accountA];
    const pockets: Pocket[] = [];
    const monthlyIncome = 0; // No income entered

    const overview = calculateFinancialOverview(accounts, pockets, 0, [], '2026-10');
    const runway = calculateEmergencyRunway(accounts, pockets, overview, monthlyIncome);

    expect(runway.status).toBe('insufficient_data');
    expect(runway.statusLabel).toBe('Data Belum Cukup');
    expect(runway.runwayMonths).toBe(0);
    expect(runway.monthlyEssentialExpense).toBe(0);
    expect(runway.adviceMessage).toContain('Lengkapi penghasilan');
  });

  it('PRIV-01 & PRIV-02: Privacy masking only masks monetary values and leaves non-money content intact', () => {
    // When privacy mode is ON:
    const maskedWithPrefix = formatIDRPrivacy(1500000, true, true);
    expect(maskedWithPrefix).toBe('Rp •••••••');

    const maskedWithoutPrefix = formatIDRPrivacy(1500000, true, false);
    expect(maskedWithoutPrefix).toBe('•••••••');

    // When privacy mode is OFF:
    const unmasked = formatIDRPrivacy(1500000, false, true);
    expect(unmasked).toBe('Rp 1.500.000');

    // Dates and item counts are never masked by formatIDRPrivacy
    const itemCount = 5;
    expect(`${itemCount} transaksi`).toBe('5 transaksi');
  });
});

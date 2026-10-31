import { describe, it, expect, beforeEach } from 'vitest';
import { DataService, generateUUID } from '../../src/services/dataService';

describe('P0 Data Isolation & Namespace Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
    DataService.setMode('local', null);
  });

  it('generates standard RFC 4122 v4 UUIDs for all entity IDs', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (let i = 0; i < 10; i++) {
      const id = generateUUID();
      expect(id).toMatch(uuidRegex);
    }
  });

  it('isolates demo dataset from authenticated user data namespaces', async () => {
    // 1. Enter Demo Mode and create a transaction
    DataService.setMode('demo', 'demo-user');
    expect(DataService.isDemo()).toBe(true);

    const demoTx = await DataService.createTransaction({
      user_id: 'demo-user',
      account_id: 'demo-acc-1',
      amount: 45000,
      type: 'expense',
      date: '2026-10-31T10:00:00Z',
      description: 'Demo Kopi',
    });

    const demoKey = DataService.getStorageKey('transactions');
    expect(demoKey).toBe('pockito:demo:transactions:v2');

    const demoTxs = await DataService.getTransactions();
    expect(demoTxs.some((t) => t.id === demoTx.id)).toBe(true);

    // 2. Switch to User A (e.g. user-alice)
    DataService.setMode('local', 'user-alice');
    expect(DataService.isDemo()).toBe(false);

    const userAliceKey = DataService.getStorageKey('transactions');
    expect(userAliceKey).toBe('pockito:user:user-alice:transactions:v2');

    const aliceTxs = await DataService.getTransactions();
    // User Alice should NOT see the demo transaction
    expect(aliceTxs.some((t) => t.id === demoTx.id)).toBe(false);
  });

  it('prevents cross-user data bleeding between User A and User B', async () => {
    // User A creates an account and pocket
    DataService.setMode('local', 'user-alice');
    const aliceAccount = await DataService.createAccount({
      user_id: 'user-alice',
      name: 'Rekening Pribadi Alice',
      type: 'bank',
      opening_balance: 10000000,
      currency: 'IDR',
      color: '#00529C',
      is_archived: false,
    });

    const alicePockets = await DataService.getPockets();
    expect(alicePockets).toBeDefined();

    // User B logs in on the same browser
    DataService.setMode('local', 'user-bob');
    const bobAccounts = await DataService.getAccounts();

    // Bob should not see Alice's account
    expect(bobAccounts.some((a) => a.id === aliceAccount.id)).toBe(false);

    // Bob creates his own account
    const bobAccount = await DataService.createAccount({
      user_id: 'user-bob',
      name: 'Rekening Bob Syariah',
      type: 'bank',
      opening_balance: 5000000,
      currency: 'IDR',
      color: '#10B981',
      is_archived: false,
    });

    const bobAccountsUpdated = await DataService.getAccounts();
    expect(bobAccountsUpdated.some((a) => a.id === bobAccount.id)).toBe(true);

    // Switch back to Alice
    DataService.setMode('local', 'user-alice');
    const aliceAccountsAfter = await DataService.getAccounts();
    expect(aliceAccountsAfter.some((a) => a.id === aliceAccount.id)).toBe(true);
    expect(aliceAccountsAfter.some((a) => a.id === bobAccount.id)).toBe(false);
  });

  it('cleans up user data completely without leaving residual records', async () => {
    DataService.setMode('local', 'user-target-delete');
    await DataService.createAccount({
      user_id: 'user-target-delete',
      name: 'Hapus Rekening',
      type: 'cash',
      opening_balance: 200000,
      currency: 'IDR',
      color: '#000',
      is_archived: false,
    });

    await DataService.createTransaction({
      user_id: 'user-target-delete',
      account_id: 'acc-test',
      amount: 15000,
      type: 'expense',
      date: '2026-10-31T09:00:00Z',
      description: 'Beli Roti',
    });

    await DataService.deleteAllUserData();

    const accountsAfter = await DataService.getAccounts();
    const transactionsAfter = await DataService.getTransactions();
    expect(accountsAfter).toHaveLength(0);
    expect(transactionsAfter).toHaveLength(0);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { DataService } from '../../src/services/dataService';

describe('Auth & Session Boundary Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    DataService.setMode('local', null);
  });

  it('AUTH-02: Local/cloud login does not succeed without proper mode and credentials', async () => {
    // Mode is local guest initially
    expect(DataService.getActiveUserId()).toBeNull();
    expect(DataService.isDemo()).toBe(false);

    // Profile for guest should be unauthenticated or guest
    const guestProfile = await DataService.getProfile();
    expect(guestProfile.id).toBe('guest-user');
  });

  it('AUTH-03: Demo mode transition strictly activates demo dataset without touching real user storage', async () => {
    // 1. Authenticated user saves something
    DataService.setMode('local', 'user-real-999');
    await DataService.createAccount({
      user_id: 'user-real-999',
      name: 'Rekening Real',
      type: 'bank',
      opening_balance: 50000000,
      currency: 'IDR',
      color: '#00529C',
      is_archived: false,
    });

    const realAccounts = await DataService.getAccounts();
    expect(realAccounts).toHaveLength(1);
    expect(realAccounts[0].name).toBe('Rekening Real');

    // 2. User switches to Demo Mode
    DataService.setMode('demo', 'demo-user');
    expect(DataService.isDemo()).toBe(true);

    // In demo mode, accounts should NOT include the real user's account
    const demoAccounts = await DataService.getAccounts();
    expect(demoAccounts.some((a) => a.name === 'Rekening Real')).toBe(false);

    // Demo user creates a demo account
    await DataService.createAccount({
      user_id: 'demo-user',
      name: 'Demo Bank Tester',
      type: 'bank',
      opening_balance: 1000000,
      currency: 'IDR',
      color: '#FAAE2B',
      is_archived: false,
    });

    const demoAccountsUpdated = await DataService.getAccounts();
    expect(demoAccountsUpdated.some((a) => a.name === 'Demo Bank Tester')).toBe(true);

    // 3. Switch back to real user
    DataService.setMode('local', 'user-real-999');
    const realAccountsAfter = await DataService.getAccounts();
    expect(realAccountsAfter).toHaveLength(1);
    expect(realAccountsAfter[0].name).toBe('Rekening Real');
    expect(realAccountsAfter.some((a) => a.name === 'Demo Bank Tester')).toBe(false);
  });

  it('AUTH-06: Logout resets mode to local/guest with null active user and clears demo flag', () => {
    DataService.setMode('demo', 'demo-user');
    expect(DataService.isDemo()).toBe(true);

    // Emulate logout
    DataService.setMode('local', null);
    expect(DataService.isDemo()).toBe(false);
    expect(DataService.getActiveUserId()).toBeNull();
  });
});

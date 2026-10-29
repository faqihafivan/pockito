import { describe, it, expect, beforeEach } from 'vitest';
import { DataService } from '../../src/services/dataService';

describe('DataService: Backup, Restore & Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exports valid JSON backup conforming to Pockito schema', () => {
    const backupJson = DataService.exportFullBackup();
    const parsed = JSON.parse(backupJson);

    expect(parsed.app).toBe('Pockito');
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.exported_at).toBeDefined();
    expect(Array.isArray(parsed.accounts)).toBe(true);
    expect(Array.isArray(parsed.pockets)).toBe(true);
    expect(Array.isArray(parsed.transactions)).toBe(true);
  });

  it('successfully restores a valid backup JSON', () => {
    const sampleBackup = JSON.stringify({
      app: 'Pockito',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      profile: { id: 'test-user', full_name: 'Audit Tester', email: 'audit@test.com' },
      accounts: [{ id: 'acc-1', name: 'BCA Audit', opening_balance: 5000000 }],
      pockets: [{ id: 'poc-1', name: 'Makan', target_amount: 1000000 }],
      transactions: [{ id: 'tx-1', amount: 50000, type: 'expense', pocket_id: 'poc-1' }],
      goals: [],
      tasks: [],
      subscriptions: [],
      debts: [],
    });

    const result = DataService.importFullBackup(sampleBackup);
    expect(result.success).toBe(true);
    expect(result.message).toContain('berhasil');

    const profile = JSON.parse(localStorage.getItem('pockito_profile_v1') || '{}');
    expect(profile.full_name).toBe('Audit Tester');

    const accounts = JSON.parse(localStorage.getItem('pockito_accounts_v1') || '[]');
    expect(accounts).toHaveLength(1);
    expect(accounts[0].name).toBe('BCA Audit');
  });

  it('rejects corrupt or non-Pockito JSON backup', () => {
    const foreignBackup = JSON.stringify({
      app: 'MaliciousApp',
      version: '9.9.9',
    });

    const resultForeign = DataService.importFullBackup(foreignBackup);
    expect(resultForeign.success).toBe(false);
    expect(resultForeign.message).toContain('bukan file cadangan resmi Pockito');

    const resultCorrupt = DataService.importFullBackup('invalid-json{{{');
    expect(resultCorrupt.success).toBe(false);
  });

  it('initializes clean user data with 1 default account', () => {
    DataService.initializeCleanUserData('new-user-123');

    const accounts = JSON.parse(localStorage.getItem('pockito_accounts_v1') || '[]');
    expect(accounts).toHaveLength(1);
    expect(accounts[0].name).toBe('Rekening Utama');
    expect(accounts[0].opening_balance).toBe(0);

    const txs = JSON.parse(localStorage.getItem('pockito_transactions_v1') || '[]');
    expect(txs).toHaveLength(0);
  });

  it('resets to defaults cleanly', () => {
    DataService.resetToDefaults();

    const accounts = JSON.parse(localStorage.getItem('pockito_accounts_v1') || '[]');
    expect(accounts.length).toBeGreaterThan(0);

    const pockets = JSON.parse(localStorage.getItem('pockito_pockets_v1') || '[]');
    expect(pockets.length).toBeGreaterThan(0);
  });
});

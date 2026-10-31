import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSubscriptionDueDateInfo,
  generateDailyBriefing,
} from '../../src/domain/finance/financialEngine';
import {
  getDeterministicLocalUserId,
} from '../../src/context/AuthContext';
import { DataService } from '../../src/services/dataService';
import { Subscription } from '../../src/types';

describe('Subscription Due Date Precision Tests', () => {
  // Reference date: 31 October 2026 (same as user scenario in screenshot)
  const today31Oct = new Date(2026, 9, 31, 14, 30, 0); // Month is 0-indexed: 9 = October

  it('SUB-01: Does NOT mark future month bills as overdue (BPJS on 10th Nov viewed on 31st Oct)', () => {
    const info = getSubscriptionDueDateInfo(10, '2026-11', false, today31Oct);

    expect(info.status).toBe('upcoming');
    expect(info.diffDays).toBe(10);
    expect(info.badgeLabel).toBe('Belum Bayar');
    expect(info.badgeVariant).toBe('neutral');
    expect(info.dueDateISO).toBe('2026-11-10');
  });

  it('SUB-02: Flags 3-day urgency correctly (Ganti Oli on 3rd Nov viewed on 31st Oct)', () => {
    const info = getSubscriptionDueDateInfo(3, '2026-11', false, today31Oct);

    expect(info.status).toBe('upcoming');
    expect(info.diffDays).toBe(3);
    expect(info.badgeLabel).toBe('3 Hari Lagi');
    expect(info.badgeVariant).toBe('warning');
    expect(info.dueDateISO).toBe('2026-11-03');
  });

  it('SUB-03: Flags 1-day urgency as "Besok!" (1st Nov viewed on 31st Oct)', () => {
    const info = getSubscriptionDueDateInfo(1, '2026-11', false, today31Oct);

    expect(info.status).toBe('upcoming');
    expect(info.diffDays).toBe(1);
    expect(info.badgeLabel).toBe('Besok!');
    expect(info.badgeVariant).toBe('warning');
  });

  it('SUB-04: Flags same-day bill as "Hari Ini!" (10th Nov viewed on 10th Nov)', () => {
    const today10Nov = new Date(2026, 10, 10, 9, 0, 0);
    const info = getSubscriptionDueDateInfo(10, '2026-11', false, today10Nov);

    expect(info.status).toBe('due_today');
    expect(info.diffDays).toBe(0);
    expect(info.badgeLabel).toBe('Hari Ini!');
    expect(info.badgeVariant).toBe('warning');
  });

  it('SUB-05: Strictly marks overdue ONLY when target date has passed (10th Nov viewed on 15th Nov)', () => {
    const today15Nov = new Date(2026, 10, 15, 10, 0, 0);
    const info = getSubscriptionDueDateInfo(10, '2026-11', false, today15Nov);

    expect(info.status).toBe('overdue');
    expect(info.diffDays).toBe(-5);
    expect(info.badgeLabel).toBe('Lewat Tempo');
    expect(info.badgeVariant).toBe('danger');
  });

  it('SUB-06: Unpaid past month bills are marked overdue (10th Oct viewed on 31st Oct)', () => {
    const info = getSubscriptionDueDateInfo(10, '2026-10', false, today31Oct);

    expect(info.status).toBe('overdue');
    expect(info.diffDays).toBe(-21);
    expect(info.badgeLabel).toBe('Lewat Tempo');
  });

  it('SUB-07: Paid bills always return status "paid" and "Lunas"', () => {
    const info = getSubscriptionDueDateInfo(10, '2026-11', true, today31Oct);

    expect(info.status).toBe('paid');
    expect(info.badgeLabel).toBe('Lunas');
    expect(info.badgeVariant).toBe('success');
  });

  it('SUB-08: Caps day of month correctly for short months (e.g. 31st February 2026 -> 28th Feb)', () => {
    const info = getSubscriptionDueDateInfo(31, '2026-02', false, new Date(2026, 1, 1));
    expect(info.dueDateISO).toBe('2026-02-28');
  });

  it('SUB-09: Daily Briefing does not create false overdue alerts for future subscriptions', () => {
    const testSubs: Subscription[] = [
      {
        id: 'sub-bpjs',
        user_id: 'user-1',
        name: 'Bayar BPJS',
        amount: 300000,
        billing_cycle: 'monthly',
        due_day: 10,
        is_active: true,
      },
      {
        id: 'sub-oli',
        user_id: 'user-1',
        name: 'Ganti Oli',
        amount: 70000,
        billing_cycle: 'monthly',
        due_day: 3,
        is_active: true,
      },
    ];

    const briefing = generateDailyBriefing({
      selectedPeriod: '2026-11',
      subscriptions: testSubs,
      transactions: [],
      goals: [],
      tasks: [],
      todayDate: today31Oct,
    });

    const bpjsItem = briefing.items.find((item) => item.id === 'sub-sub-bpjs');
    const oliItem = briefing.items.find((item) => item.id === 'sub-sub-oli');

    // BPJS is 10 days away: should NOT be marked overdue, nor shown in urgent daily items
    expect(bpjsItem).toBeUndefined();

    // Oli is 3 days away: should be shown as upcoming
    expect(oliItem).toBeDefined();
    expect(oliItem?.badge).toBe('3 Hari Lagi');
    expect(oliItem?.title).toContain('3 Hari Lagi');
    expect(oliItem?.badge).not.toBe('Lewat Tempo');
  });
});

describe('Local User Session Persistence & Namespace Migration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    DataService.setMode('local', null);
  });

  it('AUTH-07: getDeterministicLocalUserId produces identical sanitized keys regardless of case/trim', () => {
    const id1 = getDeterministicLocalUserId('faqihunw@gmail.com');
    const id2 = getDeterministicLocalUserId('  FAQIHUNW@GMAIL.COM ');
    expect(id1).toBe('user-local-faqihunw_gmail_com');
    expect(id1).toBe(id2);
  });

  it('AUTH-08: migrateLegacyUserNamespace successfully recovers data from random UUID session', () => {
    const deterministicId = getDeterministicLocalUserId('faqihunw@gmail.com');
    const randomUuid = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

    // Simulate user registered under random UUID previously
    localStorage.setItem(
      `pockito:user:${randomUuid}:profile:v2`,
      JSON.stringify({
        id: randomUuid,
        full_name: 'Faqih',
        email: 'faqihunw@gmail.com',
        monthly_income: 1600000,
      })
    );
    localStorage.setItem(
      `pockito:user:${randomUuid}:accounts:v2`,
      JSON.stringify([
        {
          id: 'acc-1',
          name: 'Rekening Utama',
          opening_balance: 1600000,
        },
      ])
    );

    // Run migration
    DataService.migrateLegacyUserNamespace(deterministicId, 'faqihunw@gmail.com');

    // Check migrated keys exist under deterministic ID
    const migratedProfile = localStorage.getItem(`pockito:user:${deterministicId}:profile:v2`);
    const migratedAccounts = localStorage.getItem(`pockito:user:${deterministicId}:accounts:v2`);

    expect(migratedProfile).toBeTruthy();
    expect(migratedAccounts).toBeTruthy();
    expect(JSON.parse(migratedAccounts || '[]')[0].name).toBe('Rekening Utama');
  });
});

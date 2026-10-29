import { describe, it, expect } from 'vitest';
import { AIScannerService } from '../../src/services/aiScannerService';
import { Account, Pocket } from '../../src/types';

describe('AIScannerService: Indonesian Natural Language & Sample Receipts', () => {
  const mockPockets: Pocket[] = [
    {
      id: 'pocket-food',
      user_id: 'u1',
      name: 'Makan & Minum',
      icon: 'Utensils',
      color: '#FF7A59',
      allocation_percentage: 30,
      is_starred: true,
      sort_order: 1,
    },
    {
      id: 'pocket-bills',
      user_id: 'u1',
      name: 'Kos & Tagihan Rutin',
      icon: 'Home',
      color: '#713B3B',
      allocation_percentage: 25,
      is_starred: true,
      sort_order: 2,
    },
    {
      id: 'pocket-transport',
      user_id: 'u1',
      name: 'Transport & Bensin',
      icon: 'Car',
      color: '#0EA5E9',
      allocation_percentage: 15,
      is_starred: false,
      sort_order: 3,
    },
    {
      id: 'pocket-fun',
      user_id: 'u1',
      name: 'Nongkrong & Hiburan',
      icon: 'Smile',
      color: '#FAAE2B',
      allocation_percentage: 10,
      is_starred: false,
      sort_order: 4,
    },
  ];

  const mockAccounts: Account[] = [
    {
      id: 'acc-bca',
      user_id: 'u1',
      name: 'Bank BCA Utama',
      type: 'bank',
      opening_balance: 1000000,
      currency: 'IDR',
      color: '#00529C',
      is_archived: false,
    },
    {
      id: 'acc-gopay',
      user_id: 'u1',
      name: 'GoPay / QRIS',
      type: 'ewallet',
      opening_balance: 200000,
      currency: 'IDR',
      color: '#00AED6',
      is_archived: false,
    },
    {
      id: 'acc-cash',
      user_id: 'u1',
      name: 'Uang Saku Tunai',
      type: 'cash',
      opening_balance: 50000,
      currency: 'IDR',
      color: '#10B981',
      is_archived: false,
    },
  ];

  describe('parseQuickNote', () => {
    it('parses food note with "rb" suffix and gopay account', () => {
      const result = AIScannerService.parseQuickNote(
        'makan bakso 25rb pakai gopay',
        mockPockets,
        mockAccounts
      );

      expect(result.amount).toBe(25000);
      expect(result.account_id).toBe('acc-gopay');
      expect(result.pocket_id).toBe('pocket-food');
      expect(result.description).toContain('Makan Bakso');
    });

    it('parses transport note with integer amount and cash payment', () => {
      const result = AIScannerService.parseQuickNote(
        'bensin pertalite motor 35000 tunai',
        mockPockets,
        mockAccounts
      );

      expect(result.amount).toBe(35000);
      expect(result.account_id).toBe('acc-cash');
      expect(result.pocket_id).toBe('pocket-transport');
      expect(result.description).toContain('Bensin Pertalite');
    });

    it('parses bills note with "k" suffix and bank account', () => {
      const result = AIScannerService.parseQuickNote(
        'bayar wifi indihome 350k via bca',
        mockPockets,
        mockAccounts
      );

      expect(result.amount).toBe(350000);
      expect(result.account_id).toBe('acc-bca');
      expect(result.pocket_id).toBe('pocket-bills');
    });

    it('parses million "jt" notation correctly', () => {
      const result = AIScannerService.parseQuickNote(
        'sewa kos bulanan 1.5jt bca',
        mockPockets,
        mockAccounts
      );

      expect(result.amount).toBe(1500000);
      expect(result.pocket_id).toBe('pocket-bills');
    });

    it('parses Indonesian date format DD/MM/YYYY (tanggal 28/10/2026)', () => {
      const result = AIScannerService.parseQuickNote(
        'Makan siang soto 25rb BCA tanggal 28/10/2026',
        mockPockets,
        mockAccounts
      );

      expect(result.amount).toBe(25000);
      expect(result.account_id).toBe('acc-bca');
      expect(result.pocket_id).toBe('pocket-food');
      expect(result.date).toBe('2026-10-28');
      expect(result.description).toContain('Makan Siang Soto');
      expect(result.description).not.toContain('28/10/2026');
    });

    it('parses named Indonesian month (28 oktober 2026)', () => {
      const result = AIScannerService.parseQuickNote(
        'Makan siang soto 25rb BCA 28 oktober 2026',
        mockPockets,
        mockAccounts
      );

      expect(result.amount).toBe(25000);
      expect(result.date).toBe('2026-10-28');
      expect(result.description).toContain('Makan Siang Soto');
      expect(result.description).not.toContain('Oktober');
    });

    it('parses spoken Indonesian number words (dua puluh lima ribu)', () => {
      const result = AIScannerService.parseQuickNote(
        'Makan soto dua puluh lima ribu BCA tanggal 28/10/2026',
        mockPockets,
        mockAccounts
      );

      expect(result.amount).toBe(25000);
      expect(result.account_id).toBe('acc-bca');
      expect(result.date).toBe('2026-10-28');
      expect(result.description).toContain('Makan Soto');
    });

    it('parses relative date "kemarin" correctly', () => {
      const result = AIScannerService.parseQuickNote(
        'Beli bensin pertalite 35000 tunai kemarin',
        mockPockets,
        mockAccounts
      );

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const expectedDate = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

      expect(result.amount).toBe(35000);
      expect(result.date).toBe(expectedDate);
      expect(result.account_id).toBe('acc-cash');
      expect(result.pocket_id).toBe('pocket-transport');
      expect(result.description).toContain('Beli Bensin Pertalite');
    });

    it('returns empty safe fallback for blank input', () => {
      const result = AIScannerService.parseQuickNote(
        '   ',
        mockPockets,
        mockAccounts
      );

      expect(result.amount).toBe(0);
      expect(result.description).toBe('');
    });
  });

  describe('Sample Receipts', () => {
    it('provides valid pre-configured sample receipts for zero-config testing', () => {
      const samples = AIScannerService.getSampleReceipts();
      expect(samples.length).toBeGreaterThanOrEqual(3);

      const indomaret = samples.find((s) => s.id === 'sample-indomaret')!;
      expect(indomaret.amount).toBe(47500);

      const parsed = AIScannerService.loadSampleReceipt(indomaret, mockPockets, mockAccounts);
      expect(parsed.amount).toBe(47500);
      expect(parsed.pocket_id).toBe('pocket-food');
      expect(parsed.description).toContain('Indomaret');
      expect(parsed.items?.length).toBe(3);
    });
  });
});

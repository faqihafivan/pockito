import {
  Account,
  Debt,
  DebtPayment,
  Pocket,
  SavingsGoal,
  Subscription,
  SubscriptionPayment,
  Task,
  Transaction,
  UserProfile,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_DEBTS,
  INITIAL_GOALS,
  INITIAL_POCKETS,
  INITIAL_PROFILE,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TASKS,
  INITIAL_TRANSACTIONS,
} from './mockData';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper to safely read and write from localStorage
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to localStorage (${key}):`, err);
  }
}

export class DataService {
  private static activeMode: 'cloud' | 'local' | 'demo' = 'local';
  private static activeUserId: string | null = null;

  public static setMode(mode: 'cloud' | 'local' | 'demo', userId: string | null = null): void {
    this.activeMode = mode;
    this.activeUserId = userId;
  }

  public static getMode(): 'cloud' | 'local' | 'demo' {
    return this.activeMode;
  }

  public static getActiveUserId(): string | null {
    return this.activeUserId;
  }

  public static isCloud(): boolean {
    return this.activeMode === 'cloud' && isSupabaseConfigured() && Boolean(supabase);
  }

  public static isDemo(): boolean {
    return this.activeMode === 'demo';
  }

  /**
   * Generates a strictly isolated namespace for localStorage keys based on mode and user ID.
   * Format:
   * - Demo mode: pockito:demo:<entity>:v2
   * - Authenticated / Local user: pockito:user:<userId>:<entity>:v2
   * - Guest fallback (for tests & backward compatibility): pockito_<entity>_v1
   */
  public static getStorageKey(entity: string): string {
    if (this.activeMode === 'demo') {
      return `pockito:demo:${entity}:v2`;
    }
    if (this.activeUserId) {
      return `pockito:user:${this.activeUserId}:${entity}:v2`;
    }
    // Guest or uninitialized mode defaults to legacy key for backward compatibility
    return `pockito_${entity}_v1`;
  }

  /**
   * Safe getter that checks namespaced key first, then falls back to legacy key if migrating.
   */
  private static readStorage<T>(entity: string, defaultValue: T): T {
    const key = this.getStorageKey(entity);
    const item = localStorage.getItem(key);
    if (item !== null) {
      return getLocalItem<T>(key, defaultValue);
    }

    // If namespaced key is empty and not demo, check legacy key
    if (this.activeMode !== 'demo') {
      const legacyKey = `pockito_${entity}_v1`;
      const legacyItem = localStorage.getItem(legacyKey);
      if (legacyItem !== null) {
        const parsed = getLocalItem<T>(legacyKey, defaultValue);
        // Auto-migrate to active namespaced key
        setLocalItem(key, parsed);
        return parsed;
      }
    }

    return defaultValue;
  }

  private static writeStorage<T>(entity: string, value: T): void {
    const key = this.getStorageKey(entity);
    setLocalItem(key, value);

    // If guest mode, also mirror to legacy key for existing test fixtures
    if (!this.activeUserId && this.activeMode === 'local') {
      setLocalItem(`pockito_${entity}_v1`, value);
    }
  }

  // ===================== PROFILE =====================
  static async getProfile(): Promise<UserProfile> {
    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        throw new Error('Sesi cloud tidak aktif atau telah kedaluwarsa');
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        throw new Error(`Gagal mengambil profil cloud: ${error.message}`);
      }
      return data as UserProfile;
    }

    const defaultProfile = this.isDemo()
      ? INITIAL_PROFILE
      : {
          id: this.activeUserId || 'guest-user',
          full_name: 'Pengguna Pockito',
          email: 'user@pockito.app',
          currency: 'IDR',
          timezone: 'Asia/Jakarta',
          monthly_income: 0,
          onboarding_completed: false,
        };

    return this.readStorage<UserProfile>('profile', defaultProfile);
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        throw new Error('Sesi cloud tidak aktif');
      }
      const updated: UserProfile = {
        ...updates,
        id: user.id,
        full_name: updates.full_name || 'Pengguna',
        email: user.email || updates.email || '',
        currency: updates.currency || 'IDR',
        timezone: updates.timezone || 'Asia/Jakarta',
        monthly_income: updates.monthly_income ?? 0,
        onboarding_completed: updates.onboarding_completed ?? false,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(updated)
        .select()
        .single();
      if (error) {
        throw new Error(`Gagal memperbarui profil di cloud: ${error.message}`);
      }
      return data as UserProfile;
    }

    const current = await this.getProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.writeStorage('profile', updated);
    return updated;
  }

  // ===================== ACCOUNTS =====================
  static async getAccounts(): Promise<Account[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        throw new Error(`Gagal memuat daftar rekening dari cloud: ${error.message}`);
      }
      return (data || []) as Account[];
    }

    const defaults = this.isDemo() ? INITIAL_ACCOUNTS : [];
    return this.readStorage<Account[]>('accounts', defaults);
  }

  static async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const id = generateUUID();
    const newAccount: Account = {
      ...account,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sesi cloud tidak aktif');
      newAccount.user_id = user.id;

      const { data, error } = await supabase
        .from('accounts')
        .insert(newAccount)
        .select()
        .single();
      if (error) {
        throw new Error(`Gagal membuat rekening di cloud: ${error.message}`);
      }
      return data as Account;
    }

    const current = await this.getAccounts();
    const updated = [...current, newAccount];
    this.writeStorage('accounts', updated);
    return newAccount;
  }

  static async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('accounts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(`Gagal mengubah rekening di cloud: ${error.message}`);
      return data as Account;
    }

    const current = await this.getAccounts();
    const index = current.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Rekening ${id} tidak ditemukan`);
    const updated = { ...current[index], ...updates, updated_at: new Date().toISOString() };
    current[index] = updated;
    this.writeStorage('accounts', current);
    return updated;
  }

  static async deleteAccount(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw new Error(`Gagal menghapus rekening di cloud: ${error.message}`);
      return;
    }

    const current = await this.getAccounts();
    const updated = current.filter((a) => a.id !== id);
    this.writeStorage('accounts', updated);
  }

  // ===================== POCKETS =====================
  static async getPockets(): Promise<Pocket[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('pockets')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) {
        throw new Error(`Gagal memuat kantong anggaran dari cloud: ${error.message}`);
      }
      return (data || []) as Pocket[];
    }

    const defaults = this.isDemo() ? INITIAL_POCKETS : [];
    return this.readStorage<Pocket[]>('pockets', defaults);
  }

  static async createPocket(pocket: Omit<Pocket, 'id' | 'created_at' | 'updated_at'>): Promise<Pocket> {
    const id = generateUUID();
    const newPocket: Pocket = {
      ...pocket,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sesi cloud tidak aktif');
      newPocket.user_id = user.id;

      const { data, error } = await supabase
        .from('pockets')
        .insert(newPocket)
        .select()
        .single();
      if (error) {
        throw new Error(`Gagal membuat kantong anggaran di cloud: ${error.message}`);
      }
      return data as Pocket;
    }

    const current = await this.getPockets();
    const updated = [...current, newPocket];
    this.writeStorage('pockets', updated);
    return newPocket;
  }

  static async updatePocket(id: string, updates: Partial<Pocket>): Promise<Pocket> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('pockets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        throw new Error(`Gagal memperbarui kantong anggaran di cloud: ${error.message}`);
      }
      return data as Pocket;
    }

    const current = await this.getPockets();
    const index = current.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Pocket ${id} not found`);

    const updatedPocket: Pocket = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    current[index] = updatedPocket;
    this.writeStorage('pockets', current);
    return updatedPocket;
  }

  static async deletePocket(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      const { error } = await supabase.from('pockets').delete().eq('id', id);
      if (error) {
        throw new Error(`Gagal menghapus kantong di cloud: ${error.message}`);
      }
      return;
    }
    const current = await this.getPockets();
    const updated = current.filter((p) => p.id !== id);
    this.writeStorage('pockets', updated);
  }

  static async savePockets(pockets: Pocket[]): Promise<void> {
    if (this.isCloud() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const sanitized = pockets.map((p) => ({
        ...p,
        user_id: user?.id || p.user_id,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('pockets').upsert(sanitized);
      if (error) {
        throw new Error(`Gagal menyimpan daftar kantong ke cloud: ${error.message}`);
      }
      return;
    }
    this.writeStorage('pockets', pockets);
  }

  // ===================== TRANSACTIONS =====================
  static async getTransactions(): Promise<Transaction[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        throw new Error(`Gagal memuat transaksi dari cloud: ${error.message}`);
      }
      return (data || []) as Transaction[];
    }

    const defaults = this.isDemo() ? INITIAL_TRANSACTIONS : [];
    return this.readStorage<Transaction[]>('transactions', defaults);
  }

  static async createTransaction(tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const id = generateUUID();
    const newTx: Transaction = {
      ...tx,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sesi cloud tidak aktif');
      newTx.user_id = user.id;

      const { data, error } = await supabase
        .from('transactions')
        .insert(newTx)
        .select()
        .single();
      if (error) {
        throw new Error(`Gagal mencatat transaksi di cloud: ${error.message}`);
      }
      return data as Transaction;
    }

    const current = await this.getTransactions();
    const updated = [newTx, ...current];
    this.writeStorage('transactions', updated);
    return newTx;
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(`Gagal memperbarui transaksi di cloud: ${error.message}`);
      return data as Transaction;
    }

    const current = await this.getTransactions();
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Transaksi ${id} tidak ditemukan`);
    const updated = { ...current[index], ...updates, updated_at: new Date().toISOString() };
    current[index] = updated;
    this.writeStorage('transactions', current);
    return updated;
  }

  static async deleteTransaction(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) {
        throw new Error(`Gagal menghapus transaksi dari cloud: ${error.message}`);
      }
      return;
    }
    const current = await this.getTransactions();
    const updated = current.filter((t) => t.id !== id);
    this.writeStorage('transactions', updated);
  }

  static async saveTransactions(transactions: Transaction[]): Promise<void> {
    if (this.isCloud() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const sanitized = transactions.map((t) => ({
        ...t,
        user_id: user?.id || t.user_id,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('transactions').upsert(sanitized);
      if (error) {
        throw new Error(`Gagal menyimpan transaksi ke cloud: ${error.message}`);
      }
      return;
    }
    this.writeStorage('transactions', transactions);
  }

  // ===================== SAVINGS GOALS =====================
  static async getGoals(): Promise<SavingsGoal[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        throw new Error(`Gagal memuat target tabungan dari cloud: ${error.message}`);
      }
      return (data || []) as SavingsGoal[];
    }

    const defaults = this.isDemo() ? INITIAL_GOALS : [];
    return this.readStorage<SavingsGoal[]>('goals', defaults);
  }

  static async createGoal(goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'>): Promise<SavingsGoal> {
    const id = generateUUID();
    const newGoal: SavingsGoal = {
      ...goal,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sesi cloud tidak aktif');
      newGoal.user_id = user.id;

      const { data, error } = await supabase
        .from('savings_goals')
        .insert(newGoal)
        .select()
        .single();
      if (error) {
        throw new Error(`Gagal membuat target tabungan di cloud: ${error.message}`);
      }
      return data as SavingsGoal;
    }

    const current = await this.getGoals();
    const updated = [...current, newGoal];
    this.writeStorage('goals', updated);
    return newGoal;
  }

  static async updateGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('savings_goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(`Gagal memperbarui target tabungan di cloud: ${error.message}`);
      return data as SavingsGoal;
    }

    const current = await this.getGoals();
    const index = current.findIndex((g) => g.id === id);
    if (index === -1) throw new Error(`Goal ${id} not found`);

    const updatedGoal: SavingsGoal = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    current[index] = updatedGoal;
    this.writeStorage('goals', current);
    return updatedGoal;
  }

  static async deleteGoal(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) throw new Error(`Gagal menghapus target tabungan dari cloud: ${error.message}`);
      return;
    }
    const current = await this.getGoals();
    const updated = current.filter((g) => g.id !== id);
    this.writeStorage('goals', updated);
  }

  // ===================== TASKS =====================
  static async getTasks(): Promise<Task[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        throw new Error(`Gagal memuat tugas planner dari cloud: ${error.message}`);
      }
      return (data || []) as Task[];
    }

    const defaults = this.isDemo() ? INITIAL_TASKS : [];
    return this.readStorage<Task[]>('tasks', defaults);
  }

  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const id = generateUUID();
    const newTask: Task = {
      ...task,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sesi cloud tidak aktif');
      newTask.user_id = user.id;

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
      if (error) {
        throw new Error(`Gagal membuat tugas di cloud: ${error.message}`);
      }
      return data as Task;
    }

    const current = await this.getTasks();
    const updated = [newTask, ...current];
    this.writeStorage('tasks', updated);
    return newTask;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(`Gagal memperbarui tugas di cloud: ${error.message}`);
      return data as Task;
    }

    const current = await this.getTasks();
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Task ${id} not found`);

    const updatedTask: Task = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    current[index] = updatedTask;
    this.writeStorage('tasks', current);
    return updatedTask;
  }

  static async deleteTask(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        throw new Error(`Gagal menghapus tugas dari cloud: ${error.message}`);
      }
      return;
    }
    const current = await this.getTasks();
    const updated = current.filter((t) => t.id !== id);
    this.writeStorage('tasks', updated);
  }

  // ===================== SUBSCRIPTIONS =====================
  static async getSubscriptions(): Promise<Subscription[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('due_day', { ascending: true });
      if (error) {
        throw new Error(`Gagal memuat tagihan rutin dari cloud: ${error.message}`);
      }
      return (data || []) as Subscription[];
    }

    const defaults = this.isDemo() ? INITIAL_SUBSCRIPTIONS : [];
    return this.readStorage<Subscription[]>('subscriptions', defaults);
  }

  static async createSubscription(
    subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Subscription> {
    const id = generateUUID();
    const newSub: Subscription = {
      ...subscription,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sesi cloud tidak aktif');
      newSub.user_id = user.id;

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(newSub)
        .select()
        .single();
      if (error) {
        throw new Error(`Gagal membuat tagihan di cloud: ${error.message}`);
      }
      return data as Subscription;
    }

    const current = await this.getSubscriptions();
    const updated = [...current, newSub];
    this.writeStorage('subscriptions', updated);
    return newSub;
  }

  static async updateSubscription(
    id: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(`Gagal memperbarui tagihan di cloud: ${error.message}`);
      return data as Subscription;
    }

    const current = await this.getSubscriptions();
    const index = current.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subscription not found');

    const updatedSub: Subscription = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    current[index] = updatedSub;
    this.writeStorage('subscriptions', current);
    return updatedSub;
  }

  static async deleteSubscription(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) {
        throw new Error(`Gagal menghapus tagihan dari cloud: ${error.message}`);
      }
      return;
    }
    const current = await this.getSubscriptions();
    const updated = current.filter((s) => s.id !== id);
    this.writeStorage('subscriptions', updated);
  }

  // ===================== SUBSCRIPTION PAYMENTS =====================
  static async getSubscriptionPayments(subscriptionId?: string): Promise<SubscriptionPayment[]> {
    if (this.isCloud() && supabase) {
      let query = supabase
        .from('subscription_payments')
        .select('*')
        .order('paid_at', { ascending: false });
      if (subscriptionId) query = query.eq('subscription_id', subscriptionId);
      const { data, error } = await query;
      if (error) throw new Error(`Gagal mengambil riwayat pembayaran tagihan: ${error.message}`);
      return (data || []) as SubscriptionPayment[];
    }

    const all = this.readStorage<SubscriptionPayment[]>('subscription_payments', []);
    return subscriptionId ? all.filter((p) => p.subscription_id === subscriptionId) : all;
  }

  static async createSubscriptionPayment(
    payment: Omit<SubscriptionPayment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SubscriptionPayment> {
    const id = generateUUID();
    const newPayment: SubscriptionPayment = {
      ...payment,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sesi cloud tidak aktif');
      newPayment.user_id = user.id;

      const { data, error } = await supabase
        .from('subscription_payments')
        .insert(newPayment)
        .select()
        .single();
      if (error) throw new Error(`Gagal mencatat pembayaran tagihan di cloud: ${error.message}`);
      return data as SubscriptionPayment;
    }

    const current = await this.getSubscriptionPayments();
    const updated = [newPayment, ...current];
    this.writeStorage('subscription_payments', updated);
    return newPayment;
  }

  // ===================== DEBTS & RECEIVABLES =====================
  static async getDebts(): Promise<Debt[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        throw new Error(`Gagal memuat catatan hutang/piutang dari cloud: ${error.message}`);
      }
      return (data || []) as Debt[];
    }

    const defaults = this.isDemo() ? INITIAL_DEBTS : [];
    return this.readStorage<Debt[]>('debts', defaults);
  }

  static async createDebt(
    debt: Omit<Debt, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Debt> {
    const id = generateUUID();
    const newDebt: Debt = {
      ...debt,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sesi cloud tidak aktif');
      newDebt.user_id = user.id;

      const { data, error } = await supabase
        .from('debts')
        .insert(newDebt)
        .select()
        .single();
      if (error) {
        throw new Error(`Gagal mencatat hutang/piutang di cloud: ${error.message}`);
      }
      return data as Debt;
    }

    const current = await this.getDebts();
    const updated = [...current, newDebt];
    this.writeStorage('debts', updated);
    return newDebt;
  }

  static async updateDebt(
    id: string,
    updates: Partial<Debt>
  ): Promise<Debt> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('debts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(`Gagal memperbarui hutang di cloud: ${error.message}`);
      return data as Debt;
    }

    const current = await this.getDebts();
    const index = current.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Debt record not found');

    const updatedDebt: Debt = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    current[index] = updatedDebt;
    this.writeStorage('debts', current);
    return updatedDebt;
  }

  static async deleteDebt(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) {
        throw new Error(`Gagal menghapus hutang dari cloud: ${error.message}`);
      }
      return;
    }
    const current = await this.getDebts();
    const updated = current.filter((d) => d.id !== id);
    this.writeStorage('debts', updated);
  }

  // ===================== DEBT PAYMENTS =====================
  static async getDebtPayments(debtId?: string): Promise<DebtPayment[]> {
    if (this.isCloud() && supabase) {
      let query = supabase
        .from('debt_payments')
        .select('*')
        .order('paid_at', { ascending: false });
      if (debtId) query = query.eq('debt_id', debtId);
      const { data, error } = await query;
      if (error) throw new Error(`Gagal mengambil riwayat cicilan: ${error.message}`);
      return (data || []) as DebtPayment[];
    }

    const all = this.readStorage<DebtPayment[]>('debt_payments', []);
    return debtId ? all.filter((p) => p.debt_id === debtId) : all;
  }

  static async createDebtPayment(
    payment: Omit<DebtPayment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DebtPayment> {
    const id = generateUUID();
    const newPayment: DebtPayment = {
      ...payment,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sesi cloud tidak aktif');
      newPayment.user_id = user.id;

      const { data, error } = await supabase
        .from('debt_payments')
        .insert(newPayment)
        .select()
        .single();
      if (error) throw new Error(`Gagal mencatat cicilan di cloud: ${error.message}`);
      return data as DebtPayment;
    }

    const current = await this.getDebtPayments();
    const updated = [newPayment, ...current];
    this.writeStorage('debt_payments', updated);
    return newPayment;
  }

  // ===================== RESET & BACKUP =====================
  static initializeCleanUserData(userId: string): void {
    const defaultAccount: Account = {
      id: generateUUID(),
      user_id: userId,
      name: 'Rekening Utama',
      type: 'bank',
      opening_balance: 0,
      currency: 'IDR',
      color: '#00529C',
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.writeStorage('accounts', [defaultAccount]);
    this.writeStorage('transactions', []);
    this.writeStorage('goals', []);
    this.writeStorage('tasks', []);
    this.writeStorage('subscriptions', []);
    this.writeStorage('debts', []);
    this.writeStorage('subscription_payments', []);
    this.writeStorage('debt_payments', []);
  }

  static exportFullBackup(): string {
    const backup = {
      app: 'Pockito',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      profile: this.readStorage('profile', null),
      accounts: this.readStorage('accounts', []),
      pockets: this.readStorage('pockets', []),
      transactions: this.readStorage('transactions', []),
      goals: this.readStorage('goals', []),
      tasks: this.readStorage('tasks', []),
      subscriptions: this.readStorage('subscriptions', []),
      debts: this.readStorage('debts', []),
      subscription_payments: this.readStorage('subscription_payments', []),
      debt_payments: this.readStorage('debt_payments', []),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Format file tidak valid.');
      }
      if (data.app && data.app !== 'Pockito') {
        throw new Error('File ini bukan file cadangan resmi Pockito.');
      }

      if (data.profile) this.writeStorage('profile', data.profile);
      if (Array.isArray(data.accounts)) this.writeStorage('accounts', data.accounts);
      if (Array.isArray(data.pockets)) this.writeStorage('pockets', data.pockets);
      if (Array.isArray(data.transactions)) this.writeStorage('transactions', data.transactions);
      if (Array.isArray(data.goals)) this.writeStorage('goals', data.goals);
      if (Array.isArray(data.tasks)) this.writeStorage('tasks', data.tasks);
      if (Array.isArray(data.subscriptions)) this.writeStorage('subscriptions', data.subscriptions);
      if (Array.isArray(data.debts)) this.writeStorage('debts', data.debts);
      if (Array.isArray(data.subscription_payments)) this.writeStorage('subscription_payments', data.subscription_payments);
      if (Array.isArray(data.debt_payments)) this.writeStorage('debt_payments', data.debt_payments);

      return { success: true, message: 'Cadangan data berhasil dipulihkan!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal membaca file cadangan.' };
    }
  }

  static resetToDefaults(): void {
    this.writeStorage('profile', INITIAL_PROFILE);
    this.writeStorage('accounts', INITIAL_ACCOUNTS);
    this.writeStorage('pockets', INITIAL_POCKETS);
    this.writeStorage('transactions', INITIAL_TRANSACTIONS);
    this.writeStorage('goals', INITIAL_GOALS);
    this.writeStorage('tasks', INITIAL_TASKS);
    this.writeStorage('subscriptions', INITIAL_SUBSCRIPTIONS);
    this.writeStorage('debts', INITIAL_DEBTS);
    this.writeStorage('subscription_payments', []);
    this.writeStorage('debt_payments', []);
  }

  static async deleteAllUserData(): Promise<void> {
    if (this.isCloud() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Cascade delete in child-first order to satisfy FK constraints
        await supabase.from('subscription_payments').delete().eq('user_id', user.id);
        await supabase.from('debt_payments').delete().eq('user_id', user.id);
        await supabase.from('transactions').delete().eq('user_id', user.id);
        await supabase.from('pockets').delete().eq('user_id', user.id);
        await supabase.from('accounts').delete().eq('user_id', user.id);
        await supabase.from('savings_goals').delete().eq('user_id', user.id); // Fixed: was 'goals'!
        await supabase.from('tasks').delete().eq('user_id', user.id);
        await supabase.from('subscriptions').delete().eq('user_id', user.id);
        await supabase.from('debts').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
      }
    }

    const entities = [
      'profile',
      'accounts',
      'pockets',
      'transactions',
      'goals',
      'tasks',
      'subscriptions',
      'debts',
      'subscription_payments',
      'debt_payments',
    ];
    entities.forEach((entity) => {
      localStorage.removeItem(this.getStorageKey(entity));
      localStorage.removeItem(`pockito_${entity}_v1`);
    });
    localStorage.removeItem('pockito_demo_user');
    localStorage.removeItem('pockito_privacy_mode');
  }
}

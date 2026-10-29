import {
  Account,
  Debt,
  Pocket,
  SavingsGoal,
  Subscription,
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

const STORAGE_KEYS = {
  PROFILE: 'pockito_profile_v1',
  ACCOUNTS: 'pockito_accounts_v1',
  POCKETS: 'pockito_pockets_v1',
  TRANSACTIONS: 'pockito_transactions_v1',
  GOALS: 'pockito_goals_v1',
  TASKS: 'pockito_tasks_v1',
  SUBSCRIPTIONS: 'pockito_subscriptions_v1',
  DEBTS: 'pockito_debts_v1',
};

// Helper to read and write from localStorage safely
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
  private static isCloud(): boolean {
    return isSupabaseConfigured() && Boolean(supabase?.auth.getSession());
  }

  // ===================== PROFILE =====================
  static async getProfile(): Promise<UserProfile> {
    if (this.isCloud() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!error && data) return data as UserProfile;
      }
    }
    return getLocalItem<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({ ...updated, id: user.id });
      }
    }

    setLocalItem(STORAGE_KEYS.PROFILE, updated);
    return updated;
  }

  // ===================== ACCOUNTS =====================
  static async getAccounts(): Promise<Account[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('accounts').select('*').order('created_at', { ascending: true });
      if (!error && data) return data as Account[];
    }
    return getLocalItem<Account[]>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
  }

  static async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const newAccount: Account = {
      ...account,
      id: 'acc-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('accounts').insert(newAccount).select().single();
      if (!error && data) return data as Account;
    }

    const current = await this.getAccounts();
    const updated = [...current, newAccount];
    setLocalItem(STORAGE_KEYS.ACCOUNTS, updated);
    return newAccount;
  }

  // ===================== POCKETS =====================
  static async getPockets(): Promise<Pocket[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('pockets').select('*').order('sort_order', { ascending: true });
      if (!error && data) return data as Pocket[];
    }
    return getLocalItem<Pocket[]>(STORAGE_KEYS.POCKETS, INITIAL_POCKETS);
  }

  static async createPocket(pocket: Omit<Pocket, 'id' | 'created_at' | 'updated_at'>): Promise<Pocket> {
    const newPocket: Pocket = {
      ...pocket,
      id: 'pocket-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('pockets').insert(newPocket).select().single();
      if (!error && data) return data as Pocket;
    }

    const current = await this.getPockets();
    const updated = [...current, newPocket];
    setLocalItem(STORAGE_KEYS.POCKETS, updated);
    return newPocket;
  }

  static async updatePocket(id: string, updates: Partial<Pocket>): Promise<Pocket> {
    const current = await this.getPockets();
    const index = current.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Pocket ${id} not found`);

    const updatedPocket: Pocket = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      await supabase.from('pockets').update(updatedPocket).eq('id', id);
    }

    current[index] = updatedPocket;
    setLocalItem(STORAGE_KEYS.POCKETS, current);
    return updatedPocket;
  }

  static async deletePocket(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      await supabase.from('pockets').delete().eq('id', id);
    }
    const current = await this.getPockets();
    const updated = current.filter((p) => p.id !== id);
    setLocalItem(STORAGE_KEYS.POCKETS, updated);
  }

  static async savePockets(pockets: Pocket[]): Promise<void> {
    if (this.isCloud() && supabase) {
      await supabase.from('pockets').upsert(pockets);
    }
    setLocalItem(STORAGE_KEYS.POCKETS, pockets);
  }

  // ===================== TRANSACTIONS =====================
  static async getTransactions(): Promise<Transaction[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (!error && data) return data as Transaction[];
    }
    return getLocalItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }

  static async createTransaction(tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('transactions').insert(newTx).select().single();
      if (!error && data) return data as Transaction;
    }

    const current = await this.getTransactions();
    const updated = [newTx, ...current];
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, updated);
    return newTx;
  }

  static async deleteTransaction(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      await supabase.from('transactions').delete().eq('id', id);
    }
    const current = await this.getTransactions();
    const updated = current.filter((t) => t.id !== id);
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, updated);
  }

  static async saveTransactions(transactions: Transaction[]): Promise<void> {
    if (this.isCloud() && supabase) {
      await supabase.from('transactions').upsert(transactions);
    }
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  // ===================== SAVINGS GOALS =====================
  static async getGoals(): Promise<SavingsGoal[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('savings_goals').select('*').order('created_at', { ascending: true });
      if (!error && data) return data as SavingsGoal[];
    }
    return getLocalItem<SavingsGoal[]>(STORAGE_KEYS.GOALS, INITIAL_GOALS);
  }

  static async createGoal(goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'>): Promise<SavingsGoal> {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'goal-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('savings_goals').insert(newGoal).select().single();
      if (!error && data) return data as SavingsGoal;
    }

    const current = await this.getGoals();
    const updated = [...current, newGoal];
    setLocalItem(STORAGE_KEYS.GOALS, updated);
    return newGoal;
  }

  static async updateGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const current = await this.getGoals();
    const index = current.findIndex((g) => g.id === id);
    if (index === -1) throw new Error(`Goal ${id} not found`);

    const updatedGoal: SavingsGoal = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      await supabase.from('savings_goals').update(updatedGoal).eq('id', id);
    }

    current[index] = updatedGoal;
    setLocalItem(STORAGE_KEYS.GOALS, current);
    return updatedGoal;
  }

  // ===================== TASKS =====================
  static async getTasks(): Promise<Task[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Task[];
    }
    return getLocalItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
      if (!error && data) return data as Task;
    }

    const current = await this.getTasks();
    const updated = [newTask, ...current];
    setLocalItem(STORAGE_KEYS.TASKS, updated);
    return newTask;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const current = await this.getTasks();
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Task ${id} not found`);

    const updatedTask: Task = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      await supabase.from('tasks').update(updatedTask).eq('id', id);
    }

    current[index] = updatedTask;
    setLocalItem(STORAGE_KEYS.TASKS, current);
    return updatedTask;
  }

  static async deleteTask(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      await supabase.from('tasks').delete().eq('id', id);
    }
    const current = await this.getTasks();
    const updated = current.filter((t) => t.id !== id);
    setLocalItem(STORAGE_KEYS.TASKS, updated);
  }

  // ===================== SUBSCRIPTIONS =====================
  static async getSubscriptions(): Promise<Subscription[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('due_day', { ascending: true });
      if (!error && data) return data;
    }
    return getLocalItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  }

  static async createSubscription(
    subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Subscription> {
    const newSub: Subscription = {
      ...subscription,
      id: 'sub-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('subscriptions').insert(newSub).select().single();
      if (!error && data) return data;
    }

    const current = await this.getSubscriptions();
    current.push(newSub);
    setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, current);
    return newSub;
  }

  static async updateSubscription(
    id: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    const current = await this.getSubscriptions();
    const index = current.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subscription not found');

    const updatedSub: Subscription = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      await supabase.from('subscriptions').update(updatedSub).eq('id', id);
    }

    current[index] = updatedSub;
    setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, current);
    return updatedSub;
  }

  static async deleteSubscription(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      await supabase.from('subscriptions').delete().eq('id', id);
    }
    const current = await this.getSubscriptions();
    const updated = current.filter((s) => s.id !== id);
    setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, updated);
  }

  // ===================== DEBTS & RECEIVABLES =====================
  static async getDebts(): Promise<Debt[]> {
    if (this.isCloud() && supabase) {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalItem<Debt[]>(STORAGE_KEYS.DEBTS, INITIAL_DEBTS);
  }

  static async createDebt(
    debt: Omit<Debt, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Debt> {
    const newDebt: Debt = {
      ...debt,
      id: 'debt-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      const { data, error } = await supabase.from('debts').insert(newDebt).select().single();
      if (!error && data) return data;
    }

    const current = await this.getDebts();
    current.push(newDebt);
    setLocalItem(STORAGE_KEYS.DEBTS, current);
    return newDebt;
  }

  static async updateDebt(
    id: string,
    updates: Partial<Debt>
  ): Promise<Debt> {
    const current = await this.getDebts();
    const index = current.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Debt record not found');

    const updatedDebt: Debt = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (this.isCloud() && supabase) {
      await supabase.from('debts').update(updatedDebt).eq('id', id);
    }

    current[index] = updatedDebt;
    setLocalItem(STORAGE_KEYS.DEBTS, current);
    return updatedDebt;
  }

  static async deleteDebt(id: string): Promise<void> {
    if (this.isCloud() && supabase) {
      await supabase.from('debts').delete().eq('id', id);
    }
    const current = await this.getDebts();
    const updated = current.filter((d) => d.id !== id);
    setLocalItem(STORAGE_KEYS.DEBTS, updated);
  }

  // ===================== RESET & BACKUP =====================
  static initializeCleanUserData(userId: string): void {
    const defaultAccount: Account = {
      id: 'acc-' + Math.random().toString(36).substring(2, 9),
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
    setLocalItem(STORAGE_KEYS.ACCOUNTS, [defaultAccount]);
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, []);
    setLocalItem(STORAGE_KEYS.GOALS, []);
    setLocalItem(STORAGE_KEYS.TASKS, []);
    setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, []);
    setLocalItem(STORAGE_KEYS.DEBTS, []);
  }

  static exportFullBackup(): string {
    const backup = {
      app: 'Pockito',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      profile: getLocalItem(STORAGE_KEYS.PROFILE, null),
      accounts: getLocalItem(STORAGE_KEYS.ACCOUNTS, []),
      pockets: getLocalItem(STORAGE_KEYS.POCKETS, []),
      transactions: getLocalItem(STORAGE_KEYS.TRANSACTIONS, []),
      goals: getLocalItem(STORAGE_KEYS.GOALS, []),
      tasks: getLocalItem(STORAGE_KEYS.TASKS, []),
      subscriptions: getLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, []),
      debts: getLocalItem(STORAGE_KEYS.DEBTS, []),
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

      if (data.profile) setLocalItem(STORAGE_KEYS.PROFILE, data.profile);
      if (Array.isArray(data.accounts)) setLocalItem(STORAGE_KEYS.ACCOUNTS, data.accounts);
      if (Array.isArray(data.pockets)) setLocalItem(STORAGE_KEYS.POCKETS, data.pockets);
      if (Array.isArray(data.transactions)) setLocalItem(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      if (Array.isArray(data.goals)) setLocalItem(STORAGE_KEYS.GOALS, data.goals);
      if (Array.isArray(data.tasks)) setLocalItem(STORAGE_KEYS.TASKS, data.tasks);
      if (Array.isArray(data.subscriptions)) setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, data.subscriptions);
      if (Array.isArray(data.debts)) setLocalItem(STORAGE_KEYS.DEBTS, data.debts);

      return { success: true, message: 'Cadangan data berhasil dipulihkan!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal membaca file cadangan.' };
    }
  }

  static resetToDefaults(): void {
    setLocalItem(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    setLocalItem(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
    setLocalItem(STORAGE_KEYS.POCKETS, INITIAL_POCKETS);
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setLocalItem(STORAGE_KEYS.GOALS, INITIAL_GOALS);
    setLocalItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    setLocalItem(STORAGE_KEYS.DEBTS, INITIAL_DEBTS);
  }

  static async deleteAllUserData(): Promise<void> {
    if (this.isCloud() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('transactions').delete().eq('user_id', user.id);
        await supabase.from('pockets').delete().eq('user_id', user.id);
        await supabase.from('accounts').delete().eq('user_id', user.id);
        await supabase.from('goals').delete().eq('user_id', user.id);
        await supabase.from('tasks').delete().eq('user_id', user.id);
        await supabase.from('subscriptions').delete().eq('user_id', user.id);
        await supabase.from('debts').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
      }
    }
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('pockito_demo_user');
  }
}

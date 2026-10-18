import {
  Account,
  Pocket,
  SavingsGoal,
  Task,
  Transaction,
  UserProfile,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_GOALS,
  INITIAL_POCKETS,
  INITIAL_PROFILE,
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

  // ===================== RESET & BACKUP =====================
  static resetToDefaults(): void {
    setLocalItem(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    setLocalItem(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
    setLocalItem(STORAGE_KEYS.POCKETS, INITIAL_POCKETS);
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setLocalItem(STORAGE_KEYS.GOALS, INITIAL_GOALS);
    setLocalItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
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

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Account,
  FinancialOverview,
  Pocket,
  PocketSummary,
  SavingsGoal,
  Task,
  Transaction,
} from '../types';
import { DataService } from '../services/dataService';
import {
  calculateFinancialOverview,
  calculatePocketSummaries,
} from '../domain/finance/financialEngine';
import { useAuth } from './AuthContext';

interface DataContextType {
  accounts: Account[];
  pockets: Pocket[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  tasks: Task[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  pocketSummaries: PocketSummary[];
  overview: FinancialOverview;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Pockets CRUD
  addPocket: (pocket: Omit<Pocket, 'id' | 'created_at' | 'updated_at'>) => Promise<Pocket>;
  updatePocket: (id: string, updates: Partial<Pocket>) => Promise<Pocket>;
  deletePocket: (id: string) => Promise<void>;
  savePockets: (pockets: Pocket[]) => Promise<void>;

  // Transactions CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;

  // Accounts CRUD
  addAccount: (account: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => Promise<Account>;

  // Goals CRUD
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'>) => Promise<SavingsGoal>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<SavingsGoal>;

  // Tasks CRUD
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;

  resetToDefaults: () => Promise<void>;
  clearTransactionsAndResetBalance: () => Promise<void>;
  deleteAllUserData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Default to current year-month (e.g. '2026-10')
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [accs, pocks, txs, gls, tsks] = await Promise.all([
        DataService.getAccounts(),
        DataService.getPockets(),
        DataService.getTransactions(),
        DataService.getGoals(),
        DataService.getTasks(),
      ]);
      setAccounts(accs);
      setPockets(pocks);
      setTransactions(txs);
      setGoals(gls);
      setTasks(tsks);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user?.id]);

  // Derived summaries using financial domain engine
  const monthlyIncome = user?.monthly_income || 0;

  const pocketSummaries = useMemo(() => {
    return calculatePocketSummaries(pockets, monthlyIncome, transactions, selectedPeriod);
  }, [pockets, monthlyIncome, transactions, selectedPeriod]);

  const overview = useMemo(() => {
    return calculateFinancialOverview(accounts, pockets, monthlyIncome, transactions, selectedPeriod);
  }, [accounts, pockets, monthlyIncome, transactions, selectedPeriod]);

  // Pocket Mutations
  const addPocket = async (pocketData: Omit<Pocket, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await DataService.createPocket(pocketData);
    setPockets((prev) => [...prev, created]);
    return created;
  };

  const updatePocket = async (id: string, updates: Partial<Pocket>) => {
    const updated = await DataService.updatePocket(id, updates);
    setPockets((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deletePocket = async (id: string) => {
    await DataService.deletePocket(id);
    setPockets((prev) => prev.filter((p) => p.id !== id));
  };

  const savePockets = async (newPockets: Pocket[]) => {
    await DataService.savePockets(newPockets);
    setPockets(newPockets);
  };

  // Transaction Mutations
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await DataService.createTransaction(txData);
    setTransactions((prev) => [created, ...prev]);
    return created;
  };

  const deleteTransaction = async (id: string) => {
    await DataService.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Account Mutations
  const addAccount = async (accData: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await DataService.createAccount(accData);
    setAccounts((prev) => [...prev, created]);
    return created;
  };

  // Goals Mutations
  const addGoal = async (goalData: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await DataService.createGoal(goalData);
    setGoals((prev) => [...prev, created]);
    return created;
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const updated = await DataService.updateGoal(id, updates);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  };

  // Tasks Mutations
  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await DataService.createTask(taskData);
    setTasks((prev) => [created, ...prev]);
    return created;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await DataService.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id: string) => {
    await DataService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const isCompleted = !task.is_completed;
    await updateTask(id, {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : undefined,
    });
  };

  const resetToDefaults = async () => {
    DataService.resetToDefaults();
    await loadAllData();
  };

  const clearTransactionsAndResetBalance = async () => {
    DataService.initializeCleanUserData(user?.id || 'user-1');
    await loadAllData();
  };

  const deleteAllUserData = async () => {
    await DataService.deleteAllUserData();
    setAccounts([]);
    setPockets([]);
    setTransactions([]);
    setGoals([]);
    setTasks([]);
  };

  return (
    <DataContext.Provider
      value={{
        accounts,
        pockets,
        transactions,
        goals,
        tasks,
        selectedPeriod,
        setSelectedPeriod,
        pocketSummaries,
        overview,
        isLoading,
        refreshData: loadAllData,
        addPocket,
        updatePocket,
        deletePocket,
        savePockets,
        addTransaction,
        deleteTransaction,
        addAccount,
        addGoal,
        updateGoal,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        resetToDefaults,
        clearTransactionsAndResetBalance,
        deleteAllUserData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

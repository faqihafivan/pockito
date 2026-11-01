import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Account,
  DailyBriefingResult,
  DailySafeLimitResult,
  Debt,
  DebtPayment,
  EmergencyRunwayResult,
  FinancialOverview,
  Pocket,
  PocketSummary,
  SavingsGoal,
  Subscription,
  SubscriptionPayment,
  Task,
  Transaction,
} from '../types';
import { DataService } from '../services/dataService';
import {
  calculateDailySafeLimit,
  calculateEmergencyRunway,
  calculateFinancialOverview,
  calculatePocketSummaries,
  formatIDRPrivacy,
  formatPeriod,
  generateDailyBriefing,
  getLocalDateString,
  getLocalSafeISOString,
} from '../domain/finance/financialEngine';
import { useAuth } from './AuthContext';

interface DataContextType {
  accounts: Account[];
  pockets: Pocket[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  tasks: Task[];
  subscriptions: Subscription[];
  subscriptionPayments: SubscriptionPayment[];
  debts: Debt[];
  debtPayments: DebtPayment[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  pocketSummaries: PocketSummary[];
  overview: FinancialOverview;
  dailySafeLimit: DailySafeLimitResult;
  emergencyRunway: EmergencyRunwayResult;
  dailyBriefing: DailyBriefingResult;
  isBriefingOpen: boolean;
  openBriefing: () => void;
  closeBriefing: () => void;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  formatMoney: (amount: number, prefix?: boolean) => string;
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
  saveTransactions: (txs: Transaction[]) => Promise<void>;

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

  // Subscriptions CRUD & Actions
  addSubscription: (sub: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => Promise<Subscription>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<Subscription>;
  deleteSubscription: (id: string) => Promise<void>;
  paySubscription: (id: string, period: string, accountId?: string, paidAtDate?: string) => Promise<Transaction>;

  // Debts CRUD & Actions
  addDebt: (debt: Omit<Debt, 'id' | 'created_at' | 'updated_at'>) => Promise<Debt>;
  updateDebt: (id: string, updates: Partial<Debt>) => Promise<Debt>;
  deleteDebt: (id: string) => Promise<void>;
  recordDebtPayment: (
    id: string,
    paymentAmount: number,
    accountId?: string,
    createTransactionRecord?: boolean,
    paidAtDate?: string
  ) => Promise<Debt>;

  resetToDefaults: () => Promise<void>;
  clearTransactionsAndResetBalance: () => Promise<void>;
  deleteAllUserData: () => Promise<void>;
  exportBackup: () => string;
  importBackup: (jsonString: string) => Promise<{ success: boolean; message: string }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPayment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
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
      const [accs, pocks, txs, gls, tsks, subs, subPmts, dbts, dbtPmts] = await Promise.all([
        DataService.getAccounts(),
        DataService.getPockets(),
        DataService.getTransactions(),
        DataService.getGoals(),
        DataService.getTasks(),
        DataService.getSubscriptions(),
        DataService.getSubscriptionPayments(),
        DataService.getDebts(),
        DataService.getDebtPayments(),
      ]);
      setAccounts(accs);
      setPockets(pocks);
      setTransactions(txs);
      setGoals(gls);
      setTasks(tsks);
      setSubscriptions(subs);
      setSubscriptionPayments(subPmts);
      setDebts(dbts);
      setDebtPayments(dbtPmts);
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

  const dailySafeLimit = useMemo(() => {
    return calculateDailySafeLimit(pocketSummaries, transactions, selectedPeriod);
  }, [pocketSummaries, transactions, selectedPeriod]);

  // Privacy Mode State (Masking sensitive balance numbers)
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pockito_privacy_mode') === 'true';
    } catch {
      return false;
    }
  });

  const togglePrivacyMode = () => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pockito_privacy_mode', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const formatMoney = (amount: number, prefix: boolean = true) => {
    return formatIDRPrivacy(amount, isPrivacyMode, prefix);
  };

  // Emergency Fund Runway (Ketahanan Dana Darurat - strictly liquid cash vs essential budget)
  const emergencyRunway = useMemo(() => {
    return calculateEmergencyRunway(accounts, pockets, overview, monthlyIncome, undefined, transactions);
  }, [accounts, pockets, overview, monthlyIncome, transactions]);

  // Daily Consolidated Briefing Modal & Metrics
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);
  const openBriefing = () => setIsBriefingOpen(true);
  const closeBriefing = () => setIsBriefingOpen(false);

  const dailyBriefing = useMemo(() => {
    return generateDailyBriefing({
      userName: user?.full_name || 'Kawan',
      selectedPeriod,
      subscriptions,
      transactions,
      goals,
      tasks,
      debts,
      dailySafeLimit,
      formatMoney,
    });
  }, [
    user?.full_name,
    selectedPeriod,
    subscriptions,
    transactions,
    goals,
    tasks,
    debts,
    dailySafeLimit,
    formatMoney,
  ]);

  // Full Backup & Restore
  const exportBackup = () => {
    return DataService.exportFullBackup();
  };

  const importBackup = async (jsonString: string) => {
    const result = DataService.importFullBackup(jsonString);
    if (result.success) {
      await loadAllData();
    }
    return result;
  };

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

  const saveTransactions = async (newTransactions: Transaction[]) => {
    await DataService.saveTransactions(newTransactions);
    setTransactions(newTransactions);
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

  // Subscriptions Mutations & Actions
  const addSubscription = async (subData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await DataService.createSubscription(subData);
    setSubscriptions((prev) => [...prev, created]);
    return created;
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    const updated = await DataService.updateSubscription(id, updates);
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteSubscription = async (id: string) => {
    await DataService.deleteSubscription(id);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const paySubscription = async (
    id: string,
    period: string,
    accountId?: string,
    paidAtDate?: string
  ): Promise<Transaction> => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) throw new Error('Tagihan rutin tidak ditemukan');

    // Anti-duplicate check (P1-02)
    const existingPayments = await DataService.getSubscriptionPayments(id);
    const alreadyPaid = existingPayments.some(
      (p) => p.period === period && p.status === 'paid'
    );
    if (alreadyPaid) {
      throw new Error(`Tagihan "${sub.name}" sudah dibayar untuk periode ${formatPeriod(period, true)}.`);
    }

    const targetAccount = accountId || sub.account_id || accounts[0]?.id;
    if (!targetAccount) throw new Error('Pilih rekening untuk pembayaran');

    const paymentDate = paidAtDate || getLocalSafeISOString();

    // 1. Create Ledger expense transaction
    const createdTx = await addTransaction({
      user_id: user?.id || 'user-1',
      account_id: targetAccount,
      pocket_id: sub.category_pocket_id,
      type: 'expense',
      amount: sub.amount,
      date: paymentDate,
      description: `Tagihan Rutin: ${sub.name} (${formatPeriod(period, true)})`,
      notes: sub.notes,
    });

    try {
      // 2. Create explicit SubscriptionPayment record
      const paymentRecord = await DataService.createSubscriptionPayment({
        subscription_id: sub.id,
        user_id: user?.id || 'user-1',
        period,
        due_date: `${period}-${String(sub.due_day).padStart(2, '0')}`,
        paid_at: paymentDate,
        recorded_at: new Date().toISOString(),
        amount: sub.amount,
        account_id: targetAccount,
        transaction_id: createdTx.id,
        status: 'paid',
        notes: sub.notes,
      });

      setSubscriptionPayments((prev) => [paymentRecord, ...prev]);

      // 3. Update subscription last_paid_period
      await updateSubscription(id, { last_paid_period: period });

      return createdTx;
    } catch (err) {
      // Compensatory Rollback: remove created transaction so user balance is not wrongfully deducted on failure
      try {
        await deleteTransaction(createdTx.id);
      } catch (rollbackErr) {
        console.error('Failed to rollback created transaction for subscription payment:', rollbackErr);
      }
      throw new Error(
        `Pembayaran tagihan gagal diproses: ${
          (err as Error).message || 'Terjadi kesalahan sistem'
        }. Transaksi dibatalkan untuk menjaga konsistensi saldo.`
      );
    }
  };

  // Debts Mutations & Actions
  const addDebt = async (debtData: Omit<Debt, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await DataService.createDebt(debtData);
    setDebts((prev) => [created, ...prev]);
    return created;
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    const updated = await DataService.updateDebt(id, updates);
    setDebts((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  };

  const deleteDebt = async (id: string) => {
    await DataService.deleteDebt(id);
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const recordDebtPayment = async (
    id: string,
    paymentAmount: number,
    accountId?: string,
    createTransactionRecord: boolean = true,
    paidAtDate?: string
  ): Promise<Debt> => {
    const debt = debts.find((d) => d.id === id);
    if (!debt) throw new Error('Catatan hutang/piutang tidak ditemukan');

    if (paymentAmount <= 0) {
      throw new Error('Nominal pembayaran harus lebih besar dari Rp 0');
    }

    const remaining = Math.max(0, debt.amount - debt.paid_amount);
    if (paymentAmount > remaining) {
      throw new Error(`Nominal pembayaran (${formatMoney(paymentAmount)}) melebihi sisa (${formatMoney(remaining)})`);
    }

    const newPaidAmount = debt.paid_amount + paymentAmount;
    const isSettled = newPaidAmount >= debt.amount;
    const paymentDate = paidAtDate || getLocalSafeISOString();

    const originalPaidAmount = debt.paid_amount;
    const originalIsSettled = debt.is_settled;

    // 1. Update debt record
    const updatedDebt = await updateDebt(id, {
      paid_amount: newPaidAmount,
      is_settled: isSettled,
    });

    let createdTx: Transaction | undefined;
    try {
      // 2. Create ledger transaction if linked to an account
      if (createTransactionRecord && accountId && paymentAmount > 0) {
        if (debt.type === 'receivable') {
          // Someone paid back money to us -> income
          createdTx = await addTransaction({
            user_id: user?.id || 'user-1',
            account_id: accountId,
            pocket_id: debt.pocket_id,
            type: 'income',
            amount: paymentAmount,
            date: paymentDate,
            description: `Pelunasan Piutang: ${debt.person_name} (${debt.description})`,
          });
        } else {
          // We paid our debt/installment -> expense
          createdTx = await addTransaction({
            user_id: user?.id || 'user-1',
            account_id: accountId,
            pocket_id: debt.pocket_id,
            type: 'expense',
            amount: paymentAmount,
            date: paymentDate,
            description: `Bayar Hutang/Cicilan: ${debt.person_name} (${debt.description})`,
          });
        }
      }

      // 3. Create DebtPayment record
      const paymentRecord = await DataService.createDebtPayment({
        debt_id: debt.id,
        user_id: user?.id || 'user-1',
        amount: paymentAmount,
        paid_at: paymentDate,
        account_id: accountId || null,
        transaction_id: createdTx?.id || null,
        notes: `Pembayaran cicilan untuk ${debt.person_name}`,
      });

      setDebtPayments((prev) => [paymentRecord, ...prev]);

      return updatedDebt;
    } catch (err) {
      // Compensatory Rollback: revert debt record and delete created transaction
      try {
        await updateDebt(id, {
          paid_amount: originalPaidAmount,
          is_settled: originalIsSettled,
        });
        if (createdTx) {
          await deleteTransaction(createdTx.id);
        }
      } catch (rollbackErr) {
        console.error('Failed to rollback debt payment state:', rollbackErr);
      }
      throw new Error(
        `Pembayaran hutang/piutang gagal diproses: ${
          (err as Error).message || 'Terjadi kesalahan sistem'
        }. Perubahan telah dibatalkan untuk menjaga konsistensi saldo.`
      );
    }
  };

  const resetToDefaults = async () => {
    DataService.resetToDefaults();
    await loadAllData();
  };

  const clearTransactionsAndResetBalance = async () => {
    const userId = user?.id || 'user-1';
    DataService.initializeCleanUserData(userId);
    const userIncome = user?.monthly_income || 0;
    if (userIncome > 0) {
      const accounts = await DataService.getAccounts();
      const primaryAccount = accounts[0];
      if (primaryAccount) {
        await DataService.createTransaction({
          user_id: userId,
          account_id: primaryAccount.id,
          amount: userIncome,
          type: 'income',
          description: 'Pemasukan Gaji Awal',
          date: getLocalDateString(),
        });
      }
    }
    await loadAllData();
  };

  const deleteAllUserData = async () => {
    await DataService.deleteAllUserData();
    setAccounts([]);
    setPockets([]);
    setTransactions([]);
    setGoals([]);
    setTasks([]);
    setSubscriptions([]);
    setSubscriptionPayments([]);
    setDebts([]);
    setDebtPayments([]);
  };

  return (
    <DataContext.Provider
      value={{
        accounts,
        pockets,
        transactions,
        goals,
        tasks,
        subscriptions,
        subscriptionPayments,
        debts,
        debtPayments,
        selectedPeriod,
        setSelectedPeriod,
        pocketSummaries,
        overview,
        dailySafeLimit,
        emergencyRunway,
        dailyBriefing,
        isBriefingOpen,
        openBriefing,
        closeBriefing,
        isPrivacyMode,
        togglePrivacyMode,
        formatMoney,
        exportBackup,
        importBackup,
        isLoading,
        refreshData: loadAllData,
        addPocket,
        updatePocket,
        deletePocket,
        savePockets,
        addTransaction,
        deleteTransaction,
        saveTransactions,
        addAccount,
        addGoal,
        updateGoal,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        paySubscription,
        addDebt,
        updateDebt,
        deleteDebt,
        recordDebtPayment,
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

-- ============================================================================
-- POCKITO DATABASE MIGRATION: Performance Indexes & Foreign Key Optimization
-- Version: 20261101000003
-- Safe to run multiple times (Idempotent)
-- ============================================================================

-- 1. Budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, period);

-- 2. Pockets
CREATE INDEX IF NOT EXISTS idx_pockets_user ON public.pockets(user_id);
CREATE INDEX IF NOT EXISTS idx_pockets_budget ON public.pockets(budget_id);

-- 3. Accounts
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);

-- 4. Savings Goals
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_completed ON public.savings_goals(user_id, is_completed);

-- 5. Subscriptions (Tagihan Rutin)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_pocket ON public.subscriptions(category_pocket_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_account ON public.subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(user_id, is_active);

-- 6. Debts (Hutang & Piutang)
CREATE INDEX IF NOT EXISTS idx_debts_user ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_settled ON public.debts(user_id, is_settled);
CREATE INDEX IF NOT EXISTS idx_debts_account ON public.debts(account_id);
CREATE INDEX IF NOT EXISTS idx_debts_pocket ON public.debts(pocket_id);

-- 7. Subscription Payments & Debt Payments
CREATE INDEX IF NOT EXISTS idx_sub_payments_user ON public.subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_payments_sub ON public.subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_payments_period ON public.subscription_payments(user_id, period);

CREATE INDEX IF NOT EXISTS idx_debt_payments_user ON public.debt_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON public.debt_payments(debt_id);

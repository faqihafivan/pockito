-- ============================================================================
-- POCKITO DATABASE SCHEMA (PostgreSQL / Supabase)
-- Master Consolidated Schema (Safe to run multiple times / Idempotent)
-- ============================================================================

-- 0. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    monthly_income BIGINT NOT NULL DEFAULT 0 CHECK (monthly_income >= 0),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    period VARCHAR(7) NOT NULL, -- e.g. '2026-10'
    total_expected_income BIGINT NOT NULL DEFAULT 0 CHECK (total_expected_income >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_period UNIQUE(user_id, period)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own budgets" ON public.budgets;
CREATE POLICY "Users can access their own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. POCKETS TABLE
CREATE TABLE IF NOT EXISTS public.pockets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'Wallet',
    color VARCHAR(20) NOT NULL DEFAULT '#FAAE2B',
    allocation_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    is_starred BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.pockets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own pockets" ON public.pockets;
CREATE POLICY "Users can access their own pockets"
    ON public.pockets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'bank', -- 'cash', 'bank', 'ewallet', 'investment'
    opening_balance BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    color VARCHAR(20) NOT NULL DEFAULT '#FAAE2B',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own accounts" ON public.accounts;
CREATE POLICY "Users can access their own accounts"
    ON public.accounts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    pocket_id UUID REFERENCES public.pockets(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    destination_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
    date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    description VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_transfer_destination CHECK (
        (type = 'transfer' AND destination_account_id IS NOT NULL AND destination_account_id <> account_id)
        OR (type <> 'transfer' AND destination_account_id IS NULL)
    )
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own transactions" ON public.transactions;
CREATE POLICY "Users can access their own transactions"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_pocket ON public.transactions(pocket_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.transactions(account_id);

-- 6. SAVINGS GOALS TABLE
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    target_amount BIGINT NOT NULL CHECK (target_amount > 0),
    current_amount BIGINT NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    icon VARCHAR(50) NOT NULL DEFAULT 'Target',
    color VARCHAR(20) NOT NULL DEFAULT '#10B981',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own goals" ON public.savings_goals;
CREATE POLICY "Users can access their own goals"
    ON public.savings_goals FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    start_time TIME,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own tasks" ON public.tasks;
CREATE POLICY "Users can access their own tasks"
    ON public.tasks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON public.tasks(user_id, due_date);

-- 8. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    recurrence VARCHAR(20) NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')),
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own reminders" ON public.reminders;
CREATE POLICY "Users can access their own reminders"
    ON public.reminders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own activity logs" ON public.activity_logs;
CREATE POLICY "Users can access their own activity logs"
    ON public.activity_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 10. Triggers for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated ON public.profiles;
CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_budgets_updated ON public.budgets;
CREATE TRIGGER tr_budgets_updated BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_pockets_updated ON public.pockets;
CREATE TRIGGER tr_pockets_updated BEFORE UPDATE ON public.pockets FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_accounts_updated ON public.accounts;
CREATE TRIGGER tr_accounts_updated BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_transactions_updated ON public.transactions;
CREATE TRIGGER tr_transactions_updated BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_savings_goals_updated ON public.savings_goals;
CREATE TRIGGER tr_savings_goals_updated BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_tasks_updated ON public.tasks;
CREATE TRIGGER tr_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_reminders_updated ON public.reminders;
CREATE TRIGGER tr_reminders_updated BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 11. SUBSCRIPTIONS TABLE (Tagihan Rutin)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount BIGINT NOT NULL CHECK (amount >= 0),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'weekly', 'yearly')),
    due_day SMALLINT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    category_pocket_id UUID REFERENCES public.pockets(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_paid_period TEXT, -- 'YYYY-MM'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can manage their own subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 12. DEBTS TABLE (Hutang & Piutang)
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
    person_name TEXT NOT NULL,
    amount BIGINT NOT NULL CHECK (amount >= 0),
    paid_amount BIGINT NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    due_date DATE,
    description TEXT NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    pocket_id UUID REFERENCES public.pockets(id) ON DELETE SET NULL,
    is_settled BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own debts" ON public.debts;
CREATE POLICY "Users can manage their own debts"
ON public.debts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 13. SUBSCRIPTION PAYMENTS TABLE (Riwayat Pembayaran Tagihan)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- 'YYYY-MM'
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    amount BIGINT NOT NULL CHECK (amount >= 0),
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_subscription_period UNIQUE (subscription_id, period)
);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own subscription payments" ON public.subscription_payments;
CREATE POLICY "Users can manage their own subscription payments"
ON public.subscription_payments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 14. DEBT PAYMENTS TABLE (Riwayat Cicilan Hutang & Piutang)
CREATE TABLE IF NOT EXISTS public.debt_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL CHECK (amount > 0),
    paid_at TIMESTAMPTZ NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own debt payments" ON public.debt_payments;
CREATE POLICY "Users can manage their own debt payments"
ON public.debt_payments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers for subscriptions & debts
DROP TRIGGER IF EXISTS tr_subscriptions_updated ON public.subscriptions;
CREATE TRIGGER tr_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_debts_updated ON public.debts;
CREATE TRIGGER tr_debts_updated BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_subscription_payments_updated ON public.subscription_payments;
CREATE TRIGGER tr_subscription_payments_updated BEFORE UPDATE ON public.subscription_payments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_debt_payments_updated ON public.debt_payments;
CREATE TRIGGER tr_debt_payments_updated BEFORE UPDATE ON public.debt_payments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 15. PERFORMANCE INDEXES (Foreign Keys & Frequent Query Filters)
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, period);
CREATE INDEX IF NOT EXISTS idx_pockets_user ON public.pockets(user_id);
CREATE INDEX IF NOT EXISTS idx_pockets_budget ON public.pockets(budget_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_completed ON public.savings_goals(user_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_pocket ON public.subscriptions(category_pocket_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_account ON public.subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_debts_user ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_settled ON public.debts(user_id, is_settled);
CREATE INDEX IF NOT EXISTS idx_debts_account ON public.debts(account_id);
CREATE INDEX IF NOT EXISTS idx_debts_pocket ON public.debts(pocket_id);

CREATE INDEX IF NOT EXISTS idx_sub_payments_user ON public.subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_payments_sub ON public.subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_payments_period ON public.subscription_payments(user_id, period);

CREATE INDEX IF NOT EXISTS idx_debt_payments_user ON public.debt_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON public.debt_payments(debt_id);

-- 16. ATOMIC TRANSACTIONS & INTEGRITY PROCEDURES (BE-1: P0 Atomic RPCs)
CREATE OR REPLACE FUNCTION public.pay_subscription_atomic(
    p_subscription_id UUID,
    p_period TEXT,
    p_account_id UUID,
    p_amount BIGINT,
    p_payment_date TIMESTAMPTZ,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_sub RECORD;
    v_tx_id UUID;
    v_payment_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Pengguna belum terautentikasi (unauthorized)';
    END IF;

    -- Pessimistic Lock (FOR UPDATE) to prevent race condition / double-charging
    SELECT * INTO v_sub
    FROM public.subscriptions
    WHERE id = p_subscription_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tagihan rutin tidak ditemukan';
    END IF;

    -- Anti-duplicate check
    IF EXISTS (
        SELECT 1 FROM public.subscription_payments
        WHERE subscription_id = p_subscription_id AND period = p_period AND status = 'paid'
    ) THEN
        RAISE EXCEPTION 'Tagihan % sudah dibayar untuk periode %', v_sub.name, p_period;
    END IF;

    -- 1. Create Ledger expense transaction
    INSERT INTO public.transactions (
        id, user_id, account_id, pocket_id, type, amount, date, description, notes
    ) VALUES (
        uuid_generate_v4(),
        v_user_id,
        p_account_id,
        v_sub.category_pocket_id,
        'expense',
        p_amount,
        p_payment_date,
        'Tagihan Rutin: ' || v_sub.name || ' (' || p_period || ')',
        COALESCE(p_notes, v_sub.notes)
    )
    RETURNING id INTO v_tx_id;

    -- 2. Create subscription payment record
    INSERT INTO public.subscription_payments (
        id, subscription_id, user_id, period, due_date, paid_at, recorded_at,
        amount, account_id, transaction_id, status, notes
    ) VALUES (
        uuid_generate_v4(),
        p_subscription_id,
        v_user_id,
        p_period,
        (p_period || '-' || LPAD(v_sub.due_day::text, 2, '0'))::date,
        p_payment_date,
        now(),
        p_amount,
        p_account_id,
        v_tx_id,
        'paid',
        COALESCE(p_notes, v_sub.notes)
    )
    RETURNING id INTO v_payment_id;

    -- 3. Update subscription last_paid_period
    UPDATE public.subscriptions
    SET last_paid_period = p_period, updated_at = now()
    WHERE id = p_subscription_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'payment_id', v_payment_id,
        'period', p_period
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_debt_payment_atomic(
    p_debt_id UUID,
    p_payment_amount BIGINT,
    p_account_id UUID DEFAULT NULL,
    p_create_transaction BOOLEAN DEFAULT TRUE,
    p_payment_date TIMESTAMPTZ DEFAULT NOW(),
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_debt RECORD;
    v_remaining BIGINT;
    v_new_paid BIGINT;
    v_is_settled BOOLEAN;
    v_tx_id UUID := NULL;
    v_payment_id UUID;
    v_tx_type TEXT;
    v_tx_desc TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Pengguna belum terautentikasi (unauthorized)';
    END IF;

    IF p_payment_amount <= 0 THEN
        RAISE EXCEPTION 'Nominal pembayaran harus lebih besar dari Rp 0';
    END IF;

    -- Pessimistic Lock (FOR UPDATE)
    SELECT * INTO v_debt
    FROM public.debts
    WHERE id = p_debt_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Catatan hutang/piutang tidak ditemukan';
    END IF;

    v_remaining := GREATEST(0, v_debt.amount - v_debt.paid_amount);
    IF p_payment_amount > v_remaining THEN
        RAISE EXCEPTION 'Nominal pembayaran melebihi sisa hutang/piutang (Sisa: %)', v_remaining;
    END IF;

    v_new_paid := v_debt.paid_amount + p_payment_amount;
    v_is_settled := (v_new_paid >= v_debt.amount);

    -- 1. Create Ledger transaction if requested
    IF p_create_transaction AND p_account_id IS NOT NULL THEN
        IF v_debt.type = 'receivable' THEN
            v_tx_type := 'income';
            v_tx_desc := 'Pelunasan Piutang: ' || v_debt.person_name || ' (' || v_debt.description || ')';
        ELSE
            v_tx_type := 'expense';
            v_tx_desc := 'Bayar Hutang/Cicilan: ' || v_debt.person_name || ' (' || v_debt.description || ')';
        END IF;

        INSERT INTO public.transactions (
            id, user_id, account_id, pocket_id, type, amount, date, description, notes
        ) VALUES (
            uuid_generate_v4(),
            v_user_id,
            p_account_id,
            v_debt.pocket_id,
            v_tx_type,
            p_payment_amount,
            p_payment_date,
            v_tx_desc,
            p_notes
        )
        RETURNING id INTO v_tx_id;
    END IF;

    -- 2. Create debt payment record
    INSERT INTO public.debt_payments (
        id, debt_id, user_id, amount, paid_at, account_id, transaction_id, notes
    ) VALUES (
        uuid_generate_v4(),
        p_debt_id,
        v_user_id,
        p_payment_amount,
        p_payment_date,
        p_account_id,
        v_tx_id,
        COALESCE(p_notes, 'Pembayaran cicilan untuk ' || v_debt.person_name)
    )
    RETURNING id INTO v_payment_id;

    -- 3. Update debt record
    UPDATE public.debts
    SET paid_amount = v_new_paid, is_settled = v_is_settled, updated_at = now()
    WHERE id = p_debt_id;

    RETURN jsonb_build_object(
        'success', true,
        'debt_id', p_debt_id,
        'paid_amount', v_new_paid,
        'is_settled', v_is_settled,
        'payment_id', v_payment_id,
        'transaction_id', v_tx_id
    );
END;
$$;


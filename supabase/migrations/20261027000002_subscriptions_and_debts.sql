-- Migration: 20261027000002_subscriptions_and_debts.sql
-- Adds Subscriptions (Tagihan Rutin), Debts (Hutang & Piutang),
-- Subscription Payments (Riwayat Pembayaran Tagihan), and Debt Payments (Riwayat Cicilan)
-- Security: Full Row Level Security (RLS) enabled on all user-owned tables.
-- ID Consistency: UUID types aligned with 20261018000001_pockito_schema.sql

-- 1. Subscriptions Table
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

-- RLS for Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Debts Table (Hutang & Piutang)
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

-- RLS for Debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own debts"
ON public.debts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Subscription Payments Table (Riwayat Pembayaran Tagihan)
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

-- RLS for Subscription Payments
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscription payments"
ON public.subscription_payments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Debt Payments Table (Riwayat Cicilan Hutang & Piutang)
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

-- RLS for Debt Payments
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own debt payments"
ON public.debt_payments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers
DROP TRIGGER IF EXISTS tr_subscriptions_updated ON public.subscriptions;
CREATE TRIGGER tr_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_debts_updated ON public.debts;
CREATE TRIGGER tr_debts_updated BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_subscription_payments_updated ON public.subscription_payments;
CREATE TRIGGER tr_subscription_payments_updated BEFORE UPDATE ON public.subscription_payments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_debt_payments_updated ON public.debt_payments;
CREATE TRIGGER tr_debt_payments_updated BEFORE UPDATE ON public.debt_payments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Migration: 20261027000002_subscriptions_and_debts.sql
-- Adds Subscriptions (Tagihan Rutin) and Debts (Hutang & Piutang) tables with RLS

-- 1. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount BIGINT NOT NULL CHECK (amount >= 0),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'weekly', 'yearly')),
    due_day SMALLINT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    category_pocket_id TEXT REFERENCES public.pockets(id) ON DELETE SET NULL,
    account_id TEXT REFERENCES public.accounts(id) ON DELETE SET NULL,
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
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
    person_name TEXT NOT NULL,
    amount BIGINT NOT NULL CHECK (amount >= 0),
    paid_amount BIGINT NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    due_date DATE,
    description TEXT NOT NULL,
    account_id TEXT REFERENCES public.accounts(id) ON DELETE SET NULL,
    pocket_id TEXT REFERENCES public.pockets(id) ON DELETE SET NULL,
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

-- Updated_at triggers
DROP TRIGGER IF EXISTS tr_subscriptions_updated ON public.subscriptions;
CREATE TRIGGER tr_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_debts_updated ON public.debts;
CREATE TRIGGER tr_debts_updated BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

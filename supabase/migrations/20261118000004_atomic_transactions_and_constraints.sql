-- ============================================================================
-- POCKITO MIGRATION: Atomic Transactions & Schema Integrity Constraints
-- Migration ID: 20261118000004_atomic_transactions_and_constraints.sql
-- ============================================================================

-- 1. Additional Check Constraints on Transactions (BE-2 Validation)
ALTER TABLE public.transactions
    DROP CONSTRAINT IF EXISTS chk_tx_amount_positive,
    ADD CONSTRAINT chk_tx_amount_positive CHECK (amount > 0 AND amount <= 999999999999);

ALTER TABLE public.transactions
    DROP CONSTRAINT IF EXISTS chk_tx_desc_non_empty,
    ADD CONSTRAINT chk_tx_desc_non_empty CHECK (char_length(trim(description)) >= 1);

-- 2. Atomic Subscription Payment Stored Procedure (BE-1: P0 Atomic RPC)
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

-- 3. Atomic Debt Payment Stored Procedure (BE-1: P0 Atomic RPC)
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

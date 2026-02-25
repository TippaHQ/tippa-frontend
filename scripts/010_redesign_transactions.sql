-- 010_redesign_transactions.sql
-- Redesign transactions table: user-centric -> flat event log

-- Drop existing RLS policies
DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;

-- Drop user_id column and cascade_info
ALTER TABLE public.transactions
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS cascade_info;

-- Clear any pre-existing rows (no code was writing to this table before)
DELETE FROM public.transactions;

-- Change type enum: received/forwarded -> donate/distribute
ALTER TABLE public.transactions ALTER COLUMN type TYPE text;
DROP TYPE IF EXISTS public.transaction_type;
CREATE TYPE public.transaction_type AS ENUM ('donate', 'distribute');
ALTER TABLE public.transactions ALTER COLUMN type TYPE public.transaction_type USING type::public.transaction_type;

-- Rename columns: from_name -> from_username, to_name -> to_username
ALTER TABLE public.transactions RENAME COLUMN from_name TO from_username;
ALTER TABLE public.transactions RENAME COLUMN to_name TO to_username;

-- from_username is nullable (external donors without tippa accounts)
ALTER TABLE public.transactions ALTER COLUMN from_username DROP NOT NULL;

-- Drop old user_id index, add username-based indexes
DROP INDEX IF EXISTS idx_transactions_user_id;
CREATE INDEX IF NOT EXISTS idx_transactions_from_username ON public.transactions(from_username, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_to_username ON public.transactions(to_username, created_at DESC);

-- RLS: users see transactions where they are from or to
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (
    from_username = (SELECT username FROM public.profiles WHERE id = auth.uid())
    OR to_username = (SELECT username FROM public.profiles WHERE id = auth.uid())
  );

-- No INSERT/UPDATE/DELETE policies for regular users.
-- All inserts happen server-side via service role (admin client).

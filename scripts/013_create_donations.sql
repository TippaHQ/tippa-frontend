-- ============================================================
-- Donations table for tracking donations made by users
-- ============================================================

CREATE TABLE IF NOT EXISTS public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_wallet_address text not null,
  donor_username text,
  recipient_username text not null,
  recipient_profile_id uuid references public.profiles(id) on delete set null,
  amount numeric(18, 7) not null,
  asset text not null default 'USDC',
  stellar_tx_hash text,
  created_at timestamptz not null default now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donations_select_all" ON public.donations;
CREATE POLICY "donations_select_all" ON public.donations
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_donations_donor_wallet ON public.donations(donor_wallet_address);
CREATE INDEX IF NOT EXISTS idx_donations_donor_username ON public.donations(donor_username);
CREATE INDEX IF NOT EXISTS idx_donations_recipient ON public.donations(recipient_username);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at desc);

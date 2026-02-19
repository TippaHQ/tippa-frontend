-- Transactions table: full history of all payments and cascade activity

create type public.transaction_type as enum ('received', 'forwarded');
create type public.transaction_status as enum ('completed', 'pending', 'failed');

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.transaction_type not null,
  from_name text not null,
  from_address text not null,
  to_name text not null,
  to_address text not null,
  amount numeric(18, 7) not null,
  asset text not null default 'USDC',
  cascade_info text,
  status public.transaction_status not null default 'pending',
  stellar_tx_hash text,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

-- Users can see their own transactions
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

-- System inserts transactions (service role), but users can too for local tracking
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

-- Indexes for fast querying
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_stellar_hash on public.transactions(stellar_tx_hash);

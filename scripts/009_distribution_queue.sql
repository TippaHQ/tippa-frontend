-- Distribution queue: tracks pending distribute() calls
create table if not exists public.distribution_queue (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  asset_contract_id text not null,
  depth integer not null default 0,
  status text not null default 'pending',
  attempts integer not null default 0,
  error text,
  tx_hash text,
  source_tx text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- No RLS policies — accessed via service role only
alter table public.distribution_queue enable row level security;

-- Index for the processor to pick up pending items efficiently
create index if not exists idx_distribution_queue_status_created
  on public.distribution_queue(status, created_at)
  where status = 'pending';

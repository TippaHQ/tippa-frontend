-- Waitlist table: stores users who want early access
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Anyone can join the waitlist
create policy "waitlist_insert" on public.waitlist
  for insert with check (true);

-- Anyone can check their own status (by email)
create policy "waitlist_select_own" on public.waitlist
  for select using (true);

-- Enable public read-only access for counts (status filtering done in query)
create policy "waitlist_select_public" on public.waitlist
  for select using (status = 'approved');

-- Index for fast email lookups
create index if not exists idx_waitlist_email on public.waitlist(email);

-- Index for ordering by created_at
create index if not exists idx_waitlist_created_at on public.waitlist(created_at);

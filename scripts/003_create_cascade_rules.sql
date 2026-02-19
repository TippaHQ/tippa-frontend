-- Cascade rules: per-user settings that control how payments are processed
-- One row per user (1:1 with profiles)

create table if not exists public.cascade_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  atomic_execution boolean not null default true,
  min_hop_enabled boolean not null default true,
  min_hop_amount numeric(12, 2) not null default 0.10,
  auto_cascade boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cascade_rules enable row level security;

-- Users can read their own rules
create policy "cascade_rules_select_own" on public.cascade_rules
  for select using (auth.uid() = user_id);

-- Users can insert their own rules
create policy "cascade_rules_insert_own" on public.cascade_rules
  for insert with check (auth.uid() = user_id);

-- Users can update their own rules
create policy "cascade_rules_update_own" on public.cascade_rules
  for update using (auth.uid() = user_id);

-- Users can delete their own rules
create policy "cascade_rules_delete_own" on public.cascade_rules
  for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create trigger cascade_rules_updated_at
  before update on public.cascade_rules
  for each row
  execute function public.update_updated_at_column();

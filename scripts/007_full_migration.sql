-- ============================================================
-- Tippa: Full Database Migration (idempotent)
-- ============================================================

-- ============================================================
-- 1. Helper function: auto-update updated_at
-- ============================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 2. Profiles table
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  bio text,
  avatar_url text,
  banner_url text,
  wallet_address text not null default '',
  federated_address text,
  default_asset text not null default 'USDC',
  stellar_network text not null default 'mainnet',
  horizon_url text not null default 'https://horizon.stellar.org',
  github text,
  twitter text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

create index if not exists idx_profiles_username on public.profiles(username);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();


-- ============================================================
-- 3. Cascade dependencies table
-- ============================================================
create table if not exists public.cascade_dependencies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  recipient_username text not null,
  percentage numeric(5, 2) not null check (percentage > 0 and percentage <= 50),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cascade_dependencies enable row level security;

drop policy if exists "cascade_deps_select_all" on public.cascade_dependencies;
create policy "cascade_deps_select_all" on public.cascade_dependencies
  for select using (true);

drop policy if exists "cascade_deps_insert_own" on public.cascade_dependencies;
create policy "cascade_deps_insert_own" on public.cascade_dependencies
  for insert with check (auth.uid() = user_id);

drop policy if exists "cascade_deps_update_own" on public.cascade_dependencies;
create policy "cascade_deps_update_own" on public.cascade_dependencies
  for update using (auth.uid() = user_id);

drop policy if exists "cascade_deps_delete_own" on public.cascade_dependencies;
create policy "cascade_deps_delete_own" on public.cascade_dependencies
  for delete using (auth.uid() = user_id);

create index if not exists idx_cascade_deps_user_id on public.cascade_dependencies(user_id);

create or replace function public.check_max_dependencies()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.cascade_dependencies where user_id = new.user_id) >= 5 then
    raise exception 'Maximum of 5 cascade dependencies allowed per user';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_max_dependencies on public.cascade_dependencies;
create trigger enforce_max_dependencies
  before insert on public.cascade_dependencies
  for each row
  execute function public.check_max_dependencies();

drop trigger if exists cascade_deps_updated_at on public.cascade_dependencies;
create trigger cascade_deps_updated_at
  before update on public.cascade_dependencies
  for each row
  execute function public.update_updated_at_column();


-- ============================================================
-- 4. Cascade rules table
-- ============================================================
create table if not exists public.cascade_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  atomic_execution boolean not null default true,
  min_hop_enabled boolean not null default true,
  min_hop_amount numeric(12, 2) not null default 0.50,
  auto_cascade boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cascade_rules enable row level security;

drop policy if exists "cascade_rules_select_own" on public.cascade_rules;
create policy "cascade_rules_select_own" on public.cascade_rules
  for select using (auth.uid() = user_id);

drop policy if exists "cascade_rules_insert_own" on public.cascade_rules;
create policy "cascade_rules_insert_own" on public.cascade_rules
  for insert with check (auth.uid() = user_id);

drop policy if exists "cascade_rules_update_own" on public.cascade_rules;
create policy "cascade_rules_update_own" on public.cascade_rules
  for update using (auth.uid() = user_id);

drop policy if exists "cascade_rules_delete_own" on public.cascade_rules;
create policy "cascade_rules_delete_own" on public.cascade_rules
  for delete using (auth.uid() = user_id);

drop trigger if exists cascade_rules_updated_at on public.cascade_rules;
create trigger cascade_rules_updated_at
  before update on public.cascade_rules
  for each row
  execute function public.update_updated_at_column();


-- ============================================================
-- 5. Transactions table (with enum types)
-- ============================================================
do $$ begin
  create type public.transaction_type as enum ('received', 'forwarded');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.transaction_status as enum ('completed', 'pending', 'failed');
exception when duplicate_object then null;
end $$;

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

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_stellar_hash on public.transactions(stellar_tx_hash);


-- ============================================================
-- 6. Monthly flow stats (dashboard chart)
-- ============================================================
create table if not exists public.monthly_flow_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month date not null,
  total_received numeric(18, 7) not null default 0,
  total_forwarded numeric(18, 7) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, month)
);

alter table public.monthly_flow_stats enable row level security;

drop policy if exists "monthly_stats_select_own" on public.monthly_flow_stats;
create policy "monthly_stats_select_own" on public.monthly_flow_stats
  for select using (auth.uid() = user_id);

drop policy if exists "monthly_stats_insert_own" on public.monthly_flow_stats;
create policy "monthly_stats_insert_own" on public.monthly_flow_stats
  for insert with check (auth.uid() = user_id);

drop policy if exists "monthly_stats_update_own" on public.monthly_flow_stats;
create policy "monthly_stats_update_own" on public.monthly_flow_stats
  for update using (auth.uid() = user_id);

create index if not exists idx_monthly_stats_user_month
  on public.monthly_flow_stats(user_id, month);

drop trigger if exists monthly_stats_updated_at on public.monthly_flow_stats;
create trigger monthly_stats_updated_at
  before update on public.monthly_flow_stats
  for each row
  execute function public.update_updated_at_column();


-- ============================================================
-- 7. Notification preferences
-- ============================================================
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  payment_received boolean not null default true,
  cascade_completed boolean not null default true,
  failed_transactions boolean not null default true,
  profile_views_digest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "notif_prefs_select_own" on public.notification_preferences;
create policy "notif_prefs_select_own" on public.notification_preferences
  for select using (auth.uid() = user_id);

drop policy if exists "notif_prefs_insert_own" on public.notification_preferences;
create policy "notif_prefs_insert_own" on public.notification_preferences
  for insert with check (auth.uid() = user_id);

drop policy if exists "notif_prefs_update_own" on public.notification_preferences;
create policy "notif_prefs_update_own" on public.notification_preferences
  for update using (auth.uid() = user_id);

drop trigger if exists notif_prefs_updated_at on public.notification_preferences;
create trigger notif_prefs_updated_at
  before update on public.notification_preferences
  for each row
  execute function public.update_updated_at_column();


-- ============================================================
-- 8. Profile analytics
-- ============================================================
create table if not exists public.profile_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  profile_views int not null default 0,
  unique_supporters int not null default 0,
  total_payments_received int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profile_analytics enable row level security;

drop policy if exists "profile_analytics_select_all" on public.profile_analytics;
create policy "profile_analytics_select_all" on public.profile_analytics
  for select using (true);

drop policy if exists "profile_analytics_insert_own" on public.profile_analytics;
create policy "profile_analytics_insert_own" on public.profile_analytics
  for insert with check (auth.uid() = user_id);

drop policy if exists "profile_analytics_update_own" on public.profile_analytics;
create policy "profile_analytics_update_own" on public.profile_analytics
  for update using (auth.uid() = user_id);

drop trigger if exists profile_analytics_updated_at on public.profile_analytics;
create trigger profile_analytics_updated_at
  before update on public.profile_analytics
  for each row
  execute function public.update_updated_at_column();


-- ============================================================
-- 9. Auto-create profile + related rows on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username, wallet_address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', null),
    coalesce(new.raw_user_meta_data ->> 'username', null),
    coalesce(new.raw_user_meta_data ->> 'wallet_address', '')
  )
  on conflict (id) do nothing;

  insert into public.cascade_rules (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.profile_analytics (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================
-- 10. Distribution queue (background distribute() processor)
-- ============================================================
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

create index if not exists idx_distribution_queue_status_created
  on public.distribution_queue(status, created_at)
  where status = 'pending';

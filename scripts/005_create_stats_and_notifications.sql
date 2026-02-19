-- Monthly flow stats: aggregated received/forwarded data for the dashboard chart
-- Pre-computed to avoid expensive aggregation queries on every dashboard load

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

create policy "monthly_stats_select_own" on public.monthly_flow_stats
  for select using (auth.uid() = user_id);

create policy "monthly_stats_insert_own" on public.monthly_flow_stats
  for insert with check (auth.uid() = user_id);

create policy "monthly_stats_update_own" on public.monthly_flow_stats
  for update using (auth.uid() = user_id);

create index if not exists idx_monthly_stats_user_month
  on public.monthly_flow_stats(user_id, month);

-- Auto-update updated_at
create trigger monthly_stats_updated_at
  before update on public.monthly_flow_stats
  for each row
  execute function public.update_updated_at_column();


-- Notification preferences: per-user toggles for different alert types

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

create policy "notif_prefs_select_own" on public.notification_preferences
  for select using (auth.uid() = user_id);

create policy "notif_prefs_insert_own" on public.notification_preferences
  for insert with check (auth.uid() = user_id);

create policy "notif_prefs_update_own" on public.notification_preferences
  for update using (auth.uid() = user_id);

-- Auto-update updated_at
create trigger notif_prefs_updated_at
  before update on public.notification_preferences
  for each row
  execute function public.update_updated_at_column();


-- Profile analytics: tracks views and unique supporters

create table if not exists public.profile_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  profile_views int not null default 0,
  unique_supporters int not null default 0,
  total_payments_received int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profile_analytics enable row level security;

-- Anyone can view analytics (shown on public profile)
create policy "profile_analytics_select_all" on public.profile_analytics
  for select using (true);

create policy "profile_analytics_insert_own" on public.profile_analytics
  for insert with check (auth.uid() = user_id);

create policy "profile_analytics_update_own" on public.profile_analytics
  for update using (auth.uid() = user_id);

-- Auto-update updated_at
create trigger profile_analytics_updated_at
  before update on public.profile_analytics
  for each row
  execute function public.update_updated_at_column();

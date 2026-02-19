-- Profiles table: stores user profile data and wallet info
-- References auth.users for RLS integration

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  bio text,
  avatar_url text,
  banner_url text,
  wallet_address text not null,
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

-- Anyone can view profiles (public discovery pages)
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- Users can insert their own profile
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Users can delete their own profile
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Index for fast username lookups (discovery links)
create index if not exists idx_profiles_username on public.profiles(username);

-- Auto-update updated_at on row change
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

-- Cascade dependencies: up to 5 Stellar addresses per user that receive a % split
-- Each row is one dependency in the user's cascade configuration

create table if not exists public.cascade_dependencies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  stellar_address text not null,
  percentage numeric(5, 2) not null check (percentage > 0 and percentage <= 50),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cascade_dependencies enable row level security;

-- Anyone can view dependencies (shown on public profile)
create policy "cascade_deps_select_all" on public.cascade_dependencies
  for select using (true);

-- Users can manage their own dependencies
create policy "cascade_deps_insert_own" on public.cascade_dependencies
  for insert with check (auth.uid() = user_id);

create policy "cascade_deps_update_own" on public.cascade_dependencies
  for update using (auth.uid() = user_id);

create policy "cascade_deps_delete_own" on public.cascade_dependencies
  for delete using (auth.uid() = user_id);

-- Index for fast lookup by user
create index if not exists idx_cascade_deps_user_id on public.cascade_dependencies(user_id);

-- Enforce max 5 dependencies per user via a function + trigger
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

create trigger enforce_max_dependencies
  before insert on public.cascade_dependencies
  for each row
  execute function public.check_max_dependencies();

-- Auto-update updated_at
create trigger cascade_deps_updated_at
  before update on public.cascade_dependencies
  for each row
  execute function public.update_updated_at_column();

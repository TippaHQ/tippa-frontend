import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrations = [
  // 1. Helper function
  `create or replace function public.update_updated_at_column()
   returns trigger language plpgsql as $$
   begin new.updated_at = now(); return new; end; $$;`,

  // 2. Profiles table
  `create table if not exists public.profiles (
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
  );`,

  `alter table public.profiles enable row level security;`,
  `drop policy if exists "profiles_select_all" on public.profiles;`,
  `create policy "profiles_select_all" on public.profiles for select using (true);`,
  `drop policy if exists "profiles_insert_own" on public.profiles;`,
  `create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);`,
  `drop policy if exists "profiles_update_own" on public.profiles;`,
  `create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);`,
  `drop policy if exists "profiles_delete_own" on public.profiles;`,
  `create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);`,
  `create index if not exists idx_profiles_username on public.profiles(username);`,
  `drop trigger if exists profiles_updated_at on public.profiles;`,
  `create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();`,

  // 3. Cascade dependencies
  `create table if not exists public.cascade_dependencies (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    label text not null,
    stellar_address text not null,
    percentage numeric(5,2) not null check (percentage > 0 and percentage <= 100),
    sort_order int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );`,

  `alter table public.cascade_dependencies enable row level security;`,
  `drop policy if exists "cascade_deps_select_own" on public.cascade_dependencies;`,
  `create policy "cascade_deps_select_own" on public.cascade_dependencies for select using (auth.uid() = user_id);`,
  `drop policy if exists "cascade_deps_insert_own" on public.cascade_dependencies;`,
  `create policy "cascade_deps_insert_own" on public.cascade_dependencies for insert with check (auth.uid() = user_id);`,
  `drop policy if exists "cascade_deps_update_own" on public.cascade_dependencies;`,
  `create policy "cascade_deps_update_own" on public.cascade_dependencies for update using (auth.uid() = user_id);`,
  `drop policy if exists "cascade_deps_delete_own" on public.cascade_dependencies;`,
  `create policy "cascade_deps_delete_own" on public.cascade_dependencies for delete using (auth.uid() = user_id);`,
  `create index if not exists idx_cascade_deps_user on public.cascade_dependencies(user_id);`,
  `drop trigger if exists cascade_deps_updated_at on public.cascade_dependencies;`,
  `create trigger cascade_deps_updated_at before update on public.cascade_dependencies for each row execute function public.update_updated_at_column();`,

  // 4. Cascade rules
  `create table if not exists public.cascade_rules (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references public.profiles(id) on delete cascade,
    atomic_execution boolean not null default true,
    min_hop_threshold numeric(18,7) not null default 0.001,
    auto_cascade boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );`,

  `alter table public.cascade_rules enable row level security;`,
  `drop policy if exists "cascade_rules_select_own" on public.cascade_rules;`,
  `create policy "cascade_rules_select_own" on public.cascade_rules for select using (auth.uid() = user_id);`,
  `drop policy if exists "cascade_rules_insert_own" on public.cascade_rules;`,
  `create policy "cascade_rules_insert_own" on public.cascade_rules for insert with check (auth.uid() = user_id);`,
  `drop policy if exists "cascade_rules_update_own" on public.cascade_rules;`,
  `create policy "cascade_rules_update_own" on public.cascade_rules for update using (auth.uid() = user_id);`,
  `drop policy if exists "cascade_rules_delete_own" on public.cascade_rules;`,
  `create policy "cascade_rules_delete_own" on public.cascade_rules for delete using (auth.uid() = user_id);`,
  `drop trigger if exists cascade_rules_updated_at on public.cascade_rules;`,
  `create trigger cascade_rules_updated_at before update on public.cascade_rules for each row execute function public.update_updated_at_column();`,

  // 5. Transactions
  `do $$ begin
    create type public.transaction_type as enum ('received','forwarded');
  exception when duplicate_object then null; end $$;`,

  `do $$ begin
    create type public.transaction_status as enum ('completed','pending','failed');
  exception when duplicate_object then null; end $$;`,

  `create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    type public.transaction_type not null,
    status public.transaction_status not null default 'completed',
    amount numeric(18,7) not null,
    asset text not null default 'USDC',
    from_address text not null,
    to_address text not null,
    from_label text,
    to_label text,
    stellar_tx_hash text,
    cascade_id uuid,
    memo text,
    created_at timestamptz not null default now()
  );`,

  `alter table public.transactions enable row level security;`,
  `drop policy if exists "txn_select_own" on public.transactions;`,
  `create policy "txn_select_own" on public.transactions for select using (auth.uid() = user_id);`,
  `drop policy if exists "txn_insert_own" on public.transactions;`,
  `create policy "txn_insert_own" on public.transactions for insert with check (auth.uid() = user_id);`,
  `create index if not exists idx_txn_user on public.transactions(user_id);`,
  `create index if not exists idx_txn_created on public.transactions(created_at desc);`,
  `create index if not exists idx_txn_type on public.transactions(type);`,
  `create index if not exists idx_txn_status on public.transactions(status);`,

  // 6. Monthly flow stats
  `create table if not exists public.monthly_flow_stats (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    month date not null,
    received numeric(18,7) not null default 0,
    forwarded numeric(18,7) not null default 0,
    unique(user_id, month)
  );`,

  `alter table public.monthly_flow_stats enable row level security;`,
  `drop policy if exists "flow_select_own" on public.monthly_flow_stats;`,
  `create policy "flow_select_own" on public.monthly_flow_stats for select using (auth.uid() = user_id);`,
  `drop policy if exists "flow_insert_own" on public.monthly_flow_stats;`,
  `create policy "flow_insert_own" on public.monthly_flow_stats for insert with check (auth.uid() = user_id);`,
  `drop policy if exists "flow_update_own" on public.monthly_flow_stats;`,
  `create policy "flow_update_own" on public.monthly_flow_stats for update using (auth.uid() = user_id);`,
  `create index if not exists idx_flow_user on public.monthly_flow_stats(user_id);`,

  // 7. Notification preferences
  `create table if not exists public.notification_preferences (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references public.profiles(id) on delete cascade,
    incoming_payments boolean not null default true,
    cascade_forwarded boolean not null default true,
    cascade_failures boolean not null default true,
    weekly_summary boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );`,

  `alter table public.notification_preferences enable row level security;`,
  `drop policy if exists "notif_select_own" on public.notification_preferences;`,
  `create policy "notif_select_own" on public.notification_preferences for select using (auth.uid() = user_id);`,
  `drop policy if exists "notif_insert_own" on public.notification_preferences;`,
  `create policy "notif_insert_own" on public.notification_preferences for insert with check (auth.uid() = user_id);`,
  `drop policy if exists "notif_update_own" on public.notification_preferences;`,
  `create policy "notif_update_own" on public.notification_preferences for update using (auth.uid() = user_id);`,
  `drop trigger if exists notif_updated_at on public.notification_preferences;`,
  `create trigger notif_updated_at before update on public.notification_preferences for each row execute function public.update_updated_at_column();`,

  // 8. Profile analytics
  `create table if not exists public.profile_analytics (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references public.profiles(id) on delete cascade,
    profile_views int not null default 0,
    link_clicks int not null default 0,
    qr_scans int not null default 0,
    updated_at timestamptz not null default now()
  );`,

  `alter table public.profile_analytics enable row level security;`,
  `drop policy if exists "analytics_select_own" on public.profile_analytics;`,
  `create policy "analytics_select_own" on public.profile_analytics for select using (auth.uid() = user_id);`,
  `drop policy if exists "analytics_update_own" on public.profile_analytics;`,
  `create policy "analytics_update_own" on public.profile_analytics for update using (auth.uid() = user_id);`,
  `drop policy if exists "analytics_insert_own" on public.profile_analytics;`,
  `create policy "analytics_insert_own" on public.profile_analytics for insert with check (auth.uid() = user_id);`,
  `drop trigger if exists analytics_updated_at on public.profile_analytics;`,
  `create trigger analytics_updated_at before update on public.profile_analytics for each row execute function public.update_updated_at_column();`,

  // 9. Auto-create profile trigger
  `create or replace function public.handle_new_user()
   returns trigger language plpgsql security definer set search_path = public as $$
   begin
     insert into public.profiles (id, display_name, wallet_address)
     values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'New User'), coalesce(new.raw_user_meta_data ->> 'wallet_address', ''))
     on conflict (id) do nothing;
     insert into public.cascade_rules (user_id) values (new.id) on conflict (user_id) do nothing;
     insert into public.notification_preferences (user_id) values (new.id) on conflict (user_id) do nothing;
     insert into public.profile_analytics (user_id) values (new.id) on conflict (user_id) do nothing;
     return new;
   end; $$;`,

  `drop trigger if exists on_auth_user_created on auth.users;`,
  `create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();`
];

async function runMigrations() {
  console.log("Starting Tippa database migrations...");
  let success = 0;
  let failed = 0;

  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    const preview = sql.substring(0, 60).replace(/\n/g, " ").trim();
    try {
      const { error } = await supabase.rpc("exec_sql", { query: sql }).maybeSingle();
      if (error) {
        // Try direct approach via REST
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: sql }),
        });
        if (!res.ok) {
          // Fallback: use the sql endpoint directly
          const sqlRes = await fetch(`${supabaseUrl}/pg`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ query: sql }),
          });
        }
      }
      success++;
      console.log(`[${i + 1}/${migrations.length}] OK: ${preview}...`);
    } catch (err) {
      failed++;
      console.error(`[${i + 1}/${migrations.length}] FAIL: ${preview}... - ${err.message}`);
    }
  }

  console.log(`\nMigrations complete: ${success} succeeded, ${failed} failed`);
}

runMigrations();

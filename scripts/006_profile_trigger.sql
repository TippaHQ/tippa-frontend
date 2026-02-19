-- Auto-create profile, cascade rules, notification prefs, and analytics
-- when a new user signs up via Supabase Auth.
-- Runs with security definer so it bypasses RLS.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, display_name, username, wallet_address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', null),
    coalesce(new.raw_user_meta_data ->> 'username', null),
    coalesce(new.raw_user_meta_data ->> 'wallet_address', '')
  )
  on conflict (id) do nothing;

  -- Create default cascade rules
  insert into public.cascade_rules (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Create default notification preferences
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Create analytics row
  insert into public.profile_analytics (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if any, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

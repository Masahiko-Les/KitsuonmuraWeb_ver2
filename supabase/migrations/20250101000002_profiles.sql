-- Phase 1: village residents (住民票).

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  village_name text not null check (char_length(trim(village_name)) > 0),
  bio text,
  stutter_types text[] not null default '{}',
  difficult_sounds text[] not null default '{}',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_user_id_idx on public.profiles(user_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Table-level grant, independent of the "automatically expose new tables"
-- project setting: RLS only restricts rows, the role still needs base
-- privileges on the table before RLS is even consulted. anon gets nothing.
grant select, insert, update on public.profiles to authenticated;

-- Logged-in residents can see everyone's registry card (village_name, bio,
-- stutter info) so /residents works, but the outside world sees nothing.
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

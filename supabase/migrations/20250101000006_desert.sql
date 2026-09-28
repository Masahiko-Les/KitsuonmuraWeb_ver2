-- Phase 5: 砂漠 (desert) — leaving a record of a past hardship for others.

create table public.desert_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  suffering text not null check (char_length(trim(suffering)) >= 10 and char_length(suffering) <= 4000),
  action_taken text not null check (char_length(trim(action_taken)) >= 10 and char_length(action_taken) <= 4000),
  result text not null check (char_length(trim(result)) >= 10 and char_length(result) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index desert_stories_created_at_idx on public.desert_stories(created_at desc);
create index desert_stories_user_id_idx on public.desert_stories(user_id);

create trigger desert_stories_set_updated_at
  before update on public.desert_stories
  for each row
  execute function public.set_updated_at();

alter table public.desert_stories enable row level security;

-- Table-level grant, independent of the "automatically expose new tables"
-- project setting. anon gets nothing.
grant select, insert, update, delete on public.desert_stories to authenticated;

-- "or user_id = auth.uid()" lets the author still satisfy this policy for
-- their own row even after deleted_at is set — without it, PostgREST's
-- soft-delete UPDATE (which always needs the resulting row to pass a
-- SELECT check) is itself rejected by RLS. See
-- 20250101000019_soft_delete_rls_fix.sql. App queries still filter
-- `.is("deleted_at", null)` explicitly so a deleted story never reappears.
create policy "desert_stories_select_authenticated"
  on public.desert_stories for select
  to authenticated
  using (deleted_at is null or user_id = auth.uid());

create policy "desert_stories_insert_own"
  on public.desert_stories for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "desert_stories_update_own"
  on public.desert_stories for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "desert_stories_delete_own"
  on public.desert_stories for delete
  to authenticated
  using (user_id = auth.uid());

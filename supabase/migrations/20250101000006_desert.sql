-- Phase 5: 砂漠 (desert) — leaving a record of a past hardship for others.

create table public.desert_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  suffering text not null check (char_length(trim(suffering)) > 0 and char_length(suffering) <= 4000),
  action_taken text not null check (char_length(trim(action_taken)) > 0 and char_length(action_taken) <= 4000),
  result text not null check (char_length(trim(result)) > 0 and char_length(result) <= 4000),
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

create policy "desert_stories_select_authenticated"
  on public.desert_stories for select
  to authenticated
  using (deleted_at is null);

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

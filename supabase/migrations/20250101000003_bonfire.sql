-- Phase 2: 焚き火 (bonfire) — everyday feelings, shared with the village.

create table public.bonfire_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index bonfire_posts_created_at_idx on public.bonfire_posts(created_at desc);
create index bonfire_posts_user_id_idx on public.bonfire_posts(user_id);

create trigger bonfire_posts_set_updated_at
  before update on public.bonfire_posts
  for each row
  execute function public.set_updated_at();

alter table public.bonfire_posts enable row level security;

-- Table-level grant, independent of the "automatically expose new tables"
-- project setting. anon gets nothing.
grant select, insert, update, delete on public.bonfire_posts to authenticated;

create policy "bonfire_posts_select_authenticated"
  on public.bonfire_posts for select
  to authenticated
  using (deleted_at is null);

create policy "bonfire_posts_insert_own"
  on public.bonfire_posts for insert
  to authenticated
  with check (user_id = auth.uid());

-- Used for soft delete (setting deleted_at). Only the author may touch their post.
create policy "bonfire_posts_update_own"
  on public.bonfire_posts for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "bonfire_posts_delete_own"
  on public.bonfire_posts for delete
  to authenticated
  using (user_id = auth.uid());

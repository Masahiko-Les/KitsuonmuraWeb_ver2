-- 開発局: a bulletin board for village-improvement ideas and prototype
-- feedback. The announcements themselves (村長 asking for ideas, linking a
-- prototype) are fixed content in the page component, not DB rows — only
-- villagers' comments on them are persisted here. post_id is a free-text
-- key matching the hardcoded announcement ids in
-- src/app/(village)/dev-station/page.tsx, not a foreign key, since there is
-- no dev_station_posts table.

create table public.dev_station_comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index dev_station_comments_post_id_idx on public.dev_station_comments(post_id);
create index dev_station_comments_user_id_idx on public.dev_station_comments(user_id);

create trigger dev_station_comments_set_updated_at
  before update on public.dev_station_comments
  for each row
  execute function public.set_updated_at();

alter table public.dev_station_comments enable row level security;

grant select, insert, update, delete on public.dev_station_comments to authenticated;

-- Same "or user_id = auth.uid()" shape as bonfire_posts: needed so the
-- soft-delete UPDATE (which requires the resulting row to still pass a
-- SELECT check) isn't itself rejected by RLS.
create policy "dev_station_comments_select_authenticated"
  on public.dev_station_comments for select
  to authenticated
  using (deleted_at is null or user_id = auth.uid());

create policy "dev_station_comments_insert_own"
  on public.dev_station_comments for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "dev_station_comments_update_own"
  on public.dev_station_comments for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "dev_station_comments_delete_own"
  on public.dev_station_comments for delete
  to authenticated
  using (user_id = auth.uid());

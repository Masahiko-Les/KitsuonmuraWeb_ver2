-- Fix a real bug affecting every soft-deletable table (bonfire_posts,
-- desert_stories, library_reviews): their SELECT policy was
-- `using (deleted_at is null)`, which hides a row from EVERYONE, including
-- its own author, the instant deleted_at is set. Because PostgREST's
-- UPDATE always needs the resulting row to pass a SELECT policy check
-- (regardless of the Prefer: return=minimal header), that made the actual
-- soft-delete UPDATE itself fail with a row-level security error — the
-- "削除する" button silently did nothing. Confirmed directly against the
-- live database: the UPDATE was rejected with a 403 in every case.
--
-- Fix: let the author still satisfy the SELECT policy for their own row
-- even after it's deleted (so the RETURNING check inside the UPDATE
-- passes), while every list query in the app explicitly filters
-- `.is("deleted_at", null)` so a deleted row never actually reappears in
-- anyone's feed, including the author's own.

drop policy "bonfire_posts_select_authenticated" on public.bonfire_posts;
create policy "bonfire_posts_select_authenticated"
  on public.bonfire_posts for select
  to authenticated
  using (deleted_at is null or user_id = auth.uid());

drop policy "desert_stories_select_authenticated" on public.desert_stories;
create policy "desert_stories_select_authenticated"
  on public.desert_stories for select
  to authenticated
  using (deleted_at is null or user_id = auth.uid());

drop policy "library_reviews_select_authenticated" on public.library_reviews;
create policy "library_reviews_select_authenticated"
  on public.library_reviews for select
  to authenticated
  using (deleted_at is null or user_id = auth.uid());

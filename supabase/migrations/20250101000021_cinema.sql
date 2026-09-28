-- 映画館: exactly the same shape as 図書館 (book_catalog/library_reviews/
-- flower_gifts), just retargeted at movies. Kept as its own independent
-- set of tables rather than reusing 図書館's, matching how 焚き火's
-- crop_gifts and 図書館's flower_gifts were each kept independent too.

create table public.movie_catalog (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  original_title text,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.movie_catalog (title, original_title, description, sort_order) values
  (
    '英国王のスピーチ',
    'The King''s Speech',
    '吃音に向き合いながら、公の場で話す役割を背負っていく王の姿を描いた作品です。ことばの苦しさと、人に支えられることの力の両方を感じられます。',
    0
  ),
  (
    'Rocket Science',
    null,
    '吃音のある高校生が、自分の居場所やことばとの距離を探していく青春映画です。不器用さや焦りも含めて、若い時期の揺れに触れられる一本です。',
    1
  ),
  (
    'ワンダとダイヤと優しい奴ら',
    'A Fish Called Wanda',
    '吃音そのものが主題ではないけれど、吃音のある登場人物が印象的に描かれる有名作です。映画の中で、吃音のある人がどう描かれてきたかを見る入口として置いてください。',
    2
  );

alter table public.movie_catalog enable row level security;

grant select on public.movie_catalog to authenticated;

create policy "movie_catalog_select_authenticated"
  on public.movie_catalog for select
  to authenticated
  using (true);

create table public.cinema_reviews (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movie_catalog(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index cinema_reviews_movie_id_idx on public.cinema_reviews(movie_id);
create index cinema_reviews_user_id_idx on public.cinema_reviews(user_id);

create trigger cinema_reviews_set_updated_at
  before update on public.cinema_reviews
  for each row
  execute function public.set_updated_at();

alter table public.cinema_reviews enable row level security;

grant select, insert, update, delete on public.cinema_reviews to authenticated;

-- "or user_id = auth.uid()" from day one: without it, PostgREST's
-- soft-delete UPDATE (which always needs the resulting row to pass a
-- SELECT check) would itself be rejected by RLS. Learned the hard way on
-- bonfire_posts/desert_stories/library_reviews — see
-- 20250101000019_soft_delete_rls_fix.sql. App queries still filter
-- `.is("deleted_at", null)` explicitly so a deleted review never reappears.
create policy "cinema_reviews_select_authenticated"
  on public.cinema_reviews for select
  to authenticated
  using (deleted_at is null or user_id = auth.uid());

create policy "cinema_reviews_insert_own"
  on public.cinema_reviews for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "cinema_reviews_update_own"
  on public.cinema_reviews for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "cinema_reviews_delete_own"
  on public.cinema_reviews for delete
  to authenticated
  using (user_id = auth.uid());

-- Mirrors flower_gifts exactly, retargeted at cinema reviews.
create table public.cinema_flower_gifts (
  id uuid primary key default gen_random_uuid(),
  user_flower_id uuid not null references public.user_flowers(id) on delete cascade,
  giver_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  cinema_review_id uuid references public.cinema_reviews(id) on delete set null,
  bloom_id uuid references public.desert_blooms(id),
  created_at timestamptz not null default now()
);

create index cinema_flower_gifts_recipient_id_idx on public.cinema_flower_gifts(recipient_id);

alter table public.cinema_flower_gifts enable row level security;

grant select on public.cinema_flower_gifts to authenticated;

create policy "cinema_flower_gifts_select_authenticated"
  on public.cinema_flower_gifts for select
  to authenticated
  using (true);

-- No insert policy: only gift_flower_to_cinema_review() may create these rows.

-- Mirrors gift_flower() exactly, writing to cinema_flower_gifts instead.
create or replace function public.gift_flower_to_cinema_review(
  p_user_flower_id uuid,
  p_recipient_id uuid,
  p_cinema_review_id uuid default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_flower public.user_flowers%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_recipient_id = v_user_id then
    raise exception 'cannot gift a flower to yourself';
  end if;

  select * into v_flower from public.user_flowers where id = p_user_flower_id for update;
  if not found then
    raise exception 'flower not found';
  end if;

  if v_flower.user_id <> v_user_id then
    raise exception 'not your flower';
  end if;

  if exists (
    select 1 from public.user_flowers
    where user_id = p_recipient_id and bloom_id = v_flower.bloom_id
  ) then
    raise exception 'recipient already has this flower';
  end if;

  update public.user_flowers set user_id = p_recipient_id where id = p_user_flower_id;

  insert into public.cinema_flower_gifts (user_flower_id, giver_id, recipient_id, cinema_review_id, bloom_id)
    values (p_user_flower_id, v_user_id, p_recipient_id, p_cinema_review_id, v_flower.bloom_id);

  return json_build_object('status', 'ok');
end;
$$;

revoke all on function public.gift_flower_to_cinema_review(uuid, uuid, uuid) from public;
grant execute on function public.gift_flower_to_cinema_review(uuid, uuid, uuid) to authenticated;

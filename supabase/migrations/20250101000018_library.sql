-- 図書館: a small curated list of books about stuttering. Villagers can
-- leave impressions (library_reviews) on a book and gift each other
-- flowers (from user_flowers, the 砂漠の開拓 reward track) on those
-- impressions, mirroring 焚き火's crop-gifting exactly but retargeted at
-- flowers/reviews instead of crops/bonfire posts.

create table public.book_catalog (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.book_catalog (title, author, description, sort_order) values
  (
    '吃音 伝えられないもどかしさ',
    '近藤雄生',
    '吃音のある人が抱える、ことばにしにくい苦しさや揺れが、ていねいにたどられている一冊です。「うまく言えない気持ち」を、少し言葉にしてもらえるような本です。',
    0
  ),
  (
    '吃音の当事者研究 どもる人たちが「べてるの家」と出会った',
    '向谷地生良・伊藤伸二',
    '吃音をひとりで抱えこむのではなく、人とのつながりの中で見つめ直していく視点にふれられる本です。「悩み」をそのまま語り合うことの力を感じたい人に向いています。',
    1
  ),
  (
    '成人吃音とともに',
    null,
    '大人になってからも続いていく吃音とのつきあい方や、暮らしの中の思いに寄り添ってくれる本です。仕事や人間関係のなかで感じることを、静かに見つめたいときに手に取りたい一冊です。',
    2
  );

alter table public.book_catalog enable row level security;

grant select on public.book_catalog to authenticated;

create policy "book_catalog_select_authenticated"
  on public.book_catalog for select
  to authenticated
  using (true);

create table public.library_reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.book_catalog(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index library_reviews_book_id_idx on public.library_reviews(book_id);
create index library_reviews_user_id_idx on public.library_reviews(user_id);

create trigger library_reviews_set_updated_at
  before update on public.library_reviews
  for each row
  execute function public.set_updated_at();

alter table public.library_reviews enable row level security;

grant select, insert, update, delete on public.library_reviews to authenticated;

-- "or user_id = auth.uid()" lets the author still satisfy this policy for
-- their own row even after deleted_at is set — without it, PostgREST's
-- soft-delete UPDATE (which always needs the resulting row to pass a
-- SELECT check) is itself rejected by RLS. See
-- 20250101000019_soft_delete_rls_fix.sql. App queries still filter
-- `.is("deleted_at", null)` explicitly so a deleted review never reappears.
create policy "library_reviews_select_authenticated"
  on public.library_reviews for select
  to authenticated
  using (deleted_at is null or user_id = auth.uid());

create policy "library_reviews_insert_own"
  on public.library_reviews for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "library_reviews_update_own"
  on public.library_reviews for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "library_reviews_delete_own"
  on public.library_reviews for delete
  to authenticated
  using (user_id = auth.uid());

-- Mirrors crop_gifts (in its final, harvest_id-denormalized shape) exactly,
-- retargeted at flowers/library reviews.
create table public.flower_gifts (
  id uuid primary key default gen_random_uuid(),
  user_flower_id uuid not null references public.user_flowers(id) on delete cascade,
  giver_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  library_review_id uuid references public.library_reviews(id) on delete set null,
  bloom_id uuid references public.desert_blooms(id),
  created_at timestamptz not null default now()
);

create index flower_gifts_recipient_id_idx on public.flower_gifts(recipient_id);

alter table public.flower_gifts enable row level security;

grant select on public.flower_gifts to authenticated;

-- Quietly visible to any resident viewing the review, same as crop_gifts.
create policy "flower_gifts_select_authenticated"
  on public.flower_gifts for select
  to authenticated
  using (true);

-- No insert policy: only gift_flower() may create these rows.

-- Transfers one of the caller's own flowers to another resident. Mirrors
-- gift_crop()'s lock -> ownership check -> mutate -> log shape. Flowers
-- have no offered_at equivalent (never used for shrine offerings), so
-- there is nothing analogous to gift_crop()'s "already offered" check.
create or replace function public.gift_flower(
  p_user_flower_id uuid,
  p_recipient_id uuid,
  p_library_review_id uuid default null
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

  -- user_flowers has unique(user_id, bloom_id): guard against the rare
  -- case where the recipient already independently holds this exact bloom.
  if exists (
    select 1 from public.user_flowers
    where user_id = p_recipient_id and bloom_id = v_flower.bloom_id
  ) then
    raise exception 'recipient already has this flower';
  end if;

  update public.user_flowers set user_id = p_recipient_id where id = p_user_flower_id;

  insert into public.flower_gifts (user_flower_id, giver_id, recipient_id, library_review_id, bloom_id)
    values (p_user_flower_id, v_user_id, p_recipient_id, p_library_review_id, v_flower.bloom_id);

  return json_build_object('status', 'ok');
end;
$$;

revoke all on function public.gift_flower(uuid, uuid, uuid) from public;
grant execute on function public.gift_flower(uuid, uuid, uuid) to authenticated;

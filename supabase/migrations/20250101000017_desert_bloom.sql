-- 砂漠の開拓: add a garden-style watering mechanic. Other villagers water a
-- story, and once enough have watered it (same threshold as the community
-- garden), it blooms into a random flower shared by the poster and every
-- waterer. Flowers are a completely separate reward track from crops
-- (own catalog/inventory tables) since they are never used for offerings.

alter table public.desert_stories
  add column status text not null default 'story' check (status in ('story', 'blooming', 'bloomed')),
  add column bloomed_at timestamptz;

-- Content editing stays fully open to the owner (unchanged product
-- decision), but status/bloomed_at must only ever change inside
-- water_desert_story() below, which runs as the table owner and so
-- bypasses this column grant entirely.
revoke update on public.desert_stories from authenticated;
grant update (suffering, action_taken, result, deleted_at) on public.desert_stories to authenticated;

create table public.desert_waterings (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.desert_stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (story_id, user_id)
);

create index desert_waterings_story_id_idx on public.desert_waterings(story_id);

alter table public.desert_waterings enable row level security;

-- select only: rows are written exclusively through water_desert_story().
grant select on public.desert_waterings to authenticated;

create policy "desert_waterings_select_authenticated"
  on public.desert_waterings for select
  to authenticated
  using (true);

create table public.flower_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.flower_catalog (name, emoji) values
  ('さくら', '🌸'),
  ('ひまわり', '🌻'),
  ('チューリップ', '🌷'),
  ('マーガレット', '🌼'),
  ('ハイビスカス', '🌺');

alter table public.flower_catalog enable row level security;

grant select on public.flower_catalog to authenticated;

create policy "flower_catalog_select_authenticated"
  on public.flower_catalog for select
  to authenticated
  using (true);

create table public.desert_blooms (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.desert_stories(id) on delete cascade,
  flower_id uuid not null references public.flower_catalog(id),
  created_at timestamptz not null default now()
);

alter table public.desert_blooms enable row level security;

grant select on public.desert_blooms to authenticated;

create policy "desert_blooms_select_authenticated"
  on public.desert_blooms for select
  to authenticated
  using (true);

-- No offered_at: flowers are collect-only (my-house display), never used
-- for shrine offerings, so there is nothing to track beyond ownership.
create table public.user_flowers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bloom_id uuid not null references public.desert_blooms(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, bloom_id)
);

create index user_flowers_user_id_idx on public.user_flowers(user_id);

alter table public.user_flowers enable row level security;

grant select on public.user_flowers to authenticated;

create policy "user_flowers_select_own"
  on public.user_flowers for select
  to authenticated
  using (user_id = auth.uid());

-- Mirrors water_seed(): the row lock on desert_stories serializes concurrent
-- waterings of the same story so a bloom can never double-fire. Reuses
-- game_settings.harvest_water_count so the two facilities stay in sync
-- unless deliberately split apart later.
create or replace function public.water_desert_story(p_story_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_story public.desert_stories%rowtype;
  v_required int;
  v_count int;
  v_flower_id uuid;
  v_bloom_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select * into v_story from public.desert_stories where id = p_story_id for update;
  if not found then
    raise exception 'story not found';
  end if;

  if v_story.user_id = v_user_id then
    raise exception 'cannot water your own story';
  end if;

  if v_story.status = 'bloomed' then
    raise exception 'story already bloomed';
  end if;

  insert into public.desert_waterings (story_id, user_id) values (p_story_id, v_user_id);

  select harvest_water_count into v_required from public.game_settings where id = 1;
  select count(*) into v_count from public.desert_waterings where story_id = p_story_id;

  if v_count >= v_required then
    select id into v_flower_id
      from public.flower_catalog
      where is_active
      order by random()
      limit 1;

    if v_flower_id is null then
      raise exception 'no active flowers configured';
    end if;

    insert into public.desert_blooms (story_id, flower_id)
      values (p_story_id, v_flower_id)
      returning id into v_bloom_id;

    update public.desert_stories
      set status = 'bloomed', bloomed_at = now()
      where id = p_story_id;

    insert into public.user_flowers (user_id, bloom_id)
    select distinct recipient, v_bloom_id
      from (
        select v_story.user_id as recipient
        union
        select user_id from public.desert_waterings where story_id = p_story_id
      ) recipients
    on conflict (user_id, bloom_id) do nothing;

    return json_build_object(
      'status', 'bloomed',
      'flower_id', v_flower_id,
      'bloom_id', v_bloom_id
    );
  end if;

  update public.desert_stories
    set status = 'blooming'
    where id = p_story_id and status <> 'blooming';

  return json_build_object('status', 'blooming', 'water_count', v_count, 'required', v_required);
end;
$$;

revoke all on function public.water_desert_story(uuid) from public;
grant execute on function public.water_desert_story(uuid) to authenticated;

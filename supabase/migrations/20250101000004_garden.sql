-- Phase 3: 農園 (garden) — plant a struggle as a seed, water each other's
-- seeds, and harvest crops that get distributed to everyone who helped.

create table public.game_settings (
  id smallint primary key default 1 check (id = 1),
  harvest_water_count int not null default 3,
  offering_recovery int not null default 1,
  daily_vitality_decay int not null default 10,
  max_vitality int not null default 100,
  vitality_state_threshold_1 int not null default 75,
  vitality_state_threshold_2 int not null default 50,
  vitality_state_threshold_3 int not null default 25,
  updated_at timestamptz not null default now()
);

insert into public.game_settings (id) values (1);

-- Not exposed to clients directly, and deliberately no table grant either:
-- every value here is read through SECURITY DEFINER functions (which run
-- as the table owner) so the frontend never has to, and can't, hardcode
-- balance numbers. See the vitality functions in the shrine migration.
alter table public.game_settings enable row level security;

create table public.crop_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.crop_catalog (name, emoji) values
  ('じゃがいも', '🥔'),
  ('にんじん', '🥕'),
  ('トマト', '🍅'),
  ('とうもろこし', '🌽'),
  ('かぼちゃ', '🎃');

alter table public.crop_catalog enable row level security;

grant select on public.crop_catalog to authenticated;

create policy "crop_catalog_select_authenticated"
  on public.crop_catalog for select
  to authenticated
  using (true);

create table public.garden_seeds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  struggle text not null check (char_length(trim(struggle)) > 0 and char_length(struggle) <= 2000),
  status text not null default 'seed' check (status in ('seed', 'growing', 'harvested')),
  created_at timestamptz not null default now(),
  harvested_at timestamptz
);

create index garden_seeds_user_id_idx on public.garden_seeds(user_id);
create index garden_seeds_status_idx on public.garden_seeds(status);

alter table public.garden_seeds enable row level security;

-- No update/delete grant: status transitions only ever happen inside
-- water_seed(), which runs as the table owner and doesn't need a role grant.
grant select, insert on public.garden_seeds to authenticated;

create policy "garden_seeds_select_authenticated"
  on public.garden_seeds for select
  to authenticated
  using (true);

-- Planting is a plain insert; growth/harvest transitions only ever happen
-- inside water_seed() below, so there is deliberately no UPDATE policy here.
create policy "garden_seeds_insert_own"
  on public.garden_seeds for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'seed'
    and harvested_at is null
  );

create table public.waterings (
  id uuid primary key default gen_random_uuid(),
  seed_id uuid not null references public.garden_seeds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (seed_id, user_id)
);

create index waterings_seed_id_idx on public.waterings(seed_id);

alter table public.waterings enable row level security;

-- select only: rows are written exclusively through water_seed(), which
-- runs as the table owner and doesn't need a role grant to insert.
grant select on public.waterings to authenticated;

create policy "waterings_select_authenticated"
  on public.waterings for select
  to authenticated
  using (true);

-- Deliberately no INSERT policy: rows are only ever created by water_seed(),
-- a SECURITY DEFINER function, so the "no watering your own seed", the
-- one-watering-per-person rule, and the harvest-at-3 logic can never be
-- bypassed by calling the table directly from the client.

create table public.harvests (
  id uuid primary key default gen_random_uuid(),
  seed_id uuid not null unique references public.garden_seeds(id) on delete cascade,
  crop_id uuid not null references public.crop_catalog(id),
  created_at timestamptz not null default now()
);

alter table public.harvests enable row level security;

-- select only: rows are written exclusively through water_seed().
grant select on public.harvests to authenticated;

create policy "harvests_select_authenticated"
  on public.harvests for select
  to authenticated
  using (true);

create table public.user_crops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  harvest_id uuid not null references public.harvests(id) on delete cascade,
  offered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, harvest_id)
);

create index user_crops_user_id_idx on public.user_crops(user_id);

alter table public.user_crops enable row level security;

-- select only: rows are written exclusively through water_seed() (insert)
-- and make_offering() (offered_at update), both running as the table owner.
grant select on public.user_crops to authenticated;

create policy "user_crops_select_own"
  on public.user_crops for select
  to authenticated
  using (user_id = auth.uid());

-- Distributed only by water_seed(); offered_at is only ever updated by
-- make_offering() in the shrine migration. No client-facing write policies.

-- Atomically records a watering and, once the seed has been watered
-- harvest_water_count times, harvests it and distributes the crop to the
-- planter and every waterer. The row lock on garden_seeds serializes
-- concurrent waterings of the same seed so a harvest can never double-fire.
create or replace function public.water_seed(p_seed_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_seed public.garden_seeds%rowtype;
  v_required int;
  v_count int;
  v_crop_id uuid;
  v_harvest_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select * into v_seed from public.garden_seeds where id = p_seed_id for update;
  if not found then
    raise exception 'seed not found';
  end if;

  if v_seed.user_id = v_user_id then
    raise exception 'cannot water your own seed';
  end if;

  if v_seed.status = 'harvested' then
    raise exception 'seed already harvested';
  end if;

  insert into public.waterings (seed_id, user_id) values (p_seed_id, v_user_id);

  select harvest_water_count into v_required from public.game_settings where id = 1;
  select count(*) into v_count from public.waterings where seed_id = p_seed_id;

  if v_count >= v_required then
    select id into v_crop_id
      from public.crop_catalog
      where is_active
      order by random()
      limit 1;

    if v_crop_id is null then
      raise exception 'no active crops configured';
    end if;

    insert into public.harvests (seed_id, crop_id)
      values (p_seed_id, v_crop_id)
      returning id into v_harvest_id;

    update public.garden_seeds
      set status = 'harvested', harvested_at = now()
      where id = p_seed_id;

    insert into public.user_crops (user_id, harvest_id)
    select distinct recipient, v_harvest_id
      from (
        select v_seed.user_id as recipient
        union
        select user_id from public.waterings where seed_id = p_seed_id
      ) recipients
    on conflict (user_id, harvest_id) do nothing;

    return json_build_object(
      'status', 'harvested',
      'crop_id', v_crop_id,
      'harvest_id', v_harvest_id
    );
  end if;

  update public.garden_seeds
    set status = 'growing'
    where id = p_seed_id and status <> 'growing';

  return json_build_object('status', 'growing', 'water_count', v_count, 'required', v_required);
end;
$$;

revoke all on function public.water_seed(uuid) from public;
grant execute on function public.water_seed(uuid) to authenticated;

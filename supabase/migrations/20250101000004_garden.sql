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
  -- 'ripening': kind=community only, water_seed()'s threshold was met but
  -- the crop isn't decided/distributed yet — that happens the next day at
  -- the earliest, when an eligible recipient calls claim_garden_harvest().
  status text not null default 'seed' check (status in ('seed', 'growing', 'ripening', 'harvested')),
  -- 'community' seeds are the shared 農園 (a struggle, watered by others).
  -- 'own_field' seeds are 自分の家の畑 (an accomplishment, watered only by
  -- the planter, repeatedly, up to harvest_count = 10). Shared table so
  -- crops from either land in the same user_crops inventory used
  -- everywhere else (my-house, shrine, bonfire gifting).
  kind text not null default 'community' check (kind in ('community', 'own_field')),
  -- Only meaningful for kind = 'own_field': how many times this seed has
  -- been harvested (caps at 10) and the last calendar date it was
  -- watered (at most once per day).
  harvest_count int not null default 0,
  last_watered_date date,
  -- Only meaningful while status='ripening': the earliest calendar date
  -- claim_garden_harvest() is allowed to finalize this seed's harvest.
  ready_at date,
  created_at timestamptz not null default now(),
  harvested_at timestamptz
);

comment on column public.garden_seeds.struggle is
  'For kind=community: the struggle planted as a seed. For kind=own_field: the accomplishment (できたこと) planted as a seed. Column name kept as-is to avoid touching the already-shipped community garden code.';

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
  -- Not unique: a community seed only ever gets one harvest (enforced by
  -- water_seed()'s own "already harvested" check), but an own_field seed
  -- is harvested repeatedly (once per watering, up to harvest_count = 10).
  seed_id uuid not null references public.garden_seeds(id) on delete cascade,
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

-- Permanent record of "this person clicked 受け取る for this harvest",
-- independent of user_crops (which gift_crop() can later move to someone
-- else). Without this, a recipient could gift their crop away via 焚き火
-- and then claim the same harvest again, since re-checking user_crops
-- alone can't tell "never claimed" apart from "claimed, then gave it away".
create table public.garden_harvest_claims (
  harvest_id uuid not null references public.harvests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (harvest_id, user_id)
);

alter table public.garden_harvest_claims enable row level security;

grant select on public.garden_harvest_claims to authenticated;

create policy "garden_harvest_claims_select_own"
  on public.garden_harvest_claims for select
  to authenticated
  using (user_id = auth.uid());

-- No insert policy: only claim_garden_harvest() may create these rows.

-- Atomically records a watering and, once the seed has been watered
-- harvest_water_count times, marks it 'ripening' with ready_at set to
-- tomorrow. The row lock on garden_seeds serializes concurrent waterings
-- of the same seed so this can never double-fire. Deliberately does NOT
-- decide the crop or distribute it here anymore — see
-- claim_garden_harvest() below, which only an eligible recipient can call,
-- and only once ready_at has arrived.
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

  if v_seed.status in ('ripening', 'harvested') then
    raise exception 'seed already harvested';
  end if;

  insert into public.waterings (seed_id, user_id) values (p_seed_id, v_user_id);

  select harvest_water_count into v_required from public.game_settings where id = 1;
  select count(*) into v_count from public.waterings where seed_id = p_seed_id;

  if v_count >= v_required then
    update public.garden_seeds
      set status = 'ripening', ready_at = current_date + 1
      where id = p_seed_id;

    return json_build_object(
      'status', 'ripening',
      'ready_at', (current_date + 1)
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

-- Finalizes (first call) and/or claims a ripened community-garden harvest.
-- The row lock on garden_seeds serializes concurrent claims of the same
-- seed, so the crop species is only ever decided once — the first
-- eligible person to claim locks it in for everyone, via the harvests row
-- that already exists by the time later claimers run.
create or replace function public.claim_garden_harvest(p_seed_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_seed public.garden_seeds%rowtype;
  v_is_eligible boolean;
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

  if v_seed.kind <> 'community' then
    raise exception 'not a community garden seed';
  end if;

  select (v_seed.user_id = v_user_id) or exists (
    select 1 from public.waterings where seed_id = p_seed_id and user_id = v_user_id
  ) into v_is_eligible;

  if not v_is_eligible then
    raise exception 'not eligible to claim this harvest';
  end if;

  if v_seed.status = 'ripening' then
    if v_seed.ready_at is null or v_seed.ready_at > current_date then
      raise exception 'not ready yet';
    end if;

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
  elsif v_seed.status = 'harvested' then
    select id into v_harvest_id from public.harvests where seed_id = p_seed_id;
  else
    raise exception 'not ready yet';
  end if;

  -- Permanent check: if this user already claimed this exact harvest
  -- before (even if they've since gifted the crop away and no longer
  -- hold it in user_crops), do nothing rather than granting a second one.
  if exists (
    select 1 from public.garden_harvest_claims
    where harvest_id = v_harvest_id and user_id = v_user_id
  ) then
    return json_build_object('status', 'already_claimed', 'harvest_id', v_harvest_id);
  end if;

  insert into public.garden_harvest_claims (harvest_id, user_id) values (v_harvest_id, v_user_id);

  insert into public.user_crops (user_id, harvest_id) values (v_user_id, v_harvest_id)
    on conflict (user_id, harvest_id) do nothing;

  return json_build_object('status', 'ok', 'harvest_id', v_harvest_id);
end;
$$;

revoke all on function public.claim_garden_harvest(uuid) from public;
grant execute on function public.claim_garden_harvest(uuid) to authenticated;

-- Waters the caller's own 自分の家の畑 seed: at most once per calendar
-- day (including the day it was planted), and never past 10 harvests.
-- Each successful watering immediately yields one random crop, credited
-- to the caller alone. The row lock on garden_seeds serializes concurrent
-- calls against the same seed. Deliberately separate from water_seed()
-- so the community garden's logic is never touched by this feature.
create or replace function public.water_own_field_seed(p_seed_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_seed public.garden_seeds%rowtype;
  v_crop_id uuid;
  v_harvest_id uuid;
  v_new_count int;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select * into v_seed from public.garden_seeds where id = p_seed_id for update;
  if not found then
    raise exception 'seed not found';
  end if;

  if v_seed.kind <> 'own_field' then
    raise exception 'not an own-field seed';
  end if;

  if v_seed.user_id <> v_user_id then
    raise exception 'not your field';
  end if;

  if v_seed.harvest_count >= 10 then
    raise exception 'this seed has already reached its harvest limit';
  end if;

  if v_seed.last_watered_date is not null and v_seed.last_watered_date >= current_date then
    raise exception 'already watered today';
  end if;

  select id into v_crop_id
    from public.crop_catalog
    where is_active
    order by random()
    limit 1;

  if v_crop_id is null then
    raise exception 'no active crops configured';
  end if;

  insert into public.harvests (seed_id, crop_id) values (p_seed_id, v_crop_id)
    returning id into v_harvest_id;

  insert into public.user_crops (user_id, harvest_id) values (v_user_id, v_harvest_id)
    on conflict (user_id, harvest_id) do nothing;

  v_new_count := v_seed.harvest_count + 1;

  update public.garden_seeds
    set harvest_count = v_new_count,
        last_watered_date = current_date,
        status = case when v_new_count >= 10 then 'harvested' else 'growing' end,
        harvested_at = case when v_new_count >= 10 then now() else harvested_at end
    where id = p_seed_id;

  return json_build_object('status', 'ok', 'crop_id', v_crop_id, 'harvest_count', v_new_count);
end;
$$;

revoke all on function public.water_own_field_seed(uuid) from public;
grant execute on function public.water_own_field_seed(uuid) to authenticated;

-- 農園: slow down the pacing. Reaching the watering threshold no longer
-- harvests instantly — it marks the seed 'ripening' with a ready_at date of
-- tomorrow. The actual crop is only decided (and distributed) when an
-- eligible recipient explicitly claims it via claim_garden_harvest(),
-- mirroring this app's existing "nothing happens until an explicit action"
-- philosophy (gift_crop, make_offering, etc). No cron needed: readiness is
-- just a current_date comparison, computed on read/action like vitality
-- decay already is.

-- Drop the existing status check constraint by its actual name (found via
-- pg_constraint rather than assumed) so this doesn't depend on guessing
-- Postgres's auto-generated name correctly.
do $$
declare
  v_constraint_name text;
begin
  select conname into v_constraint_name
    from pg_constraint
    where conrelid = 'public.garden_seeds'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%';

  if v_constraint_name is not null then
    execute format('alter table public.garden_seeds drop constraint %I', v_constraint_name);
  end if;
end $$;

alter table public.garden_seeds add constraint garden_seeds_status_check
  check (status in ('seed', 'growing', 'ripening', 'harvested'));

alter table public.garden_seeds add column ready_at date;

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

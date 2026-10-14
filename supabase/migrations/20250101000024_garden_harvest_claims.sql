-- Fix a real bug found while testing 20250101000023: checking user_crops
-- to decide "has this person already claimed this harvest" breaks once
-- gift_crop() moves the crop away from them (user_crops.user_id is
-- mutable), letting them claim the same harvest again. This adds a
-- permanent, independent claim record and makes claim_garden_harvest()
-- consult it instead.

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

-- Backfill: every community-garden crop that already exists in user_crops
-- was distributed before this "click to claim" flow existed. Without
-- this, every one of those historical harvests would suddenly look
-- unclaimed to everyone who was ever involved, flooding real users with
-- 受け取る notifications for crops they already have. (Known limitation:
-- if one of those crops was since gifted away, this backfills the claim
-- to whoever currently holds it rather than the original recipient —
-- there's no historical record of the original distribution independent
-- of user_crops' current, mutable ownership. Acceptable one-time gap for
-- pre-existing data.)
insert into public.garden_harvest_claims (harvest_id, user_id, claimed_at)
select uc.harvest_id, uc.user_id, uc.created_at
from public.user_crops uc
join public.harvests h on h.id = uc.harvest_id
join public.garden_seeds gs on gs.id = h.seed_id
where gs.kind = 'community'
on conflict (harvest_id, user_id) do nothing;

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

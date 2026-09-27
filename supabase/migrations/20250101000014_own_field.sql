-- 自分の家の畑 (own field): a solo counterpart to the community 農園.
-- Reuses garden_seeds/waterings/harvests/crop_catalog/user_crops (the
-- table already exists from migration 4) so crops earned here land in
-- the same shared inventory used everywhere else. Only a new RPC governs
-- the different rules (self-watering, once/day, 10-harvest cap);
-- water_seed() itself is untouched.

alter table public.garden_seeds
  add column kind text not null default 'community' check (kind in ('community', 'own_field'));
alter table public.garden_seeds add column harvest_count int not null default 0;
alter table public.garden_seeds add column last_watered_date date;

comment on column public.garden_seeds.struggle is
  'For kind=community: the struggle planted as a seed. For kind=own_field: the accomplishment (できたこと) planted as a seed. Column name kept as-is to avoid touching the already-shipped community garden code.';

-- A community seed only ever gets one harvest (still enforced by
-- water_seed()'s own "already harvested" check), but an own_field seed is
-- harvested repeatedly, so the DB-level "one harvest per seed" constraint
-- has to go.
alter table public.harvests drop constraint harvests_seed_id_key;

-- Only one unfinished own_field seed per resident at a time; community
-- seeds are unaffected.
drop policy "garden_seeds_insert_own" on public.garden_seeds;
create policy "garden_seeds_insert_own"
  on public.garden_seeds for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'seed'
    and harvested_at is null
    and (
      kind = 'community'
      or not exists (
        select 1 from public.garden_seeds gs
        where gs.user_id = auth.uid()
          and gs.kind = 'own_field'
          and gs.harvest_count < 10
      )
    )
  );

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

  if v_seed.created_at::date >= current_date then
    raise exception 'cannot water on the day you planted';
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

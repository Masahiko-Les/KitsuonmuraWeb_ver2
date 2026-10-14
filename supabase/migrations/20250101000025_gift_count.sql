-- Facility unlock system: profiles.gift_count is incremented atomically
-- inside each of the three gifting RPCs (crop gifts via 焚き火, flower
-- gifts via 図書館/映画館). Every page already fetches the full profile
-- row via requireProfile(), so checking "is facility X unlocked" against
-- this column costs zero additional queries — unlike counting rows in
-- crop_gifts/flower_gifts/cinema_flower_gifts on every page load, which
-- would undo the round-trip reductions just made elsewhere. Badge
-- thresholds themselves live in code (src/lib/unlocks.ts), not a DB
-- table, for the same reason.

alter table public.profiles add column gift_count int not null default 0;

create or replace function public.gift_crop(
  p_user_crop_id uuid,
  p_recipient_id uuid,
  p_bonfire_post_id uuid default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_crop public.user_crops%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_recipient_id = v_user_id then
    raise exception 'cannot gift a crop to yourself';
  end if;

  select * into v_crop from public.user_crops where id = p_user_crop_id for update;
  if not found then
    raise exception 'crop not found';
  end if;

  if v_crop.user_id <> v_user_id then
    raise exception 'not your crop';
  end if;

  if v_crop.offered_at is not null then
    raise exception 'crop already offered';
  end if;

  if exists (
    select 1 from public.user_crops
    where user_id = p_recipient_id and harvest_id = v_crop.harvest_id
  ) then
    raise exception 'recipient already has this crop';
  end if;

  update public.user_crops set user_id = p_recipient_id where id = p_user_crop_id;

  insert into public.crop_gifts (user_crop_id, giver_id, recipient_id, bonfire_post_id, harvest_id)
    values (p_user_crop_id, v_user_id, p_recipient_id, p_bonfire_post_id, v_crop.harvest_id);

  update public.profiles set gift_count = gift_count + 1 where user_id = v_user_id;

  return json_build_object('status', 'ok');
end;
$$;

revoke all on function public.gift_crop(uuid, uuid, uuid) from public;
grant execute on function public.gift_crop(uuid, uuid, uuid) to authenticated;

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

  if exists (
    select 1 from public.user_flowers
    where user_id = p_recipient_id and bloom_id = v_flower.bloom_id
  ) then
    raise exception 'recipient already has this flower';
  end if;

  update public.user_flowers set user_id = p_recipient_id where id = p_user_flower_id;

  insert into public.flower_gifts (user_flower_id, giver_id, recipient_id, library_review_id, bloom_id)
    values (p_user_flower_id, v_user_id, p_recipient_id, p_library_review_id, v_flower.bloom_id);

  update public.profiles set gift_count = gift_count + 1 where user_id = v_user_id;

  return json_build_object('status', 'ok');
end;
$$;

revoke all on function public.gift_flower(uuid, uuid, uuid) from public;
grant execute on function public.gift_flower(uuid, uuid, uuid) to authenticated;

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

  update public.profiles set gift_count = gift_count + 1 where user_id = v_user_id;

  return json_build_object('status', 'ok');
end;
$$;

revoke all on function public.gift_flower_to_cinema_review(uuid, uuid, uuid) from public;
grant execute on function public.gift_flower_to_cinema_review(uuid, uuid, uuid) to authenticated;

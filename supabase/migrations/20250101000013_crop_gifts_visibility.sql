-- Denormalize harvest_id onto crop_gifts so the crop given under a
-- bonfire post can be looked up (via harvests -> crop_catalog) without
-- joining through user_crops, whose current owner may no longer be the
-- original giver (RLS there is locked to "my own rows only").

alter table public.crop_gifts add column harvest_id uuid references public.harvests(id);

update public.crop_gifts cg
  set harvest_id = uc.harvest_id
  from public.user_crops uc
  where uc.id = cg.user_crop_id and cg.harvest_id is null;

-- A gift under a post should be quietly visible to any resident viewing
-- that post, not just the two people involved — same idea as offerings
-- being publicly viewable at 祠の裏.
drop policy "crop_gifts_select_own" on public.crop_gifts;
create policy "crop_gifts_select_authenticated"
  on public.crop_gifts for select
  to authenticated
  using (true);

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

  return json_build_object('status', 'ok');
end;
$$;

revoke all on function public.gift_crop(uuid, uuid, uuid) from public;
grant execute on function public.gift_crop(uuid, uuid, uuid) to authenticated;

-- Let a resident gift one of their own not-yet-offered crops to another
-- resident, typically from under one of their 焚き火 posts.

create table public.crop_gifts (
  id uuid primary key default gen_random_uuid(),
  user_crop_id uuid not null references public.user_crops(id) on delete cascade,
  giver_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  bonfire_post_id uuid references public.bonfire_posts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index crop_gifts_recipient_id_idx on public.crop_gifts(recipient_id);

alter table public.crop_gifts enable row level security;

grant select on public.crop_gifts to authenticated;

-- Quietly viewable by the two people involved — not a public feed.
create policy "crop_gifts_select_own"
  on public.crop_gifts for select
  to authenticated
  using (giver_id = auth.uid() or recipient_id = auth.uid());

-- No insert policy: only gift_crop() may create these rows.

-- Transfers one of the caller's own, not-yet-offered crops to another
-- resident. Ownership moves by updating user_crops.user_id directly (the
-- crop keeps its full harvest lineage); crop_gifts separately records who
-- gave it to whom, and from which bonfire post if any. Mirrors
-- make_offering()'s lock -> ownership check -> state check -> mutate ->
-- log shape.
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

  -- user_crops has unique(user_id, harvest_id): guard against the rare
  -- case where the recipient already independently holds this exact
  -- harvest (e.g. they were a co-waterer of the same seed).
  if exists (
    select 1 from public.user_crops
    where user_id = p_recipient_id and harvest_id = v_crop.harvest_id
  ) then
    raise exception 'recipient already has this crop';
  end if;

  update public.user_crops set user_id = p_recipient_id where id = p_user_crop_id;

  insert into public.crop_gifts (user_crop_id, giver_id, recipient_id, bonfire_post_id)
    values (p_user_crop_id, v_user_id, p_recipient_id, p_bonfire_post_id);

  return json_build_object('status', 'ok');
end;
$$;

revoke all on function public.gift_crop(uuid, uuid, uuid) from public;
grant execute on function public.gift_crop(uuid, uuid, uuid) to authenticated;

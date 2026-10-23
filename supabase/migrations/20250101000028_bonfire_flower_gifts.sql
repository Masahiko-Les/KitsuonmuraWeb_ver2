-- Let flowers (not just crops) be gifted at the bonfire, attached to a
-- post. Reuses flower_gifts (already shared between library reviews and
-- now bonfire posts) rather than adding a third gift table, matching how
-- crop_gifts already carries a bonfire_post_id.

alter table public.flower_gifts
  add column bonfire_post_id uuid references public.bonfire_posts(id) on delete set null;

-- Adding a parameter changes the signature, so plain `create or replace`
-- would leave the old 3-arg version in place as a separate overload
-- (ambiguous for PostgREST's RPC call resolution). Drop it explicitly.
drop function if exists public.gift_flower(uuid, uuid, uuid);

create or replace function public.gift_flower(
  p_user_flower_id uuid,
  p_recipient_id uuid,
  p_library_review_id uuid default null,
  p_bonfire_post_id uuid default null
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

  insert into public.flower_gifts (user_flower_id, giver_id, recipient_id, library_review_id, bonfire_post_id, bloom_id)
    values (p_user_flower_id, v_user_id, p_recipient_id, p_library_review_id, p_bonfire_post_id, v_flower.bloom_id);

  update public.profiles set gift_count = gift_count + 1 where user_id = v_user_id;

  return json_build_object('status', 'ok');
end;
$$;

revoke all on function public.gift_flower(uuid, uuid, uuid, uuid) from public;
grant execute on function public.gift_flower(uuid, uuid, uuid, uuid) to authenticated;

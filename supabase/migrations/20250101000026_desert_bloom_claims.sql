-- Incremental version of the desert_bloom_claims addition made directly
-- in 20250101000017_desert_bloom.sql (source of truth for fresh installs).
-- See that file's comments for the full rationale: a permanent record of
-- "this person was credited for this bloom", independent of user_flowers
-- which moves to a new owner when gifted away.

create table public.desert_bloom_claims (
  bloom_id uuid not null references public.desert_blooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (bloom_id, user_id)
);

alter table public.desert_bloom_claims enable row level security;

grant select on public.desert_bloom_claims to authenticated;

create policy "desert_bloom_claims_select_own"
  on public.desert_bloom_claims for select
  to authenticated
  using (user_id = auth.uid());

-- Backfill: every existing user_flowers row today represents a legitimate
-- historical claim (nothing has gifted desert flowers away yet since this
-- is the first migration introducing that ability's claim trail), so a
-- direct 1:1 copy is safe and avoids spuriously resetting anyone's diary.
insert into public.desert_bloom_claims (bloom_id, user_id, claimed_at)
select bloom_id, user_id, created_at
  from public.user_flowers
on conflict (bloom_id, user_id) do nothing;

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

    insert into public.desert_bloom_claims (user_id, bloom_id)
    select distinct recipient, v_bloom_id
      from (
        select v_story.user_id as recipient
        union
        select user_id from public.desert_waterings where story_id = p_story_id
      ) recipients
    on conflict (bloom_id, user_id) do nothing;

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

-- Phase 4: 祠 (shrine) — village vitality and offerings.

create table public.village_state (
  id smallint primary key default 1 check (id = 1),
  base_vitality int not null default 100,
  last_calculated_date date not null default current_date,
  updated_at timestamptz not null default now()
);

insert into public.village_state (id) values (1);

-- No client-facing SELECT/UPDATE policy at all, and deliberately no table
-- grant either: the raw number is never shown in the UI, and every
-- read/write goes through the SECURITY DEFINER functions below (which run
-- as the table owner, so they need no role grant) so the decay math and
-- clamping can't be bypassed.
alter table public.village_state enable row level security;

create table public.offerings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_crop_id uuid not null unique references public.user_crops(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index offerings_created_at_idx on public.offerings(created_at desc);

alter table public.offerings enable row level security;

-- select only: rows are written exclusively through make_offering().
grant select on public.offerings to authenticated;

-- Quietly viewable by any resident (祠の裏) — not ranked, just a record.
create policy "offerings_select_authenticated"
  on public.offerings for select
  to authenticated
  using (true);

-- No insert policy: only make_offering() may create these rows.

-- Current vitality = last stored value minus decay for elapsed days,
-- clamped to [0, max_vitality]. Read-only, no writes.
create or replace function public.get_current_vitality()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state public.village_state%rowtype;
  v_settings public.game_settings%rowtype;
  v_days int;
begin
  select * into v_state from public.village_state where id = 1;
  select * into v_settings from public.game_settings where id = 1;

  v_days := greatest(0, current_date - v_state.last_calculated_date);

  return greatest(
    0,
    least(
      v_settings.max_vitality,
      v_state.base_vitality - v_days * v_settings.daily_vitality_decay
    )
  );
end;
$$;

revoke all on function public.get_current_vitality() from public;
grant execute on function public.get_current_vitality() to authenticated;

-- Translates the hidden number into one of the four village moods. The
-- thresholds live in game_settings so they can be tuned without a deploy.
create or replace function public.get_village_status()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.game_settings%rowtype;
  v_current int;
  v_tier int;
  v_message text;
begin
  select * into v_settings from public.game_settings where id = 1;
  v_current := public.get_current_vitality();

  if v_current >= v_settings.vitality_state_threshold_1 then
    v_tier := 1;
    v_message := '村にはあたたかな気配が満ちています';
  elsif v_current >= v_settings.vitality_state_threshold_2 then
    v_tier := 2;
    v_message := '少し元気がないようです';
  elsif v_current >= v_settings.vitality_state_threshold_3 then
    v_tier := 3;
    v_message := '村に不穏な静けさが漂っています';
  else
    v_tier := 4;
    v_message := 'このままでは村が枯れてしまいそうです';
  end if;

  return json_build_object('tier', v_tier, 'message', v_message);
end;
$$;

revoke all on function public.get_village_status() from public;
grant execute on function public.get_village_status() to authenticated;

-- Offers one of the caller's own, not-yet-offered crops to the shrine:
-- recomputes current vitality, adds offering_recovery, clamps to
-- max_vitality, and persists that as the new baseline (resetting the decay
-- clock to today). Row locks on user_crops and village_state make this
-- safe against concurrent offerings.
create or replace function public.make_offering(p_user_crop_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_crop public.user_crops%rowtype;
  v_settings public.game_settings%rowtype;
  v_state public.village_state%rowtype;
  v_days int;
  v_current int;
  v_new int;
begin
  if v_user_id is null then
    raise exception 'authentication required';
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

  select * into v_settings from public.game_settings where id = 1;
  select * into v_state from public.village_state where id = 1 for update;

  v_days := greatest(0, current_date - v_state.last_calculated_date);
  v_current := greatest(
    0,
    least(v_settings.max_vitality, v_state.base_vitality - v_days * v_settings.daily_vitality_decay)
  );
  v_new := least(v_settings.max_vitality, v_current + v_settings.offering_recovery);

  update public.village_state
    set base_vitality = v_new, last_calculated_date = current_date, updated_at = now()
    where id = 1;

  insert into public.offerings (user_id, user_crop_id) values (v_user_id, p_user_crop_id);

  update public.user_crops set offered_at = now() where id = p_user_crop_id;

  return json_build_object('new_vitality', v_new);
end;
$$;

revoke all on function public.make_offering(uuid) from public;
grant execute on function public.make_offering(uuid) to authenticated;

-- 祠の裏 (offering history) needs each offering's crop name, but user_crops
-- is locked to "select your own rows only" (see garden migration), which
-- would silently hide every other resident's crop when queried directly.
-- This SECURITY DEFINER function joins through that restriction so the
-- (non-ranked) public history stays visible to any resident, same as the
-- offerings table itself already is.
create or replace function public.get_offering_history()
returns table (
  id uuid,
  created_at timestamptz,
  user_id uuid,
  crop_name text,
  crop_emoji text
)
language sql
security definer
set search_path = public
as $$
  select
    o.id,
    o.created_at,
    o.user_id,
    cc.name as crop_name,
    cc.emoji as crop_emoji
  from public.offerings o
  join public.user_crops uc on uc.id = o.user_crop_id
  join public.harvests h on h.id = uc.harvest_id
  join public.crop_catalog cc on cc.id = h.crop_id
  order by o.created_at desc;
$$;

revoke all on function public.get_offering_history() from public;
grant execute on function public.get_offering_history() to authenticated;

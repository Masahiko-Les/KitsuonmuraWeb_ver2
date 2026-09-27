-- 自分の家の畑: remove the "only one unfinished own_field seed at a time"
-- restriction. Planting has no daily/concurrent limit; only watering
-- stays capped at once per day per seed (unchanged, in
-- water_own_field_seed()).

drop policy "garden_seeds_insert_own" on public.garden_seeds;
create policy "garden_seeds_insert_own"
  on public.garden_seeds for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'seed'
    and harvested_at is null
  );

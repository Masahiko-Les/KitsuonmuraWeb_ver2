-- 農園（community seed）の収穫に必要な水やり人数を3人から1人に変更。
-- water_seed() はこの行を毎回読んでいるため、コード側の変更は不要。
update public.game_settings set harvest_water_count = 1 where id = 1;

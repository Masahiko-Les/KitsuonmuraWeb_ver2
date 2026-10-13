-- 言いにくい言葉: a tag-style free-text array field, same shape as the
-- existing stutter_types/difficult_sounds columns. Kept as discrete array
-- entries (not one freeform paragraph) specifically so it can later be
-- aggregated per-word with a single query, e.g.:
--   select word, count(*) from profiles, unnest(difficult_words) as word
--   group by word order by count(*) desc;
-- No new RLS policy needed: profiles' existing select/insert/update
-- policies already cover the whole row, not individual columns.

alter table public.profiles add column difficult_words text[] not null default '{}';

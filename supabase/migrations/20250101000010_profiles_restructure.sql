-- Restructure 住民票 (profiles): rename village_name -> nickname, drop the
-- unused avatar image, and add four new optional reflection fields.
-- The table already exists (migration 2 ran already), so alter it in
-- place instead of recreating it.

alter table public.profiles rename column village_name to nickname;
alter table public.profiles rename constraint profiles_village_name_check to profiles_nickname_check;

alter table public.profiles drop column avatar_url;

alter table public.profiles
  add column favorite_things text check (favorite_things is null or char_length(favorite_things) <= 2000),
  add column difficult_situations text check (difficult_situations is null or char_length(difficult_situations) <= 2000),
  add column easy_situations text check (easy_situations is null or char_length(easy_situations) <= 2000),
  add column first_noticed_stutter text check (first_noticed_stutter is null or char_length(first_noticed_stutter) <= 2000);

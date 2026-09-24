-- Lower 砂漠 (desert) story fields' minimum from 100 to 10 characters.
-- Table already exists with the 100-char constraint from migration 8,
-- so alter it in place instead of recreating it.

alter table public.desert_stories
  drop constraint desert_stories_suffering_check,
  drop constraint desert_stories_action_taken_check,
  drop constraint desert_stories_result_check;

alter table public.desert_stories
  add constraint desert_stories_suffering_check
    check (char_length(trim(suffering)) >= 10 and char_length(suffering) <= 4000),
  add constraint desert_stories_action_taken_check
    check (char_length(trim(action_taken)) >= 10 and char_length(action_taken) <= 4000),
  add constraint desert_stories_result_check
    check (char_length(trim(result)) >= 10 and char_length(result) <= 4000);

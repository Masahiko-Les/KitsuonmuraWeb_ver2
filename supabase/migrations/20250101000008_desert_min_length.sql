-- Raise 砂漠 (desert) story fields from "just not empty" to "at least 100
-- characters", so entries stay a real reflection rather than a one-liner.
-- The table already exists (migration 6 ran already), so alter it in
-- place instead of recreating it.

alter table public.desert_stories
  drop constraint desert_stories_suffering_check,
  drop constraint desert_stories_action_taken_check,
  drop constraint desert_stories_result_check;

alter table public.desert_stories
  add constraint desert_stories_suffering_check
    check (char_length(trim(suffering)) >= 100 and char_length(suffering) <= 4000),
  add constraint desert_stories_action_taken_check
    check (char_length(trim(action_taken)) >= 100 and char_length(action_taken) <= 4000),
  add constraint desert_stories_result_check
    check (char_length(trim(result)) >= 100 and char_length(result) <= 4000);

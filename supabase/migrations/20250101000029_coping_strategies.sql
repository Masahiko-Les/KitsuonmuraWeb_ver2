-- 住民票に「自分の対処法」欄を追加。既存のdifficult_situations等と
-- 同じ任意テキストの扱い（nullable、2000文字上限）。RLSは行レベルの
-- 既存ポリシー（profiles_update_own等）がそのまま効くので変更不要。

alter table public.profiles
  add column coping_strategies text
    check (coping_strategies is null or char_length(coping_strategies) <= 2000);

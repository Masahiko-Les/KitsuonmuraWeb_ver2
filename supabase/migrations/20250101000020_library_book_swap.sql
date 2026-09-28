-- Swap out 成人吃音とともに (no reviews on it) for 吃音の世界 (光文社新書)
-- by 菊池良和, at the same sort position.

delete from public.book_catalog where title = '成人吃音とともに';

insert into public.book_catalog (title, author, description, sort_order) values
  (
    '吃音の世界 (光文社新書)',
    '菊池良和',
    null,
    2
  );

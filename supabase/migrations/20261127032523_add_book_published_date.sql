-- books に発売日を追加（お宝度の「希少性」で、発売からの年数に使う）
-- openBD の pubdate を優先し、なければ楽天ブックスの salesDate を使う。
-- 月までしか分からない本は 1 日、年までしか分からない本は 1 月 1 日として保存する

alter table public.books
  add column published_date date;

comment on column public.books.published_date is '発売日。日が不明なら 1 日、月が不明なら 1 月 1 日。分からない本は null';

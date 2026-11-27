-- books の発売日は年月までにする
-- 日は API によって有ったり無かったりして、本ごとに精度がばらばらになるため。
-- 型は date のまま（並べ替えや年数の計算がしやすい）にして、日はいつも 1 日にそろえる。
-- 年しか分からない本は 1 月 1 日として入れ、published_date_precision で「年まで」と分かるようにする

-- すでに日が入っている行は、その月の 1 日に直す
update public.books
  set published_date = date_trunc('month', published_date)::date
  where published_date is not null
    and extract(day from published_date) <> 1;

alter table public.books
  add constraint books_published_date_first_of_month
  check (published_date is null or extract(day from published_date) = 1);

alter table public.books
  add column published_date_precision text
  check (published_date_precision in ('year', 'month'));

-- すでに入っている発売日は、月まで分かっているものとして扱う
update public.books
  set published_date_precision = 'month'
  where published_date is not null;

-- 発売日と精度は、両方入っているか両方空かのどちらか
alter table public.books
  add constraint books_published_date_precision_pair
  check ((published_date is null) = (published_date_precision is null));

comment on column public.books.published_date is '発売日（年月まで。日はいつも 1 日。年しか分からなければ 1 月 1 日）。分からない本は null';
comment on column public.books.published_date_precision is '発売日がどこまで分かっているか。year（年まで）か month（年月まで）。発売日が null なら null';

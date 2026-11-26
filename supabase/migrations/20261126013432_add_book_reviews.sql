-- books にネットの評価（楽天ブックスのレビュー）を追加
-- 本ごとに 1 つの値なので books に持つ。ユーザー自身の感想を持つ場合は collection_items に別で追加する

alter table public.books
  -- 星の平均（0.00〜5.00）。楽天ブックス API の reviewAverage。レビューがない・楽天で見つからない本は null
  add column review_average numeric(3, 2)
    check (review_average >= 0 and review_average <= 5),
  -- レビュー件数。楽天ブックス API の reviewCount。楽天で見つからない本は null
  add column review_count integer
    check (review_count >= 0);

comment on column public.books.review_average is '楽天ブックスのレビュー平均（星 0〜5）。登録時点の値';
comment on column public.books.review_count is '楽天ブックスのレビュー件数。登録時点の値';

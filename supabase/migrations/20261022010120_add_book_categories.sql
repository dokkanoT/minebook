-- 書籍カテゴリー（アプリ独自の分類）。楽天ブックスのジャンルから自動で割り当てる

create table public.categories (
  slug text primary key check (slug ~ '^[a-z_]+$'),
  name text not null,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

comment on table public.categories is '書籍カテゴリー（絞り込み・ランキング用）';

insert into public.categories (slug, name, sort_order) values
  ('novel',        '小説・文学',           10),
  ('light_novel',  'ライトノベル',         20),
  ('comic',        '漫画',                 30),
  ('kids',         '絵本・児童書',         40),
  ('business',     'ビジネス・経済',       50),
  ('computer',     'パソコン・IT',         60),
  ('science',      '科学・技術・医学',     70),
  ('humanities',   '人文・思想・社会',     80),
  ('hobby',        '趣味・スポーツ・芸術', 90),
  ('lifestyle',    '暮らし・健康・旅行',  100),
  ('study',        '語学・学習・資格',    110),
  ('other',        'その他',              999);

alter table public.categories enable row level security;

-- マスターデータなので誰でも参照可。変更はマイグレーションでのみ行う
create policy "categories_select_all" on public.categories
  for select to anon, authenticated
  using (true);

revoke insert, update, delete, truncate on table public.categories from anon, authenticated;

-- books にカテゴリーを追加
alter table public.books
  -- 楽天ブックスの booksGenreId をそのまま保存（"001004008/001019001" のようにスラッシュ区切り）。
  -- 対応表を見直したときに、外部 API を再取得せずにカテゴリーを振り直せるようにするため
  add column rakuten_genre_id text,
  -- 未判定（楽天で見つからない等）は null
  add column category text
    references public.categories (slug) on update cascade on delete set null;

create index books_category_idx on public.books (category);

-- ダッシュボードで作成したテーブルの制約・RLS を整理する
-- （適用時点で全テーブル 0 件のため、NOT NULL 化などはデータ移行なしで行う）

------------------------------------------------------------
-- books
------------------------------------------------------------
alter table public.books
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

------------------------------------------------------------
-- shelves
------------------------------------------------------------
alter table public.shelves rename constraint solves_pkey to shelves_pkey;

-- UNIQUE(user_id) / UNIQUE(name) だと「1 ユーザー 1 本棚」「本棚名が全ユーザーで重複不可」になってしまう
alter table public.shelves
  drop constraint shelves_user_id_key,
  drop constraint shelves_name_key,
  drop constraint solves_user_id_fkey;

alter table public.shelves
  alter column user_id drop default,
  alter column user_id set not null,
  alter column name set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  add constraint shelves_user_id_fkey
    foreign key (user_id) references public.users (id) on delete cascade,
  add constraint shelves_user_id_name_key unique (user_id, name);

------------------------------------------------------------
-- tags
------------------------------------------------------------
alter table public.tags
  drop constraint tags_user_id_key,
  drop constraint tags_name_key,
  drop constraint tags_user_id_fkey;

alter table public.tags
  alter column user_id drop default,
  alter column user_id set not null,
  alter column name set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  add constraint tags_user_id_fkey
    foreign key (user_id) references public.users (id) on delete cascade,
  add constraint tags_user_id_name_key unique (user_id, name);

------------------------------------------------------------
-- collection_items
------------------------------------------------------------
alter table public.collection_items
  drop constraint collection_items_user_id_fkey,
  drop constraint collection_items_shelf_id_fkey;

alter table public.collection_items
  alter column user_id set not null,
  alter column isbn set not null,
  alter column scanned_at set default now(),
  alter column scanned_at set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  add constraint collection_items_user_id_fkey
    foreign key (user_id) references public.users (id) on delete cascade,
  -- 本棚を消してもアイテムは残す（未分類になる）
  add constraint collection_items_shelf_id_fkey
    foreign key (shelf_id) references public.shelves (id) on delete set null;

create index collection_items_user_id_idx on public.collection_items (user_id);
create index collection_items_shelf_id_idx on public.collection_items (shelf_id);

------------------------------------------------------------
-- collection_item_tags（多対多の中間テーブル）
------------------------------------------------------------
-- 各列の単独 UNIQUE だと「1 アイテムにタグ 1 つ」「1 タグは 1 アイテムだけ」になってしまう
alter table public.collection_item_tags
  drop constraint collection_item_tags_collection_item_id_key,
  drop constraint collection_item_tags_tag_id_key,
  drop constraint collection_item_tags_collection_item_id_fkey,
  drop constraint collection_item_tags_tag_id_fkey;

alter table public.collection_item_tags
  alter column collection_item_id drop default,
  alter column tag_id drop default,
  alter column created_at set default now(),
  alter column created_at set not null,
  add constraint collection_item_tags_pkey primary key (collection_item_id, tag_id),
  add constraint collection_item_tags_collection_item_id_fkey
    foreign key (collection_item_id) references public.collection_items (id) on delete cascade,
  add constraint collection_item_tags_tag_id_fkey
    foreign key (tag_id) references public.tags (id) on delete cascade;

create index collection_item_tags_tag_id_idx on public.collection_item_tags (tag_id);

-- RLS が無効だったため anon key で誰でも読み書きできる状態だった
alter table public.collection_item_tags enable row level security;

------------------------------------------------------------
-- RLS ポリシー
-- 既存ポリシーは TO PUBLIC（anon 含む）が混在していたので作り直す
------------------------------------------------------------
drop policy "Enable read access for all users" on public.books;
drop policy "Enable users to view their own data only" on public.collection_items;
drop policy "Enable insert for users based on user_id" on public.collection_items;
drop policy "Enable update for users based on user_id" on public.collection_items;
drop policy "Enable delete for users based on user_id" on public.collection_items;
drop policy "Enable users to view their own data only" on public.shelves;
drop policy "Enable insert for users based on user_id" on public.shelves;
drop policy "Enable update for users based on user_id" on public.shelves;
drop policy "Enable delete for users based on user_id" on public.shelves;
drop policy "Enable users to view their own data only" on public.tags;
drop policy "Enable insert for users based on user_id" on public.tags;
drop policy "Enable update for users based on user_id" on public.tags;
drop policy "Enable delete for users based on user_id" on public.tags;

-- books: 書籍マスターは誰でも参照可（書き込みはサーバー側で行う想定のためポリシーなし）
create policy "books_select_all" on public.books
  for select to anon, authenticated
  using (true);

-- collection_items / shelves / tags: 本人の行だけ操作可
create policy "collection_items_select_own" on public.collection_items
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "collection_items_insert_own" on public.collection_items
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "collection_items_update_own" on public.collection_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "collection_items_delete_own" on public.collection_items
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "shelves_select_own" on public.shelves
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "shelves_insert_own" on public.shelves
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "shelves_update_own" on public.shelves
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "shelves_delete_own" on public.shelves
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "tags_select_own" on public.tags
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "tags_insert_own" on public.tags
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "tags_update_own" on public.tags
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "tags_delete_own" on public.tags
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- collection_item_tags: 自分のアイテムに自分のタグを付け外しできる
create policy "collection_item_tags_select_own" on public.collection_item_tags
  for select to authenticated
  using (
    exists (
      select 1 from public.collection_items ci
      where ci.id = collection_item_id and ci.user_id = (select auth.uid())
    )
  );
create policy "collection_item_tags_insert_own" on public.collection_item_tags
  for insert to authenticated
  with check (
    exists (
      select 1 from public.collection_items ci
      where ci.id = collection_item_id and ci.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.tags t
      where t.id = tag_id and t.user_id = (select auth.uid())
    )
  );
create policy "collection_item_tags_delete_own" on public.collection_item_tags
  for delete to authenticated
  using (
    exists (
      select 1 from public.collection_items ci
      where ci.id = collection_item_id and ci.user_id = (select auth.uid())
    )
  );

------------------------------------------------------------
-- トリガー関数を API（RPC）から呼べないようにする
------------------------------------------------------------
revoke execute on function public.handle_new_user() from public, anon, authenticated;

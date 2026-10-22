-- collection_items の shelf_id に他人の本棚を指定できないようにする
-- （FK は存在チェックだけで所有者を見ないため）

drop policy "collection_items_insert_own" on public.collection_items;
drop policy "collection_items_update_own" on public.collection_items;

create policy "collection_items_insert_own" on public.collection_items
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      shelf_id is null
      or exists (
        select 1 from public.shelves s
        where s.id = shelf_id and s.user_id = (select auth.uid())
      )
    )
  );

create policy "collection_items_update_own" on public.collection_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      shelf_id is null
      or exists (
        select 1 from public.shelves s
        where s.id = shelf_id and s.user_id = (select auth.uid())
      )
    )
  );

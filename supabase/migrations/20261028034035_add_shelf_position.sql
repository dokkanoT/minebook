-- 棚の中の並び順（fractional indexing のキー。例: "a0", "a0V", "a1"）
-- キーは大文字・小文字を区別したバイト順で比較する必要があるため collate "C" を指定する
alter table public.collection_items
  add column shelf_position text collate "C";

-- 未配置（shelf_id が null）のときは並び順も null、配置済みなら必ず並び順がある
alter table public.collection_items
  add constraint collection_items_shelf_position_check
    check ((shelf_id is null) = (shelf_position is null));

-- 同じ棚で並び順が重複しないようにする（同時に同じ位置へ置いた場合の保険）
alter table public.collection_items
  add constraint collection_items_shelf_position_key
    unique (shelf_id, shelf_position);

-- 棚の削除（on delete set null）や未配置への変更で shelf_id が null になったら、並び順も消す
create function public.clear_shelf_position()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.shelf_id is null then
    new.shelf_position = null;
  end if;
  return new;
end;
$$;

revoke execute on function public.clear_shelf_position() from public, anon, authenticated;

create trigger collection_items_clear_shelf_position
  before insert or update of shelf_id on public.collection_items
  for each row execute function public.clear_shelf_position();

-- (shelf_id, shelf_position) の UNIQUE 制約のインデックスで棚ごとの並び順の取得も賄えるので、
-- shelf_id 単独のインデックスは不要
drop index public.collection_items_shelf_id_idx;

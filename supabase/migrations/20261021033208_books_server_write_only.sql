-- books（書籍マスター）は全ユーザー共有のため、クライアントからの書き込みを禁止する。
-- 書き込みはサーバーが外部 API（openBD 等）から取得したデータのみを secret key で行う。

-- RLS に加えて権限レベルでも書き込みを塞ぐ（ポリシーの付け間違いへの保険）
revoke insert, update, delete, truncate on table public.books from anon, authenticated;

-- ISBN は ISBN-13（ハイフンなし）に正規化して保存する
alter table public.books
  add constraint books_isbn_format_check check (isbn ~ '^97[89][0-9]{10}$');

-- updated_at を自動更新
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

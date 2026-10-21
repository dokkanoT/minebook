-- ユーザープロフィール（auth.users と 1:1）
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 30),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- 自分のプロフィールだけ参照・更新できる
-- （ランキング等で他人の表示名が必要になったら公開用ポリシーを追加する）
create policy "users_select_own"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "users_update_own"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- INSERT / DELETE はポリシーを作らない（トリガーと auth.users の cascade のみ）

-- サインアップ時にプロフィール行を自動作成
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 30), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

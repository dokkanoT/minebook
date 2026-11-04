-- Google などの OAuth で登録したユーザーは、名前が display_name ではなく full_name / name に入る
-- メール登録の display_name を優先し、なければ OAuth の名前を初期値にする
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $function$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    nullif(left(trim(coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )), 30), '')
  );
  return new;
end;
$function$;

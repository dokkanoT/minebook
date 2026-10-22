SET local check_function_bodies = off;

CREATE TABLE "public"."books" (
  "isbn"        text                     NOT NULL,
  "title"       text                     NOT NULL,
  "author"      text,
  "publisher"   text,
  "description" text,
  "cover_url"   text,
  "list_price"  integer,
  "created_at"  timestamp with time zone,
  "updated_at"  timestamp with time zone,
  CONSTRAINT "books_pkey" PRIMARY KEY (isbn)
);

ALTER TABLE "public"."books"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."collection_item_tags" (
  "collection_item_id" uuid                     DEFAULT gen_random_uuid(),
  "tag_id"             uuid                     DEFAULT gen_random_uuid(),
  "created_at"         timestamp with time zone,
  CONSTRAINT "collection_item_tags_collection_item_id_key" UNIQUE (collection_item_id),
  CONSTRAINT "collection_item_tags_tag_id_key" UNIQUE (tag_id)
);

CREATE TABLE "public"."collection_items" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid,
  "isbn"           text,
  "shelf_id"       uuid,
  "store_price"    integer,
  "treasure_score" integer,
  "store_name"     text,
  "purchase_date"  date,
  "notes"          text,
  "status"         text,
  "scanned_at"     timestamp with time zone,
  "created_at"     timestamp with time zone,
  CONSTRAINT "collection_items_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."collection_items"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."shelves" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     DEFAULT gen_random_uuid(),
  "name"       text,
  "created_at" timestamp with time zone,
  CONSTRAINT "shelves_name_key" UNIQUE (name),
  CONSTRAINT "shelves_user_id_key" UNIQUE (user_id),
  CONSTRAINT "solves_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."shelves"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."tags" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     DEFAULT gen_random_uuid(),
  "name"       text,
  "color"      text,
  "created_at" timestamp with time zone,
  CONSTRAINT "tags_name_key" UNIQUE (name),
  CONSTRAINT "tags_pkey" PRIMARY KEY (id),
  CONSTRAINT "tags_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."tags"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "id"           uuid                     NOT NULL,
  "display_name" text,
  "avatar_url"   text,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "users_display_name_check" CHECK ((char_length(display_name) <= 30)),
  CONSTRAINT "users_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 30), '')
  );
  return new;
end;
$function$;

ALTER TABLE "public"."collection_items"
  ADD CONSTRAINT "collection_items_isbn_fkey" FOREIGN KEY (isbn) REFERENCES public.books(isbn);

ALTER TABLE "public"."collection_item_tags"
  ADD CONSTRAINT "collection_item_tags_collection_item_id_fkey" FOREIGN KEY (collection_item_id) REFERENCES public.collection_items(id);

ALTER TABLE "public"."collection_items"
  ADD CONSTRAINT "collection_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."collection_items"
  ADD CONSTRAINT "collection_items_shelf_id_fkey" FOREIGN KEY (shelf_id) REFERENCES public.shelves(id);

ALTER TABLE "public"."shelves"
  ADD CONSTRAINT "solves_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."collection_item_tags"
  ADD CONSTRAINT "collection_item_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id);

ALTER TABLE "public"."tags"
  ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."users"
  ADD CONSTRAINT "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Enable read access for all users" ON "public"."books"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable delete for users based on user_id" ON "public"."collection_items"
  FOR DELETE
  TO PUBLIC
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."collection_items"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Enable update for users based on user_id" ON "public"."collection_items"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Enable users to view their own data only" ON "public"."collection_items"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."shelves"
  FOR DELETE
  TO PUBLIC
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."shelves"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Enable update for users based on user_id" ON "public"."shelves"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Enable users to view their own data only" ON "public"."shelves"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."tags"
  FOR DELETE
  TO PUBLIC
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."tags"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Enable update for users based on user_id" ON "public"."tags"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Enable users to view their own data only" ON "public"."tags"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "users_select_own" ON "public"."users"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "users_update_own" ON "public"."users"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

COMMENT ON TABLE "public"."books" IS '書籍マスター';

COMMENT ON TABLE "public"."collection_item_tags" IS 'アイテムとタグの中間テーブル';

COMMENT ON TABLE "public"."collection_items" IS 'ユーザごとのコレクションアイテム';

COMMENT ON TABLE "public"."shelves" IS 'ユーザの本棚';

COMMENT ON TABLE "public"."tags" IS 'ユーザのタグ';

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."books" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."books" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."books" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."books" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."collection_item_tags" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."collection_item_tags" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."collection_item_tags" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."collection_item_tags" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."collection_items" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."collection_items" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."collection_items" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."collection_items" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."shelves" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."shelves" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."shelves" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."shelves" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tags" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."tags" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tags" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tags" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."users" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "service_role";


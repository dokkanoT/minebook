import "server-only";

import { requireUser } from "@/features/auth/dal";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Tag = Tables<"tags">;

// 自分のタグ一覧（名前順）
export async function getMyTags(): Promise<Tag[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("name");
  if (error) throw error;
  return data;
}

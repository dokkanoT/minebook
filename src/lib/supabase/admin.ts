import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

// RLS をバイパスする管理用クライアント。
// books など「ユーザーが直接書き込めない共有データ」の更新にだけ使い、
// ユーザーのデータ操作には必ず server.ts の createClient を使うこと
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY が未設定です（.env.local を確認してください）",
    );
  }

  return createSupabaseClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

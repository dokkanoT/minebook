import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

// Server Component / Server Action / Route Handler 用
export async function createClient() {
  // Supabase のクライアントは内部で Date.now()（セッションの期限切れ判定）を呼ぶ。
  // Cache Components の事前レンダリング中に呼ばれるとエラーになるので、
  // リクエスト時まで待ってから作る（Cookie を読むだけでは事前レンダリングが止まらない）
  await connection();
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component からは Cookie を書けない。セッション更新は proxy が担う
        }
      },
    },
  });
}

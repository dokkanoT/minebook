import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

// Client Component 用（ISBN スキャン画面などブラウザから直接使う場合）
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

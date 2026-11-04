import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { safeRedirectPath } from "@/features/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

// 確認メールのリンク先と Google ログインの戻り先。
// PKCE の code（確認メール・Google）とメールテンプレートの token_hash の両方に対応
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get("next"));

  const supabase = await createClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("missing params") };

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=confirm_failed`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}

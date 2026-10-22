"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import type { AuthFormState } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const DISPLAY_NAME_MAX_LENGTH = 30;

// オープンリダイレクト対策: 自サイト内の相対パスだけ許可
function safeRedirectPath(next: FormDataEntryValue | null) {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function readSignUpFields(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: NonNullable<AuthFormState>["fieldErrors"] = {};
  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "メールアドレスの形式が正しくありません";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    fieldErrors.password = `パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください`;
  }

  return { email, password, fieldErrors };
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password, fieldErrors } = readSignUpFields(formData);
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    fieldErrors.displayName = `表示名は${DISPLAY_NAME_MAX_LENGTH}文字以内で入力してください`;
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { email, displayName } };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // public.users.display_name の初期値（DB トリガーで反映）
      data: { display_name: displayName || null },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return {
      error: "登録に失敗しました。時間をおいて再度お試しください",
      values: { email, displayName },
    };
  }

  // メール確認が無効な設定ならそのままログイン状態になる
  if (data.session) redirect("/");

  return {
    message: "確認メールを送信しました。メール内のリンクから登録を完了してください",
  };
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください",
      values: { email },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // アカウントの有無が分からないよう、メッセージは共通にする
    return {
      error: "メールアドレスまたはパスワードが正しくありません",
      values: { email },
    };
  }

  redirect(safeRedirectPath(formData.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

import { z } from "zod";

// Server Action の戻り値の共通形。フロントは ok で分岐する
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | {
      ok: false;
      // 画面にそのまま出せるメッセージ
      error: string;
      // フォームの項目ごとのエラー（入力チェック失敗時のみ）
      fieldErrors?: Record<string, string>;
    };

export function success<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function failure(error: string): ActionResult<never> {
  return { ok: false, error };
}

export function invalidInput(error: z.ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fieldErrors[key] ??= issue.message;
  }
  return { ok: false, error: "入力内容を確認してください", fieldErrors };
}

// PostgreSQL のエラーコードを画面向けのメッセージに変換する
export function dbFailure(
  error: { code?: string; message: string },
  messages: { unique?: string; foreignKey?: string } = {},
): ActionResult<never> {
  if (error.code === "23505" && messages.unique) return failure(messages.unique);
  if (error.code === "23503" && messages.foreignKey) {
    return failure(messages.foreignKey);
  }
  console.error(error);
  return failure("保存に失敗しました。時間をおいて再度お試しください");
}

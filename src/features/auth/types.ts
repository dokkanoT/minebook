// useActionState で受け取るフォームの状態
export type AuthFormState =
  | {
      // フィールドごとのバリデーションエラー
      fieldErrors?: Partial<Record<"email" | "password" | "displayName", string>>;
      // フォーム全体のエラー（認証失敗など）
      error?: string;
      // 成功時の案内（確認メール送信など）
      message?: string;
      // 入力値の復元用（パスワードは返さない）
      values?: { email?: string; displayName?: string };
    }
  | undefined;

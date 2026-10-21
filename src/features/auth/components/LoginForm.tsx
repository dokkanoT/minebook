"use client";

import { useActionState } from "react";

import { signIn } from "../actions";

// 動作確認用の最小フォーム。見た目は PC / スマホ各担当で差し替える想定
export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next ?? "/"} />
      <label className="flex flex-col gap-1">
        メールアドレス
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
          className="border p-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        パスワード
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border p-2"
        />
      </label>
      {state?.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="border p-2">
        {pending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}

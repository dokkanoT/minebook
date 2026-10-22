"use client";

import { useActionState } from "react";

import { signUp } from "../actions";

// 動作確認用の最小フォーム。見た目は PC / スマホ各担当で差し替える想定
export function RegisterForm() {
  const [state, action, pending] = useActionState(signUp, undefined);

  if (state?.message) return <p>{state.message}</p>;

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        表示名（任意）
        <input
          name="displayName"
          maxLength={30}
          defaultValue={state?.values?.displayName}
          className="border p-2"
        />
        {state?.fieldErrors?.displayName && (
          <span role="alert">{state.fieldErrors.displayName}</span>
        )}
      </label>
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
        {state?.fieldErrors?.email && (
          <span role="alert">{state.fieldErrors.email}</span>
        )}
      </label>
      <label className="flex flex-col gap-1">
        パスワード（8文字以上）
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="border p-2"
        />
        {state?.fieldErrors?.password && (
          <span role="alert">{state.fieldErrors.password}</span>
        )}
      </label>
      {state?.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="border p-2">
        {pending ? "登録中..." : "登録"}
      </button>
    </form>
  );
}

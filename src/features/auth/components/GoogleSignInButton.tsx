"use client";

import { useFormStatus } from "react-dom";

import { signInWithGoogle } from "../actions";

// 動作確認用の最小ボタン。見た目は各担当で差し替える想定
// ログイン・新規登録のどちらの画面にも置ける（初回は自動でアカウントが作られる）
export function GoogleSignInButton({ next }: { next?: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next ?? "/"} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="w-full border p-2">
      {pending ? "Google に移動中..." : "Google でログイン"}
    </button>
  );
}

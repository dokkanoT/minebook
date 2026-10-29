"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { signIn } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? "/"} />

      <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700">
        メールアドレス
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
          placeholder="example@mail.com"
          className="w-full bg-gray-50 border border-gray-300 focus:border-[#9E6219] focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700">
        パスワード
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full bg-gray-50 border border-gray-300 focus:border-[#9E6219] focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
        />
      </label>

      {state?.error && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full mt-1 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
      >
        <LogIn className="w-4 h-4" />
        {pending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { UserPlus, CheckCircle2 } from "lucide-react";

import { signUp } from "../actions";

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUp, undefined);

  if (state?.message) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-emerald-900 mb-1">
          登録確認メールを送信しました
        </h2>
        <p className="text-xs text-emerald-700 leading-relaxed">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700">
        表示名（任意）
        <input
          name="displayName"
          maxLength={30}
          defaultValue={state?.values?.displayName}
          placeholder="古本 太郎"
          className="w-full bg-gray-50 border border-gray-300 focus:border-[#9E6219] focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
        />
        {state?.fieldErrors?.displayName && (
          <span role="alert" className="text-rose-600 text-[11px] font-normal">
            {state.fieldErrors.displayName}
          </span>
        )}
      </label>

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
        {state?.fieldErrors?.email && (
          <span role="alert" className="text-rose-600 text-[11px] font-normal">
            {state.fieldErrors.email}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700">
        パスワード（8文字以上）
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="••••••••"
          className="w-full bg-gray-50 border border-gray-300 focus:border-[#9E6219] focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
        />
        {state?.fieldErrors?.password && (
          <span role="alert" className="text-rose-600 text-[11px] font-normal">
            {state.fieldErrors.password}
          </span>
        )}
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
        <UserPlus className="w-4 h-4" />
        {pending ? "登録中..." : "登録"}
      </button>
    </form>
  );
}

import Link from "next/link";
import { BookOpen } from "lucide-react";

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full bg-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 flex flex-col">
        {/* ロゴ & ヘッダー */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#9E6219]">
            <BookOpen className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            アカウント作成
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            無料で本棚を使い始めましょう。
          </p>
        </div>

        {/* 登録フォーム */}
        <RegisterForm />

        {/* ログイン案内 */}
        <div className="mt-6 pt-5 border-t border-gray-150 text-center text-xs text-gray-500">
          すでにアカウントをお持ちですか？{" "}
          <Link
            href="/login"
            className="text-[#9E6219] font-bold hover:underline"
          >
            ログインはこちら
          </Link>
        </div>
      </div>
    </main>
  );
}

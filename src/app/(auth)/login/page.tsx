import Link from "next/link";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";

import { LoginForm } from "@/features/auth/components/LoginForm";

type SearchParams = Promise<{ next?: string; error?: string }>;

export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="min-h-screen w-full bg-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 flex flex-col">
        {/* ロゴ & ヘッダー */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#9E6219]">
            <BookOpen className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            MineBook にログイン
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            古本との出会いを、あなたの本棚へ。
          </p>
        </div>

        {/* ログインフォーム */}
        <Suspense
          fallback={
            <div className="py-8 text-center text-xs text-gray-400">
              読み込み中...
            </div>
          }
        >
          <LoginFormWithParams searchParams={searchParams} />
        </Suspense>

        {/* 新規登録案内 */}
        <div className="mt-6 pt-5 border-t border-gray-150 text-center text-xs text-gray-500">
          アカウントをお持ちでないですか？{" "}
          <Link
            href="/register"
            className="text-[#9E6219] font-bold hover:underline"
          >
            新規登録
          </Link>
        </div>
      </div>
    </main>
  );
}

async function LoginFormWithParams({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next, error } = await searchParams;

  return (
    <>
      {error === "confirm_failed" && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
        >
          メール確認に失敗しました。もう一度お試しください。
        </div>
      )}
      <LoginForm next={next} />
    </>
  );
}

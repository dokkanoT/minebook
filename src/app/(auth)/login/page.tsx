import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/LoginForm";

type SearchParams = Promise<{ next?: string; error?: string }>;

export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 p-6">
      <h1 className="text-xl font-bold">ログイン</h1>
      <Suspense fallback={<LoginForm />}>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
      <Link href="/register" className="underline">
        アカウントを作成する
      </Link>
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
        <p role="alert">メール確認に失敗しました。もう一度お試しください</p>
      )}
      <LoginForm next={next} />
    </>
  );
}

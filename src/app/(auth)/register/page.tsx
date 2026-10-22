import Link from "next/link";

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 p-6">
      <h1 className="text-xl font-bold">アカウント作成</h1>
      <RegisterForm />
      <Link href="/login" className="underline">
        ログインはこちら
      </Link>
    </main>
  );
}

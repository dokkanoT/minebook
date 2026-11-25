"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { signOut } from "../actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 disabled:opacity-60 transition-colors cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      {pending ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}

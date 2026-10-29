import { redirect } from "next/navigation";

// トップページは src/proxy.ts で振り分ける（スマホ → /home、PC → /dashboard、未ログイン → /login）。
// このページが表示されるのは proxy を通らなかった場合だけなので、ログイン画面に送る
export default function Home() {
  redirect("/login");
}

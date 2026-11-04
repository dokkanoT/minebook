import { NextResponse, userAgent, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// ログイン必須のパス（前方一致）。ページを追加したらここにも追加する
const PROTECTED_PATHS = [
  // PC
  "/dashboard",
  "/bookshelf",
  "/collection",
  "/ranking",
  "/history",
  "/analysis",
  // スマホ
  "/home",
  "/scan",
];
// ログイン済みならアクセス不要なパス
const AUTH_PATHS = ["/login", "/register"];

function matches(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// ログイン後の最初の画面。スマホはスキャン中心、PC（タブレット含む）は管理画面
function homePathFor(request: NextRequest) {
  return userAgent(request).device.type === "mobile" ? "/home" : "/dashboard";
}

// リフレッシュされたセッション Cookie をリダイレクト先にも引き継ぐ
function redirectWithCookies(
  request: NextRequest,
  from: NextResponse,
  pathname: string,
  search = "",
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

// ここでのチェックはリダイレクト用の楽観的チェック。
// データ保護は Server Action / DAL 側の requireUser と RLS で行う
export default async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  // トップページは振り分け専用（ログイン・登録・メール確認の後もここに来る）
  if (pathname === "/") {
    return redirectWithCookies(
      request,
      response,
      userId ? homePathFor(request) : "/login",
    );
  }

  if (!userId && matches(pathname, PROTECTED_PATHS)) {
    return redirectWithCookies(
      request,
      response,
      "/login",
      `?next=${encodeURIComponent(pathname + search)}`,
    );
  }

  if (userId && matches(pathname, AUTH_PATHS)) {
    return redirectWithCookies(request, response, homePathFor(request));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

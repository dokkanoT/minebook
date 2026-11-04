// オープンリダイレクト対策: 自サイト内の相対パスだけ許可
export function safeRedirectPath(next: unknown) {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

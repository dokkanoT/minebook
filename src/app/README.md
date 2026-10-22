# app ディレクトリ仕様

`src/app/` は **URL と画面の入口だけ** を置く場所。部品は `components/`、データ取得・更新は `features/` に置く。

> Next.js 16 は学習データや古い記事と仕様が違う。迷ったら `node_modules/next/dist/docs/` を読む。

## ルート一覧

URL | ファイル | 端末 | ログイン | 担当
---|---|---|---|---
`/` | `page.tsx` | 両方 | 不要 | 未定
`/login` | `(auth)/login/page.tsx` | 両方 | 不要（ログイン済みは `/` へ） | 未定
`/register` | `(auth)/register/page.tsx` | 両方 | 不要（ログイン済みは `/` へ） | 未定
`/dashboard` | `(dashboard)/dashboard/page.tsx` | PC | 必要 | PC
`/collection` | `(dashboard)/collection/page.tsx` | PC | 必要 | PC
`/ranking` | `(dashboard)/ranking/page.tsx` | PC | 必要 | PC
`/scan` | `(mobile)/scan/page.tsx` | スマホ | 必要 | スマホ
`/bookshelf` | `bookshelf/page.tsx` | 両方 | 必要 | 未定
`/books/[isbn]` | `books/[isbn]/page.tsx` | 両方 | 不要 | 未定
`/auth/confirm` | `auth/confirm/route.ts` | – | – | バックエンド
`/api/*` | `api/**/route.ts` | – | – | バックエンド

- 「ログイン必要」のパスは `src/proxy.ts` の `PROTECTED_PATHS` で未ログイン時に `/login` へリダイレクトされる。**ページを追加・URL を変更したら `PROTECTED_PATHS` も更新する**（バックエンドに依頼）
- `(auth)` `(dashboard)` `(mobile)` は route group で **URL には出ない**。端末で画面を出し分ける仕組みではないので、PC 向けページもスマホ幅で崩れない程度にはしておく
- 「両方」のページはレスポンシブな 1 画面にして、担当を 1 人に決める（同じファイルを 2 人で触らない）

## 置いてよいファイル

ファイル | 用途 | 備考
---|---|---
`page.tsx` | 画面 | Server Component（`"use client"` を付けない）
`layout.tsx` | 共通の枠（ナビ・サイドバー） | `(dashboard)/layout.tsx` は PC、`(mobile)/layout.tsx` はスマホ担当
`loading.tsx` | 読み込み中の表示 | スケルトンなど
`error.tsx` | エラー時の表示 | `"use client"` 必須。props は `error` と `retry`
`not-found.tsx` | 404 表示 | `notFound()` を呼ぶと表示される
`route.ts` | API エンドポイント | **バックエンドのみ**。画面からの更新は Server Action を使う

これ以外（部品・フック・型・定数・ユーティリティ）は `app/` に置かない。

## page.tsx の書き方

```tsx
// (dashboard)/collection/page.tsx（例。getMyCollection などはこれから作る）
import { Suspense } from "react";

import { CollectionList } from "@/components/desktop/CollectionList";
import { getMyCollection } from "@/features/collection/server";

export default function CollectionPage() {
  return (
    <main>
      <h1>コレクション</h1>
      {/* ログインユーザーのデータを読む部分は Suspense の中に入れる */}
      <Suspense fallback={<p>読み込み中...</p>}>
        <MyCollection />
      </Suspense>
    </main>
  );
}

async function MyCollection() {
  const items = await getMyCollection();
  return <CollectionList items={items} />;
}
```

### ルール

1. **データは `features/*/server.ts` や `features/*/dal.ts` の関数で取る。** `page.tsx` や部品から Supabase を直接呼ばない（`@/lib/supabase/*` を import しない）
2. **更新は `features/*/actions.ts` の Server Action を使う。** フォームの `action` やボタンの `onClick` から呼ぶ
3. **Cookie・ログインユーザー・`params`・`searchParams` を読む処理は `<Suspense>` の中に置く。** Cache Components が有効なので、外に置くと `pnpm build` が失敗する（`/login` が実例）
4. **`layout.tsx` のトップレベルでログインユーザーを `await` しない。** 配下のページ全体が遅くなる。ユーザー名表示などは Suspense で囲んだ小さい部品に分ける
5. **`params` と `searchParams` は Promise。** `const { isbn } = await params;` のように await する
6. **画面の見た目の制御（未ログイン時に隠す等）はセキュリティではない。** データの保護は Server Action / DAL と RLS で行っている

## components / features との関係

```text
app/（画面の入口）
 ├─ features/<機能>/server.ts, actions.ts, dal.ts   データ取得・更新（バックエンド担当）
 ├─ features/<機能>/components/                     機能に結びついた部品（フォーム等）
 └─ components/
     ├─ desktop/   PC 画面にしかない部品
     ├─ mobile/    スマホ画面にしかない部品
     ├─ common/    両方で使うアプリ固有の部品
     └─ ui/        Button・Input など見た目だけの汎用部品
```

- `components/` の部品はデータを props で受け取る。Server Action や Supabase を直接呼ばない
- `desktop/` と `mobile/` はお互いを import しない。両方で必要になったら `common/` に移す
- 部品は PascalCase の 1 ファイル 1 コンポーネント（`ShelfGrid.tsx`）、named export

## よく使う import

用途 | import
---|---
ログインユーザー取得（Server Component） | `getCurrentUser` / `requireUser` from `@/features/auth/dal`
ログイン・登録・ログアウト | `signIn` / `signUp` / `signOut` from `@/features/auth/actions`
ISBN から書籍情報を取得 | `lookupBook` from `@/features/books/actions`
自分のコレクション一覧・1件（本棚・カテゴリー・タグで絞り込み可） | `getMyCollection` / `getCollectionItem` from `@/features/collection/server`
コレクションに追加・更新・削除 | `addToCollection` / `updateCollectionItem` / `removeFromCollection` from `@/features/collection/actions`
自分の本棚一覧（冊数付き） | `getMyShelves` from `@/features/shelves/server`
本棚の作成・名前変更・削除 | `createShelf` / `renameShelf` / `deleteShelf` from `@/features/shelves/actions`
自分のタグ一覧 | `getMyTags` from `@/features/tags/server`
タグの作成・編集・削除、本へのタグ付け | `createTag` / `editTag` / `deleteTag` / `setItemTags` from `@/features/tags/actions`
DB の行の型 | `Tables<"books">` など from `@/types/database`

### Server Action の戻り値

`actions.ts` の関数（認証まわりを除く）は `ActionResult` を返す（`@/lib/utils/action-result`）。例外は投げないので `ok` で分岐する。

```ts
const result = await createShelf({ name });
if (!result.ok) {
  // result.error: 画面にそのまま出せるメッセージ
  // result.fieldErrors?.name: 項目ごとのエラー
  return;
}
result.data.id;
```

成功時は `refresh()` で今のページのデータが自動で再取得されるので、フロントで再読み込みする必要はない。

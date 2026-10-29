# MineBook

古本との出会いを、持ち帰れる本棚へ。

ISBNをスキャンし、書籍情報やお宝度を記録できるWebアプリケーション。

## 概要

MineBookは、古本屋で見つけた本をスマートフォンでスキャンし、

- 書籍情報取得
- お宝度判定
- 本棚保存
- PCでのコレクション管理

を行えるサービスです。

## 主な機能

### モバイル

- ISBNスキャン
- 書籍情報取得
- お宝度判定
- 本棚保存

### PC

- バーチャル本棚
- 発掘履歴
- コレクション管理
- ランキング

## 技術スタック

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- Supabase

### External API

- openBD
- 楽天ブックスAPI

### Hosting

- Vercel

## セットアップ

```bash
pnpm install

pnpm dev
```

環境変数は `.env.local` を作成してください。

```env
# Supabase（必須）: ダッシュボード → Connect または Project Settings → API Keys
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# サーバー専用（books の登録に使用）。NEXT_PUBLIC_ を付けないこと
SUPABASE_SECRET_KEY=

# 楽天ブックス API（任意）。未設定でも動くが、カテゴリーは未分類になる
RAKUTEN_APPLICATION_ID=
RAKUTEN_ACCESS_KEY=
# 楽天のアプリ設定に登録した Web サイト URL
RAKUTEN_REFERER=
```

## 認証（Supabase Auth / メール+パスワード）

フロントエンド（PC・スマホ）からは以下を使ってください。

用途 | import
---|---
ログイン / 登録 / ログアウト（`useActionState` 対応） | `signIn` / `signUp` / `signOut` from `@/features/auth/actions`
フォーム状態の型 | `AuthFormState` from `@/features/auth/types`
Server Component でユーザー取得 | `getCurrentUser` / `requireUser` from `@/features/auth/dal`
Client Component から Supabase | `createClient` from `@/lib/supabase/client`

- `/dashboard` 配下と `/scan` は未ログインだと `/login?next=...` へリダイレクト（`src/proxy.ts`）
- フォームの name 属性: `email` / `password` / `displayName`（登録のみ）/ `next`（ログインのみ・hidden）
- `src/features/auth/components/` のフォームは動作確認用の仮実装なので、各端末向けに差し替えてOK

## 書籍情報（books）

- スキャン画面からは `lookupBook(isbn)` from `@/features/books/actions` を呼ぶ（ISBN-10 / 13・ハイフンありどちらでも可）
- 初めての本はサーバーが openBD から取得して `books` に登録する。`books` はクライアントから書き込めない
- カテゴリーは楽天ブックスのジャンルから自動判定（`books.category` → `categories.slug`）。判定できない本は `null`（未分類）

## データベース（Supabase CLI）

スキーマ変更はダッシュボードで直接行わず、マイグレーションで管理する。

```bash
pnpm db:new <名前>   # supabase/migrations/ にファイル作成
pnpm db:push         # 未適用のマイグレーションを反映
pnpm db:types        # src/types/database.ts を再生成
```

初回のみ `pnpm exec supabase login` と `pnpm exec supabase link` が必要。

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## ディレクトリ構成

```text
src/
├── app/
├── components/
├── features/
├── lib/
└── types/
```

## ドキュメント

- [src/app/README.md](src/app/README.md) — 画面（app ディレクトリ）の仕様・担当・書き方

- docs/requirements.md
- docs/database.md
- docs/architecture.md
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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 認証（Supabase Auth / メール+パスワード）

フロントエンド（PC・スマホ）からは以下を使ってください。

用途 | import
---|---
ログイン / 登録 / ログアウト（`useActionState` 対応） | `signIn` / `signUp` / `signOut` from `@/features/auth/actions`
フォーム状態の型 | `AuthFormState` from `@/features/auth/types`
Server Component でユーザー取得 | `getCurrentUser` / `requireUser` from `@/features/auth/dal`
Client Component から Supabase | `createClient` from `@/lib/supabase/client`

- `/dashboard` `/collection` `/ranking` `/scan` `/bookshelf` は未ログインだと `/login?next=...` へリダイレクト（`src/proxy.ts`）
- フォームの name 属性: `email` / `password` / `displayName`（登録のみ）/ `next`（ログインのみ・hidden）
- `src/features/auth/components/` のフォームは動作確認用の仮実装なので、各端末向けに差し替えてOK
- DB: `supabase/migrations/` の SQL を Supabase の SQL Editor で実行する

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

- docs/requirements.md
- docs/database.md
- docs/architecture.md
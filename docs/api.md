# API

## 外部 API

どちらもサーバーからだけ呼びます。ブラウザから直接呼ぶことはありません。

### openBD

- エンドポイント：`https://api.openbd.jp/v1/get?isbn=<ISBN>`
- キーは不要
- 書名・著者・出版社・あらすじ・書影・定価を取ります
- コード：[src/lib/openbd/](../src/lib/openbd/)

### 楽天ブックス API（書籍検索）

- エンドポイント：`https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404`
- 環境変数 `RAKUTEN_APPLICATION_ID` と `RAKUTEN_ACCESS_KEY` が必要です
- 楽天のアプリ設定に登録した URL を、`Referer` と `Origin` ヘッダーで送ります（環境変数 `RAKUTEN_REFERER`）。送らないとエラーになります
- openBD で足りない項目、ジャンル（カテゴリーを決めるのに使う）、レビューの平均と件数を取ります
- コード：[src/lib/rakuten/](../src/lib/rakuten/)

### 2 つの使い分け

ISBN をはじめて読み取ったときだけ、2 つを同時に呼びます。openBD の内容を優先し、足りない項目を楽天で補って `books` に登録します。2 回目からは `books` の内容を返すので、外部 API は呼びません。

## アプリ内の API

画面からのデータの取得・更新は、HTTP の API ではなく **Server Component の関数**と **Server Action** で行います。一覧は [src/app/README.md](../src/app/README.md) の「よく使う import」にあります。

種類 | 置き場所 | 使い方
---|---|---
データの取得 | `src/features/*/server.ts` | Server Component（`page.tsx`）から `await` する
データの更新 | `src/features/*/actions.ts` | フォームの `action` やボタンの `onClick` から呼ぶ。戻り値は `ActionResult`

### HTTP のエンドポイント

URL | 中身
---|---
`/auth/confirm` | 確認メールのリンクと、Google ログインの戻り先。ログインを完了して `/` に戻す

`/api/*` の Route Handler はいまはありません。

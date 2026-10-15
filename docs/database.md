# DB設計

## 使用DB

Supabase (PostgreSQL)

## テーブル設計

### books

書籍マスター

列名 | 型 | 説明
---|---|---
isbn | text | PK
title | text | タイトル
author | text | 著者
publisher | text | 出版社
description | text | 説明
cover_url | text | 表紙URL
list_price | int | 定価
created_at | timestamp | 作成日時
updated_at | timestamp | 更新日時

### users
    
列名 | 型 | 説明
---|---|---
id | uuid | PK auth.users.id
display_name | text | 表示名
avatar_url | text | アイコン
created_at | timestamp | 作成日時

### collection_items

ユーザーごとのコレクションアイテム

列名 | 型 | 説明
---|---|---
id | uuid | PK
user_id | uuid | FK → auth.users
isbn | text | FK → books
shelf_id | uuid | FK → shelves
store_price | int | 購入価格
treasure_score | int | お宝度スコア
store_name | text | 購入店舗
purchase_date | date | 購入日
notes | text | メモ
status | text | ステータス
scanned_at | timestamp | スキャン日時
created_at | timestamp | 作成日時

### shelves

ユーザーが作成した本棚

列名 | 型 | 説明
---|---|---
id | uuid | PK
user_id | uuid | FK → auth.users
name | text | 本棚名
created_at | timestamp | 作成日時

### tags

タグマスター

列名 | 型 | 説明
---|---|---
id | uuid | PK
user_id | uuid | FK → auth.users
name | text | タグ名
color | text | 表示カラー
created_at | timestamp | 作成日時

### collection_item_tags

コレクションアイテムとタグの多対多

列名 | 型 | 説明
---|---|---
id | uuid | PK
collection_item_id | uuid | FK → collection_items
tag_id | uuid | FK → tags
created_at | timestamp | 作成日時
// src/app/(dashboard)/dashboard/bookshelf/page.tsx
import { Suspense } from "react";
import { getCategories } from "@/features/books/server";
import { getMyBookshelf } from "@/features/shelves/server";
import { BookshelfWorkspace } from "../_components/bookshelf/BookshelfWorkspace";
import { PageHeader } from "../_components/layout/PageHeader";
import { categoryOptions, toBookshelfView } from "../_data/fromBookshelf";

export default function BookshelfPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader
            title="本棚"
            description="未配置の本を選び、好きな棚へドラッグして整理できます。"
          />
          <p className="py-12 text-center text-xs text-neutral-500">読み込み中...</p>
        </>
      }
    >
      <MyBookshelf />
    </Suspense>
  );
}

// ログインユーザーの本棚と、保存した本（収集プール）
async function MyBookshelf() {
  const [bookshelf, categories] = await Promise.all([getMyBookshelf(), getCategories()]);
  return (
    <BookshelfWorkspace
      bookshelf={toBookshelfView(bookshelf, categories)}
      categories={categoryOptions(categories)}
    />
  );
}

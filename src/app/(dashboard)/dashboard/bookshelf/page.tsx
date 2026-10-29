// src/app/(dashboard)/bookshelf/page.tsx
import { AlternativeFlowPanel } from "../_components/bookshelf/AlternativeFlowPanel";
import { BookPool } from "../_components/bookshelf/BookPool";
import { BookshelfNotes } from "../_components/bookshelf/BookshelfNotes";
import { DragExamplePanel } from "../_components/bookshelf/DragExamplePanel";
import { MyShelvesPanel } from "../_components/bookshelf/MyShelvesPanel";
import { OperationRulesPanel } from "../_components/bookshelf/OperationRulesPanel";
import { StepGuide } from "../_components/bookshelf/StepGuide";
import { PageHeader } from "../_components/layout/PageHeader";
import { CATEGORIES } from "../_data/books";
import {
  BOOKSHELF_NOTES,
  BOOKSHELF_STEPS,
  FLOW_EXAMPLE,
  OPERATION_RULES,
  POOL_BOOKS,
  SHELVES,
} from "../_data/bookshelf";

export default function BookshelfPage() {
  return (
    <>
      <PageHeader
        title="本棚"
        description="収集した本をプールで整理し、ドラッグまたは追加ボタンで本棚へ配置します。"
        meta="対象：本棚に保存済みの本"
      />

      <StepGuide steps={BOOKSHELF_STEPS} />

      <div className="mt-4 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-4">
        <BookPool books={POOL_BOOKS} categories={CATEGORIES} />
        <MyShelvesPanel shelves={SHELVES} />
      </div>

      <div className="mt-4 space-y-4">
        <DragExamplePanel book={FLOW_EXAMPLE.book} shelf={FLOW_EXAMPLE.shelf} />
        <AlternativeFlowPanel book={FLOW_EXAMPLE.book} shelf={FLOW_EXAMPLE.shelf} />
        <OperationRulesPanel rules={OPERATION_RULES} />
      </div>

      <BookshelfNotes notes={BOOKSHELF_NOTES} />
    </>
  );
}
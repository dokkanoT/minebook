// src/app/(dashboard)/collection/page.tsx
import { CollectionToolbar } from "../_components/collection/CollectionToolbar";
import { CollectionWorkspace } from "../_components/collection/CollectionWorkspace";
import { TagManagementPanel } from "../_components/collection/TagManagementPanel";
import { PageFooter } from "../_components/layout/PageFooter";
import { PageHeader } from "../_components/layout/PageHeader";
import { COLLECTIONS, REGISTERED_TAGS } from "../_data/collections";

export default function CollectionPage() {
  return (
    <>
      <PageHeader
        title="コレクション"
        description="コレクションの作成・編集・削除と、書籍のタグをまとめて管理します。"
        meta="対象：本棚に保存済みの本"
      />

      <CollectionToolbar count={COLLECTIONS.length} />

      <CollectionWorkspace collections={COLLECTIONS}>
        <TagManagementPanel tags={REGISTERED_TAGS} />
      </CollectionWorkspace>

      <PageFooter>書誌・店舗・価格・統計・スコアはサンプルです。</PageFooter>
    </>
  );
}
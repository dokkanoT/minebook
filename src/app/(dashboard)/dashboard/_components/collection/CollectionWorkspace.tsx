// src/app/(dashboard)/_components/collection/CollectionWorkspace.tsx
"use client";

import { useState, type ReactNode } from "react";
import { CollectionDetailPanel } from "./CollectionDetailPanel";
import { CollectionList } from "./CollectionList";

export type CollectionBook = {
  id: string;
  title: string;
  author: string;
  category: string;
  score: number;
};

export type CollectionView = {
  id: string;
  name: string;
  books: CollectionBook[];
};

type CollectionWorkspaceProps = {
  collections: CollectionView[];
  /** 詳細パネルの下に並べる要素（タグ管理など） */
  children?: ReactNode;
};

export function CollectionWorkspace({ collections, children }: CollectionWorkspaceProps) {
  const [selectedId, setSelectedId] = useState(collections[0]?.id ?? "");
  const selected = collections.find((c) => c.id === selectedId) ?? collections[0];

  return (
    <div className="grid grid-cols-[15rem_minmax(0,1fr)] items-start gap-4">
      <CollectionList
        items={collections.map((c) => ({ id: c.id, name: c.name, count: c.books.length }))}
        selectedId={selected?.id ?? ""}
        onSelect={setSelectedId}
      />
      <div className="space-y-4">
        {selected && <CollectionDetailPanel collection={selected} />}
        {children}
      </div>
    </div>
  );
}
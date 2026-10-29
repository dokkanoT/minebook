// src/app/(dashboard)/_data/collections.ts
import type { CollectionView } from "../_components/collection/CollectionWorkspace";
import { pickBooks } from "./bookLookup";

/** 12冊を重複なく3コレクションに振り分け（4 + 3 + 5） */
export const COLLECTIONS: CollectionView[] = [
  { id: "c1", name: "文学をめぐる本", books: pickBooks(["b03", "b05", "b10", "b11"]) },
  { id: "c2", name: "アートとデザイン", books: pickBooks(["b02", "b07", "b09"]) },
  { id: "c3", name: "暮らしと知識", books: pickBooks(["b01", "b04", "b06", "b08", "b12"]) },
];

export const REGISTERED_TAGS: string[] = ["初版", "帯付き", "お気に入り"];
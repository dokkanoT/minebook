import type { Rank } from '@/features/treasure/score';

export type SheetState = 'closed' | 'half' | 'full';
export type TabType = 'home' | 'scan';
export type FlagType = 'none' | 'purchased' | 'pending' | 'skip';

export interface ScannedItem {
  id: string;
  title: string;
  coverUrl?: string;
  statusText: string;
  isEvaluated: boolean;
  isMock?: boolean;
  rank?: Rank;
  isNew?: boolean;
}

export interface BookItem {
  id: string;
  collectionItemId?: string; // コレクションに登録済みのアイテムID（未登録の場合はundefined）
  isMock?: boolean;          // 仮データ由来の書籍かどうか（DB保存対象外）
  title: string;
  author: string;
  scanDate: string;
  categoryTag?: string;
  originalPrice: number;
  shopPrice: number;
  coverUrl?: string;
  rank?: Rank;
  isEvaluated?: boolean; // お宝度判定済みかどうか（false = スキャン直後・未入力）
  storeName: string;
  isbn: string;
  publishedYear: string;
  publishedDate?: string; // 発売日の表示（例: '2013年10月'）
  releaseDate?: string;   // 発売日 'YYYY-MM-DD'（お宝度の計算に使う）
  publisher?: string;     // 出版社（例: '白水社'）
  reviewRating?: number;  // ネットレビュー評価（例: 4.4）
  reviewCount?: number;   // レビュー件数（例: 168）
  reviewSnippet?: string; // 代表的な読者レビューの一言
  reviewSource?: string;  // レビュー元（例: 'Amazon / 読書メーター'）
  description: string;
  flag?: FlagType;
}

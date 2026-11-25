// src/app/(dashboard)/_data/books.ts
export const CATEGORIES = ["文学", "芸術", "人文", "自然科学"] as const;
export type Category = (typeof CATEGORIES)[number];

export const TAGS = ["初版", "お気に入り", "帯付き"] as const;
export type TagName = (typeof TAGS)[number];

export type MockBook = {
  id: string;
  title: string;
  author: string;
  category: Category;
  /** お宝度（サンプル値） */
  score: number;
  tags: TagName[];
};

/** 本棚に保存済みの12冊。新しく保存した順 */
export const MOCK_BOOKS: MockBook[] = [
  { id: "b01", title: "古書のある風景", author: "山田 文子", category: "人文", score: 96, tags: ["初版", "お気に入り"] },
  { id: "b02", title: "活版印刷の記憶", author: "佐藤 健", category: "芸術", score: 92, tags: ["初版", "帯付き"] },
  { id: "b03", title: "日本近代文学散歩", author: "田中 遥", category: "文学", score: 88, tags: ["初版"] },
  { id: "b04", title: "星を読む", author: "中村 亮", category: "自然科学", score: 84, tags: ["お気に入り"] },
  { id: "b05", title: "旅と随筆", author: "小林 美咲", category: "文学", score: 78, tags: ["初版", "お気に入り"] },
  { id: "b06", title: "街の古書店", author: "石井 直樹", category: "人文", score: 72, tags: ["帯付き"] },
  { id: "b07", title: "色と形の手帖", author: "松本 彩", category: "芸術", score: 70, tags: [] },
  { id: "b08", title: "小さな書店案内", author: "青木 里奈", category: "人文", score: 60, tags: [] },
  { id: "b09", title: "絵本の記憶", author: "高橋 優", category: "芸術", score: 68, tags: ["初版"] },
  { id: "b10", title: "余白を読む", author: "森 由紀", category: "文学", score: 64, tags: ["お気に入り"] },
  { id: "b11", title: "言葉の散歩道", author: "川村 智", category: "文学", score: 62, tags: [] },
  { id: "b12", title: "植物観察ノート", author: "井上 透", category: "自然科学", score: 66, tags: [] },
];

export const MOCK_COLLECTION_COUNT = 3;

/** カテゴリ別の冊数（多い順。同数は CATEGORIES の並び順） */
export const CATEGORY_COUNTS = CATEGORIES.map((category) => ({
  label: category,
  count: MOCK_BOOKS.filter((b) => b.category === category).length,
})).sort((a, b) => b.count - a.count);
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

/** 本棚に保存済みのダミー本。新しく保存した順 */
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
  { id: "b13", title: "海辺の植物誌", author: "高田 直子", category: "自然科学", score: 73, tags: ["お気に入り"] },
  { id: "b14", title: "古い地図を歩く", author: "藤井 誠", category: "人文", score: 81, tags: ["初版"] },
  { id: "b15", title: "木版画の楽しみ", author: "小川 玲子", category: "芸術", score: 69, tags: [] },
  { id: "b16", title: "短歌と暮らす", author: "西村 透", category: "文学", score: 76, tags: ["帯付き"] },
  { id: "b17", title: "鉱石標本の見方", author: "石田 誠", category: "自然科学", score: 85, tags: ["初版", "お気に入り"] },
  { id: "b18", title: "喫茶店の文化史", author: "森田 由美", category: "人文", score: 71, tags: [] },
  { id: "b19", title: "写真集・街角", author: "河合 俊介", category: "芸術", score: 88, tags: ["帯付き"] },
  { id: "b20", title: "物語の仕立て方", author: "大西 真", category: "文学", score: 79, tags: ["お気に入り"] },
  { id: "b21", title: "雲を観察する", author: "前田 晴子", category: "自然科学", score: 63, tags: [] },
  { id: "b22", title: "民具と生活", author: "松井 亮", category: "人文", score: 74, tags: ["初版"] },
  { id: "b23", title: "版画家のアトリエ", author: "長谷川 彩", category: "芸術", score: 91, tags: ["初版", "帯付き"] },
  { id: "b24", title: "詩集・雨の庭", author: "岡本 由紀", category: "文学", score: 68, tags: [] },
  { id: "b25", title: "小さな天文学", author: "宮本 翔", category: "自然科学", score: 82, tags: ["お気に入り"] },
  { id: "b26", title: "旅人の日記", author: "清水 香", category: "人文", score: 65, tags: ["帯付き"] },
  { id: "b27", title: "色彩の手引き", author: "石川 杏", category: "芸術", score: 77, tags: [] },
];

export const MOCK_COLLECTION_COUNT = 3;

/** カテゴリ別の冊数（多い順。同数は CATEGORIES の並び順） */
export const CATEGORY_COUNTS = CATEGORIES.map((category) => ({
  label: category,
  count: MOCK_BOOKS.filter((b) => b.category === category).length,
})).sort((a, b) => b.count - a.count);

// 楽天ブックスのジャンル ID（"001" = 本 の直下 6 桁）→ アプリのカテゴリー（categories.slug）
// TODO: 楽天のキー取得後、ジャンル検索 API（BooksGenre/Search, booksGenreId=001）で ID と名前を照合する
const GENRE_TO_CATEGORY: Record<string, string> = {
  "001001": "comic", // 漫画（コミック）
  "001002": "study", // 語学・学習参考書
  "001003": "kids", // 絵本・児童書・図鑑
  "001004": "novel", // 小説・エッセイ
  "001005": "computer", // パソコン・システム開発
  "001006": "business", // ビジネス・経済・就職
  "001007": "lifestyle", // 旅行・留学・アウトドア
  "001008": "humanities", // 人文・思想・社会
  "001009": "hobby", // ホビー・スポーツ・美術
  "001010": "lifestyle", // 美容・暮らし・健康・料理
  "001011": "hobby", // エンタメ・ゲーム
  "001012": "science", // 科学・技術
  "001013": "hobby", // 写真集・タレント
  "001016": "study", // 資格・検定
  "001017": "light_novel", // ライトノベル
  "001028": "science", // 医学・薬学・看護学・歯科学
};

// 文庫・新書は「判型」のジャンルで内容を表さないため、他のジャンルを優先する
const FORMAT_GENRES = new Set(["001019", "001020"]);

// booksGenreId（スラッシュ区切りで複数）からカテゴリーを決める。判定できなければ null
export function categoryFromRakutenGenre(genreId: string | null) {
  if (!genreId) return null;

  const tops = genreId
    .split("/")
    .map((id) => id.trim().slice(0, 6))
    .filter((id) => id.startsWith("001"));

  for (const top of tops) {
    if (FORMAT_GENRES.has(top)) continue;
    const category = GENRE_TO_CATEGORY[top];
    if (category) return category;
  }

  // 判型ジャンルしかない（文庫の小説など）場合は内容が分からないので未判定にする
  return tops.some((top) => !FORMAT_GENRES.has(top)) ? "other" : null;
}

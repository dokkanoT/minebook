import "server-only";

const OPENBD_ENDPOINT = "https://api.openbd.jp/v1/get";

export type OpenBDBook = {
  isbn: string;
  title: string;
  author: string | null;
  publisher: string | null;
  description: string | null;
  coverUrl: string | null;
  listPrice: number | null;
};

// openBD のレスポンスのうち使う部分だけ
type OpenBDResponse = Array<{
  summary: {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    cover: string;
  };
  onix?: {
    CollateralDetail?: {
      TextContent?: Array<{ TextType: string; Text: string }>;
    };
    ProductSupply?: {
      SupplyDetail?: { Price?: Array<{ PriceAmount: string }> };
    };
  };
} | null>;

// 該当なしなら null。通信エラー時は例外
export async function fetchBookFromOpenBD(
  isbn13: string,
): Promise<OpenBDBook | null> {
  const res = await fetch(`${OPENBD_ENDPOINT}?isbn=${isbn13}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`openBD request failed: ${res.status}`);

  const [item] = (await res.json()) as OpenBDResponse;
  if (!item?.summary.title) return null;

  const { summary, onix } = item;
  const texts = onix?.CollateralDetail?.TextContent ?? [];
  // 03: 詳細説明 / 02: 短い説明
  const description =
    texts.find((t) => t.TextType === "03")?.Text ??
    texts.find((t) => t.TextType === "02")?.Text ??
    null;
  const price = Number(
    onix?.ProductSupply?.SupplyDetail?.Price?.[0]?.PriceAmount,
  );

  return {
    isbn: isbn13,
    title: summary.title,
    author: formatAuthor(summary.author),
    publisher: summary.publisher || null,
    description,
    coverUrl: summary.cover || null,
    listPrice: Number.isFinite(price) && price > 0 ? price : null,
  };
}

// "夏目,漱石,1867-1916" → "夏目漱石"。複数著者は空白区切りで来るので「、」で連結
function formatAuthor(author: string) {
  const names = author
    .split(/\s+/)
    .map((person) =>
      person
        .split(",")
        .filter((part) => part && !/^\d{4}-?(\d{4})?$/.test(part))
        .join(""),
    )
    .filter(Boolean);
  return names.length > 0 ? names.join("、") : null;
}

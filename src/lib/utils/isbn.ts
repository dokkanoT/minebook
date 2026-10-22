// ISBN-10 / ISBN-13（ハイフン・空白あり可）を ISBN-13 に正規化する。不正なら null
export function normalizeIsbn(input: string): string | null {
  const raw = input.replace(/[-\s]/g, "").toUpperCase();

  if (/^\d{9}[\dX]$/.test(raw)) {
    if (!isValidIsbn10(raw)) return null;
    const body = `978${raw.slice(0, 9)}`;
    return body + isbn13CheckDigit(body);
  }

  if (/^97[89]\d{10}$/.test(raw)) {
    return isbn13CheckDigit(raw.slice(0, 12)) === raw[12] ? raw : null;
  }

  return null;
}

function isValidIsbn10(isbn: string) {
  const sum = [...isbn].reduce(
    (acc, ch, i) => acc + (ch === "X" ? 10 : Number(ch)) * (10 - i),
    0,
  );
  return sum % 11 === 0;
}

function isbn13CheckDigit(first12: string) {
  const sum = [...first12].reduce(
    (acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3),
    0,
  );
  return String((10 - (sum % 10)) % 10);
}

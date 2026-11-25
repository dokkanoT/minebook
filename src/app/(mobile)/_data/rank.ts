export type Rank = 'S' | 'A' | 'B';

// お宝度の仮ルール。定価からの割引率で決める（正式な計算方法は調整中だよ）
export function calcRank(originalPrice: number, shopPrice: number): Rank {
  // // 定価が不明な本は市場価値が高いとみなしてSにする
  if (originalPrice <= 0) return 'S';

  const discountRate = (originalPrice - shopPrice) / originalPrice;

  if (discountRate >= 0.75) return 'S';
  if (discountRate >= 0.5) return 'A';
  return 'B';
}

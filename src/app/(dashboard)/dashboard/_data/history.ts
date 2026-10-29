// src/app/(dashboard)/_data/history.ts
import type { ScanRecord } from "../_components/history/ScanTable";

export const SCAN_RECORDS: ScanRecord[] = [
  { id: "s1", scannedAt: "2026/10/14 10:32", title: "紙の博物誌", shop: "神保町 ひだまり書房", price: 800, result: "未判定", status: "unsaved" },
  { id: "s2", scannedAt: "2026/10/14 10:24", title: "古書のある風景", shop: "神保町 ひだまり書房", price: 500, result: "お宝度 96", status: "saved" },
  { id: "s3", scannedAt: "2026/10/13 15:40", title: "活版印刷の記憶", shop: "西荻窪 しおり古書店", price: 700, result: "お宝度 92", status: "saved" },
  { id: "s4", scannedAt: "2026/10/12 13:18", title: "日本近代文学散歩", shop: "吉祥寺 森の本屋", price: 400, result: "お宝度 88", status: "saved" },
];

export const UNSAVED_SCAN_COUNT = SCAN_RECORDS.filter((r) => r.status === "unsaved").length;

const ALL_TOTAL = 13;
const ALL_SAVED = 12;

export const HISTORY_STATS = {
  monthTotal: 5,
  monthSaved: 4,
  allTotal: ALL_TOTAL,
  allSaved: ALL_SAVED,
  saveRate: Math.round((ALL_SAVED / ALL_TOTAL) * 100),
  shopCount: 3,
  topShop: "神保町 ひだまり書房",
};

/** 2026年10月（10/1 は木曜）。日 → スキャン冊数 */
export const SCAN_CALENDAR = {
  year: 2026,
  month: 10,
  counts: { 5: 1, 12: 1, 13: 1, 14: 2 } as Record<number, number>,
};